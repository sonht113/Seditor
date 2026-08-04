import { describe, it, expect } from "vitest";
import {
  createEditor,
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  KEY_DOWN_COMMAND,
  type LexicalCommand,
} from "lexical";
import { registerShortcuts, SE_OPEN_LINK_COMMAND } from "./shortcuts";
import { createSeditor } from "./createSeditor";

function makeKeyEvent(
  key: string,
  mods: {
    ctrlKey?: boolean;
    metaKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
  },
): KeyboardEvent {
  return {
    key,
    ctrlKey: mods.ctrlKey ?? false,
    metaKey: mods.metaKey ?? false,
    shiftKey: mods.shiftKey ?? false,
    altKey: mods.altKey ?? false,
    preventDefault: () => {},
  } as unknown as KeyboardEvent;
}

function bareEditor() {
  return createEditor({ namespace: "test", onError: () => {} });
}

function trackCommand<T>(
  editor: ReturnType<typeof bareEditor>,
  command: LexicalCommand<T>,
) {
  let calls = 0;
  editor.registerCommand(
    command,
    () => {
      calls++;
      return false;
    },
    0,
  );
  return () => calls;
}

describe("registerShortcuts (isolated, bare editor)", () => {
  it("does not throw on registration", () => {
    const editor = bareEditor();
    expect(() => registerShortcuts(editor)).not.toThrow();
  });

  it("dispatches FORMAT_TEXT_COMMAND on Ctrl+B", () => {
    const editor = bareEditor();
    registerShortcuts(editor);
    const getCalls = trackCommand(editor, FORMAT_TEXT_COMMAND);
    editor.dispatchCommand(
      KEY_DOWN_COMMAND,
      makeKeyEvent("b", { ctrlKey: true }),
    );
    expect(getCalls()).toBeGreaterThan(0);
  });

  it("dispatches UNDO_COMMAND on Ctrl+Z", () => {
    const editor = bareEditor();
    registerShortcuts(editor);
    const getCalls = trackCommand(editor, UNDO_COMMAND);
    editor.dispatchCommand(
      KEY_DOWN_COMMAND,
      makeKeyEvent("z", { ctrlKey: true }),
    );
    expect(getCalls()).toBeGreaterThan(0);
  });

  it("dispatches SE_OPEN_LINK_COMMAND on Ctrl+Shift+K", () => {
    const editor = bareEditor();
    registerShortcuts(editor);
    const getCalls = trackCommand(editor, SE_OPEN_LINK_COMMAND);
    editor.dispatchCommand(
      KEY_DOWN_COMMAND,
      makeKeyEvent("k", { ctrlKey: true, shiftKey: true }),
    );
    expect(getCalls()).toBeGreaterThan(0);
  });

  it("ignores unbound keys", () => {
    const editor = bareEditor();
    registerShortcuts(editor);
    const getCalls = trackCommand(editor, FORMAT_TEXT_COMMAND);
    editor.dispatchCommand(
      KEY_DOWN_COMMAND,
      makeKeyEvent("q", { ctrlKey: true }),
    );
    expect(getCalls()).toBe(0);
  });
});

describe("createSeditor shortcuts integration", () => {
  it("SE_OPEN_LINK_COMMAND dispatched when shortcuts enabled", () => {
    const instance = createSeditor();
    const getCalls = trackCommand(instance.editor, SE_OPEN_LINK_COMMAND);
    instance.editor.dispatchCommand(
      KEY_DOWN_COMMAND,
      makeKeyEvent("k", { ctrlKey: true, shiftKey: true }),
    );
    expect(getCalls()).toBeGreaterThan(0);
  });

  it("SE_OPEN_LINK_COMMAND NOT dispatched when shortcuts disabled", () => {
    const instance = createSeditor({ shortcuts: false });
    const getCalls = trackCommand(instance.editor, SE_OPEN_LINK_COMMAND);
    instance.editor.dispatchCommand(
      KEY_DOWN_COMMAND,
      makeKeyEvent("k", { ctrlKey: true, shiftKey: true }),
    );
    expect(getCalls()).toBe(0);
  });

  it("stores placeholder from config", () => {
    const instance = createSeditor({ placeholder: "Type here" });
    expect(instance.placeholder).toBe("Type here");
  });

  it("placeholder is null by default", () => {
    const instance = createSeditor();
    expect(instance.placeholder).toBeNull();
  });
});
