<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { COMMAND_PRIORITY_LOW } from "lexical";
import { SE_OPEN_TABLE_COMMAND } from "seditor-core";
import { INSERT_TABLE_COMMAND } from "seditor-plugin-table";
import { useEditor } from "./useEditor";

const MAX_SIZE = 8;
const instance = useEditor();
const state = ref<{ top: number; left: number } | null>(null);
const hover = ref({ rows: 1, cols: 1 });

function close(): void {
  state.value = null;
}

function insert(rows: number, cols: number): void {
  instance.editor.dispatchCommand(INSERT_TABLE_COMMAND, {
    columns: String(cols),
    rows: String(rows),
    includeHeaders: { rows: true, columns: false },
  });
  instance.editor.focus();
  close();
}

function onKey(event: KeyboardEvent): void {
  if (state.value && event.key === "Escape") {
    event.preventDefault();
    close();
  }
}

function onMouseDown(event: MouseEvent): void {
  if (
    state.value &&
    !(event.target as HTMLElement).closest(".se-table-picker")
  ) {
    close();
  }
}

let unregister: (() => void) | undefined;
onMounted(() => {
  unregister = instance.editor.registerCommand(
    SE_OPEN_TABLE_COMMAND,
    () => {
      const domSel = window.getSelection();
      let top = 0;
      let left = 0;
      if (domSel && domSel.rangeCount > 0) {
        const rect = domSel.getRangeAt(0).getBoundingClientRect();
        top = rect.bottom + 6;
        left = rect.left + rect.width / 2;
      }
      state.value = { top, left };
      hover.value = { rows: 1, cols: 1 };
      return true;
    },
    COMMAND_PRIORITY_LOW,
  );
  document.addEventListener("keydown", onKey);
  document.addEventListener("mousedown", onMouseDown);
});

onBeforeUnmount(() => {
  unregister?.();
  document.removeEventListener("keydown", onKey);
  document.removeEventListener("mousedown", onMouseDown);
});
</script>

<template>
  <div
    v-if="state"
    class="se-table-picker"
    :style="{
      top: `${state.top}px`,
      left: `${state.left}px`,
      transform: 'translateX(-50%)',
      '--se-table-picker-cols': MAX_SIZE,
    }"
    role="dialog"
    aria-label="Insert table"
  >
    <div class="se-table-picker-grid">
      <button
        v-for="index in MAX_SIZE * MAX_SIZE"
        :key="index"
        type="button"
        class="se-table-picker-cell"
        :data-active="
          Math.floor((index - 1) / MAX_SIZE) + 1 <= hover.rows &&
          ((index - 1) % MAX_SIZE) + 1 <= hover.cols
            ? 'true'
            : 'false'
        "
        :aria-label="`${Math.floor((index - 1) / MAX_SIZE) + 1} rows by ${((index - 1) % MAX_SIZE) + 1} columns`"
        @mouseenter="
          hover = {
            rows: Math.floor((index - 1) / MAX_SIZE) + 1,
            cols: ((index - 1) % MAX_SIZE) + 1,
          }
        "
        @click="
          insert(
            Math.floor((index - 1) / MAX_SIZE) + 1,
            ((index - 1) % MAX_SIZE) + 1,
          )
        "
      />
    </div>
    <div class="se-table-picker-label">{{ hover.rows }} × {{ hover.cols }}</div>
  </div>
</template>
