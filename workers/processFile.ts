import type { Line } from "~/types";

type Params = {
  file?: File;
  position?: number;
  limit?: number;
  clear?: boolean;
};

let processedData: Line[] = [];

self.addEventListener("message", (event: MessageEvent<Params>) => {
  const { file, position = 0, limit = 100, clear } = event.data;

  if (clear) {
    processedData = [];
    return;
  }

  if (!file) {
    self.postMessage({
      data: processedData.slice(position, position + limit),
      length: processedData.length,
    });
    return;
  }

  const reader = new FileReader();

  reader.addEventListener("load", () => {
    const content = reader.result;

    try {
      const data = JSON.parse(content as string);
      processedData = processData(data);

      self.postMessage({
        data: processedData.slice(position, position + limit),
        length: processedData.length,
      });
    } catch (error) {
      console.log(error);
      self.postMessage({
        error: true,
      });
    }
  });

  reader.readAsText(file);
});
