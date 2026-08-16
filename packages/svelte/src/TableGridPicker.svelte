<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { COMMAND_PRIORITY_LOW } from "lexical";
  import { SE_OPEN_TABLE_COMMAND } from "seditor-core";
  import { INSERT_TABLE_COMMAND } from "seditor-plugin-table";
  import { useEditor } from "./context";

  const MAX_SIZE = 8;
  const instance = useEditor();
  let state: { top: number; left: number } | null = null;
  let hover = { rows: 1, cols: 1 };

  function close(): void {
    state = null;
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

  onMount(() => {
    const unregister = instance.editor.registerCommand(
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
        state = { top, left };
        hover = { rows: 1, cols: 1 };
        return true;
      },
      COMMAND_PRIORITY_LOW,
    );
    const onKey = (event: KeyboardEvent) => {
      if (state && event.key === "Escape") {
        event.preventDefault();
        close();
      }
    };
    const onMouseDown = (event: MouseEvent) => {
      if (state && !(event.target as HTMLElement).closest(".se-table-picker")) {
        close();
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onMouseDown);
    return () => {
      unregister();
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onMouseDown);
    };
  });

  onDestroy(close);
</script>

{#if state}
  <div
    class="se-table-picker"
    style={`top: ${state.top}px; left: ${state.left}px; transform: translateX(-50%); --se-table-picker-cols: ${MAX_SIZE};`}
    role="dialog"
    aria-label="Insert table"
  >
    <div class="se-table-picker-grid">
      {#each Array(MAX_SIZE * MAX_SIZE) as _, index}
        {@const row = Math.floor(index / MAX_SIZE) + 1}
        {@const col = (index % MAX_SIZE) + 1}
        <button
          type="button"
          class="se-table-picker-cell"
          data-active={row <= hover.rows && col <= hover.cols ? "true" : "false"}
          on:mouseenter={() => (hover = { rows: row, cols: col })}
          on:click={() => insert(row, col)}
          aria-label={`${row} rows by ${col} columns`}
        />
      {/each}
    </div>
    <div class="se-table-picker-label">{hover.rows} × {hover.cols}</div>
  </div>
{/if}
