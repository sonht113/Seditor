<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import {
  COMMAND_PRIORITY_LOW,
  SELECTION_CHANGE_COMMAND,
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
} from "lexical";
import { $isTableSelection } from "@lexical/table";
import { isInTable, isTableHeaderRowActive } from "seditor-core";
import {
  canMergeTableCells,
  canUnmergeTableCell,
  deleteTable,
  deleteTableColumn,
  deleteTableRow,
  getActiveTableAlignment,
  getActiveTableCellBackgroundColor,
  getActiveTableCellVerticalAlign,
  getActiveTableBorder,
  getActiveTableKey,
  getTableSelectionBounds,
  insertTableColumn,
  insertTableRow,
  moveTableColumn,
  moveTableRow,
  isTableHeaderColumnActive,
  $findCellNode,
  isTableRowStripingActive,
  mergeTableCells,
  setTableAlignment,
  setTableCellBackgroundColor,
  setTableCellVerticalAlign,
  setTableCellWidth,
  setTableColumnWidth,
  setTableRowHeight,
  setTableBorder,
  toggleTableHeaderColumn,
  toggleTableHeaderRow,
  toggleTableRowStriping,
  unmergeTableCell,
} from "seditor-plugin-table";
import { useEditor } from "./useEditor";

const instance = useEditor();
interface ActionsState {
  top: number;
  left: number;
  placement: "above" | "below";
  maxHeight: number;
}
const state = ref<ActionsState | null>(null);
const isHeaderRow = ref(false);
const isHeaderColumn = ref(false);
const canMerge = ref(false);
const canUnmerge = ref(false);
const backgroundColor = ref<string | null>(null);
const verticalAlign = ref("top");
const tableAlign = ref("left");
const isStriped = ref(false);
const contextMenuOpen = ref(false);
const border = ref(getActiveTableBorder(instance.editor));
const activeTableKey = ref<string | null>(null);

function getActionPosition(bounds: {
  top: number;
  right: number;
  bottom: number;
  left: number;
}): ActionsState {
  const gap = 6;
  const padding = 8;
  const preferredHeight = Math.min(560, window.innerHeight * 0.8);
  const spaceBelow = window.innerHeight - bounds.bottom - gap - padding;
  const spaceAbove = bounds.top - gap - padding;
  const placement =
    spaceBelow < preferredHeight && spaceAbove > spaceBelow ? "above" : "below";
  return {
    top: placement === "above" ? bounds.top - gap : bounds.bottom + gap,
    left: (bounds.left + bounds.right) / 2,
    placement,
    maxHeight: Math.max(80, placement === "above" ? spaceAbove : spaceBelow),
  };
}

const icon = (path: string) =>
  `<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
const icons = {
  rowAbove: icon('<path d="M2 5h12M5 2v6M2 12h12"/>'),
  rowBelow: icon('<path d="M2 4h12M2 11h12M11 8v6"/>'),
  colLeft: icon('<path d="M4 2v12M11 2v12M2 5h12"/>'),
  colRight: icon('<path d="M5 2v12M12 2v12M2 8h12"/>'),
  deleteRow: icon('<path d="M2 5h12M4 2v6M2 12h12"/>'),
  deleteCol: icon('<path d="M4 2v12M2 5h12"/>'),
  headerRow: icon('<path d="M2 3h12v10H2zM2 7h12M6 3v10"/>'),
  headerColumn: icon('<path d="M3 2h10v12H3zM7 2v12M3 6h10"/>'),
  merge: icon('<path d="M2 4h5v8H2zM9 4h5v8H9zM7 8h2"/>'),
  unmerge: icon('<path d="M2 4h5v8H2zM9 4h5v8H9zM7 6h2M7 10h2"/>'),
  deleteTable: icon('<path d="M3 3h10v10H3zM5 6h6M5 9h6"/>'),
  striping: icon('<path d="M2 3h12v3H2zM2 8h12v3H2zM2 13h12"/>'),
  moveUp: icon('<path d="M2 11h12M8 3v8M5 6l3-3 3 3"/>'),
  moveDown: icon('<path d="M2 5h12M8 13V5M5 10l3 3 3-3"/>'),
  moveLeft: icon('<path d="M11 2v12M5 8h8M8 5l-3 3 3 3"/>'),
  moveRight: icon('<path d="M5 2v12M3 8h8M8 5l3 3-3 3"/>'),
};

function close(): void {
  contextMenuOpen.value = false;
  state.value = null;
}

function reposition(): void {
  const tableBounds = getTableSelectionBounds(instance.editor);
  instance.editor.read(() => {
    const selection = $getSelection();
    if (
      (!$isRangeSelection(selection) && !$isTableSelection(selection)) ||
      ($isRangeSelection(selection) &&
        selection.isCollapsed() &&
        !contextMenuOpen.value) ||
      !isInTable(instance.editor)
    ) {
      close();
      return;
    }
    const domSel = window.getSelection();
    const nativeRect =
      domSel && domSel.rangeCount > 0
        ? domSel.getRangeAt(0).getBoundingClientRect()
        : null;
    const rect = tableBounds ?? nativeRect;
    if (!rect) {
      close();
      return;
    }
    state.value = getActionPosition(
      tableBounds ?? {
        top: nativeRect!.top,
        right: nativeRect!.right,
        bottom: nativeRect!.bottom,
        left: nativeRect!.left,
      },
    );
    isHeaderRow.value = isTableHeaderRowActive(instance.editor);
    isHeaderColumn.value = isTableHeaderColumnActive(instance.editor);
    canMerge.value = canMergeTableCells(instance.editor);
    canUnmerge.value = canUnmergeTableCell(instance.editor);
    backgroundColor.value = getActiveTableCellBackgroundColor(instance.editor);
    verticalAlign.value = getActiveTableCellVerticalAlign(instance.editor);
    tableAlign.value = getActiveTableAlignment(instance.editor);
    isStriped.value = isTableRowStripingActive(instance.editor);
    border.value = getActiveTableBorder(instance.editor);
    activeTableKey.value = getActiveTableKey(instance.editor);
  });
}

function run(action: () => void): void {
  action();
  instance.editor.focus();
  close();
}

function applyVerticalAlign(align: string): void {
  if (align === "top" || align === "middle" || align === "bottom") {
    run(() => setTableCellVerticalAlign(instance.editor, align));
  }
}

function applyTableAlign(align: string): void {
  if (align === "left" || align === "center" || align === "right") {
    run(() => setTableAlignment(instance.editor, align));
  }
}

function handleBorderModeChange(event: Event): void {
  const next = {
    ...border.value,
    mode: (event.target as HTMLSelectElement).value as
      "outer" | "rows" | "columns",
  };
  border.value = next;
  setTableBorder(instance.editor, next, activeTableKey.value ?? undefined);
}

function onMouseDown(event: MouseEvent): void {
  if (
    state.value &&
    !(event.target as HTMLElement).closest(".se-table-actions")
  ) {
    close();
  }
}

function onContextMenu(event: MouseEvent): void {
  const target = event.target as HTMLElement;
  const cell = target.closest("td, th");
  const root = instance.editor.getRootElement();
  if (!cell || !root || !root.contains(cell)) return;
  event.preventDefault();
  contextMenuOpen.value = true;
  const currentBounds = getTableSelectionBounds(instance.editor);
  const bounds = currentBounds ?? {
    top: event.clientY,
    right: event.clientX,
    bottom: event.clientY,
    left: event.clientX,
  };
  state.value = getActionPosition(bounds);
  isHeaderRow.value = isTableHeaderRowActive(instance.editor);
  isHeaderColumn.value = isTableHeaderColumnActive(instance.editor);
  canMerge.value = canMergeTableCells(instance.editor);
  canUnmerge.value = canUnmergeTableCell(instance.editor);
  if (!currentBounds) {
    const key = cell.getAttribute("data-lexical-node-key");
    if (key) {
      instance.editor.update(() => {
        const node = $getNodeByKey(key);
        const cellNode = node ? $findCellNode(node) : null;
        cellNode?.selectStart();
      });
    }
  }
}

let resize: {
  mode: "column" | "cell" | "row";
  key: string;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
} | null = null;
function onPointerMove(event: PointerEvent): void {
  if (!resize) return;
  if (resize.mode === "row") {
    setTableRowHeight(
      instance.editor,
      resize.key,
      resize.startHeight + event.clientY - resize.startY,
    );
  } else if (resize.mode === "cell") {
    setTableCellWidth(
      instance.editor,
      resize.key,
      resize.startWidth + event.clientX - resize.startX,
    );
  } else {
    setTableColumnWidth(
      instance.editor,
      resize.key,
      resize.startWidth + event.clientX - resize.startX,
    );
  }
}
function stopResize(): void {
  if (!resize) return;
  resize = null;
  document.body.style.cursor = "";
  document.body.style.userSelect = "";
  document.removeEventListener("pointermove", onPointerMove);
  document.removeEventListener("pointerup", stopResize);
}
function onPointerDown(event: PointerEvent): void {
  const target = event.target as HTMLElement;
  const cell = target.closest("td, th") as HTMLTableCellElement | null;
  const root = instance.editor.getRootElement();
  if (!cell || !root || !root.contains(cell)) return;
  const rect = cell.getBoundingClientRect();
  const nearRight = rect.right - event.clientX <= 8;
  const nearBottom = rect.bottom - event.clientY <= 8;
  if (!nearRight && !nearBottom) return;
  const cellKey = cell.getAttribute("data-lexical-node-key");
  const rowKey = cell.parentElement?.getAttribute("data-lexical-node-key");
  if (!cellKey || !rowKey) return;
  event.preventDefault();
  const mode =
    nearRight && event.altKey ? "cell" : nearBottom ? "row" : "column";
  resize = {
    mode,
    key: mode === "row" ? rowKey : cellKey,
    startX: event.clientX,
    startY: event.clientY,
    startWidth: rect.width,
    startHeight: rect.height,
  };
  document.body.style.cursor = mode === "row" ? "row-resize" : "col-resize";
  document.body.style.userSelect = "none";
  document.addEventListener("pointermove", onPointerMove);
  document.addEventListener("pointerup", stopResize);
}

let unregisterSelection: (() => void) | undefined;
let unregisterUpdate: (() => void) | undefined;
onMounted(() => {
  unregisterSelection = instance.editor.registerCommand(
    SELECTION_CHANGE_COMMAND,
    () => {
      reposition();
      return false;
    },
    COMMAND_PRIORITY_LOW,
  );
  unregisterUpdate = instance.editor.registerUpdateListener(reposition);
  document.addEventListener("mousedown", onMouseDown);
  document.addEventListener("contextmenu", onContextMenu);
  document.addEventListener("pointerdown", onPointerDown);
});

onBeforeUnmount(() => {
  unregisterSelection?.();
  unregisterUpdate?.();
  document.removeEventListener("mousedown", onMouseDown);
  document.removeEventListener("contextmenu", onContextMenu);
  document.removeEventListener("pointerdown", onPointerDown);
  stopResize();
});
</script>

<template>
  <div
    v-if="state"
    class="se-table-actions"
    :style="{
      top: `${state.top}px`,
      left: `${state.left}px`,
      maxHeight: `${state.maxHeight}px`,
      transform:
        state.placement === 'above'
          ? 'translate(-50%, -100%)'
          : 'translateX(-50%)',
    }"
    role="menu"
  >
    <button
      type="button"
      title="Insert row above"
      aria-label="Insert row above"
      @click="run(() => insertTableRow(instance.editor, false))"
    >
      <span v-html="icons.rowAbove" /><span>Insert row above</span>
    </button>
    <button
      type="button"
      title="Insert row below"
      aria-label="Insert row below"
      @click="run(() => insertTableRow(instance.editor, true))"
    >
      <span v-html="icons.rowBelow" /><span>Insert row below</span>
    </button>
    <button
      type="button"
      title="Move row up"
      aria-label="Move row up"
      @click="run(() => moveTableRow(instance.editor, false))"
    >
      <span v-html="icons.moveUp" /><span>Move row up</span>
    </button>
    <button
      type="button"
      title="Move row down"
      aria-label="Move row down"
      @click="run(() => moveTableRow(instance.editor, true))"
    >
      <span v-html="icons.moveDown" /><span>Move row down</span>
    </button>
    <button
      type="button"
      title="Insert column left"
      aria-label="Insert column left"
      @click="run(() => insertTableColumn(instance.editor, false))"
    >
      <span v-html="icons.colLeft" /><span>Insert column left</span>
    </button>
    <button
      type="button"
      title="Insert column right"
      aria-label="Insert column right"
      @click="run(() => insertTableColumn(instance.editor, true))"
    >
      <span v-html="icons.colRight" /><span>Insert column right</span>
    </button>
    <button
      type="button"
      title="Move column left"
      aria-label="Move column left"
      @click="run(() => moveTableColumn(instance.editor, false))"
    >
      <span v-html="icons.moveLeft" /><span>Move column left</span>
    </button>
    <button
      type="button"
      title="Move column right"
      aria-label="Move column right"
      @click="run(() => moveTableColumn(instance.editor, true))"
    >
      <span v-html="icons.moveRight" /><span>Move column right</span>
    </button>
    <div class="se-table-actions-separator" />
    <button
      type="button"
      title="Delete row"
      aria-label="Delete row"
      @click="run(() => deleteTableRow(instance.editor))"
    >
      <span v-html="icons.deleteRow" /><span>Delete row</span>
    </button>
    <button
      type="button"
      title="Delete column"
      aria-label="Delete column"
      @click="run(() => deleteTableColumn(instance.editor))"
    >
      <span v-html="icons.deleteCol" /><span>Delete column</span>
    </button>
    <div class="se-table-actions-separator" />
    <button
      type="button"
      :data-active="isHeaderRow"
      title="Toggle header row"
      aria-label="Toggle header row"
      @click="run(() => toggleTableHeaderRow(instance.editor))"
    >
      <span v-html="icons.headerRow" /><span>Toggle header row</span>
    </button>
    <button
      type="button"
      :data-active="isHeaderColumn"
      title="Toggle header column"
      aria-label="Toggle header column"
      @click="run(() => toggleTableHeaderColumn(instance.editor))"
    >
      <span v-html="icons.headerColumn" /><span>Toggle header column</span>
    </button>
    <template v-if="canMerge">
      <div class="se-table-actions-separator" />
      <button
        type="button"
        title="Merge cells"
        aria-label="Merge cells"
        @click="run(() => mergeTableCells(instance.editor))"
      >
        <span v-html="icons.merge" /><span>Merge cells</span>
      </button>
    </template>
    <button
      v-if="canUnmerge"
      type="button"
      title="Unmerge cell"
      aria-label="Unmerge cell"
      @click="run(() => unmergeTableCell(instance.editor))"
    >
      <span v-html="icons.unmerge" /><span>Unmerge cell</span>
    </button>
    <div class="se-table-actions-control">
      <label for="se-table-cell-color-vue">Cell color</label>
      <input
        id="se-table-cell-color-vue"
        type="color"
        :value="backgroundColor ?? '#ffffff'"
        @mousedown.stop
        @change="
          (event) => {
            const color = (event.target as HTMLInputElement).value;
            backgroundColor = color;
            setTableCellBackgroundColor(instance.editor, color);
          }
        "
      />
      <button
        v-if="backgroundColor"
        type="button"
        class="se-table-actions-clear"
        @click="
          run(() => setTableCellBackgroundColor(instance.editor, null));
          backgroundColor = null;
        "
      >
        Clear
      </button>
    </div>
    <div class="se-table-actions-control">
      <span>Vertical align</span>
      <div class="se-table-actions-inline">
        <button
          v-for="align in ['top', 'middle', 'bottom']"
          :key="align"
          type="button"
          :data-active="verticalAlign === align"
          @click="applyVerticalAlign(align)"
        >
          {{ align }}
        </button>
      </div>
    </div>
    <div class="se-table-actions-control">
      <span>Table align</span>
      <div class="se-table-actions-inline">
        <button
          v-for="align in ['left', 'center', 'right']"
          :key="align"
          type="button"
          :data-active="tableAlign === align"
          @click="applyTableAlign(align)"
        >
          {{ align }}
        </button>
      </div>
    </div>
    <div class="se-table-actions-control">
      <label for="se-table-border-style-vue">Border</label>
      <select
        aria-label="Border target"
        :value="border.mode ?? 'outer'"
        @change="handleBorderModeChange"
      >
        <option value="outer">Whole table</option>
        <option value="rows">Rows</option>
        <option value="columns">Columns</option>
      </select>
      <select
        id="se-table-border-style-vue"
        v-model="border.style"
        @change="
          setTableBorder(instance.editor, border, activeTableKey ?? undefined)
        "
      >
        <option value="solid">Solid</option>
        <option value="dashed">Dashed</option>
        <option value="dotted">Dotted</option>
        <option value="double">Double</option>
        <option value="none">None</option>
      </select>
      <input
        v-model="border.color"
        type="color"
        aria-label="Table border color"
        @change="
          setTableBorder(instance.editor, border, activeTableKey ?? undefined)
        "
      />
      <select
        v-model.number="border.width"
        aria-label="Table border width"
        @change="
          setTableBorder(instance.editor, border, activeTableKey ?? undefined)
        "
      >
        <option v-for="width in [0, 1, 2, 3, 4]" :key="width" :value="width">
          {{ width }}px
        </option>
      </select>
    </div>
    <button
      type="button"
      :data-active="isStriped"
      title="Toggle striped rows"
      aria-label="Toggle striped rows"
      @click="run(() => toggleTableRowStriping(instance.editor))"
    >
      <span v-html="icons.striping" /><span>Toggle striped rows</span>
    </button>
    <div class="se-table-actions-separator" />
    <button
      type="button"
      title="Delete table"
      aria-label="Delete table"
      @click="run(() => deleteTable(instance.editor))"
    >
      <span v-html="icons.deleteTable" /><span>Delete table</span>
    </button>
  </div>
</template>
