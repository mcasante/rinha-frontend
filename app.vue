<script setup lang="ts">
import FileWorker from "~/workers/processFile?worker";

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
  <div class="md:h-100vh h-80vh flex justify-center items-center">
    <div
      class="mx-auto max-w-xl container h-full relative"
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
      </header>
      <JsonTree v-if="fileWorker" :worker="fileWorker" />
    </div>
    <div v-else class="text-center flex flex-col gap-4">
      <h1 class="text-10">JSON Tree Viewer</h1>
      <h2 class="font-light">
        Simple JSON viewer that runs completly on-client. No data exchange
      </h2>

      <FileLoader :disabled="isLoading" @change="updateFile">
        {{ isLoading ? "loading..." : "Load JSON" }}
      </FileLoader>
      <div v-if="hasError" class="text-red-500">Error while loading file</div>
    </div>
  </div>
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
