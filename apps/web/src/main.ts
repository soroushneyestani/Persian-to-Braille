import {
  createPersianBrailleTranslator,
} from "@persian-braille/sdk";

import {
  createPlaygroundController,
} from "./controller.js";
import {
  createDomView,
  installDomActions,
} from "./dom-view.js";

const clipboard = {
  async writeText(
    text: string,
  ): Promise<void> {
    if (
      !navigator.clipboard
    ) {
      throw new Error(
        "Clipboard API unavailable.",
      );
    }

    await navigator.clipboard
      .writeText(text);
  },
};

const controller =
  createPlaygroundController(
    createPersianBrailleTranslator(),
    createDomView(),
    clipboard,
  );

installDomActions(
  controller,
);
