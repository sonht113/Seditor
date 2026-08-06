<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { getPendingFontSize } from "seditor-core";
import { useEditor } from "./useEditor";

const instance = useEditor();
const open = ref(false);
const tick = ref(0);
const rootRef = ref<HTMLDivElement | null>(null);

const force = () => {
  tick.value++;
};

const unregister = instance.editor.registerUpdateListener(() => force());
onBeforeUnmount(unregister);

const FONT_SIZES: Array<{ label: string; value: string | null }> = [
  { label: "Default", value: null },
  { label: "10", value: "10px" },
  { label: "11", value: "11px" },
  { label: "12", value: "12px" },
  { label: "13", value: "13px" },
  { label: "14", value: "14px" },
  { label: "15", value: "15px" },
  { label: "16", value: "16px" },
  { label: "18", value: "18px" },
  { label: "20", value: "20px" },
  { label: "24", value: "24px" },
  { label: "28", value: "28px" },
  { label: "32", value: "32px" },
  { label: "36", value: "36px" },
  { label: "40", value: "40px" },
  { label: "48", value: "48px" },
  { label: "56", value: "56px" },
  { label: "64", value: "64px" },
];

const activeSize = computed(() => {
  void tick.value;
  const pending = getPendingFontSize();
  return pending ?? "";
});

function handleSelect(value: string | null): void {
  if (value === null) {
    instance.commands.clearFontSize();
  } else {
    instance.commands.setFontSize(value);
  }
  force();
  open.value = false;
}

function toggleOpen(): void {
  open.value = !open.value;
}

function onDocumentMouseDown(e: MouseEvent): void {
  if (rootRef.value && !rootRef.value.contains(e.target as Node)) {
    open.value = false;
  }
}

watch(open, (isOpen) => {
  if (isOpen) {
    document.addEventListener("mousedown", onDocumentMouseDown);
  } else {
    document.removeEventListener("mousedown", onDocumentMouseDown);
  }
});

onMounted(() => {
  if (open.value) {
    document.addEventListener("mousedown", onDocumentMouseDown);
  }
});

onBeforeUnmount(() => {
  document.removeEventListener("mousedown", onDocumentMouseDown);
});

function sampleStyle(value: string | null): Record<string, string> {
  if (value) return { fontSize: value };
  return {};
}
</script>

<template>
  <div ref="rootRef" class="se-fontsize-picker">
    <button
      type="button"
      title="Font size"
      aria-label="Font size"
      :class="`se-toolbar-button se-fontsize-picker-button${activeSize ? ' se-fontsize-picker-active' : ''}`"
      @click="toggleOpen"
    >
      <svg viewBox="0 0 18 18" width="18" height="18">
        <text
          x="5"
          y="13"
          text-anchor="middle"
          font-size="13"
          font-weight="600"
          fill="currentColor"
        >A</text>
        <text
          x="13"
          y="13"
          text-anchor="middle"
          font-size="9"
          font-weight="600"
          fill="currentColor"
        >A</text>
      </svg>
    </button>
    <div v-if="open" class="se-fontsize-picker-dropdown" role="menu">
      <button
        v-for="s in FONT_SIZES"
        :key="s.label"
        type="button"
        class="se-fontsize-picker-option"
        :title="s.label"
        :aria-label="s.label"
        @click="handleSelect(s.value)"
      >
        <span class="se-fontsize-picker-sample" :style="sampleStyle(s.value)">
          {{ s.label }}
        </span>
      </button>
    </div>
  </div>
</template>
