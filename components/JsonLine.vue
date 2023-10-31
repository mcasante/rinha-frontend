<script lang="ts" setup>
import type { Line } from "~/types";

const props = defineProps<{
  data: Line;
  index: number;
}>();
const isClosing = computed(() => ["}", "]"].includes(props.data.key));
const key = computed(() => props.data.key.split(":"));
</script>

<template>
  <div class="flex items-stretch">
    <div
      class="shrink-0 text-3 text-gray-400 w-20 pr-4 text-right"
      v-if="index !== null && index >= 0"
    >
      {{ index }}
    </div>
    <div class="offset" :style="{ width: data.level * 20 + 'px' }" />
    <span class="whitespace-nowrap text-teal-600 font-light shrink-0">
      <span
        :class="{ 'text-orange-200': isClosing, 'font-semibold': isClosing }"
      >
        {{ key[0] }}<span v-show="!isClosing">:</span>
        <span class="font-semibold text-orange-200">&nbsp;{{ key[1] }}</span>
      </span>
    </span>
    <span class="font-light whitespace-nowrap"> {{ data.value }}</span>
  </div>
</template>

<style scoped>
.offset {
  background: linear-gradient(
    to right,
    transparent 0,
    transparent 19px,
    #bfbfbf80 20px,
    #bfbfbf80 21px
  );
  background-position: -20px 0;
  background-size: 21px;
  background-repeat: repeat-x;
  flex-shrink: 0;
}
</style>
