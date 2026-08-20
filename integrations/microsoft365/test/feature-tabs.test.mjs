import assert from "node:assert/strict";
import test from "node:test";

import {
  createFeatureTabController,
} from "../dist/taskpane/feature-tabs.js";

class FakeClassList {
  constructor() {
    this.values =
      new Set();
  }

  toggle(
    name,
    force,
  ) {
    if (force) {
      this.values.add(name);
    } else {
      this.values.delete(name);
    }

    return this.values.has(name);
  }

  contains(name) {
    return this.values.has(name);
  }
}

class FakeElement {
  constructor(
    id,
  ) {
    this.id = id;
    this.hidden = false;
    this.tabIndex = 0;
    this.textContent = "";
    this.parentElement = null;
    this.classList =
      new FakeClassList();
    this.attributes =
      new Map();
    this.listeners =
      new Map();
    this.focused = false;
  }

  setAttribute(
    name,
    value,
  ) {
    this.attributes.set(
      name,
      value,
    );
  }

  getAttribute(name) {
    return this.attributes.get(name);
  }

  addEventListener(
    name,
    listener,
  ) {
    this.listeners.set(
      name,
      listener,
    );
  }

  click() {
    this.listeners.get("click")?.({
      preventDefault() {},
    });
  }

  keydown(key) {
    this.listeners.get("keydown")?.({
      key,
      preventDefault() {},
    });
  }

  focus() {
    this.focused = true;
  }
}

function fixture() {
  const ids = [
    "feature-tab-persian",
    "feature-tab-german",
    "feature-tab-music",
    "feature-context-text",
    "translate-selection",
    "translation-result",
    "translation-error",
    "taskpane-status",
    "german-braille-section",
    "music-braille-section",
  ];

  const elements =
    Object.fromEntries(
      ids.map(
        (id) => [
          id,
          new FakeElement(id),
        ],
      ),
    );

  const actions =
    new FakeElement(
      "translation-actions",
    );

  elements[
    "translate-selection"
  ].parentElement =
    actions;

  const document = {
    getElementById(id) {
      return elements[id]
        ?? null;
    },
  };

  return {
    document,
    elements,
    actions,
  };
}

test(
  "feature tabs default to Persian and expose Music only in Word",
  () => {
    const {
      document,
      elements,
      actions,
    } =
      fixture();

    const controller =
      createFeatureTabController(
        document,
      );

    assert.equal(
      controller.activeTab(),
      "persian",
    );

    controller.setHost(
      "excel",
    );

    assert.equal(
      elements[
        "feature-tab-music"
      ].hidden,
      true,
    );

    assert.equal(
      actions.classList.contains(
        "feature-tab-hidden",
      ),
      false,
    );

    controller.setHost(
      "word",
    );

    assert.equal(
      elements[
        "feature-tab-music"
      ].hidden,
      false,
    );
  },
);

test(
  "Music tab hides Persian surfaces without mutating their own hidden state",
  () => {
    const {
      document,
      elements,
      actions,
    } =
      fixture();

    elements[
      "translation-result"
    ].hidden =
      true;

    const controller =
      createFeatureTabController(
        document,
      );

    controller.setHost(
      "word",
    );

    elements[
      "feature-tab-music"
    ].click();

    assert.equal(
      controller.activeTab(),
      "music",
    );

    assert.equal(
      actions.classList.contains(
        "feature-tab-hidden",
      ),
      true,
    );

    assert.equal(
      elements[
        "translation-result"
      ].classList.contains(
        "feature-tab-hidden",
      ),
      true,
    );

    assert.equal(
      elements[
        "translation-result"
      ].hidden,
      true,
    );

    assert.equal(
      elements[
        "music-braille-section"
      ].classList.contains(
        "feature-tab-hidden",
      ),
      false,
    );

    assert.match(
      elements[
        "feature-context-text"
      ].textContent,
      /Standard MIDI/,
    );
  },
);

test(
  "leaving Word while Music is active returns safely to Persian",
  () => {
    const {
      document,
      elements,
    } =
      fixture();

    const controller =
      createFeatureTabController(
        document,
      );

    controller.setHost(
      "word",
    );

    controller.select(
      "music",
    );

    controller.setHost(
      "powerpoint",
    );

    assert.equal(
      controller.activeTab(),
      "persian",
    );

    assert.equal(
      elements[
        "feature-tab-music"
      ].hidden,
      true,
    );

    assert.equal(
      elements[
        "feature-tab-persian"
      ].getAttribute(
        "aria-selected",
      ),
      "true",
    );
  },
);

test(
  "Deutsch is available in every Office host and owns an isolated shell",
  () => {
    const {
      document,
      elements,
      actions,
    } =
      fixture();

    const controller =
      createFeatureTabController(
        document,
      );

    controller.setHost(
      "excel",
    );

    assert.equal(
      elements[
        "feature-tab-german"
      ].hidden,
      false,
    );

    assert.equal(
      elements[
        "feature-tab-music"
      ].hidden,
      true,
    );

    elements[
      "feature-tab-german"
    ].click();

    assert.equal(
      controller.activeTab(),
      "german",
    );

    assert.equal(
      elements[
        "feature-tab-german"
      ].getAttribute(
        "aria-selected",
      ),
      "true",
    );

    assert.equal(
      elements[
        "feature-tab-persian"
      ].getAttribute(
        "aria-selected",
      ),
      "false",
    );

    assert.equal(
      actions.classList.contains(
        "feature-tab-hidden",
      ),
      true,
    );

    assert.equal(
      elements[
        "german-braille-section"
      ].classList.contains(
        "feature-tab-hidden",
      ),
      false,
    );

    assert.equal(
      elements[
        "music-braille-section"
      ].classList.contains(
        "feature-tab-hidden",
      ),
      true,
    );

    assert.match(
      elements[
        "feature-context-text"
      ].textContent,
      /German Braille/,
    );

    controller.setHost(
      "powerpoint",
    );

    assert.equal(
      controller.activeTab(),
      "german",
    );

    assert.equal(
      elements[
        "feature-tab-music"
      ].hidden,
      true,
    );
  },
);

test(
  "keyboard navigation places Deutsch between Persian and Music",
  () => {
    const {
      document,
      elements,
    } =
      fixture();

    const controller =
      createFeatureTabController(
        document,
      );

    controller.setHost(
      "word",
    );

    elements[
      "feature-tab-persian"
    ].keydown(
      "ArrowRight",
    );

    assert.equal(
      controller.activeTab(),
      "german",
    );

    assert.equal(
      elements[
        "feature-tab-german"
      ].focused,
      true,
    );

    elements[
      "feature-tab-german"
    ].keydown(
      "ArrowRight",
    );

    assert.equal(
      controller.activeTab(),
      "music",
    );

    assert.equal(
      elements[
        "feature-tab-music"
      ].focused,
      true,
    );

    elements[
      "feature-tab-music"
    ].keydown(
      "ArrowLeft",
    );

    assert.equal(
      controller.activeTab(),
      "german",
    );

    elements[
      "feature-tab-german"
    ].keydown(
      "Home",
    );

    assert.equal(
      controller.activeTab(),
      "persian",
    );
  },
);
