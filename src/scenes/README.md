# Scenes

Each future video is one scene file in this folder (for example
`EnquiryManagement.tsx`), registered as a `<Composition>` in `src/Root.tsx`.

A scene composes:

- **Screen recordings** from `public/recordings/` — `<OffthreadVideo src={staticFile("recordings/…")} />`
- **Images** from `public/images/` — `<Img src={staticFile("images/…")} />`
- **Stock clips** from `public/stock/` — `<OffthreadVideo src={staticFile("stock/…")} />`
- **Brand components** from `src/brand/` — `Intro`, `Outro`, `LowerThird`,
  `Caption`, `Notification`, plus `tokens.ts` (colours) and `fonts.ts` (Poppins).

Use `<Sequence>` / `<Series>` to lay out time, and `@remotion/transitions`
between sections. Every scene should open with `<Intro>` and close with
`<Outro>` so the videos read as one series.

Register each scene twice in `Root.tsx`: 1080×1350 (LinkedIn feed portrait)
and 1080×1920 (vertical), both at 30 fps.
