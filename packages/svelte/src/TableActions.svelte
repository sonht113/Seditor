<script lang="ts">
  import { onMount } from "svelte";
  import {
    COMMAND_PRIORITY_LOW,
    SELECTION_CHANGE_COMMAND,
  } from "lexical";
  import * as Lexical from "lexical";
  import * as LexicalTable from "@lexical/table";
  import * as TablePlugin from "seditor-plugin-table";
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
  import { useEditor } from "./context";

  const instance = useEditor();
  interface ActionsState {
    top: number;
    left: number;
    placement: "above" | "below";
    maxHeight: number;
  }
  let state: ActionsState | null = null;
  let isHeaderRow = false;
  let isHeaderColumn = false;
  let canMerge = false;
  let canUnmerge = false;
  let backgroundColor: string | null = null;
  let verticalAlign = "top";
  let tableAlign = "left";
  let isStriped = false;
  let contextMenuOpen = false;
  let border = getActiveTableBorder(instance.editor);
  let activeTableKey: string | null = null;

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
      spaceBelow < preferredHeight && spaceAbove > spaceBelow
        ? "above"
        : "below";
    return {
      top: placement === "above" ? bounds.top - gap : bounds.bottom + gap,
      left: (bounds.left + bounds.right) / 2,
      placement,
      maxHeight: Math.max(
        80,
        placement === "above" ? spaceAbove : spaceBelow,
      ),
    };
  }

  const icon = (path: string) =>
    `<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
  const rowAbove = icon('<path d="M2 5h12M5 2v6M2 12h12"/>');
  const rowBelow = icon('<path d="M2 4h12M2 11h12M11 8v6"/>');
  const colLeft = icon('<path d="M4 2v12M11 2v12M2 5h12"/>');
  const colRight = icon('<path d="M5 2v12M12 2v12M2 8h12"/>');
  const deleteRow = icon('<path d="M2 5h12M4 2v6M2 12h12"/>');
  const deleteCol = icon('<path d="M4 2v12M2 5h12"/>');
  const headerRow = icon('<path d="M2 3h12v10H2zM2 7h12M6 3v10"/>');
  const headerColumn = icon('<path d="M3 2h10v12H3zM7 2v12M3 6h10"/>');
  const merge = icon('<path d="M2 4h5v8H2zM9 4h5v8H9zM7 8h2"/>');
  const unmerge = icon('<path d="M2 4h5v8H2zM9 4h5v8H9zM7 6h2M7 10h2"/>');
  const deleteTableIcon = icon('<path d="M3 3h10v10H3zM5 6h6M5 9h6"/>');
  const striping = icon('<path d="M2 3h12v3H2zM2 8h12v3H2zM2 13h12"/>');
  const moveUp = icon('<path d="M2 11h12M8 3v8M5 6l3-3 3 3"/>');
  const moveDown = icon('<path d="M2 5h12M8 13V5M5 10l3 3 3-3"/>');
  const moveLeft = icon('<path d="M11 2v12M5 8h8M8 5l-3 3 3 3"/>');
  const moveRight = icon('<path d="M5 2v12M3 8h8M8 5l3 3-3 3"/>');

  function close(): void {
    contextMenuOpen = false;
    state = null;
  }

  function reposition(): void {
    const tableBounds = getTableSelectionBounds(instance.editor);
    instance.editor.read(() => {
      const selection = Lexical.$getSelection();
      if (
        (!Lexical.$isRangeSelection(selection) &&
          !LexicalTable.$isTableSelection(selection)) ||
        (Lexical.$isRangeSelection(selection) &&
          selection.isCollapsed() &&
          !contextMenuOpen) ||
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
      const rect =
        tableBounds ??
        nativeRect;
      if (!rect) {
        close();
        return;
      }
      state = getActionPosition(
        tableBounds ?? {
          top: nativeRect!.top,
          right: nativeRect!.right,
          bottom: nativeRect!.bottom,
          left: nativeRect!.left,
        },
      );
      isHeaderRow = isTableHeaderRowActive(instance.editor);
      isHeaderColumn = isTableHeaderColumnActive(instance.editor);
      canMerge = canMergeTableCells(instance.editor);
      canUnmerge = canUnmergeTableCell(instance.editor);
      backgroundColor = getActiveTableCellBackgroundColor(instance.editor);
      verticalAlign = getActiveTableCellVerticalAlign(instance.editor);
      tableAlign = getActiveTableAlignment(instance.editor);
      isStriped = isTableRowStripingActive(instance.editor);
      border = getActiveTableBorder(instance.editor);
      activeTableKey = getActiveTableKey(instance.editor);
    });
  }

  function run(action: () => void): void {
    action();
    instance.editor.focus();
    close();
  }

  function handleColorChange(event: Event): void {
    const color = (event.currentTarget as HTMLInputElement).value;
    backgroundColor = color;
    setTableCellBackgroundColor(instance.editor, color);
  }

  function handleBorderModeChange(event: Event): void {
    border = {
      ...border,
      mode: (event.currentTarget as HTMLSelectElement).value as
        | "outer"
        | "rows"
        | "columns",
    };
    setTableBorder(instance.editor, border, activeTableKey ?? undefined);
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

  onMount(() => {
    const unregisterSelection = instance.editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        reposition();
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );
    const unregisterUpdate = instance.editor.registerUpdateListener(reposition);
    const onMouseDown = (event: MouseEvent) => {
      if (state && !(event.target as HTMLElement).closest(".se-table-actions")) {
        close();
      }
    };
    const onContextMenu = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const cell = target.closest("td, th");
      const root = instance.editor.getRootElement();
      if (!cell || !root || !root.contains(cell)) return;
      event.preventDefault();
      contextMenuOpen = true;
      const currentBounds = getTableSelectionBounds(instance.editor);
      const bounds = currentBounds ?? {
        top: event.clientY,
        right: event.clientX,
        bottom: event.clientY,
        left: event.clientX,
      };
      state = getActionPosition(bounds);
      isHeaderRow = isTableHeaderRowActive(instance.editor);
      isHeaderColumn = isTableHeaderColumnActive(instance.editor);
      canMerge = canMergeTableCells(instance.editor);
      canUnmerge = canUnmergeTableCell(instance.editor);
      if (!currentBounds) {
        const key = cell.getAttribute("data-lexical-node-key");
        if (key) {
          instance.editor.update(() => {
            const node = Lexical.$getNodeByKey(key);
            const cellNode = node ? TablePlugin.$findCellNode(node) : null;
            cellNode?.selectStart();
          });
        }
      }
    };
    let resize: {
      mode: "column" | "cell" | "row";
      key: string;
      startX: number;
      startY: number;
      startWidth: number;
      startHeight: number;
    } | null = null;
    const onPointerMove = (event: PointerEvent) => {
      if (!resize) return;
      if (resize.mode === "row") {
        setTableRowHeight(instance.editor, resize.key, resize.startHeight + event.clientY - resize.startY);
      } else if (resize.mode === "cell") {
        setTableCellWidth(instance.editor, resize.key, resize.startWidth + event.clientX - resize.startX);
      } else {
        setTableColumnWidth(instance.editor, resize.key, resize.startWidth + event.clientX - resize.startX);
      }
    };
    const stopResize = () => {
      if (!resize) return;
      resize = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", stopResize);
    };
    const onPointerDown = (event: PointerEvent) => {
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
      const mode = nearRight && event.altKey ? "cell" : nearBottom ? "row" : "column";
      resize = { mode, key: mode === "row" ? rowKey : cellKey, startX: event.clientX, startY: event.clientY, startWidth: rect.width, startHeight: rect.height };
      document.body.style.cursor = mode === "row" ? "row-resize" : "col-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("pointermove", onPointerMove);
      document.addEventListener("pointerup", stopResize);
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      unregisterSelection();
      unregisterUpdate();
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("pointerdown", onPointerDown);
      stopResize();
    };
  });
</script>

{#if state}
  <div
    class="se-table-actions"
    style={`top: ${state.top}px; left: ${state.left}px; max-height: ${state.maxHeight}px; transform: ${state.placement === "above" ? "translate(-50%, -100%)" : "translateX(-50%)"};`}
    role="menu"
  >
    <button type="button" title="Insert row above" aria-label="Insert row above" on:click={() => run(() => insertTableRow(instance.editor, false))}>
      {@html rowAbove}<span>Insert row above</span>
    </button>
    <button type="button" title="Insert row below" aria-label="Insert row below" on:click={() => run(() => insertTableRow(instance.editor, true))}>
      {@html rowBelow}<span>Insert row below</span>
    </button>
    <button type="button" title="Move row up" aria-label="Move row up" on:click={() => run(() => moveTableRow(instance.editor, false))}>
      {@html moveUp}<span>Move row up</span>
    </button>
    <button type="button" title="Move row down" aria-label="Move row down" on:click={() => run(() => moveTableRow(instance.editor, true))}>
      {@html moveDown}<span>Move row down</span>
    </button>
    <button type="button" title="Insert column left" aria-label="Insert column left" on:click={() => run(() => insertTableColumn(instance.editor, false))}>
      {@html colLeft}<span>Insert column left</span>
    </button>
    <button type="button" title="Insert column right" aria-label="Insert column right" on:click={() => run(() => insertTableColumn(instance.editor, true))}>
      {@html colRight}<span>Insert column right</span>
    </button>
    <button type="button" title="Move column left" aria-label="Move column left" on:click={() => run(() => moveTableColumn(instance.editor, false))}>
      {@html moveLeft}<span>Move column left</span>
    </button>
    <button type="button" title="Move column right" aria-label="Move column right" on:click={() => run(() => moveTableColumn(instance.editor, true))}>
      {@html moveRight}<span>Move column right</span>
    </button>
    <div class="se-table-actions-separator" />
    <button type="button" title="Delete row" aria-label="Delete row" on:click={() => run(() => deleteTableRow(instance.editor))}>
      {@html deleteRow}<span>Delete row</span>
    </button>
    <button type="button" title="Delete column" aria-label="Delete column" on:click={() => run(() => deleteTableColumn(instance.editor))}>
      {@html deleteCol}<span>Delete column</span>
    </button>
    <div class="se-table-actions-separator" />
    <button type="button" data-active={isHeaderRow} title="Toggle header row" aria-label="Toggle header row" on:click={() => run(() => toggleTableHeaderRow(instance.editor))}>
      {@html headerRow}<span>Toggle header row</span>
    </button>
    <button type="button" data-active={isHeaderColumn} title="Toggle header column" aria-label="Toggle header column" on:click={() => run(() => toggleTableHeaderColumn(instance.editor))}>
      {@html headerColumn}<span>Toggle header column</span>
    </button>
    {#if canMerge}
      <div class="se-table-actions-separator" />
      <button type="button" title="Merge cells" aria-label="Merge cells" on:click={() => run(() => mergeTableCells(instance.editor))}>
        {@html merge}<span>Merge cells</span>
      </button>
    {/if}
    {#if canUnmerge}
      <button type="button" title="Unmerge cell" aria-label="Unmerge cell" on:click={() => run(() => unmergeTableCell(instance.editor))}>
        {@html unmerge}<span>Unmerge cell</span>
      </button>
    {/if}
    <div class="se-table-actions-control">
      <label for="se-table-cell-color-svelte">Cell color</label>
      <input
        id="se-table-cell-color-svelte"
        type="color"
        value={backgroundColor ?? "#ffffff"}
        on:mousedown|stopPropagation
        on:change={handleColorChange}
      />
      {#if backgroundColor}
        <button
          type="button"
          class="se-table-actions-clear"
          on:click={() => {
            setTableCellBackgroundColor(instance.editor, null);
            backgroundColor = null;
          }}>Clear</button
        >
      {/if}
    </div>
    <div class="se-table-actions-control">
      <span>Vertical align</span>
      <div class="se-table-actions-inline">
        {#each ["top", "middle", "bottom"] as align}
          <button
            type="button"
            data-active={verticalAlign === align ? "true" : "false"}
            on:click={() => applyVerticalAlign(align)}>{align}</button
          >
        {/each}
      </div>
    </div>
    <div class="se-table-actions-control">
      <span>Table align</span>
      <div class="se-table-actions-inline">
        {#each ["left", "center", "right"] as align}
          <button
            type="button"
            data-active={tableAlign === align ? "true" : "false"}
            on:click={() => applyTableAlign(align)}>{align}</button
          >
        {/each}
      </div>
    </div>
    <div class="se-table-actions-control">
      <label for="se-table-border-style-svelte">Border</label>
      <select
        aria-label="Border target"
        value={border.mode ?? "outer"}
        on:change={handleBorderModeChange}
      >
        <option value="outer">Whole table</option>
        <option value="rows">Rows</option>
        <option value="columns">Columns</option>
      </select>
      <select
        id="se-table-border-style-svelte"
        bind:value={border.style}
        on:change={() => setTableBorder(instance.editor, border, activeTableKey ?? undefined)}
      >
        <option value="solid">Solid</option>
        <option value="dashed">Dashed</option>
        <option value="dotted">Dotted</option>
        <option value="double">Double</option>
        <option value="none">None</option>
      </select>
      <input
        type="color"
        bind:value={border.color}
        aria-label="Table border color"
        on:change={() => setTableBorder(instance.editor, border, activeTableKey ?? undefined)}
      />
      <select
        bind:value={border.width}
        aria-label="Table border width"
        on:change={() => setTableBorder(instance.editor, border, activeTableKey ?? undefined)}
      >
        {#each [0, 1, 2, 3, 4] as width}
          <option value={width}>{width}px</option>
        {/each}
      </select>
    </div>
    <button
      type="button"
      data-active={isStriped ? "true" : "false"}
      title="Toggle striped rows"
      aria-label="Toggle striped rows"
      on:click={() => run(() => toggleTableRowStriping(instance.editor))}
    >
      {@html striping}<span>Toggle striped rows</span>
    </button>
    <div class="se-table-actions-separator" />
    <button type="button" title="Delete table" aria-label="Delete table" on:click={() => run(() => deleteTable(instance.editor))}>
      {@html deleteTableIcon}<span>Delete table</span>
    </button>
  </div>
{/if}
