<script lang="ts" setup>
import { useWindowSize, useWindowScroll } from "@vueuse/core";

const props = defineProps<{
  items: any[];
  itemHeight: number;
  componentId: any;
}>();

const { height: screenHeight } = useWindowSize();
const { y } = useWindowScroll();

const itemPerScreen = computed(() =>
  Math.ceil(screenHeight.value / props.itemHeight)
);

const height = computed(() => props.items.length * props.itemHeight);

const currentData = computed(() => {
  const start = Math.floor(y.value / props.itemHeight);
  const end = start + itemPerScreen.value * 2;

  return props.items.slice(start, end);
});
</script>

<template>
  <div :style="{ height: `${height}px` }">
    <div :style="{ height: `${y}px` }"></div>
    <template v-for="n in itemPerScreen" :key="n">
      <component
        v-if="currentData[n - 1]"
        :is="componentId"
        :data="currentData[n - 1]"
      />
    </template>
  </div>
</template>

<style></style>
