export type FeatureTabId =
  | "persian"
  | "music";

export interface FeatureTabController {
  readonly activeTab:
    () => FeatureTabId;

  select(
    tab: FeatureTabId,
  ): void;

  setHost(
    hostKind: string,
  ): void;
}

interface FeatureTabDom {
  readonly persianTab: HTMLElement;
  readonly musicTab: HTMLElement;
  readonly intro: HTMLElement;
  readonly persianSurfaces:
    readonly HTMLElement[];
  readonly musicSurface:
    HTMLElement;
}

function requiredElement(
  document: Document,
  id: string,
): HTMLElement {
  const element =
    document.getElementById(
      id,
    );

  if (element === null) {
    throw new Error(
      `Feature tab element is missing: ${id}`,
    );
  }

  return element;
}

function featureDom(
  document: Document,
): FeatureTabDom {
  const translateButton =
    requiredElement(
      document,
      "translate-selection",
    );

  const translationActions =
    translateButton.parentElement;

  if (translationActions === null) {
    throw new Error(
      "Persian translation actions container is unavailable.",
    );
  }

  return Object.freeze({
    persianTab:
      requiredElement(
        document,
        "feature-tab-persian",
      ),
    musicTab:
      requiredElement(
        document,
        "feature-tab-music",
      ),
    intro:
      requiredElement(
        document,
        "feature-context-text",
      ),
    persianSurfaces:
      Object.freeze([
        translationActions,
        requiredElement(
          document,
          "translation-result",
        ),
        requiredElement(
          document,
          "translation-error",
        ),
        requiredElement(
          document,
          "taskpane-status",
        ),
      ]),
    musicSurface:
      requiredElement(
        document,
        "music-braille-section",
      ),
  });
}

function setSurfaceVisible(
  element: HTMLElement,
  visible: boolean,
): void {
  element.classList.toggle(
    "feature-tab-hidden",
    !visible,
  );

  element.setAttribute(
    "aria-hidden",
    visible
      ? "false"
      : "true",
  );
}

function setTabSelected(
  element: HTMLElement,
  selected: boolean,
): void {
  element.setAttribute(
    "aria-selected",
    selected
      ? "true"
      : "false",
  );

  element.tabIndex =
    selected
      ? 0
      : -1;
}

export function createFeatureTabController(
  document: Document,
): FeatureTabController {
  const ui =
    featureDom(
      document,
    );

  let current:
    FeatureTabId =
      "persian";

  let wordHost =
    false;

  const sync = () => {
    const persian =
      current ===
      "persian";

    setTabSelected(
      ui.persianTab,
      persian,
    );

    setTabSelected(
      ui.musicTab,
      !persian,
    );

    for (
      const surface
      of ui.persianSurfaces
    ) {
      setSurfaceVisible(
        surface,
        persian,
      );
    }

    setSurfaceVisible(
      ui.musicSurface,
      !persian
      && wordHost,
    );

    ui.intro.textContent =
      persian
        ? "Translate the current supported Office selection through the shared Persian Braille SDK."
        : "Convert a Standard MIDI file to Music Braille through the shared public SDK, preview it, and insert it into Word.";
  };

  const select = (
    tab: FeatureTabId,
  ) => {
    if (
      tab === "music"
      && !wordHost
    ) {
      return;
    }

    current =
      tab;

    sync();
  };

  ui.persianTab.addEventListener(
    "click",
    () => {
      select(
        "persian",
      );
    },
  );

  ui.musicTab.addEventListener(
    "click",
    () => {
      select(
        "music",
      );
    },
  );

  ui.persianTab.addEventListener(
    "keydown",
    (event) => {
      if (
        wordHost
        && (
          event.key === "ArrowRight"
          || event.key === "End"
        )
      ) {
        event.preventDefault();
        select(
          "music",
        );
        ui.musicTab.focus();
      }
    },
  );

  ui.musicTab.addEventListener(
    "keydown",
    (event) => {
      if (
        event.key === "ArrowLeft"
        || event.key === "Home"
      ) {
        event.preventDefault();
        select(
          "persian",
        );
        ui.persianTab.focus();
      }
    },
  );

  sync();

  return Object.freeze({
    activeTab() {
      return current;
    },

    select,

    setHost(
      hostKind: string,
    ) {
      wordHost =
        hostKind ===
        "word";

      ui.musicTab.hidden =
        !wordHost;

      if (
        !wordHost
        && current ===
          "music"
      ) {
        current =
          "persian";
      }

      sync();
    },
  });
}
