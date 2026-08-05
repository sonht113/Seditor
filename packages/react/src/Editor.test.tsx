import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import {
  $getRoot,
  $createParagraphNode,
  $createTextNode,
  type LexicalEditor,
  type EditorState,
} from "lexical";
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

describe("Editor controlled content", () => {
  it("renders initial value prop", () => {
    render(<Editor value="<p>Hello controlled</p>" />);
    const root = document.querySelector(".se-root");
    expect(root?.textContent).toContain("Hello controlled");
  });

  it("renders defaultValue when value is undefined", () => {
    render(<Editor defaultValue="<p>Default content</p>" />);
    const root = document.querySelector(".se-root");
    expect(root?.textContent).toContain("Default content");
  });

  it("falls back to config.html for backward compat", () => {
    render(<Editor config={{ html: "<p>From config</p>" }} />);
    const root = document.querySelector(".se-root");
    expect(root?.textContent).toContain("From config");
  });

  it("updates content when value prop changes", () => {
    const { rerender } = render(<Editor value="<p>First</p>" />);
    expect(document.querySelector(".se-root")?.textContent).toContain("First");
    rerender(<Editor value="<p>Second</p>" />);
    expect(document.querySelector(".se-root")?.textContent).toContain("Second");
    expect(document.querySelector(".se-root")?.textContent).not.toContain("First");
  });

  it("calls onChange when editor content changes", () => {
    const onChange = vi.fn();
    let editor: LexicalEditor | null = null;
    render(
      <Editor
        onChange={onChange}
        onReady={(inst) => {
          editor = inst.editor;
        }}
      />,
    );
    expect(editor).not.toBeNull();
    act(() => {
      editor!.update(() => {
        const root = $getRoot();
        root.clear();
        const p = $createParagraphNode();
        p.append($createTextNode("Typed text"));
        root.append(p);
      });
      editor!.read(() => {});
    });
    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[0]).toContain("Typed text");
  });

  it("does not echo back a controlled value via onChange (no loop)", () => {
    const onChange = vi.fn();
    let editor: LexicalEditor | null = null;
    render(
      <Editor
        value="<p>Controlled</p>"
        onChange={onChange}
        onReady={(inst) => {
          editor = inst.editor;
        }}
      />,
    );
    expect(editor).not.toBeNull();
    // The initial controlled set must not produce an onChange call.
    const callsBefore = onChange.mock.calls.length;
    expect(callsBefore).toBe(0);
    // A subsequent user edit should fire onChange.
    act(() => {
      editor!.update(() => {
        const root = $getRoot();
        root.clear();
        const p = $createParagraphNode();
        p.append($createTextNode("User edit"));
        root.append(p);
      });
      editor!.read(() => {});
    });
    expect(onChange.mock.calls.length).toBeGreaterThan(0);
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[0]).toContain("User edit");
  });

  it("supports valueFormat='json' for onChange", () => {
    const onChange = vi.fn();
    let editor: LexicalEditor | null = null;
    render(
      <Editor
        valueFormat="json"
        onChange={onChange}
        onReady={(inst) => {
          editor = inst.editor;
        }}
      />,
    );
    act(() => {
      editor!.update(() => {
        const root = $getRoot();
        root.clear();
        const p = $createParagraphNode();
        p.append($createTextNode("JSON mode"));
        root.append(p);
      });
      editor!.read(() => {});
    });
    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    const parsed = JSON.parse(lastCall[0]);
    expect(JSON.stringify(parsed)).toContain("JSON mode");
  });

  it("supports valueFormat='json' for controlled value", () => {
    let editor: LexicalEditor | null = null;
    const onReady = (inst: { editor: LexicalEditor }) => {
      editor = inst.editor;
    };
    // Seed with HTML content, then capture its JSON, then change content,
    // then restore the captured JSON via the `value` prop.
    const { rerender } = render(
      <Editor defaultValue="<p>JSON mode</p>" onReady={onReady} />,
    );
    expect(editor).not.toBeNull();
    editor!.read(() => {});
    const capturedJson = JSON.stringify(
      (editor!.getEditorState() as EditorState).toJSON(),
    );
    // Change content to something else.
    act(() => {
      editor!.update(() => {
        const root = $getRoot();
        root.clear();
        root.append($createParagraphNode());
      });
      editor!.read(() => {});
    });
    expect(document.querySelector(".se-root")?.textContent).not.toContain(
      "JSON mode",
    );
    // Now restore via controlled value with JSON format.
    rerender(<Editor valueFormat="json" value={capturedJson} onReady={onReady} />);
    expect(document.querySelector(".se-root")?.textContent).toContain(
      "JSON mode",
    );
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
