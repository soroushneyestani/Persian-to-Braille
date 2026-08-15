import type {
  PowerPointSelectionSnapshot,
} from "./types.js";

export type PowerPointRuntimeMutationOutcome =
  | "written"
  | "selection-changed";

export interface PowerPointRuntimePort {
  isReady(): boolean;
  isPowerPointHost(): boolean;
  supportsPowerPointApi15(): boolean;

  readSelectionSnapshot():
    Promise<
      PowerPointSelectionSnapshot |
      null
    >;

  replaceSelectedText(
    expected:
      PowerPointSelectionSnapshot,
    replacementText:
      string,
  ): Promise<PowerPointRuntimeMutationOutcome>;
}

interface OfficeRequirementsPort {
  isSetSupported(
    name: string,
    version: string,
  ): boolean;
}

interface OfficeContextPort {
  readonly host:
    unknown;
  readonly requirements:
    OfficeRequirementsPort;
}

interface OfficeGlobalPort {
  readonly context:
    OfficeContextPort;
  readonly HostType?: {
    readonly PowerPoint?:
      unknown;
  };
}

interface PowerPointSlidePort {
  id:
    string;

  load(
    properties:
      string | string[],
  ): void;
}

interface PowerPointShapePort {
  id:
    string;

  load(
    properties:
      string | string[],
  ): void;

  getParentSlide():
    PowerPointSlidePort;
}

interface PowerPointTextFramePort {
  getParentShape():
    PowerPointShapePort;
}

interface PowerPointTextRangePort {
  isNullObject:
    boolean;
  start:
    number;
  length:
    number;
  text:
    string;

  load(
    properties:
      string | string[],
  ): void;

  getParentTextFrame():
    PowerPointTextFramePort;
}

interface PowerPointPresentationPort {
  getSelectedTextRangeOrNullObject():
    PowerPointTextRangePort;
}

interface PowerPointRequestContextPort {
  readonly presentation:
    PowerPointPresentationPort;

  sync():
    Promise<void>;
}

interface PowerPointGlobalPort {
  run<T>(
    callback: (
      context:
        PowerPointRequestContextPort,
    ) => Promise<T>,
  ): Promise<T>;
}

export interface OfficePowerPointGlobals {
  readonly Office?:
    OfficeGlobalPort;
  readonly PowerPoint?:
    PowerPointGlobalPort;
}

interface SnapshotRead {
  readonly range:
    PowerPointTextRangePort;
  readonly snapshot:
    PowerPointSelectionSnapshot;
}

function powerPointHostValue(
  office:
    OfficeGlobalPort,
): unknown {
  return (
    office.HostType?.PowerPoint ??
    "PowerPoint"
  );
}

function sameSnapshot(
  left:
    PowerPointSelectionSnapshot,
  right:
    PowerPointSelectionSnapshot,
): boolean {
  return (
    left.slideId ===
      right.slideId &&
    left.shapeId ===
      right.shapeId &&
    left.start ===
      right.start &&
    left.length ===
      right.length &&
    left.text ===
      right.text
  );
}

async function readSnapshotInContext(
  context:
    PowerPointRequestContextPort,
): Promise<
  SnapshotRead |
  null
> {
  const range =
    context.presentation
      .getSelectedTextRangeOrNullObject();

  range.load(
    "isNullObject",
  );
  await context.sync();

  if (range.isNullObject) {
    return null;
  }

  range.load([
    "start",
    "length",
    "text",
  ]);

  const textFrame =
    range.getParentTextFrame();

  const shape =
    textFrame.getParentShape();

  const slide =
    shape.getParentSlide();

  shape.load("id");
  slide.load("id");

  await context.sync();

  return Object.freeze({
    range,
    snapshot:
      Object.freeze({
        slideId:
          slide.id,
        shapeId:
          shape.id,
        start:
          range.start,
        length:
          range.length,
        text:
          range.text,
      }),
  });
}

export function createOfficePowerPointRuntime(
  globals:
    OfficePowerPointGlobals,
): PowerPointRuntimePort {
  function office():
    OfficeGlobalPort | undefined {
    return globals.Office;
  }

  function powerPoint():
    PowerPointGlobalPort | undefined {
    return globals.PowerPoint;
  }

  return Object.freeze({
    isReady() {
      return Boolean(
        office() &&
        powerPoint(),
      );
    },

    isPowerPointHost() {
      const currentOffice =
        office();

      if (!currentOffice) {
        return false;
      }

      return (
        currentOffice.context.host ===
        powerPointHostValue(
          currentOffice,
        )
      );
    },

    supportsPowerPointApi15() {
      const currentOffice =
        office();

      if (!currentOffice) {
        return false;
      }

      return currentOffice
        .context
        .requirements
        .isSetSupported(
          "PowerPointApi",
          "1.5",
        );
    },

    async readSelectionSnapshot() {
      const currentPowerPoint =
        powerPoint();

      if (!currentPowerPoint) {
        throw new Error(
          "PowerPoint runtime unavailable.",
        );
      }

      return currentPowerPoint.run(
        async (context) => {
          const current =
            await readSnapshotInContext(
              context,
            );

          return (
            current?.snapshot ??
            null
          );
        },
      );
    },

    async replaceSelectedText(
      expected:
        PowerPointSelectionSnapshot,
      replacementText:
        string,
    ) {
      const currentPowerPoint =
        powerPoint();

      if (!currentPowerPoint) {
        throw new Error(
          "PowerPoint runtime unavailable.",
        );
      }

      return currentPowerPoint.run(
        async (context) => {
          const current =
            await readSnapshotInContext(
              context,
            );

          if (
            !current ||
            !sameSnapshot(
              current.snapshot,
              expected,
            )
          ) {
            return "selection-changed";
          }

          current.range.text =
            replacementText;

          await context.sync();

          return "written";
        },
      );
    },
  });
}

export function createGlobalOfficePowerPointRuntime():
  PowerPointRuntimePort {
  return createOfficePowerPointRuntime(
    globalThis as unknown as
      OfficePowerPointGlobals,
  );
}
