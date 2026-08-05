import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import type { LexicalEditor } from "lexical";
import { Editor, useEditor } from "./Editor";
import { Toolbar } from "./Toolbar";
import { LinkTooltip } from "./LinkTooltip";
import { SE_OPEN_LINK_COMMAND } from "seditor-core";

describe("Editor", () => {
  it("renders a contenteditable root", () => {
    render(<Editor />);
    const root = document.querySelector(".se-root");
    expect(root).not.toBeNull();
    expect(root?.getAttribute("contenteditable")).toBe("true");
  });

  it("provides instance via useEditor", () => {
    let captured: { editor: unknown; commands: unknown } | null = null;
    function Child() {
      captured = useEditor();
      return null;
    }
    render(
      <Editor>
        <Child />
      </Editor>,
    );
    expect(captured).not.toBeNull();
    expect(captured!.commands).toBeDefined();
  });

  it("useEditor throws outside Editor", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => {
      function Bad() {
        useEditor();
        return null;
      }
      render(<Bad />);
    }).toThrow(/useEditor must be used within/);
    spy.mockRestore();
  });

  it("renders Toolbar with default buttons", () => {
    render(
      <Editor>
        <Toolbar />
      </Editor>,
    );
    expect(screen.getByLabelText("Bold")).toBeDefined();
    expect(screen.getByLabelText("Italic")).toBeDefined();
    expect(screen.getByLabelText("Undo")).toBeDefined();
  });
});

describe("LinkTooltip", () => {
  it("does not render when closed", () => {
    render(
      <Editor>
        <LinkTooltip />
      </Editor>,
    );
    expect(document.querySelector(".se-link-tooltip")).toBeNull();
  });

  it("opens tooltip with input and buttons on SE_OPEN_LINK_COMMAND", () => {
    let editor: LexicalEditor | null = null;
    render(
      <Editor
        onReady={(inst) => {
          editor = inst.editor;
        }}
      >
        <LinkTooltip />
      </Editor>,
    );
    expect(editor).not.toBeNull();
    act(() => {
      editor!.dispatchCommand(SE_OPEN_LINK_COMMAND, undefined);
    });
    const tooltip = document.querySelector(".se-link-tooltip");
    expect(tooltip).not.toBeNull();
    expect(tooltip!.querySelector("input")).not.toBeNull();
    expect(tooltip!.querySelector(".se-link-tooltip-close")).not.toBeNull();
    expect(tooltip!.querySelector(".se-link-tooltip-accept")).not.toBeNull();
  });
});
