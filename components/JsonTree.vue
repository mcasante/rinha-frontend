<script lang="ts" setup>
import type { Line } from "~/types";
import JsonLine from "./JsonLine.vue";

defineProps<{
  data: Line[];
}>();
</script>

<template>
  <virtualized-list :items="data" :itemHeight="24" :componentId="JsonLine" />
</template>
