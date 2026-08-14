import type {
  PersianBrailleProfileInfo,
} from "@persian-braille/sdk";

import type {
  PersianBraillePlaygroundResultView,
  PersianBraillePlaygroundView,
} from "./controller.js";

function requiredElement<
  T extends HTMLElement,
>(
  id: string,
): T {
  const element =
    document.getElementById(id);

  if (!element) {
    throw new Error(
      `Missing required Web Playground element: #${id}`,
    );
  }

  return element as T;
}

function setText(
  element: HTMLElement,
  value: string,
): void {
  element.textContent = value;
}

function setList(
  element: HTMLElement,
  values: readonly string[],
  emptyText: string,
): void {
  element.replaceChildren();

  if (values.length === 0) {
    const item =
      document.createElement(
        "li",
      );
    item.textContent =
      emptyText;
    element.append(item);
    return;
  }

  for (const value of values) {
    const item =
      document.createElement(
        "li",
      );
    item.textContent =
      value;
    element.append(item);
  }
}

export function createDomView():
  PersianBraillePlaygroundView {
  const input =
    requiredElement<HTMLTextAreaElement>(
      "print-text-input",
    );
  const resultPanel =
    requiredElement<HTMLElement>(
      "translation-result",
    );
  const successPanel =
    requiredElement<HTMLElement>(
      "translation-success",
    );
  const errorPanel =
    requiredElement<HTMLElement>(
      "translation-error",
    );
  const unicodeBraille =
    requiredElement<HTMLElement>(
      "unicode-braille",
    );
  const cells =
    requiredElement<HTMLElement>(
      "cells",
    );
  const normalizedText =
    requiredElement<HTMLElement>(
      "normalized-text",
    );
  const structuralTokens =
    requiredElement<HTMLUListElement>(
      "structural-tokens",
    );
  const errorCode =
    requiredElement<HTMLElement>(
      "error-code",
    );
  const errorMessage =
    requiredElement<HTMLElement>(
      "error-message",
    );
  const errorDetails =
    requiredElement<HTMLUListElement>(
      "error-details",
    );
  const profileId =
    requiredElement<HTMLElement>(
      "profile-id",
    );
  const profileVersion =
    requiredElement<HTMLElement>(
      "profile-version",
    );
  const profileStatus =
    requiredElement<HTMLElement>(
      "profile-status",
    );
  const profileDirection =
    requiredElement<HTMLElement>(
      "profile-direction",
    );
  const profileDisclosure =
    requiredElement<HTMLElement>(
      "profile-disclosure",
    );
  const copyFeedback =
    requiredElement<HTMLElement>(
      "copy-feedback",
    );

  function resetResult():
    void {
    resultPanel.hidden = true;
    successPanel.hidden = true;
    errorPanel.hidden = true;

    setText(
      unicodeBraille,
      "",
    );
    setText(
      cells,
      "",
    );
    setText(
      normalizedText,
      "",
    );
    structuralTokens
      .replaceChildren();

    setText(
      errorCode,
      "",
    );
    setText(
      errorMessage,
      "",
    );
    errorDetails
      .replaceChildren();
  }

  resetResult();

  return {
    readInput() {
      return input.value;
    },

    writeInput(value) {
      input.value = value;
    },

    renderProfile(profile) {
      setText(
        profileId,
        profile.id,
      );
      setText(
        profileVersion,
        profile.version,
      );
      setText(
        profileStatus,
        profile.status,
      );
      setText(
        profileDirection,
        profile.direction,
      );

      profileDisclosure.hidden =
        profile.status !== "draft";
    },

    renderResult(result) {
      resultPanel.hidden = false;

      if (result.ok) {
        successPanel.hidden = false;
        errorPanel.hidden = true;

        setText(
          unicodeBraille,
          result.unicodeBraille,
        );
        setText(
          cells,
          result.cells.join(" "),
        );
        setText(
          normalizedText,
          result.normalizedText,
        );
        setList(
          structuralTokens,
          result.structuralTokens,
          "None",
        );
        return;
      }

      successPanel.hidden = true;
      errorPanel.hidden = false;

      setText(
        errorCode,
        result.errorCode,
      );
      setText(
        errorMessage,
        result.errorMessage,
      );
      setList(
        errorDetails,
        result.errorDetails,
        "No additional public error details.",
      );
    },

    clearResult() {
      resetResult();
    },

    renderCopyFeedback(message) {
      setText(
        copyFeedback,
        message,
      );
    },

    focusInput() {
      input.focus();
    },
  };
}

export function installDomActions(
  actions: {
    translate(): void;
    clear(): void;
    copyUnicodeBraille():
      Promise<void>;
  },
): void {
  const translateButton =
    requiredElement<HTMLButtonElement>(
      "translate",
    );
  const clearButton =
    requiredElement<HTMLButtonElement>(
      "clear",
    );
  const copyButton =
    requiredElement<HTMLButtonElement>(
      "copy-unicode-braille",
    );
  const input =
    requiredElement<HTMLTextAreaElement>(
      "print-text-input",
    );

  translateButton.addEventListener(
    "click",
    () => {
      actions.translate();
    },
  );

  clearButton.addEventListener(
    "click",
    () => {
      actions.clear();
    },
  );

  copyButton.addEventListener(
    "click",
    () => {
      void actions
        .copyUnicodeBraille();
    },
  );

  input.addEventListener(
    "keydown",
    (event) => {
      if (
        event.key === "Enter" &&
        (event.ctrlKey ||
          event.metaKey)
      ) {
        event.preventDefault();
        actions.translate();
      }
    },
  );
}
