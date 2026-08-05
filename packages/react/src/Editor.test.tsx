import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { createRef } from "react";
import {
  $getRoot,
  $createParagraphNode,
  $createTextNode,
  type LexicalEditor,
  type EditorState,
} from "lexical";
import { Editor, useEditor } from "./Editor";
import type { SeditorInstance } from "seditor-core";
import { Toolbar } from "./Toolbar";
import { LinkTooltip } from "./LinkTooltip";
import { SE_OPEN_LINK_COMMAND } from "seditor-core";

describe("Editor onChangeDebounceMs", () => {
  it("fires onChange synchronously when debounce is 0 (default)", () => {
    vi.useFakeTimers();
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
    act(() => {
      editor!.update(() => {
        const root = $getRoot();
        root.clear();
        root.append($createParagraphNode());
      });
      editor!.read(() => {});
    });
    expect(onChange).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("defers onChange when onChangeDebounceMs > 0", () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    let editor: LexicalEditor | null = null;
    render(
      <Editor
        onChange={onChange}
        onChangeDebounceMs={100}
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
        p.append($createTextNode("debounced"));
        root.append(p);
      });
      editor!.read(() => {});
    });
    expect(onChange).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls[0][0]).toContain("debounced");
    vi.useRealTimers();
  });

  it("flushes pending debounced onChange on blur", () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    let editor: LexicalEditor | null = null;
    render(
      <Editor
        onChange={onChange}
        onChangeDebounceMs={500}
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
        p.append($createTextNode("flush on blur"));
        root.append(p);
      });
      editor!.read(() => {});
    });
    expect(onChange).not.toHaveBeenCalled();
    const root = document.querySelector(".se-root") as HTMLElement;
    act(() => {
      root.focus();
    });
    act(() => {
      root.blur();
    });
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls[0][0]).toContain("flush on blur");
    vi.useRealTimers();
  });
});

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

describe("Editor lifecycle and state", () => {
  it("calls onFocus when the root receives focus", () => {
    const onFocus = vi.fn();
    render(<Editor onFocus={onFocus} />);
    const root = document.querySelector(".se-root") as HTMLElement;
    expect(root).not.toBeNull();
    act(() => {
      root.focus();
    });
    expect(onFocus).toHaveBeenCalled();
  });

  it("calls onBlur when the root loses focus", () => {
    const onBlur = vi.fn();
    render(<Editor onBlur={onBlur} />);
    const root = document.querySelector(".se-root") as HTMLElement;
    expect(root).not.toBeNull();
    act(() => {
      root.focus();
    });
    act(() => {
      root.blur();
    });
    expect(onBlur).toHaveBeenCalled();
  });

  it("sets contentEditable=false when editable=false", () => {
    render(<Editor editable={false} />);
    const root = document.querySelector(".se-root");
    expect(root?.getAttribute("contenteditable")).toBe("false");
  });

  it("updates contentEditable when editable prop changes", () => {
    const { rerender } = render(<Editor editable={true} />);
    expect(
      document.querySelector(".se-root")?.getAttribute("contenteditable"),
    ).toBe("true");
    rerender(<Editor editable={false} />);
    expect(
      document.querySelector(".se-root")?.getAttribute("contenteditable"),
    ).toBe("false");
    rerender(<Editor editable={true} />);
    expect(
      document.querySelector(".se-root")?.getAttribute("contenteditable"),
    ).toBe("true");
  });

  it("calls onEditableChange when editable prop changes", () => {
    const onEditableChange = vi.fn();
    const { rerender } = render(
      <Editor editable={true} onEditableChange={onEditableChange} />,
    );
    onEditableChange.mockClear();
    rerender(<Editor editable={false} onEditableChange={onEditableChange} />);
    expect(onEditableChange).toHaveBeenCalledWith(false);
    onEditableChange.mockClear();
    rerender(<Editor editable={true} onEditableChange={onEditableChange} />);
    expect(onEditableChange).toHaveBeenCalledWith(true);
  });

  it("renders placeholder prop", () => {
    render(<Editor placeholder="Type something" />);
    const placeholder = document.querySelector(".se-placeholder");
    expect(placeholder?.textContent).toBe("Type something");
  });

  it("updates placeholder when prop changes", () => {
    const { rerender } = render(<Editor placeholder="First" />);
    expect(document.querySelector(".se-placeholder")?.textContent).toBe(
      "First",
    );
    rerender(<Editor placeholder="Second" />);
    expect(document.querySelector(".se-placeholder")?.textContent).toBe(
      "Second",
    );
  });

  it("falls back to config.placeholder for backward compat", () => {
    render(<Editor config={{ placeholder: "From config" }} />);
    expect(document.querySelector(".se-placeholder")?.textContent).toBe(
      "From config",
    );
  });

  it("calls onError when the editor throws", () => {
    const onError = vi.fn();
    let editor: LexicalEditor | null = null;
    render(
      <Editor
        onError={onError}
        onReady={(inst) => {
          editor = inst.editor;
        }}
      />,
    );
    expect(editor).not.toBeNull();
    act(() => {
      editor!.update(() => {
        throw new Error("kaboom");
      });
      editor!.read(() => {});
    });
    expect(onError).toHaveBeenCalled();
    const arg = onError.mock.calls[0][0];
    expect(arg).toBeInstanceOf(Error);
    expect((arg as Error).message).toBe("kaboom");
  });
});

describe("Editor ref and form integration", () => {
  it("exposes SeditorInstance via ref", () => {
    const ref = createRef<SeditorInstance>();
    render(<Editor ref={ref} />);
    expect(ref.current).not.toBeNull();
    expect(ref.current?.getHTML).toBeDefined();
    expect(ref.current?.commands).toBeDefined();
    expect(ref.current?.editor).toBeDefined();
  });

  it("renders a hidden input when name is set", () => {
    render(<Editor name="content" defaultValue="<p>Form value</p>" />);
    const hidden = document.querySelector(
      'input[type="hidden"][name="content"]',
    ) as HTMLInputElement | null;
    expect(hidden).not.toBeNull();
    expect(hidden?.value).toContain("Form value");
  });

  it("keeps hidden input in sync with user edits", () => {
    let editor: LexicalEditor | null = null;
    render(
      <Editor
        name="content"
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
        p.append($createTextNode("Edited"));
        root.append(p);
      });
      editor!.read(() => {});
    });
    const hidden = document.querySelector(
      'input[type="hidden"][name="content"]',
    ) as HTMLInputElement | null;
    expect(hidden?.value).toContain("Edited");
  });

  it("keeps hidden input in sync with controlled value", () => {
    const { rerender } = render(<Editor name="content" value="<p>A</p>" />);
    const hidden = document.querySelector(
      'input[type="hidden"][name="content"]',
    ) as HTMLInputElement | null;
    expect(hidden?.value).toContain("<p>A</p>");
    rerender(<Editor name="content" value="<p>B</p>" />);
    const hidden2 = document.querySelector(
      'input[type="hidden"][name="content"]',
    ) as HTMLInputElement | null;
    expect(hidden2?.value).toContain("<p>B</p>");
  });

  it("applies id to the contentEditable root", () => {
    render(<Editor id="my-editor" />);
    const root = document.querySelector(".se-root");
    expect(root?.getAttribute("id")).toBe("my-editor");
  });

  it("applies aria-label to the contentEditable root", () => {
    render(<Editor ariaLabel="Article body" />);
    const root = document.querySelector(".se-root");
    expect(root?.getAttribute("aria-label")).toBe("Article body");
  });

  it("applies spellCheck and tabIndex", () => {
    render(<Editor spellCheck={false} tabIndex={-1} />);
    const root = document.querySelector(".se-root");
    expect(root?.getAttribute("spellcheck")).toBe("false");
    expect(root?.getAttribute("tabindex")).toBe("-1");
  });

  it("sets role=textbox and aria-multiline=true", () => {
    render(<Editor />);
    const root = document.querySelector(".se-root");
    expect(root?.getAttribute("role")).toBe("textbox");
    expect(root?.getAttribute("aria-multiline")).toBe("true");
  });
});

describe("Editor backward compat", () => {
  it("renders with no props (fully uncontrolled)", () => {
    render(<Editor />);
    const root = document.querySelector(".se-root");
    expect(root).not.toBeNull();
    expect(root?.getAttribute("contenteditable")).toBe("true");
  });

  it("still works with config.html only", () => {
    render(<Editor config={{ html: "<p>Legacy</p>" }} />);
    expect(document.querySelector(".se-root")?.textContent).toContain(
      "Legacy",
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
    // Clear any selection left by previous tests so the command handler
    // doesn't try to read a stale range's getBoundingClientRect (jsdom).
    window.getSelection()?.removeAllRanges();
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
