<script setup lang="ts">
import FileWorker from "~/workers/processFile?worker";
import { useWindowSize } from "@vueuse/core";
import { useConfirmDialog, onKeyStroke } from "@vueuse/core";

const { isRevealed, reveal, confirm } = useConfirmDialog();

onKeyStroke("Escape", confirm);
onKeyStroke("h", () => (isRevealed.value ? confirm() : reveal()));

const shortcuts = [
  { keys: ["h"], description: "Toggles the shortcut modal" },
  { keys: ["esc"], description: "Closes the shortcut modal" },
  { keys: ["ArrowUp"], description: "Scrolls up" },
  { keys: ["ArrowDown"], description: "Scrolls down" },
  { keys: ["Meta", "ArrowDown"], description: "Scrolls up faster" },
  { keys: ["Meta", "ArrowUp"], description: "Scrolls down faster" },
  {
    keys: ["Any Number"],
    description: "Try start typing :)",
  },
];

useHead({
  htmlAttrs: {
    lang: "en",
  },
});

useSeoMeta({
  title: "JSON Tree Viewer",
  description:
    "Simple JSON viewer that runs completly on-client. No data exchange",
});

const { height } = useWindowSize();
const containerHeight = computed(() =>
  isFinite(height.value) ? height.value + "px" : "80vh"
);

const selectedFile = ref<File | null>(null);
const status = ref<"idle" | "loading" | "error">("idle");

const isLoading = computed(() => status.value === "loading");
const hasError = computed(() => status.value === "error");
const isIdle = computed(() => status.value === "idle");

const fileWorker = ref<Worker>();

const updateFile = (data: File) => {
  if (!fileWorker.value) return;

  status.value = "loading";
  fileWorker.value.postMessage({ file: data });

  selectedFile.value = data;
};

onMounted(() => {
  if (window.Worker) {
    if (!(fileWorker instanceof Worker)) {
      fileWorker.value = new FileWorker();

      fileWorker.value.addEventListener("message", (event) => {
        const { error } = event.data;
        status.value = error ? "error" : "idle";
      });
    }
  }
});

const clear = () => {
  if (!fileWorker.value) return;
  fileWorker.value.postMessage({ clear: true });
  selectedFile.value = null;
};
</script>

<template>
  <div
    :style="{ height: containerHeight }"
    class="flex justify-center items-center relative"
  >
    <div
      class="mx-auto max-w-5xl shadow-xl px-4 container h-auto min-h-full relative"
      v-if="selectedFile?.name && isIdle"
    >
      <header class="z-10 flex sticky top-0 bg-white items-center gap-4 py-4">
        <button
          class="b-none text-8 hover:cursor-pointer flex items-center bg-transparent"
          @click="clear"
        >
          ←
        </button>
        <h1 v-text="selectedFile!.name" />

        <button
          class="ml-auto px-3 text-4 py-1 rounded-2 b-1 transition hover:transform hover:scale-105 hover:cursor-pointer active:scale-100 active:translate-y-1 active:shadow-none"
          @click="reveal"
        >
          Shortcuts
        </button>
      </header>
      <JsonTree v-if="fileWorker" :worker="fileWorker" />
    </div>
    <div v-else class="text-center">
      <h1 class="text-10 mb-4">JSON Tree Viewer</h1>
      <h2 class="font-light mb-8">
        Simple JSON viewer that runs completly on-client<br />
        No data exchange
      </h2>

      <FileLoader :disabled="isLoading" @change="updateFile">
        {{ isLoading ? "loading..." : "Load JSON" }}
      </FileLoader>
      <div v-if="hasError" class="text-red-500">Error while loading file</div>
    </div>
  </div>
  <teleport to="body">
    <div
      v-if="isRevealed"
      class="top-0 z-50 flex justify-center items-center absolute h-full w-full bg-black/30"
      @click.self="confirm"
    >
      <div class="bg-white px-4 pt-2 pb-6 rounded-lg shadow-xl w-full max-w-xl">
        <header class="flex justify-between items-center mb-6">
          <h2>Shortcuts</h2>
          <button
            class="w-6 h-6 text-4 rounded-2 b-1 transition hover:transform hover:scale-105 hover:cursor-pointer active:scale-100 active:translate-y-1 active:shadow-none"
            @click="confirm"
          >
            x
          </button>
        </header>
        <ul class="flex flex-col list-none gap-4">
          <li class="grid keys-grid" v-for="shortcut in shortcuts">
            <div>
              <template v-for="[index, key] in Object.entries(shortcut.keys)">
                <kbd
                  class="bg-zinc-100 text-zinc-800 font-bold lh-4 py-1 px-2 border-zinc-400 border rounded shadow px-1"
                  v-text="key"
                />
                <span
                  class="px-2"
                  v-if="+index !== shortcut.keys.length - 1"
                  v-text="'+'"
                />
              </template>
            </div>
            <span class="ml-2" v-text="shortcut.description" />
          </li>
        </ul>
      </div>
    </div>
  </teleport>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: font-family, ui-sans-serif, system-ui, -apple-system,
    BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans",
    sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol",
    "Noto Color Emoji";
}
</style>

<style scoped>
.keys-grid {
  grid-template-columns: 1fr 2fr;
}
</style>
