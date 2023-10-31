<script lang="ts" setup>
import { useWindowSize, useMousePressed, useMouse } from "@vueuse/core";
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

const scrollThumb = ref<HTMLElement | null>(null);
const scrollBar = ref<HTMLElement | null>(null);
const upButton = ref<HTMLElement | null>(null);
const downButton = ref<HTMLElement | null>(null);

const currentScroll = ref(1);

const { pressed: thumbPressed } = useMousePressed({ target: scrollThumb });
const { pressed: scrollBarPressed } = useMousePressed({ target: scrollBar });
const { pressed: upPressed } = useMousePressed({ target: upButton });
const { pressed: downPressed } = useMousePressed({ target: downButton });

const { height: screenHeight, width } = useWindowSize();
const { y } = useMouse();

const availableHeight = computed(
  () => screenHeight.value - (width.value <= 768 ? 200 : 100)
);

const itemPerScreen = computed(() =>
  Math.ceil(availableHeight.value / props.itemHeight)
);

const totalHeight = computed(() => props.itemsLength * props.itemHeight);

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

let interval: ReturnType<typeof setInterval>;
watchEffect(() => {
  if (!upPressed.value && !downPressed.value) {
    clearInterval(interval);
    return;
  }

  const upOrDown = upPressed.value ? -1 : 1;

  interval = setInterval(() => {
    updateScroll(currentScroll.value + 50 * upOrDown);
  }, 50);
});

let barInterval: ReturnType<typeof setInterval>;
watchEffect(() => {
  if (!scrollBarPressed.value) {
    clearInterval(barInterval);
    return;
  }

  barInterval = setInterval(() => {
    const { top } = scrollBar.value!.getBoundingClientRect();

    const percentage = (y.value - top) / availableHeight.value;
    const toMove = totalHeight.value * percentage - currentScroll.value;

    if (toMove === 0) return;
    if (Math.abs(toMove) < 200)
      return updateScroll(currentScroll.value + toMove);

    updateScroll(currentScroll.value + toMove / 2);
  }, 50);
});

onMounted(() => {
  document.addEventListener("wheel", (e) => {
    if (thumbPressed.value) return;
    updateScroll(currentScroll.value + e.deltaY);
  });

  type MoveEvent = MouseEvent & TouchEvent;
  let prevY = 0;

  const handleMove = (e: MoveEvent) => {
    const currentY = e?.clientY ? e.clientY : e.touches[0].clientY;

    if (thumbPressed.value) {
      const deltaY = currentY - prevY;
      const percentage = deltaY / availableHeight.value;
      updateScroll(currentScroll.value + totalHeight.value * percentage);
    }

    prevY = currentY;
  };

  document.addEventListener("mousemove", (e) => handleMove(e as MoveEvent));
  document.addEventListener("touchmove", (e) => handleMove(e as MoveEvent));

  document.addEventListener("touchstart", (e) => {
    prevY = e.touches[0].clientY;
  });
});

const style = computed(() => ({
  itemHeight: `${props.itemHeight}px`,
  containerHeight: `${availableHeight.value}px`,
  scrollThumbOffset: `${(start.value / props.itemsLength) * 100}%`,
}));
</script>

<template>
  <div class="flex overflow-hidden py-4 px-4 gap-2 relative items-start">
    <div class="virtual-scroll select-none">
      <div ref="scrollBar" class="scrollbar">
        <button ref="scrollThumb" class="thumb fixed" />
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
  <div class="controls flex justify-end md:hidden py-2 px-4">
    <button
      class="w-20 h-12 select-none text-6 cursor-pointer flex items-center justify-center py-2 px-3"
      ref="upButton"
    >
      ↑
    </button>
    <button
      class="w-20 h-12 select-none text-6 cursor-pointer flex items-center justify-center py-2 px-3"
      ref="downButton"
    >
      ↓
    </button>
  </div>
</template>

<style scoped>
.container {
  height: v-bind("style.containerHeight");
}

.scrollbar {
  height: v-bind("style.containerHeight");
  width: 10px;
  background: #00000020;
  position: relative;
  border-radius: 5px;
}

.thumb {
  position: absolute;
  top: calc(v-bind("style.scrollThumbOffset") - 10px);
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
