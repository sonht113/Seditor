<script setup lang="ts">
import {
  ref,
  shallowRef,
  watch,
  provide,
  onMounted,
  onBeforeUnmount,
} from "vue";
import { $getRoot } from "lexical";
import { createSeditor } from "seditor-core";
import type { SeditorConfig, SeditorInstance } from "seditor-core";
import { SEDITOR_KEY } from "./useEditor";
import type { EditorValueFormat } from "./types";
import LinkTooltip from "./LinkTooltip.vue";

const props = withDefaults(
  defineProps<{
    config?: SeditorConfig;
    modelValue?: string;
    defaultValue?: string;
    valueFormat?: EditorValueFormat;
    onChangeDebounceMs?: number;
    editable?: boolean;
    placeholder?: string;
    id?: string;
    name?: string;
    ariaLabel?: string;
    ariaLabelledBy?: string;
    ariaDescribedBy?: string;
    spellCheck?: boolean;
    autoFocus?: boolean;
    tabIndex?: number;
    className?: string;
  }>(),
  {
    valueFormat: "html",
    onChangeDebounceMs: 0,
    className: "se-editor",
    editable: undefined,
    placeholder: undefined,
    id: undefined,
    name: undefined,
    ariaLabel: undefined,
    ariaLabelledBy: undefined,
    ariaDescribedBy: undefined,
    spellCheck: undefined,
    autoFocus: undefined,
    tabIndex: undefined,
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: string, instance: SeditorInstance];
  ready: [instance: SeditorInstance];
  change: [value: string, instance: SeditorInstance];
  focus: [event: FocusEvent, instance: SeditorInstance];
  blur: [event: FocusEvent, instance: SeditorInstance];
  error: [error: Error, instance: SeditorInstance];
  editableChange: [editable: boolean];
}>();

function readValue(
  instance: SeditorInstance,
  format: EditorValueFormat,
): string {
  return format === "json"
    ? JSON.stringify(instance.getJSON())
    : instance.getHTML();
}

function writeValue(
  instance: SeditorInstance,
  value: string,
  format: EditorValueFormat,
): void {
  if (format === "json") {
    instance.setJSON(value);
  } else {
    instance.setHTML(value);
  }
}

// Resolve initial content once. Priority: modelValue > defaultValue > config.html.
const initialContent =
  props.modelValue ?? props.defaultValue ?? props.config?.html ?? "";

// The editor instance is created once. `config` is treated as initial-only
// for fields that Lexical cannot change after creation (plugins, theme,
// namespace, shortcuts). Use the controlled props for reactive content.
const instance = createSeditor({
  ...props.config,
  html: undefined,
  placeholder: undefined,
  editable: props.editable ?? props.config?.editable,
  onError: (error) => {
    emit("error", error, instance);
  },
});

if (initialContent !== undefined && initialContent !== "") {
  try {
    writeValue(instance, initialContent, props.valueFormat);
  } catch (error) {
    emit("error", error as Error, instance);
  }
}

// Expose the SeditorInstance so consumers can access it via template ref.
defineExpose(instance);

// Provide the instance to child components (Toolbar, ColorPicker, etc.).
provide(SEDITOR_KEY, instance);

const rootRef = ref<HTMLDivElement | null>(null);
const isEmpty = ref(true);
const editableState = ref(props.editable ?? props.config?.editable ?? true);
const placeholderState = ref(
  props.placeholder ?? props.config?.placeholder ?? null,
);
const hiddenValue = ref(initialContent);

// Loop protection for controlled `modelValue`:
//  - lastInternalValue: the last value produced by the user typing
//    (so we can skip applying a `modelValue` prop that merely echoes it back).
//  - isSettingFromProp: set while we are applying a `modelValue` prop, so the
//    update listener can avoid echoing that update back via `update:modelValue`.
const lastInternalValue = shallowRef<string | undefined>(undefined);
const isSettingFromProp = ref(false);

// Instance destroy is deferred to a microtask in the unmount cleanup so a
// dev-mode remount cycle can cancel it via this flag; only a real unmount
// actually destroys.
const destroyPending = ref(false);

// Debounce plumbing for `onChange`. Default (0) fires synchronously.
const debounceTimer = ref<ReturnType<typeof setTimeout> | null>(null);

function fireOnChange(val: string): void {
  const ms = props.onChangeDebounceMs;
  if (ms > 0) {
    if (debounceTimer.value !== null) {
      clearTimeout(debounceTimer.value);
    }
    debounceTimer.value = setTimeout(() => {
      debounceTimer.value = null;
      emit("change", val, instance);
      emit("update:modelValue", val, instance);
    }, ms);
  } else {
    emit("change", val, instance);
    emit("update:modelValue", val, instance);
  }
}

function flushOnChange(): void {
  if (debounceTimer.value !== null) {
    clearTimeout(debounceTimer.value);
    debounceTimer.value = null;
    const last = lastInternalValue.value;
    if (last !== undefined) {
      emit("change", last, instance);
      emit("update:modelValue", last, instance);
    }
  }
}

// Cleanup functions registered in onMounted, called in onBeforeUnmount.
const cleanupFns: Array<() => void> = [];

onMounted(() => {
  destroyPending.value = false;
  const editor = instance.editor;
  const root = rootRef.value;
  if (!root) return;
  editor.setRootElement(root);
  // Ensure the editor's editable state is set after the root element is
  // attached, since setRootElement may reset it.
  editor.setEditable(props.editable ?? props.config?.editable ?? true);
  emit("ready", instance);

  const unregisterUpdate = editor.registerUpdateListener(({ editorState }) => {
    editorState.read(() => {
      isEmpty.value = $getRoot().getTextContent() === "";
    });
    if (isSettingFromProp.value) return;
    const next = readValue(instance, props.valueFormat);
    lastInternalValue.value = next;
    hiddenValue.value = next;
    fireOnChange(next);
  });

  const unregisterEditable = editor.registerEditableListener((next) => {
    editableState.value = next;
    emit("editableChange", next);
  });

  const handleFocus = (event: FocusEvent) => {
    emit("focus", event, instance);
  };
  const handleBlur = (event: FocusEvent) => {
    flushOnChange();
    emit("blur", event, instance);
  };
  root.addEventListener("focus", handleFocus, true);
  root.addEventListener("blur", handleBlur, true);

  cleanupFns.push(() => {
    unregisterUpdate();
    unregisterEditable();
    root.removeEventListener("focus", handleFocus, true);
    root.removeEventListener("blur", handleBlur, true);
    editor.setRootElement(null);
  });
});

onBeforeUnmount(() => {
  for (const fn of cleanupFns) fn();
  cleanupFns.length = 0;
  destroyPending.value = true;
  queueMicrotask(() => {
    if (destroyPending.value) instance.destroy();
  });
  flushOnChange();
});

// Focus the editor on mount (and if `autoFocus` later turns truthy).
watch(
  () => props.autoFocus,
  (af) => {
    if (af) {
      instance.editor.focus();
    }
  },
  { immediate: true },
);

// Reactive `editable` prop -> editor.setEditable.
watch(
  () => props.editable,
  (editable) => {
    const value = editable ?? props.config?.editable ?? true;
    instance.editor.setEditable(value);
  },
);

// Reactive `placeholder` prop -> local state.
watch(
  () => props.placeholder ?? props.config?.placeholder,
  (p) => {
    placeholderState.value = p ?? null;
  },
);

// Sync controlled `modelValue` prop -> editor content.
watch(
  () => props.modelValue,
  (value) => {
    if (value === undefined) return;
    // Layer 1: the prop matches what the user just typed — nothing to do.
    if (value === lastInternalValue.value) return;
    // Layer 3: the prop matches the current editor content — nothing to do.
    const current = readValue(instance, props.valueFormat);
    if (value === current) return;
    // Layer 2: flag so the update listener does not echo this back.
    isSettingFromProp.value = true;
    try {
      writeValue(instance, value, props.valueFormat);
      instance.editor.read(() => {});
    } catch (error) {
      emit("error", error as Error, instance);
      return;
    } finally {
      isSettingFromProp.value = false;
    }
    hiddenValue.value = value;
  },
);
</script>

<template>
  <div :class="className">
    <slot />
    <div class="se-content">
      <div
        v-if="isEmpty && placeholderState"
        class="se-placeholder"
        aria-hidden="true"
      >
        {{ placeholderState }}
      </div>
      <div
        ref="rootRef"
        :id="id"
        class="se-root"
        :contenteditable="editableState"
        role="textbox"
        aria-multiline="true"
        :aria-label="ariaLabel"
        :aria-labelledby="ariaLabelledBy"
        :aria-describedby="ariaDescribedBy"
        :spellcheck="spellCheck"
        :tabindex="tabIndex"
      />
    </div>
    <input v-if="name" type="hidden" :name="name" :value="hiddenValue" />
    <LinkTooltip />
  </div>
</template>
