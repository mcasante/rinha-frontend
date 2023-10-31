export type Line = {
  key: string;
  value?: string;
  level: number;
};

export type JsonData = {
  data: Line[];
  length: number;
  itemHeight: number;
};
