<script setup lang="ts">
const fileInput = ref<HTMLInputElement | null>(null);

const emit = defineEmits<{
  (e: "change", value: File): void;
}>();

const loadJson = () => {
  if (!fileInput.value) return;

  fileInput.value.addEventListener("change", () => {
    emit("change", fileInput.value!.files![0]);
  });

  fileInput.value.click();
};
</script>

<template>
  <input ref="fileInput" accept="application/json" type="file" class="hidden" />
  <button
    v-bind="$attrs"
    @click="loadJson"
    class="self-center px-3 text-4 py-1 rounded-2 b-1 transition hover:transform hover:scale-105 hover:cursor-pointer active:scale-100 active:translate-y-1 active:shadow-none"
  >
    <slot>Load JSON</slot>
  </button>
</template>
