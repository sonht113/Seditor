import { describe, it, expect, vi, afterEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import {
  $getRoot,
  $createParagraphNode,
  $createTextNode,
  type LexicalEditor,
  type EditorState,
} from "lexical";
import { defineComponent, h, nextTick } from "vue";
import Editor from "./Editor.vue";
import Toolbar from "./Toolbar.vue";
import LinkTooltip from "./LinkTooltip.vue";
import { useEditor } from "./useEditor";
import { SE_OPEN_LINK_COMMAND } from "seditor-core";
import type { SeditorInstance } from "seditor-core";

async function tick(): Promise<void> {
  await flushPromises();
  await nextTick();
}

function applyEditorUpdate(editor: LexicalEditor, fn: () => void): void {
  editor.update(fn);
  editor.read(() => {});
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mountEditor(options?: any) {
  return mount(Editor, { attachTo: document.body, ...options });
}

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = "";
});

describe("Editor", () => {
  it("renders a contenteditable root", () => {
    mountEditor();
    const root = document.querySelector(".se-root");
    expect(root).not.toBeNull();
    expect(root?.getAttribute("contenteditable")).toBe("true");
  });

  it("provides instance via useEditor", () => {
    let captured: { commands: unknown } | null = null;
    const Child = defineComponent({
      setup() {
        captured = useEditor() as { commands: unknown };
        return () => null;
      },
    });
    mountEditor({
      slots: { default: () => h(Child) },
    });
    expect(captured).not.toBeNull();
    expect(captured!.commands).toBeDefined();
  });

  it("useEditor throws outside Editor", () => {
    expect(() => {
      const Bad = defineComponent({
        setup() {
          useEditor();
          return () => null;
        },
      });
      mount(Bad, { attachTo: document.body });
    }).toThrow(/useEditor must be used within/);
  });

  it("renders Toolbar with default buttons", () => {
    const wrapper = mountEditor({
      slots: { default: () => h(Toolbar) },
    });
    expect(wrapper.find('[aria-label="Bold"]').exists()).toBe(true);
    expect(wrapper.find('[aria-label="Italic"]').exists()).toBe(true);
    expect(wrapper.find('[aria-label="Undo"]').exists()).toBe(true);
  });
});

describe("Editor onChangeDebounceMs", () => {
  it("fires change synchronously when debounce is 0 (default)", async () => {
    const onChange = vi.fn();
    let editor: LexicalEditor | null = null;
    mountEditor({
      props: {
        onChange,
        onReady: (inst: SeditorInstance) => {
          editor = inst.editor;
        },
      },
    });
    applyEditorUpdate(editor!, () => {
      const root = $getRoot();
      root.clear();
      root.append($createParagraphNode());
    });
    await tick();
    expect(onChange).toHaveBeenCalled();
  });

  it("defers change when onChangeDebounceMs > 0", async () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    let editor: LexicalEditor | null = null;
    mountEditor({
      props: {
        onChange,
        onChangeDebounceMs: 100,
        onReady: (inst: SeditorInstance) => {
          editor = inst.editor;
        },
      },
    });
    applyEditorUpdate(editor!, () => {
      const root = $getRoot();
      root.clear();
      const p = $createParagraphNode();
      p.append($createTextNode("debounced"));
      root.append(p);
    });
    await tick();
    expect(onChange).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);
    await tick();
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls[0][0]).toContain("debounced");
    vi.useRealTimers();
  });

  it("flushes pending debounced change on blur", async () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    let editor: LexicalEditor | null = null;
    mountEditor({
      props: {
        onChange,
        onChangeDebounceMs: 500,
        onReady: (inst: SeditorInstance) => {
          editor = inst.editor;
        },
      },
    });
    applyEditorUpdate(editor!, () => {
      const root = $getRoot();
      root.clear();
      const p = $createParagraphNode();
      p.append($createTextNode("flush on blur"));
      root.append(p);
    });
    await tick();
    expect(onChange).not.toHaveBeenCalled();
    const root = document.querySelector(".se-root") as HTMLElement;
    root.focus();
    await tick();
    root.blur();
    await tick();
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls[0][0]).toContain("flush on blur");
    vi.useRealTimers();
  });

  it("flushes pending debounced change on unmount", async () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    let editor: LexicalEditor | null = null;
    const wrapper = mountEditor({
      props: {
        onChange,
        onChangeDebounceMs: 500,
        onReady: (inst: SeditorInstance) => {
          editor = inst.editor;
        },
      },
    });
    applyEditorUpdate(editor!, () => {
      const root = $getRoot();
      root.clear();
      const p = $createParagraphNode();
      p.append($createTextNode("flush on unmount"));
      root.append(p);
    });
    await tick();
    expect(onChange).not.toHaveBeenCalled();
    wrapper.unmount();
    await tick();
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls[0][0]).toContain("flush on unmount");
    vi.useRealTimers();
  });
});

describe("Editor controlled content", () => {
  it("renders initial modelValue prop", () => {
    mountEditor({ props: { modelValue: "<p>Hello controlled</p>" } });
    const root = document.querySelector(".se-root");
    expect(root?.textContent).toContain("Hello controlled");
  });

  it("renders defaultValue when modelValue is undefined", () => {
    mountEditor({ props: { defaultValue: "<p>Default content</p>" } });
    const root = document.querySelector(".se-root");
    expect(root?.textContent).toContain("Default content");
  });

  it("falls back to config.html for backward compat", () => {
    mountEditor({ props: { config: { html: "<p>From config</p>" } } });
    const root = document.querySelector(".se-root");
    expect(root?.textContent).toContain("From config");
  });

  it("updates content when modelValue prop changes", async () => {
    const wrapper = mountEditor({ props: { modelValue: "<p>First</p>" } });
    expect(document.querySelector(".se-root")?.textContent).toContain("First");
    await wrapper.setProps({ modelValue: "<p>Second</p>" });
    await tick();
    expect(document.querySelector(".se-root")?.textContent).toContain("Second");
    expect(document.querySelector(".se-root")?.textContent).not.toContain(
      "First",
    );
  });

  it("emits change when editor content changes", async () => {
    let editor: LexicalEditor | null = null;
    const wrapper = mountEditor({
      props: {
        onReady: (inst: SeditorInstance) => {
          editor = inst.editor;
        },
      },
    });
    expect(editor).not.toBeNull();
    applyEditorUpdate(editor!, () => {
      const root = $getRoot();
      root.clear();
      const p = $createParagraphNode();
      p.append($createTextNode("Typed text"));
      root.append(p);
    });
    await tick();
    const changeEvents = wrapper.emitted("change");
    expect(changeEvents).toBeDefined();
    const lastCall = changeEvents![changeEvents!.length - 1];
    expect(lastCall[0]).toContain("Typed text");
  });

  it("does not echo back a controlled modelValue via change (no loop)", async () => {
    const onChange = vi.fn();
    let editor: LexicalEditor | null = null;
    mountEditor({
      props: {
        modelValue: "<p>Controlled</p>",
        onChange,
        onReady: (inst: SeditorInstance) => {
          editor = inst.editor;
        },
      },
    });
    expect(editor).not.toBeNull();
    expect(onChange).not.toHaveBeenCalled();
    applyEditorUpdate(editor!, () => {
      const root = $getRoot();
      root.clear();
      const p = $createParagraphNode();
      p.append($createTextNode("User edit"));
      root.append(p);
    });
    await tick();
    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[0]).toContain("User edit");
  });

  it("supports valueFormat='json' for change", async () => {
    let editor: LexicalEditor | null = null;
    const wrapper = mountEditor({
      props: {
        valueFormat: "json",
        onReady: (inst: SeditorInstance) => {
          editor = inst.editor;
        },
      },
    });
    applyEditorUpdate(editor!, () => {
      const root = $getRoot();
      root.clear();
      const p = $createParagraphNode();
      p.append($createTextNode("JSON mode"));
      root.append(p);
    });
    await tick();
    const changeEvents = wrapper.emitted("change");
    expect(changeEvents).toBeDefined();
    const lastCall = changeEvents![changeEvents!.length - 1];
    const parsed = JSON.parse(lastCall[0] as string);
    expect(JSON.stringify(parsed)).toContain("JSON mode");
  });

  it("supports valueFormat='json' for controlled modelValue", async () => {
    let editor: LexicalEditor | null = null;
    const onReady = (inst: SeditorInstance) => {
      editor = inst.editor;
    };
    const wrapper = mountEditor({
      props: { defaultValue: "<p>JSON mode</p>", onReady },
    });
    expect(editor).not.toBeNull();
    editor!.read(() => {});
    const capturedJson = JSON.stringify(
      (editor!.getEditorState() as EditorState).toJSON(),
    );
    applyEditorUpdate(editor!, () => {
      const root = $getRoot();
      root.clear();
      root.append($createParagraphNode());
    });
    await tick();
    expect(document.querySelector(".se-root")?.textContent).not.toContain(
      "JSON mode",
    );
    await wrapper.setProps({ valueFormat: "json", modelValue: capturedJson });
    await tick();
    expect(document.querySelector(".se-root")?.textContent).toContain(
      "JSON mode",
    );
  });

  it("reports a modelValue that does not match valueFormat via error instead of throwing", async () => {
    const onError = vi.fn();
    const wrapper = mountEditor({
      props: { modelValue: "<p>First</p>", onError },
    });
    expect(document.querySelector(".se-root")?.textContent).toContain("First");
    await wrapper.setProps({
      valueFormat: "json",
      modelValue: "<p>not json</p>",
    });
    await tick();
    expect(onError).toHaveBeenCalled();
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(document.querySelector(".se-root")?.textContent).toContain("First");
  });
});

describe("Editor lifecycle and state", () => {
  it("calls onFocus when the root receives focus", async () => {
    const onFocus = vi.fn();
    mountEditor({ props: { onFocus } });
    const root = document.querySelector(".se-root") as HTMLElement;
    expect(root).not.toBeNull();
    root.focus();
    await tick();
    expect(onFocus).toHaveBeenCalled();
  });

  it("calls onBlur when the root loses focus", async () => {
    const onBlur = vi.fn();
    mountEditor({ props: { onBlur } });
    const root = document.querySelector(".se-root") as HTMLElement;
    expect(root).not.toBeNull();
    root.focus();
    await tick();
    root.blur();
    await tick();
    expect(onBlur).toHaveBeenCalled();
  });

  it("focuses the editor when autoFocus is set", async () => {
    const onReady = vi.fn();
    let instance: SeditorInstance | null = null;
    const wrapper = mountEditor({
      props: {
        autoFocus: false,
        onReady: (inst: SeditorInstance) => {
          onReady(inst);
          instance = inst;
        },
      },
    });
    expect(instance).not.toBeNull();
    const focusSpy = vi.spyOn(instance!.editor, "focus");
    try {
      expect(focusSpy).not.toHaveBeenCalled();
      await wrapper.setProps({ autoFocus: true });
      await tick();
      expect(focusSpy).toHaveBeenCalledTimes(1);
    } finally {
      focusSpy.mockRestore();
    }
  });

  it("does not destroy the instance when autoFocus changes after mount", async () => {
    const onReady = vi.fn();
    const onChange = vi.fn();
    let editor: LexicalEditor | null = null;
    const wrapper = mountEditor({
      props: {
        autoFocus: false,
        onChange,
        onReady: (inst: SeditorInstance) => {
          onReady(inst);
          editor = inst.editor;
        },
      },
    });
    await wrapper.setProps({ autoFocus: true });
    await tick();
    expect(onReady).toHaveBeenCalledTimes(1);
    applyEditorUpdate(editor!, () => {
      const root = $getRoot();
      root.clear();
      const p = $createParagraphNode();
      p.append($createTextNode("still alive"));
      root.append(p);
    });
    await tick();
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls[onChange.mock.calls.length - 1][0]).toContain(
      "still alive",
    );
  });

  it("sets contentEditable=false when editable=false", () => {
    mountEditor({ props: { editable: false } });
    const root = document.querySelector(".se-root");
    expect(root?.getAttribute("contenteditable")).toBe("false");
  });

  it("updates contentEditable when editable prop changes", async () => {
    const wrapper = mountEditor({ props: { editable: true } });
    expect(
      document.querySelector(".se-root")?.getAttribute("contenteditable"),
    ).toBe("true");
    await wrapper.setProps({ editable: false });
    await tick();
    expect(
      document.querySelector(".se-root")?.getAttribute("contenteditable"),
    ).toBe("false");
    await wrapper.setProps({ editable: true });
    await tick();
    expect(
      document.querySelector(".se-root")?.getAttribute("contenteditable"),
    ).toBe("true");
  });

  it("does not call onEditableChange on mount", () => {
    const onEditableChange = vi.fn();
    mountEditor({
      props: { editable: false, onEditableChange },
    });
    expect(onEditableChange).not.toHaveBeenCalled();
  });

  it("calls onEditableChange when editable prop changes", async () => {
    const onEditableChange = vi.fn();
    const wrapper = mountEditor({
      props: { editable: true, onEditableChange },
    });
    await wrapper.setProps({ editable: false });
    await tick();
    expect(onEditableChange).toHaveBeenCalledWith(false);
    onEditableChange.mockClear();
    await wrapper.setProps({ editable: true });
    await tick();
    expect(onEditableChange).toHaveBeenCalledWith(true);
  });

  it("calls onEditableChange when editable is changed via the instance", async () => {
    const onEditableChange = vi.fn();
    let instance: SeditorInstance | null = null;
    mountEditor({
      props: {
        onEditableChange,
        onReady: (inst: SeditorInstance) => {
          instance = inst;
        },
      },
    });
    expect(onEditableChange).not.toHaveBeenCalled();
    instance!.editor.setEditable(false);
    await tick();
    expect(onEditableChange).toHaveBeenCalledWith(false);
    expect(
      document.querySelector(".se-root")?.getAttribute("contenteditable"),
    ).toBe("false");
  });

  it("renders placeholder prop", () => {
    mountEditor({ props: { placeholder: "Type something" } });
    const placeholder = document.querySelector(".se-placeholder");
    expect(placeholder?.textContent).toBe("Type something");
  });

  it("updates placeholder when prop changes", async () => {
    const wrapper = mountEditor({ props: { placeholder: "First" } });
    expect(document.querySelector(".se-placeholder")?.textContent).toBe("First");
    await wrapper.setProps({ placeholder: "Second" });
    await tick();
    expect(document.querySelector(".se-placeholder")?.textContent).toBe(
      "Second",
    );
  });

  it("falls back to config.placeholder for backward compat", () => {
    mountEditor({ props: { config: { placeholder: "From config" } } });
    expect(document.querySelector(".se-placeholder")?.textContent).toBe(
      "From config",
    );
  });

  it("calls onError when the editor throws", async () => {
    const onError = vi.fn();
    let editor: LexicalEditor | null = null;
    mountEditor({
      props: {
        onError,
        onReady: (inst: SeditorInstance) => {
          editor = inst.editor;
        },
      },
    });
    expect(editor).not.toBeNull();
    applyEditorUpdate(editor!, () => {
      throw new Error("kaboom");
    });
    await tick();
    expect(onError).toHaveBeenCalled();
    const arg = onError.mock.calls[0][0];
    expect(arg).toBeInstanceOf(Error);
    expect((arg as Error).message).toBe("kaboom");
  });
});

describe("Editor ref and form integration", () => {
  it("exposes SeditorInstance via template ref", () => {
    const wrapper = mountEditor();
    const exposed = wrapper.vm as unknown as SeditorInstance;
    expect(exposed.getHTML).toBeDefined();
    expect(exposed.commands).toBeDefined();
    expect(exposed.editor).toBeDefined();
  });

  it("renders a hidden input when name is set", () => {
    mountEditor({
      props: { name: "content", defaultValue: "<p>Form value</p>" },
    });
    const hidden = document.querySelector(
      'input[type="hidden"][name="content"]',
    ) as HTMLInputElement | null;
    expect(hidden).not.toBeNull();
    expect(hidden?.value).toContain("Form value");
  });

  it("keeps hidden input in sync with user edits", async () => {
    let editor: LexicalEditor | null = null;
    mountEditor({
      props: {
        name: "content",
        onReady: (inst: SeditorInstance) => {
          editor = inst.editor;
        },
      },
    });
    applyEditorUpdate(editor!, () => {
      const root = $getRoot();
      root.clear();
      const p = $createParagraphNode();
      p.append($createTextNode("Edited"));
      root.append(p);
    });
    await tick();
    const hidden = document.querySelector(
      'input[type="hidden"][name="content"]',
    ) as HTMLInputElement | null;
    expect(hidden?.value).toContain("Edited");
  });

  it("keeps hidden input in sync with controlled modelValue", async () => {
    const wrapper = mountEditor({
      props: { name: "content", modelValue: "<p>A</p>" },
    });
    const hidden = document.querySelector(
      'input[type="hidden"][name="content"]',
    ) as HTMLInputElement | null;
    expect(hidden?.value).toContain("<p>A</p>");
    await wrapper.setProps({ modelValue: "<p>B</p>" });
    await tick();
    const hidden2 = document.querySelector(
      'input[type="hidden"][name="content"]',
    ) as HTMLInputElement | null;
    expect(hidden2?.value).toContain("<p>B</p>");
  });

  it("applies id to the contentEditable root", () => {
    mountEditor({ props: { id: "my-editor" } });
    const root = document.querySelector(".se-root");
    expect(root?.getAttribute("id")).toBe("my-editor");
  });

  it("applies aria-label to the contentEditable root", () => {
    mountEditor({ props: { ariaLabel: "Article body" } });
    const root = document.querySelector(".se-root");
    expect(root?.getAttribute("aria-label")).toBe("Article body");
  });

  it("applies spellCheck and tabIndex", () => {
    mountEditor({ props: { spellCheck: false, tabIndex: -1 } });
    const root = document.querySelector(".se-root");
    expect(root?.getAttribute("spellcheck")).toBe("false");
    expect(root?.getAttribute("tabindex")).toBe("-1");
  });

  it("sets role=textbox and aria-multiline=true", () => {
    mountEditor();
    const root = document.querySelector(".se-root");
    expect(root?.getAttribute("role")).toBe("textbox");
    expect(root?.getAttribute("aria-multiline")).toBe("true");
  });
});

describe("Editor backward compat", () => {
  it("renders with no props (fully uncontrolled)", () => {
    mountEditor();
    const root = document.querySelector(".se-root");
    expect(root).not.toBeNull();
    expect(root?.getAttribute("contenteditable")).toBe("true");
  });

  it("still works with config.html only", () => {
    mountEditor({ props: { config: { html: "<p>Legacy</p>" } } });
    expect(document.querySelector(".se-root")?.textContent).toContain(
      "Legacy",
    );
  });
});

describe("LinkTooltip", () => {
  it("does not render when closed", () => {
    mountEditor({
      slots: { default: () => h(LinkTooltip) },
    });
    expect(document.querySelector(".se-link-tooltip")).toBeNull();
  });

  it("opens tooltip with input and buttons on SE_OPEN_LINK_COMMAND", async () => {
    window.getSelection()?.removeAllRanges();
    let editor: LexicalEditor | null = null;
    mountEditor({
      props: {
        onReady: (inst: SeditorInstance) => {
          editor = inst.editor;
        },
      },
      slots: { default: () => h(LinkTooltip) },
    });
    expect(editor).not.toBeNull();
    editor!.dispatchCommand(SE_OPEN_LINK_COMMAND, undefined);
    await tick();
    const tooltip = document.querySelector(".se-link-tooltip");
    expect(tooltip).not.toBeNull();
    expect(tooltip!.querySelector("input")).not.toBeNull();
    expect(tooltip!.querySelector(".se-link-tooltip-close")).not.toBeNull();
    expect(tooltip!.querySelector(".se-link-tooltip-accept")).not.toBeNull();
  });
});
