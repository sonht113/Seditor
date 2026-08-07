<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { COMMAND_PRIORITY_LOW } from "lexical";
  import { SE_OPEN_LINK_COMMAND, getLinkUrl } from "seditor-core";
  import { useEditor } from "./context";

  interface TooltipState {
    url: string;
    top: number;
    left: number;
  }

  const CLOSE_ICON =
    '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>';
  const ACCEPT_ICON =
    '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8l3.5 3.5L13 5"/></svg>';

  const instance = useEditor();
  let state: TooltipState | null = null;
  let inputRef: HTMLInputElement | null = null;

  const unregister = instance.editor.registerCommand(
    SE_OPEN_LINK_COMMAND,
    () => {
      const domSel = window.getSelection();
      let top = 0;
      let left = 0;
      if (domSel && domSel.rangeCount > 0) {
        const rect = domSel.getRangeAt(0).getBoundingClientRect();
        top = rect.bottom + 6;
        left = rect.left + rect.width / 2;
      }
      const url = getLinkUrl(instance.editor);
      state = { url, top, left };
      return true;
    },
    COMMAND_PRIORITY_LOW,
  );

  onDestroy(unregister);

  $: if (state && inputRef) {
    requestAnimationFrame(() => {
      if (inputRef) {
        inputRef.value = state?.url ?? "";
        inputRef.focus();
        inputRef.select();
      }
    });
  }

  function close(): void {
    state = null;
  }

  function accept(): void {
    const url = inputRef?.value ?? "";
    instance.commands.setLink(url);
    state = null;
  }

  function onKeydown(e: KeyboardEvent): void {
    if (!state) return;
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "Enter") {
      e.preventDefault();
      accept();
    }
  }

  function onDocumentMouseDown(e: MouseEvent): void {
    if (!state) return;
    const target = e.target as HTMLElement;
    if (!target.closest(".se-link-tooltip")) {
      close();
    }
  }

  onMount(() => {
    document.addEventListener("keydown", onKeydown);
    document.addEventListener("mousedown", onDocumentMouseDown);
    return () => {
      document.removeEventListener("keydown", onKeydown);
      document.removeEventListener("mousedown", onDocumentMouseDown);
    };
  });
</script>

{#if state}
  <div
    class="se-link-tooltip"
    style="top: {state.top}px; left: {state.left}px"
    role="dialog"
  >
    <input
      bind:this={inputRef}
      type="url"
      placeholder="https://"
      class="se-link-tooltip-input"
    />
    <button
      type="button"
      class="se-link-tooltip-btn se-link-tooltip-close"
      title="Cancel"
      aria-label="Cancel"
      on:click={close}
    >
      {@html CLOSE_ICON}
    </button>
    <button
      type="button"
      class="se-link-tooltip-btn se-link-tooltip-accept"
      title="Apply"
      aria-label="Apply link"
      on:click={accept}
    >
      {@html ACCEPT_ICON}
    </button>
  </div>
{/if}
