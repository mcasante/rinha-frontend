<script lang="ts" setup>
import type { Line } from "~/types";

const props = defineProps<{
  data: Line;
}>();
const isClosing = computed(() => ["}", "]"].includes(props.data.key));
const key = computed(() => props.data.key.split(":"));
</script>

<template>
  <div class="flex items-stretch">
    <div class="offset" :style="{ width: data.level * 20 + 'px' }" />
    <span class="text-teal-600 font-light">
      <span
        :class="{ 'text-orange-200': isClosing, 'font-semibold': isClosing }"
      >
        {{ key[0] }}
        <span v-show="!isClosing">:</span>
        <span class="font-semibold text-orange-200">&nbsp;{{ key[1] }}</span>
      </span>
    </span>
    <span clas="font-light"> {{ data.value }}</span>
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
}
</style>
