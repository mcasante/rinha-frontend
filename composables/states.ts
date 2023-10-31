import type { JsonData } from "~/types";

export const useVirtualScroll = useState("virtualScroll", () => 1);

export const jsonData = useState<JsonData>("jsonData", () => ({
  data: [],
  length: 0,
  itemHeight: 0,
}));
