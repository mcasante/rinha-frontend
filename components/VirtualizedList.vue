<script lang="ts" setup>
import { useWindowSize, useMousePressed } from "@vueuse/core";
import { clamp } from "~/utils";

const emit = defineEmits<{
  (e: "scroll", value: { position: number; limit: number }): void;
}>();

const props = defineProps<{
  items: any[];
  itemsLength: number;
  itemHeight: number;
  componentId: any;
}>();

const { height: screenHeight } = useWindowSize();
const availableHeight = computed(() => screenHeight.value - 100);
const scrollThumb = ref<HTMLElement | null>(null);
const { pressed } = useMousePressed({ target: scrollThumb });
const currentScroll = ref(1);

const itemPerScreen = computed(() =>
  Math.ceil(availableHeight.value / props.itemHeight)
);

const totalHeight = computed(() => props.itemsLength * props.itemHeight);

const style = computed(() => ({
  itemHeight: `${props.itemHeight}px`,
}));

const start = computed(() =>
  Math.floor(currentScroll.value / props.itemHeight)
);

watch(currentScroll, () => {
  emit("scroll", {
    position: start.value,
    limit: itemPerScreen.value + 1,
  });
});

const updateScroll = (value: number) => {
  currentScroll.value = clamp(
    value,
    0,
    totalHeight.value - availableHeight.value
  );
};

onMounted(() => {
  document.addEventListener("wheel", (e) => {
    if (pressed.value) return;
    updateScroll(currentScroll.value + e.deltaY);
  });

  let prevY = 0;

  document.addEventListener("mousemove", (e) => {
    const deltaY = e.clientY - prevY;

    if (pressed.value) {
      const percentage = deltaY / availableHeight.value;
      updateScroll(currentScroll.value + totalHeight.value * percentage);
    }

    prevY = e.clientY;
  });
});

const currentScrollPercentage = computed(() => {
  const start = Math.floor(currentScroll.value / props.itemHeight);
  return (start / props.itemsLength) * 100;
});
const scrollThumbOffset = computed(() => `${currentScrollPercentage.value}%`);
</script>

<template>
  <div class="flex gap-4 relative items-start">
    <div class="virtual-scroll h-full">
      <div ref="scrollThumb" class="scrollbar">
        <button class="thumb fixed" />
      </div>
    </div>
    <div class="container">
      <template v-for="n in itemPerScreen" :key="n">
        <component
          v-if="props.items[n - 1]"
          class="item"
          :is="componentId"
          :index="start + n"
          :data="props.items[n - 1]"
        />
      </template>
    </div>
  </div>
</template>

<style scoped>
.container {
  height: calc(100vh - 90px);
}

.scrollbar {
  height: calc(100vh - 90px);
  width: 10px;
  background: #00000020;
  position: relative;
  border-radius: 5px;
}

.thumb {
  position: absolute;
  top: calc(v-bind(scrollThumbOffset) - 10px);
  left: 50%;
  transform: translateX(-50%);
  cursor: pointer;
  width: 14px;
  height: 14px;
  background: #00000080;
  border-radius: 50%;
}

.item {
  height: v-bind("style.itemHeight");
}
</style>
