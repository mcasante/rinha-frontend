<script lang="ts" setup>
import type { Line } from "~/types";
import JsonLine from "./JsonLine.vue";

const props = defineProps<{
  worker: Worker;
}>();

const jsonData = ref<Line[]>([]);
const jsonLength = ref(0);
const itemHeight = ref(24);

const handleScroll = (value: { position: number; limit: number }) => {
  props.worker.postMessage(value);
};

const throttledScroll = throttle(handleScroll, 5);

onMounted(() => {
  props.worker.addEventListener("message", (event) => {
    const { data, length } = event.data;

    jsonData.value = data;
    if (length !== jsonLength.value) jsonLength.value = length;
  });

  handleScroll({ position: 0, limit: 100 });
});
</script>

<template>
  <virtualized-list
    :items="jsonData"
    :items-length="jsonLength"
    :itemHeight="itemHeight"
    :componentId="JsonLine"
    @scroll="throttledScroll"
  />
</template>
