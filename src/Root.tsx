import { Composition, Series } from "remotion";
import { Intro, INTRO_SECONDS, Outro, OUTRO_SECONDS } from "./brand";
import { RecruitmentAutomation, RECRUITMENT_FRAMES } from "./scenes/RecruitmentAutomation";
import { RecruitmentOverview, OVERVIEW_FRAMES } from "./scenes/RecruitmentOverview";
import { AICallerLoop, LOOP_FRAMES } from "./scenes/AICallerLoop";
import { AICallerLoopWide, WIDE_FRAMES, WIDE_HEIGHT, WIDE_WIDTH } from "./scenes/AICallerLoopWide";
import { Recruitment45, R45_FRAMES } from "./scenes/Recruitment45";
import { AvailabilityForm, ScreenPlate } from "./brand";
import { Img, staticFile } from "remotion";
import { FPS } from "./fps";

/** Intro then Outro, back to back. */
const BrandTest: React.FC = () => {
  return (
    <Series>
      <Series.Sequence durationInFrames={INTRO_SECONDS * FPS}>
        <Intro />
      </Series.Sequence>
      <Series.Sequence durationInFrames={OUTRO_SECONDS * FPS}>
        <Outro />
      </Series.Sequence>
    </Series>
  );
};

const BRAND_TEST_FRAMES = (INTRO_SECONDS + OUTRO_SECONDS) * FPS;

/** LinkedIn feed portrait (4:5) and vertical (9:16). */
const FORMATS = [
  { suffix: "", width: 1080, height: 1350 },
  { suffix: "-1080x1920", width: 1080, height: 1920 },
] as const;

/** The overview is designed for 1080×1920; "-Square" is the 1080×1350 cut of the same layout. */
const OVERVIEW_FORMATS = [
  { suffix: "", width: 1080, height: 1920 },
  { suffix: "-Square", width: 1080, height: 1350 },
] as const;

/** Every scene, registered once per format. */
const SCENES = [
  { id: "BrandTest", component: BrandTest, durationInFrames: BRAND_TEST_FRAMES },
  { id: "Recruitment", component: RecruitmentAutomation, durationInFrames: RECRUITMENT_FRAMES },
] as const;

/** The availability form at the phone's own screen size, for use as a reference still outside Remotion. */
const AvailabilityFormStill: React.FC = () => <AvailabilityForm w={1170} h={2532} tapAt={0} sendAt={100000} />;

/** The form on the ElevenLabs plate (24 fps, 3.38 s): plays the plate once at 0.45× over 6 s. */
const ScreenPlateTest: React.FC = () => (
  <ScreenPlate track="eleven-phone" playbackRate={0.45}>
    <AvailabilityForm w={1170} h={2532} tapAt={70} sendAt={130} />
  </ScreenPlate>
);

/**
 * A still: Scott's capture of the live form on the candidate-phone plate.
 * The capture is 1080×1920 (16:9); the glass is 1170×2532, so it is fitted
 * to the glass height and centred, its own status bar sitting under the notch.
 */
const PhoneStill: React.FC = () => (
  <ScreenPlate track="candidate-phone">
    <Img
      src={staticFile("images/avolon-form-capture.jpg")}
      style={{ position: "absolute", top: 0, left: (1170 - 2532 * (1080 / 1920)) / 2, height: 2532, width: 2532 * (1080 / 1920) }}
    />
  </ScreenPlate>
);

/** Scott's capture on the Kling-generated plate, at the plate's native 1920×1080 and as a 9:16 crop on the phone. */
/**
 * The capture from its URL bar down (the status bar and Dynamic Island, the top
 * 130 of 1920 px, are cropped away), fitted to the glass width and placed under
 * the plate's punch-hole camera.
 */
const CaptureNoStatusBar: React.FC = () => {
  const scale = 1170 / 1080;
  const top = 200;
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#f5f6f8" }}>
      <div style={{ position: "absolute", top, left: 0, width: 1170, height: 2532 - top, overflow: "hidden" }}>
        <Img
          src={staticFile("images/avolon-form-capture.jpg")}
          style={{ position: "absolute", top: -130 * scale, left: 0, width: 1170, height: 1920 * scale }}
        />
      </div>
    </div>
  );
};
const KlingPlateTest: React.FC = () => (
  <ScreenPlate track="kling-phone" playbackRate={0.8}>
    <CaptureNoStatusBar />
  </ScreenPlate>
);
const KlingPlateTestTall: React.FC = () => (
  <ScreenPlate track="kling-phone" playbackRate={0.8} focus={{ x: 0.56, y: 0.5 }}>
    <CaptureNoStatusBar />
  </ScreenPlate>
);

export const Root: React.FC = () => {
  return (
    <>
      <Composition id="KlingPlateTest" component={KlingPlateTest} durationInFrames={150} fps={FPS} width={1920} height={1080} />
      <Composition id="KlingPlateTest-1080x1920" component={KlingPlateTestTall} durationInFrames={150} fps={FPS} width={1080} height={1920} />
      <Composition id="PhoneStill" component={PhoneStill} durationInFrames={109} fps={FPS} width={1080} height={1920} />
      <Composition id="PhoneStill-2160x3840" component={PhoneStill} durationInFrames={109} fps={FPS} width={2160} height={3840} />
      <Composition id="ScreenPlateTest" component={ScreenPlateTest} durationInFrames={180} fps={FPS} width={1080} height={1920} />
      <Composition id="AvailabilityFormStill" component={AvailabilityFormStill} durationInFrames={30} fps={FPS} width={1170} height={2532} />
      {[
        { id: "Recruitment45", width: 1080, height: 1920, component: Recruitment45, frames: R45_FRAMES },
        { id: "Recruitment45-1080x1350", width: 1080, height: 1350, component: Recruitment45, frames: R45_FRAMES },
      ].map((c) => (
        <Composition key={c.id} id={c.id} component={c.component} durationInFrames={c.frames} fps={FPS} width={c.width} height={c.height} />
      ))}
      {[
        { id: "AICallerLoop", width: 1080, height: 1920 },
        { id: "AICallerLoop-1080x1350", width: 1080, height: 1350 },
      ].map((c) => (
        <Composition key={c.id} id={c.id} component={AICallerLoop} durationInFrames={LOOP_FRAMES} fps={FPS} width={c.width} height={c.height} />
      ))}
      {/* The loop as the real app screen, 16:10, for the marketing site's calls slot. */}
      <Composition id="AICallerLoopWide" component={AICallerLoopWide} durationInFrames={WIDE_FRAMES} fps={FPS} width={WIDE_WIDTH} height={WIDE_HEIGHT} />
      {OVERVIEW_FORMATS.map((f) => (
        <Composition
          key={`RecruitmentOverview${f.suffix}`}
          id={`RecruitmentOverview${f.suffix}`}
          component={RecruitmentOverview}
          durationInFrames={OVERVIEW_FRAMES}
          fps={FPS}
          width={f.width}
          height={f.height}
        />
      ))}
      {SCENES.map((s) =>
        FORMATS.map((f) => (
          <Composition
            key={`${s.id}${f.suffix}`}
            id={`${s.id}${f.suffix}`}
            component={s.component}
            durationInFrames={s.durationInFrames}
            fps={FPS}
            width={f.width}
            height={f.height}
          />
        )),
      )}
    </>
  );
};
