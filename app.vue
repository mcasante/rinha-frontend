<script setup lang="ts">
import type { Line } from "~/types";
const jsonLines = ref<Line[]>([]);

const updateJson = (data: Record<string, unknown>) => {
  const parsed = parseLines(data);
  jsonLines.value = parsed;
};
</script>

<template>
  <div class="min-h-100vh flex justify-center items-center">
    <div class="mx-auto max-w-xl container relative" v-if="jsonLines.length">
      <header class="flex sticky top-0 bg-white items-center gap-2 py-4">
        <button
          class="b-none hover:cursor-pointer flex items-center bg-transparent"
          @click="jsonLines = []"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 inline-block mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>
        <h1>File name</h1>
      </header>
      <JsonTree :data="jsonLines" />
    </div>
    <div v-else class="text-center flex flex-col gap-4">
      <h1 class="text-10">JSON Three Viewer</h1>
      <h2 class="font-light">
        Simple JSON viewer that runs completly on-client. No data exchange
      </h2>

      <FileLoader @change="updateJson" />
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
