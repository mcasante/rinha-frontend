<script setup lang="ts">
const fileInput = ref<HTMLInputElement | null>(null);

const emit = defineEmits<{
  (e: "change", value: Record<string, unknown>): void;
}>();

const loadJson = () => {
  if (!fileInput.value) return;

  const reader = new FileReader();
  reader.addEventListener("load", (event) => {
    const content = event.target!.result;

    try {
      const data = JSON.parse(content as string);
      emit("change", data);
    } catch (error) {
      throw new Error("Error parsing JSON: " + error);
    }
  });

  fileInput.value.addEventListener("change", () => {
    const file = fileInput.value!.files![0];
    reader.readAsText(file!);
  });

  fileInput.value.click();
};
</script>

<template>
  <input ref="fileInput" accept="application/json" type="file" class="hidden" />
  <button @click="loadJson" class="self-center px-3 py-1 rounded-1 b-1">
    Load JSON
  </button>
</template>
