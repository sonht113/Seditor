<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from "vue";
import { CAN_REDO_COMMAND, CAN_UNDO_COMMAND } from "lexical";
import { SE_OPEN_IMAGE_COMMAND, SE_OPEN_LINK_COMMAND, filterToolbarItems } from "seditor-core";
import type { ToolbarItem } from "seditor-core";
import { useEditor } from "./useEditor";
import { defaultToolbarItems } from "./defaultToolbar";
import ColorPicker from "./ColorPicker.vue";
import FontSizePicker from "./FontSizePicker.vue";

const props = withDefaults(
  defineProps<{
    items?: ToolbarItem[];
    exclude?: string[];
    className?: string;
  }>(),
  { className: "se-toolbar" },
);

const instance = useEditor();
// Tick ref to force re-evaluation of computed on editor updates.
const tick = ref(0);
const force = () => {
  tick.value++;
};

const allItems = computed(() =>
  filterToolbarItems(
    props.items ?? [...defaultToolbarItems, ...instance.toolbarItems],
    props.exclude,
  ),
);

function handleClick(item: ToolbarItem): void {
  if (item.command === "setLink") {
    instance.editor.dispatchCommand(SE_OPEN_LINK_COMMAND, undefined);
    force();
    return;
  }
  if (item.command === "openImageDialog") {
    instance.editor.dispatchCommand(SE_OPEN_IMAGE_COMMAND, undefined);
    force();
    return;
  }
  if (item.command === "toggleHeading") {
    const tag = item.id === "h1" ? "h1" : item.id === "h2" ? "h2" : "h3";
    instance.commands.toggleHeading(tag);
    force();
    return;
  }
  if (item.command === "setAlign") {
    const align =
      item.id === "left" ? "left" : item.id === "right" ? "right" : "center";
    instance.commands.setAlign(align);
    force();
    return;
  }
  const fn = (
    instance.commands as unknown as Record<string, (...args: unknown[]) => void>
  )[item.command];
  if (fn) fn();
  force();
}

function isActive(item: ToolbarItem): boolean {
  // touch tick so Vue tracks this dependency
  void tick.value;
  return item.isActive?.(instance) ?? false;
}

function isEnabled(item: ToolbarItem): boolean {
  void tick.value;
  return item.enable?.(instance) ?? true;
}

function onButtonDown(event: MouseEvent): void {
  // Keep the editor focused so image node-selection / text range
  // selection survives while the toolbar button is clicked.
  event.preventDefault();
}

const editor = instance.editor;
const unregisterUpdate = editor.registerUpdateListener(() => force());
const unregisterUndo = editor.registerCommand(
  CAN_UNDO_COMMAND,
  () => {
    force();
    return false;
  },
  0,
);
const unregisterRedo = editor.registerCommand(
  CAN_REDO_COMMAND,
  () => {
    force();
    return false;
  },
  0,
);

onBeforeUnmount(() => {
  unregisterUpdate();
  unregisterUndo();
  unregisterRedo();
});
</script>

<template>
  <div :class="className" role="toolbar">
    <template v-for="item in allItems" :key="item.id">
      <span v-if="item.separator" class="se-toolbar-separator" />
      <ColorPicker v-else-if="item.command === 'textColor'" kind="text" />
      <ColorPicker v-else-if="item.command === 'bgColor'" kind="background" />
      <FontSizePicker v-else-if="item.command === 'fontSize'" />
      <button
        v-else
        type="button"
        :title="item.label"
        :aria-label="item.label"
        :aria-pressed="isActive(item)"
        :disabled="!isEnabled(item)"
        :class="`se-toolbar-button${isActive(item) ? ' se-toolbar-button-active' : ''}`"
        @mousedown="onButtonDown"
        @click="handleClick(item)"
      >
        <span v-if="item.icon" v-html="item.icon" />
        <template v-else>{{ item.label }}</template>
      </button>
    </template>
  </div>
</template>
