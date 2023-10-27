import type { Line } from "~/types";

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const chunk = <T>(array: T[], size: number) => {
  const chunked_arr = [];
  let index = 0;
  while (index < array.length) {
    chunked_arr.push(array.slice(index, size + index));
    index += size;
  }
  return chunked_arr;
};

export const parseLines = (data: Record<string, unknown>, level = 0) => {
  const lines: Line[] = [];

  const formatValue = (str: string) =>
    typeof str === "string" ? `"${str}"` : String(str);

  const parseLine = (data: Record<string, unknown>, level: number) => {
    for (const key in data) {
      const entry = { key, value: "", level };

      if (typeof data[key] !== "object") {
        entry.value = formatValue(data[key] as string);
        entry.key = `${entry.key}:`;
        lines.push(entry);
        continue;
      }

      const bkts = Array.isArray(data[key]) ? "[]" : "{}";

      if (!data[key]) {
        entry.value = "null";
      } else {
        entry.key += `: ${bkts[0]}`;
      }

      lines.push(entry);
      parseLine(data[key] as Record<string, unknown>, level + 1);

      if (!data[key]) continue;

      lines.push({ key: bkts[1], level });
    }
  };

  parseLine(data, level);
  return lines;
};
