import React, { useState } from "react";

type OnLoad = (text: string, file?: File) => void;

export default function useCsvUploader(onLoad?: OnLoad) {
  const [fileText, setFileText] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === "string") {
        setFileText(result);
        onLoad?.(result, file);
      } else {
        setFileText("");
      }
      setIsLoading(false);
    };

    reader.readAsText(file);
  }

  return { fileText, fileName, isLoading, handleFileUpload } as const;
}
