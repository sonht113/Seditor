<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import {
  getActiveTableBorder,
  getActiveTableKey,
  setTableBorder,
  type TableBorder,
  type TableBorderMode,
  type TableBorderStyle,
} from "seditor-plugin-table";
import type { ToolbarItem } from "seditor-core";
import { useEditor } from "./useEditor";

const props = defineProps<{ item: ToolbarItem }>();
const instance = useEditor();
const button = ref<HTMLButtonElement | null>(null);
const popup = ref<HTMLDivElement | null>(null);
const open = ref(false);
const border = ref<TableBorder>(getActiveTableBorder(instance.editor));
const tableKey = ref<string | null>(null);
const enabled = () => props.item.enable?.(instance) ?? true;

function update(changes: Partial<TableBorder>): void {
  border.value = { ...border.value, ...changes };
  setTableBorder(instance.editor, border.value, tableKey.value ?? undefined);
}

function handleStyleChange(event: Event): void {
  update({
    style: (event.target as HTMLSelectElement).value as TableBorderStyle,
  });
}

function handleModeChange(event: Event): void {
  update({
    mode: (event.target as HTMLSelectElement).value as TableBorderMode,
  });
}

function handleColorChange(event: Event): void {
  update({ color: (event.target as HTMLInputElement).value });
}

function handleWidthChange(event: Event): void {
  update({ width: Number((event.target as HTMLSelectElement).value) });
}

function toggle(): void {
  border.value = getActiveTableBorder(instance.editor);
  tableKey.value = getActiveTableKey(instance.editor);
  open.value = !open.value;
}

function close(): void {
  open.value = false;
}

function onMouseDown(event: MouseEvent): void {
  const target = event.target as Node;
  if (
    open.value &&
    !popup.value?.contains(target) &&
    !button.value?.contains(target)
  )
    close();
}

function onKeyDown(event: KeyboardEvent): void {
  if (open.value && event.key === "Escape") close();
}

onMounted(() => {
  document.addEventListener("mousedown", onMouseDown);
  document.addEventListener("keydown", onKeyDown);
});
onBeforeUnmount(() => {
  document.removeEventListener("mousedown", onMouseDown);
  document.removeEventListener("keydown", onKeyDown);
});
</script>

<template>
  <span class="se-table-border-picker">
    <button
      ref="button"
      type="button"
      class="se-toolbar-button"
      :title="props.item.label"
      :aria-label="props.item.label"
      :aria-expanded="open"
      :disabled="!enabled()"
      @mousedown.prevent
      @click="toggle"
    >
      <span v-if="props.item.icon" v-html="props.item.icon" />
      <template v-else>{{ props.item.label }}</template>
    </button>
    <div
      v-if="open && button"
      ref="popup"
      class="se-table-border-popup"
      :style="{
        top: `${button.getBoundingClientRect().bottom + 4}px`,
        left: `${button.getBoundingClientRect().left}px`,
      }"
      role="dialog"
      aria-label="Table border settings"
    >
      <label>
        Apply to
        <select :value="border.mode ?? 'outer'" @change="handleModeChange">
          <option value="outer">Whole table</option>
          <option value="rows">Rows</option>
          <option value="columns">Columns</option>
        </select>
      </label>
      <label>
        Style
        <select :value="border.style" @change="handleStyleChange">
          <option value="solid">Solid</option>
          <option value="dashed">Dashed</option>
          <option value="dotted">Dotted</option>
          <option value="double">Double</option>
          <option value="none">None</option>
        </select>
      </label>
      <label>
        Color
        <input type="color" :value="border.color" @change="handleColorChange" />
      </label>
      <label>
        Width
        <select :value="border.width" @change="handleWidthChange">
          <option v-for="width in [0, 1, 2, 3, 4]" :key="width" :value="width">
            {{ width }}px
          </option>
        </select>
      </label>
    </div>
  </span>
</template>
