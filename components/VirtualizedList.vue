<script lang="ts" setup>
import {
  useWindowSize,
  useMousePressed,
  useMouse,
  onKeyStroke,
  useKeyModifier,
} from "@vueuse/core";

import type { JsonData } from "~/types";

import { clamp } from "~/utils";

const emit = defineEmits<{
  (e: "scroll", value: { position: number; limit: number }): void;
}>();

const props = defineProps<{
  items: any[];
  itemHeight: number;
  componentId: any;
}>();

const jsonData = useState<JsonData>("jsonData");

const scrollThumb = ref<HTMLElement | null>(null);
const scrollBar = ref<HTMLElement | null>(null);
const upButton = ref<HTMLElement | null>(null);
const downButton = ref<HTMLElement | null>(null);

const currentScroll = useState<number>("virtualScroll", () => 1);

const meta = useKeyModifier("Meta");
const { pressed: thumbPressed } = useMousePressed({ target: scrollThumb });
const { pressed: scrollBarPressed } = useMousePressed({ target: scrollBar });
const { pressed: upPressed } = useMousePressed({ target: upButton });
const { pressed: downPressed } = useMousePressed({ target: downButton });

const { height: screenHeight, width } = useWindowSize();
const { y } = useMouse();

const availableHeight = computed(
  () => screenHeight.value - (width.value <= 768 ? 190 : 120)
);

const itemPerScreen = computed(() =>
  Math.ceil(availableHeight.value / props.itemHeight)
);

const totalHeight = computed(() => jsonData.value.length * props.itemHeight);

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
  const newVal = clamp(value, 0, totalHeight.value - availableHeight.value);
  currentScroll.value = newVal;
};

let interval: ReturnType<typeof setInterval>;
watchEffect(() => {
  if (!upPressed.value && !downPressed.value) {
    clearInterval(interval);
    return;
  }

  const upOrDown = upPressed.value ? -1 : 1;

  interval = setInterval(() => {
    updateScroll(currentScroll.value + props.itemHeight * upOrDown);
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

const speed = computed(() =>
  meta.value ? itemPerScreen.value * props.itemHeight : props.itemHeight * 2
);

onKeyStroke("ArrowUp", () => {
  updateScroll(currentScroll.value - speed.value);
});

onKeyStroke("ArrowDown", () => {
  updateScroll(currentScroll.value + speed.value);
});

const actions = ["Enter", "Backspace", "Escape"];
const digits = "1234567890".split("").concat(actions);

const typed = ref<string[]>([]);

onKeyStroke(digits, (e) => {
  if (typed.value.length === 0 && actions.includes(e.key)) return;

  if (e.key === "Backspace") {
    typed.value.pop();
    return;
  }

  if (e.key === "Escape") {
    typed.value = [];
    return;
  }

  const number = Number(typed.value.join(""));

  if (e.key === "Enter") {
    updateScroll((number - 1) * props.itemHeight);
    typed.value = [];
    return;
  }

  if (number > jsonData.value.length) {
    typed.value = jsonData.value.length.toString().split("");
    return;
  }

  typed.value.push(e.key);
});

onMounted(() => {
  document.onwheel = (e) => {
    if (thumbPressed.value) return;
    updateScroll(currentScroll.value + e.deltaY);
  };

  type MoveEvent = MouseEvent & TouchEvent;
  let prevY = 0;

  const handleMove = (e: MoveEvent) => {
    const currentY = e?.clientY ? e.clientY : e.touches?.[0].clientY;

    if (thumbPressed.value) {
      const deltaY = currentY - prevY;
      const percentage = deltaY / availableHeight.value;
      updateScroll(currentScroll.value + totalHeight.value * percentage);
    }

    prevY = currentY || prevY;
  };

  document.onmousemove = (e) => handleMove(e as MoveEvent);
  document.ontouchmove = (e) => handleMove(e as MoveEvent);

  document.ontouchstart = (e) => {
    prevY = e.touches[0].clientY;
  };
});

const style = computed(() => ({
  itemHeight: `${props.itemHeight}px`,
  containerHeight: `${availableHeight.value}px`,
  scrollThumbOffset: `${(start.value / jsonData.value.length) * 100}%`,
}));
</script>

<template>
  <div class="flex overflow-hidden py-4 px-4 gap-2 relative items-start">
    <div class="virtual-scroll select-none">
      <div ref="scrollBar" class="scrollbar">
        <div ref="scrollThumb" class="thumb fixed" />
      </div>
    </div>
    <div class="container overflow-hidden overflow-x-scroll">
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
  <Teleport to="body">
    <div
      v-if="typed.length"
      class="z-30 absolute top-0 h-full w-full flex justify-center items-center bg-black/5"
    >
      <div class="bg-white text-center shadow-lg rounded-md px-4 pt-2 pb-6">
        <span class="text-10 font-bold" v-text="typed.join('')" />
        <div class="flex justify-end gap-2 mt-4">
          <kbd
            class="bg-zinc-100 mr-2 text-zinc-800 font-bold lh-4 py-1 px-2 border-zinc-400 border rounded shadow px-1"
          >
            esc - Clear
          </kbd>
          <kbd
            class="bg-zinc-100 mr-2 text-zinc-800 font-bold lh-4 py-1 px-2 border-zinc-400 border rounded shadow px-1"
          >
            Enter - Jump to line</kbd
          >
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
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
