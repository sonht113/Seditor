<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { getPendingTextColor, getPendingBgColor } from "seditor-core";
import { useEditor } from "./useEditor";

const props = defineProps<{
  kind: "text" | "background";
}>();

const instance = useEditor();
const open = ref(false);
const tick = ref(0);
const rootRef = ref<HTMLDivElement | null>(null);

const force = () => {
  tick.value++;
};

const unregister = instance.editor.registerUpdateListener(() => force());
onBeforeUnmount(unregister);

const TEXT_COLORS: Array<{ label: string; value: string | null }> = [
  { label: "Default", value: null },
  { label: "Dark gray", value: "#434343" },
  { label: "Gray", value: "#666666" },
  { label: "Light gray", value: "#999999" },
  { label: "Red", value: "#e03e3e" },
  { label: "Dark red", value: "#a56548" },
  { label: "Coral", value: "#e06666" },
  { label: "Orange", value: "#f08c00" },
  { label: "Dark orange", value: "#b45f06" },
  { label: "Amber", value: "#bf9000" },
  { label: "Yellow", value: "#dfab01" },
  { label: "Olive", value: "#808000" },
  { label: "Green", value: "#4f9b45" },
  { label: "Dark green", value: "#38761d" },
  { label: "Teal", value: "#008080" },
  { label: "Cyan", value: "#009eaf" },
  { label: "Blue", value: "#2383e2" },
  { label: "Dark blue", value: "#1155cc" },
  { label: "Indigo", value: "#3b5998" },
  { label: "Purple", value: "#9065b0" },
  { label: "Dark purple", value: "#674ea7" },
  { label: "Magenta", value: "#a4396b" },
  { label: "Pink", value: "#d6459d" },
  { label: "Brown", value: "#8b4513" },
];

const BG_COLORS: Array<{ label: string; value: string | null }> = [
  { label: "None", value: null },
  { label: "Light gray", value: "#e3e2e0" },
  { label: "Gray", value: "#cccccc" },
  { label: "Dark gray", value: "#999999" },
  { label: "Light red", value: "#fde0e0" },
  { label: "Red", value: "#f7b3b3" },
  { label: "Salmon", value: "#fad7a0" },
  { label: "Light orange", value: "#fdebd0" },
  { label: "Orange", value: "#fbd9a8" },
  { label: "Light amber", value: "#fce8b3" },
  { label: "Light yellow", value: "#fcf2c7" },
  { label: "Yellow", value: "#fff2a8" },
  { label: "Light olive", value: "#e8e8c0" },
  { label: "Light green", value: "#dbeddb" },
  { label: "Green", value: "#b6d7a8" },
  { label: "Light teal", value: "#c0e0e0" },
  { label: "Light cyan", value: "#c0e8ec" },
  { label: "Light blue", value: "#d4e4fa" },
  { label: "Blue", value: "#a8c8f0" },
  { label: "Light indigo", value: "#c8d2e8" },
  { label: "Light purple", value: "#e5dcef" },
  { label: "Purple", value: "#c9b8e0" },
  { label: "Light pink", value: "#f8dcec" },
  { label: "Pink", value: "#f0b8d8" },
  { label: "Light brown", value: "#e0d0c0" },
];

const colors = computed(() =>
  props.kind === "text" ? TEXT_COLORS : BG_COLORS,
);
const label = computed(() =>
  props.kind === "text" ? "Text color" : "Background color",
);
const apply = computed(() =>
  props.kind === "text"
    ? instance.commands.setTextColor
    : instance.commands.setTextBackgroundColor,
);
const clear = computed(() =>
  props.kind === "text"
    ? instance.commands.clearTextColor
    : instance.commands.clearTextBackgroundColor,
);
const getPending = computed(() =>
  props.kind === "text" ? getPendingTextColor : getPendingBgColor,
);

const activeColor = computed(() => {
  void tick.value;
  return getPending.value();
});

function handleSelect(value: string | null): void {
  if (value === null) {
    clear.value();
  } else {
    apply.value(value);
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

function swatchStyle(value: string | null): Record<string, string> {
  if (value === null) {
    return {
      backgroundImage:
        "linear-gradient(135deg, transparent 43%, #e03e3e 43%, #e03e3e 57%, transparent 57%)",
    };
  }
  return { backgroundColor: value };
}
</script>

<template>
  <div ref="rootRef" class="se-color-picker">
    <button
      type="button"
      :title="label"
      :aria-label="label"
      :class="`se-toolbar-button se-color-picker-button${activeColor ? ' se-color-picker-active' : ''}`"
      @click="toggleOpen"
    >
      <svg v-if="kind === 'text'" viewBox="0 0 18 18" width="18" height="18">
        <text
          x="9"
          y="12"
          text-anchor="middle"
          font-size="13"
          font-weight="600"
          fill="currentColor"
        >
          A
        </text>
        <rect
          x="2"
          y="14"
          width="14"
          height="2.5"
          rx="1"
          :fill="activeColor ?? 'currentColor'"
          :opacity="activeColor ? 1 : 0.3"
        />
      </svg>
      <svg v-else viewBox="0 0 18 18" width="18" height="18">
        <rect
          x="2"
          y="3"
          width="14"
          height="11"
          rx="2"
          :fill="activeColor ?? 'none'"
          stroke="currentColor"
          stroke-width="1"
          :opacity="activeColor ? 1 : 0.4"
        />
        <text
          x="9"
          y="11"
          text-anchor="middle"
          font-size="8"
          font-weight="600"
          :fill="activeColor ? '#fff' : 'currentColor'"
        >
          ab
        </text>
      </svg>
    </button>
    <div v-if="open" class="se-color-picker-dropdown" role="menu">
      <button
        v-for="c in colors"
        :key="c.label"
        type="button"
        class="se-color-picker-swatch"
        :title="c.label"
        :aria-label="c.label"
        @click="handleSelect(c.value)"
      >
        <span class="se-color-picker-color" :style="swatchStyle(c.value)" />
        <span class="se-color-picker-label">{{ c.label }}</span>
      </button>
    </div>
  </div>
</template>
