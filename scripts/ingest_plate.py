"""
Track the screen of a device filmed in a stock plate, so a UI can be mapped
onto it in Remotion.

Frame 0: find the bright flat screen inside its dark bezel and reduce it to
four corners. Every frame after: Lucas-Kanade optical flow on features inside
the phone body, RANSAC homography from the previous frame, corners carried
through it. Features are re-seeded whenever too few survive.

Output: {"width","height","fps","frames":[{"frame":n,"corners":[[x,y]x4]}]}
with corners in source pixels, ordered top-left, top-right, bottom-right,
bottom-left, which is the order brand/homography.ts expects.
"""
import cv2, numpy as np, json, sys

SCALE = 0.5          # track at half size, report at full
MIN_FEATURES = 60
BLEED = 0.018       # grow the screen quad by 1.8% so nothing of the plate shows
BEZEL = 0.035       # with --at: inset the phone's outline by this to reach the glass
LK = dict(winSize=(31, 31), maxLevel=4,
          criteria=(cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 40, 0.01))


def order_quad(pts):
    pts = np.array(pts, dtype=np.float32).reshape(-1, 2)
    c = pts.mean(axis=0)
    ang = np.arctan2(pts[:, 1] - c[1], pts[:, 0] - c[0])
    pts = pts[np.argsort(ang)]                       # counter-clockwise from -pi
    start = np.argmin(pts.sum(axis=1))               # top-left has the smallest x+y
    pts = np.roll(pts, -start, axis=0)
    if np.cross(pts[1] - pts[0], pts[2] - pts[0]) < 0:
        pts = pts[[0, 3, 2, 1]]
    return pts


def quad_from_edges(contour):
    """
    True corners of a rounded-rectangle screen. approxPolyDP cuts the rounded
    corners off and lands inside the glass, which leaves a sliver of the
    original screen showing. Instead: fit a line to each of the four straight
    edges, ignoring the rounded corners, and intersect adjacent lines.
    """
    pts = contour.reshape(-1, 2).astype(np.float32)
    box = cv2.boxPoints(cv2.minAreaRect(contour))
    box = order_quad(box)                                  # TL, TR, BR, BL
    side = min(np.linalg.norm(box[1] - box[0]), np.linalg.norm(box[3] - box[0]))
    keep_out = 0.22 * side                                 # corner radius to ignore

    near_corner = np.min(np.linalg.norm(pts[:, None, :] - box[None, :, :], axis=2), axis=1)
    pts = pts[near_corner > keep_out]
    if len(pts) < 40:
        return box

    edges = [(box[i], box[(i + 1) % 4]) for i in range(4)]  # top, right, bottom, left
    d = []
    for a, b in edges:
        ab = b - a
        t = np.clip(((pts - a) @ ab) / (ab @ ab), 0, 1)
        proj = a + t[:, None] * ab
        d.append(np.linalg.norm(pts - proj, axis=1))
    owner = np.argmin(np.vstack(d), axis=0)

    lines = []
    for i in range(4):
        grp = pts[owner == i]
        if len(grp) < 10:
            return box
        vx, vy, x0, y0 = cv2.fitLine(grp, cv2.DIST_HUBER, 0, 0.01, 0.01).ravel()
        lines.append((np.array([x0, y0]), np.array([vx, vy])))

    def meet(l1, l2):
        (p1, v1), (p2, v2) = l1, l2
        A = np.array([[v1[0], -v2[0]], [v1[1], -v2[1]]])
        if abs(np.linalg.det(A)) < 1e-6:
            return None
        t = np.linalg.solve(A, p2 - p1)
        return p1 + t[0] * v1

    # corner between top&right = TR, right&bottom = BR, bottom&left = BL, left&top = TL
    got = [meet(lines[i], lines[(i + 1) % 4]) for i in range(4)]
    if any(g is None for g in got):
        return box
    return order_quad(np.array(got, dtype=np.float32))


def find_screen(frame, at=None):
    """
    The screen is a hole in the dark silhouette: the bezel encloses it
    completely, so it appears as a child contour of the dark mask. Taking the
    largest hole is far more robust than thresholding brightness, which lets
    the wall behind the phone merge with the screen.

    `at` is a point (x, y, in this frame's pixels) on the phone body itself,
    such as the notch or the bezel. With it, only holes inside that silhouette
    are considered, which is what a busy screen (dark buttons, text) needs.
    """
    g = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    dark = (g < 90).astype(np.uint8) * 255
    dark = cv2.morphologyEx(dark, cv2.MORPH_CLOSE, np.ones((25, 25), np.uint8))
    cnts, hier = cv2.findContours(dark, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_SIMPLE)
    if hier is None:
        raise SystemExit("nothing dark in the frame")
    parent_ok = lambda i: True
    if at is not None:
        outers = [i for i, h in enumerate(hier[0]) if h[3] == -1 and cv2.pointPolygonTest(cnts[i], (float(at[0]), float(at[1])), False) >= 0]
        if not outers:
            raise SystemExit(f"--at {at}: no dark silhouette contains that point")
        body = min(outers, key=lambda i: cv2.contourArea(cnts[i]))   # the phone, not the shirt behind it
        parent_ok = lambda i: hier[0][i][3] == body
    holes = [c for i, (c, h) in enumerate(zip(cnts, hier[0])) if h[3] != -1 and parent_ok(i) and cv2.contourArea(c) > 500]
    if not holes:
        raise SystemExit("no enclosed screen found")
    if at is not None:
        # A busy screen has no clean hole. Fit the quad to the phone's outer
        # silhouette instead and inset it by the bezel.
        scr = cnts[body]
        quad = quad_from_edges(scr)
        c = quad.mean(axis=0)
        quad = (c + (quad - c) * (1.0 - BEZEL)).astype(np.float32)
    else:
        scr = max(holes, key=cv2.contourArea)
        quad = quad_from_edges(scr)

    # Overshoot slightly so the UI bleeds under the bezel. Overshoot is hidden
    # by the dark bezel; undershoot leaves a sliver of the original screen
    # showing, which is the tell that gives a composite away.
    c = quad.mean(axis=0)
    quad = (c + (quad - c) * (1.0 + BLEED)).astype(np.float32)

    w = (np.linalg.norm(quad[1] - quad[0]) + np.linalg.norm(quad[2] - quad[3])) / 2
    h = (np.linalg.norm(quad[3] - quad[0]) + np.linalg.norm(quad[2] - quad[1])) / 2
    ratio, area = h / max(w, 1e-6), cv2.contourArea(quad.astype(np.float32))
    covered = area / max(cv2.contourArea(scr), 1)
    frac = area / (g.shape[0] * g.shape[1])
    print(f"  screen {w:.0f}x{h:.0f}px  aspect h/w={ratio:.2f}  "
          f"quad covers {covered:.0%} of the hole, {frac:.1%} of frame")
    if not (1.3 < ratio < 2.8):
        raise SystemExit(f"rejected: aspect {ratio:.2f} is not a phone screen")
    if at is None and not (0.85 < covered < 1.15):
        raise SystemExit(f"rejected: quad fits the screen outline poorly ({covered:.0%})")
    if at is not None and not (0.7 < covered < 1.0):
        raise SystemExit(f"rejected: quad does not sit inside the phone outline ({covered:.0%})")

    # features for tracking come from the whole rigid phone, so seed on a band
    # around the screen rather than the screen itself, which is flat and blank
    m = np.zeros(g.shape, np.uint8)
    cv2.fillConvexPoly(m, quad.astype(np.int32), 255)
    m = cv2.dilate(m, np.ones((41, 41), np.uint8))
    return quad, m


def ring_mask(shape, quad, outer=90, inner=6):
    m = np.zeros(shape, np.uint8)
    cv2.fillConvexPoly(m, quad.astype(np.int32), 255)
    band = cv2.dilate(m, np.ones((outer, outer), np.uint8))
    hole = cv2.erode(m, np.ones((inner, inner), np.uint8))
    return cv2.subtract(band, hole)


def track(path, out_json, every=1, at=None, seed=None):
    cap = cv2.VideoCapture(path)
    ok, first = cap.read()
    if not ok:
        raise SystemExit("cannot read clip")
    H, W = first.shape[:2]
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    small = cv2.resize(first, None, fx=SCALE, fy=SCALE)
    if seed is not None:
        # Corners given by hand (clip pixels, TL TR BR BL). Features come from a
        # ring around the screen — bezel, thumb, fingers — never from the glass,
        # which is blank and gives the tracker nothing to hold.
        corners = order_quad(np.array(seed, dtype=np.float32).reshape(4, 2) * SCALE)
        mask = ring_mask(small.shape[:2], corners)
        print("  seeded by hand")
    else:
        corners, mask = find_screen(small, None if at is None else (at[0] * SCALE, at[1] * SCALE))
    dbg = first.copy()
    cv2.polylines(dbg, [(corners / SCALE).astype(np.int32)], True, (0, 0, 255), 3)
    cv2.imwrite(out_json.replace(".json", ".seed.png"), dbg)
    prev_gray = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)
    feats = cv2.goodFeaturesToTrack(prev_gray, 500, 0.01, 8, mask=mask, blockSize=7)
    frames = [{"frame": 0, "corners": (corners / SCALE).round(1).tolist()}]
    n, reseeds = 0, 0
    while True:
        ok, frame = cap.read()
        if not ok:
            break
        n += 1
        small = cv2.resize(frame, None, fx=SCALE, fy=SCALE)
        gray = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)
        nxt, st, _ = cv2.calcOpticalFlowPyrLK(prev_gray, gray, feats, None, **LK)
        good_new = nxt[st.ravel() == 1]
        good_old = feats[st.ravel() == 1]
        if len(good_new) >= 8:
            M, inl = cv2.findHomography(good_old, good_new, cv2.RANSAC, 2.0)
            if M is not None:
                corners = cv2.perspectiveTransform(corners.reshape(-1, 1, 2), M).reshape(-1, 2)
        frames.append({"frame": n, "corners": (corners / SCALE).round(1).tolist()})
        prev_gray = gray
        feats = good_new.reshape(-1, 1, 2)
        if len(feats) < MIN_FEATURES:                 # re-seed on the ring around the current quad
            m = ring_mask(gray.shape, corners) if seed is not None else None
            if m is None:
                m = np.zeros(gray.shape, np.uint8)
                cv2.fillConvexPoly(m, corners.astype(np.int32), 255)
                m = cv2.dilate(m, np.ones((61, 61), np.uint8))
            f = cv2.goodFeaturesToTrack(gray, 500, 0.01, 8, mask=m, blockSize=7)
            if f is not None:
                feats, reseeds = f, reseeds + 1
    cap.release()
    data = {"width": W, "height": H, "fps": round(fps, 3), "frames": frames[::every]}
    json.dump(data, open(out_json, "w"))
    print(f"tracked {len(frames)} frames, {reseeds} re-seeds, wrote {len(data['frames'])} keys")
    return data


if __name__ == "__main__":
    # ingest_plate.py <clip> <out.json> [every] [--at=x,y] [--seed=x1,y1,x2,y2,x3,y3,x4,y4]
    #   --at    a point on the phone body (clip px), for a busy screen
    #   --seed  the screen's four corners by hand (clip px, TL TR BR BL); writes <out>.seed.png to check
    args, at, seed = [], None, None
    for a in sys.argv[1:]:
        if a.startswith("--at="):
            at = tuple(float(v) for v in a[5:].split(","))
        elif a.startswith("--seed="):
            seed = [float(v) for v in a[7:].split(",")]
        else:
            args.append(a)
    track(args[0], args[1], int(args[2]) if len(args) > 2 else 1, at, seed)
