<script lang="ts" setup>
import type { JsonData } from "~/types";
import JsonLine from "./JsonLine.vue";

const props = defineProps<{
  worker: Worker;
}>();

const jsonData = useState<JsonData>("jsonData", () => ({
  data: [],
  length: 0,
  itemHeight: 24,
}));

const handleScroll = (value: { position: number; limit: number }) => {
  props.worker.postMessage(value);
};

const throttledScroll = throttle(handleScroll, 5);

onMounted(() => {
  props.worker.addEventListener("message", (event) => {
    const { data, length } = event.data;

    jsonData.value.data = data;
    jsonData.value.length = length;
  });

  handleScroll({ position: 0, limit: 100 });
});
</script>

<template>
  <virtualized-list
    :items="jsonData.data"
    :itemHeight="jsonData.itemHeight"
    :componentId="JsonLine"
    @scroll="throttledScroll"
  />
</template>
