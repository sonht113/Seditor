<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy } from "svelte";
  import { $getRoot as getRoot } from "lexical";
  import { createSeditor } from "seditor-core";
  import type { SeditorConfig, SeditorInstance } from "seditor-core";
  import { setEditor } from "./context";
  import type { EditorValueFormat } from "./types";
  import LinkTooltip from "./LinkTooltip.svelte";

  export let config: SeditorConfig | undefined = undefined;
  export let value: string | undefined = undefined;
  export let defaultValue: string | undefined = undefined;
  export let valueFormat: EditorValueFormat = "html";
  export let onChangeDebounceMs = 0;
  export let editable: boolean | undefined = undefined;
  export let placeholder: string | undefined = undefined;
  export let id: string | undefined = undefined;
  export let name: string | undefined = undefined;
  export let ariaLabel: string | undefined = undefined;
  export let ariaLabelledBy: string | undefined = undefined;
  export let ariaDescribedBy: string | undefined = undefined;
  export let spellCheck: boolean | undefined = undefined;
  export let autoFocus: boolean | undefined = undefined;
  export let tabIndex: number | undefined = undefined;
  export let className = "se-editor";

  const dispatch = createEventDispatcher<{
    ready: SeditorInstance;
    change: { value: string; instance: SeditorInstance };
    focus: { event: FocusEvent; instance: SeditorInstance };
    blur: { event: FocusEvent; instance: SeditorInstance };
    error: { error: Error; instance: SeditorInstance };
    editableChange: boolean;
  }>();

  function readValue(
    inst: SeditorInstance,
    format: EditorValueFormat,
  ): string {
    return format === "json"
      ? JSON.stringify(inst.getJSON())
      : inst.getHTML();
  }

  function writeValue(
    inst: SeditorInstance,
    valueToWrite: string,
    format: EditorValueFormat,
  ): void {
    if (format === "json") {
      inst.setJSON(valueToWrite);
    } else {
      inst.setHTML(valueToWrite);
    }
  }

  const initialContent = value ?? defaultValue ?? config?.html ?? "";

  const instance = createSeditor({
    ...config,
    html: undefined,
    placeholder: undefined,
    editable: editable ?? config?.editable,
    onError: (error) => {
      dispatch("error", { error, instance });
    },
  });

  if (initialContent && initialContent !== "") {
    try {
      writeValue(instance, initialContent, valueFormat);
    } catch (error) {
      dispatch("error", { error: error as Error, instance });
    }
  }

  setEditor(instance);

  let rootRef: HTMLDivElement | null = null;
  let isEmpty = true;
  let editableState = editable ?? config?.editable ?? true;
  let placeholderState = placeholder ?? config?.placeholder ?? null;
  let hiddenValue = initialContent ?? "";

  let lastInternalValue: string | undefined;
  let isSettingFromProp = false;
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let destroyPending = false;

  function fireOnChange(val: string): void {
    if (onChangeDebounceMs > 0) {
      if (debounceTimer !== null) {
        clearTimeout(debounceTimer);
      }
      debounceTimer = setTimeout(() => {
        debounceTimer = null;
        dispatch("change", { value: val, instance });
      }, onChangeDebounceMs);
    } else {
      dispatch("change", { value: val, instance });
    }
  }

  function flushOnChange(): void {
    if (debounceTimer !== null) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
      const last = lastInternalValue;
      if (last !== undefined) {
        dispatch("change", { value: last, instance });
      }
    }
  }

  onMount(() => {
    destroyPending = false;
    const editor = instance.editor;
    if (!rootRef) return;
    editor.setRootElement(rootRef);
    editor.setEditable(editable ?? config?.editable ?? true);
    dispatch("ready", instance);

    const unregisterUpdate = editor.registerUpdateListener(
      ({ editorState }) => {
        editorState.read(() => {
          isEmpty = getRoot().getTextContent() === "";
        });
        if (isSettingFromProp) return;
        const next = readValue(instance, valueFormat);
        lastInternalValue = next;
        hiddenValue = next;
        fireOnChange(next);
      },
    );

    const unregisterEditable = editor.registerEditableListener((next) => {
      editableState = next;
      dispatch("editableChange", next);
    });

    const handleFocus = (event: FocusEvent) => {
      dispatch("focus", { event, instance });
    };
    const handleBlur = (event: FocusEvent) => {
      flushOnChange();
      dispatch("blur", { event, instance });
    };
    rootRef.addEventListener("focus", handleFocus, true);
    rootRef.addEventListener("blur", handleBlur, true);

    if (autoFocus) {
      editor.focus();
    }

    return () => {
      unregisterUpdate();
      unregisterEditable();
      rootRef?.removeEventListener("focus", handleFocus, true);
      rootRef?.removeEventListener("blur", handleBlur, true);
      editor.setRootElement(null);
    };
  });

  onDestroy(() => {
    destroyPending = true;
    queueMicrotask(() => {
      if (destroyPending) instance.destroy();
    });
    flushOnChange();
  });

  $: {
    const next = editable ?? config?.editable ?? true;
    instance.editor.setEditable(next);
    editableState = next;
  }

  $: {
    placeholderState = placeholder ?? config?.placeholder ?? null;
  }

  $: if (value !== undefined) {
    if (
      value !== lastInternalValue &&
      value !== readValue(instance, valueFormat)
    ) {
      isSettingFromProp = true;
      try {
        writeValue(instance, value, valueFormat);
        instance.editor.read(() => {});
        hiddenValue = value;
      } catch (error) {
        dispatch("error", { error: error as Error, instance });
      } finally {
        isSettingFromProp = false;
      }
    }
  }

  $: if (autoFocus) {
    instance.editor.focus();
  }
</script>

<div class={className}>
  <slot />
  <div class="se-content">
    {#if isEmpty && placeholderState}
      <div class="se-placeholder" aria-hidden="true">
        {placeholderState}
      </div>
    {/if}
    <div
      bind:this={rootRef}
      {id}
      class="se-root"
      contenteditable={editableState}
      role="textbox"
      aria-multiline="true"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      spellcheck={spellCheck}
      tabindex={tabIndex}
    />
  </div>
  {#if name}
    <input type="hidden" {name} value={hiddenValue} />
  {/if}
  <LinkTooltip />
</div>
