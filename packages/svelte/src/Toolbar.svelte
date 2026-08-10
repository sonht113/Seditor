<script lang="ts">
  import { onDestroy } from "svelte";
  import {
    CAN_REDO_COMMAND,
    CAN_UNDO_COMMAND,
  } from "lexical";
  import {
    SE_OPEN_IMAGE_COMMAND,
    SE_OPEN_LINK_COMMAND,
    filterToolbarItems,
  } from "seditor-core";
  import type { ToolbarItem } from "seditor-core";
  import { useEditor } from "./context";
  import { defaultToolbarItems } from "./defaultToolbar";
  import ColorPicker from "./ColorPicker.svelte";
  import FontSizePicker from "./FontSizePicker.svelte";

  export let items: ToolbarItem[] | undefined = undefined;
  export let exclude: string[] | undefined = undefined;
  export let className = "se-toolbar";

  const instance = useEditor();
  let tick = 0;

  function force() {
    tick += 1;
  }

  $: allItems = filterToolbarItems(
    items ?? [...defaultToolbarItems, ...instance.toolbarItems],
    exclude,
  );

  $: itemState = (item: ToolbarItem, t: typeof tick) => ({
    active: t > -1 && (item.isActive?.(instance) ?? false),
    enabled: t > -1 && (item.enable?.(instance) ?? true),
  });

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
      const tag =
        item.id === "h1" ? "h1" : item.id === "h2" ? "h2" : "h3";
      instance.commands.toggleHeading(tag);
      force();
      return;
    }
    if (item.command === "setAlign") {
      const align =
        item.id === "left"
          ? "left"
          : item.id === "right"
            ? "right"
            : "center";
      instance.commands.setAlign(align);
      force();
      return;
    }
    if (item.command === "fontSize") {
      return;
    }
    if (item.command === "textColor") {
      return;
    }
    if (item.command === "bgColor") {
      return;
    }
    const command = item.command as keyof typeof instance.commands;
    if (typeof instance.commands[command] === "function") {
      (instance.commands[command] as () => void)();
      force();
    }
  }

  function onButtonDown(event: MouseEvent): void {
    event.preventDefault();
  }

  const unregisterUpdate = instance.editor.registerUpdateListener(() =>
    force(),
  );
  const unregisterUndo = instance.editor.registerCommand(
    CAN_UNDO_COMMAND,
    () => {
      force();
      return false;
    },
    0,
  );
  const unregisterRedo = instance.editor.registerCommand(
    CAN_REDO_COMMAND,
    () => {
      force();
      return false;
    },
    0,
  );

  onDestroy(() => {
    unregisterUpdate();
    unregisterUndo();
    unregisterRedo();
  });
</script>

<div class={className} role="toolbar">
  {#each allItems as item (item.id)}
    {#if item.separator}
      <span class="se-toolbar-separator" />
    {:else if item.command === "fontSize"}
      <FontSizePicker />
    {:else if item.command === "textColor" || item.command === "bgColor"}
      <ColorPicker kind={item.command === "textColor" ? "text" : "background"} />
    {:else}
      <button
        type="button"
        class="se-toolbar-button{itemState(item, tick).active ? ' se-toolbar-button-active' : ''}"
        title={item.label}
        aria-label={item.label}
        aria-pressed={itemState(item, tick).active}
        disabled={!itemState(item, tick).enabled}
        on:mousedown={onButtonDown}
        on:click={() => handleClick(item)}
      >
        {#if item.icon}
          {@html item.icon}
        {:else}
          {item.label}
        {/if}
      </button>
    {/if}
  {/each}
</div>
