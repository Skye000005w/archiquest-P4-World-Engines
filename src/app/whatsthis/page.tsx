"use client";
import { getGeminiVision } from "@/ai/gemini";
import SelectImageRegion from "@/components/SelectImageRegion";
import { useState } from "react";

//Demo of generating a map of coordinates that can be selected
export default function WhatsThisPage() {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const handleSelect = async (imgUrl: string) => {
    setDescription("Analyzing...");
    const description = await getGeminiVision(
      "Briefly describe the image.",
      imgUrl
    );
    setDescription(description);
    setImageUrl(imgUrl);
  };

  const downloadImage = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = "selected-region.png";
    link.click();
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <div className="flex flex-col gap-4">
          <span className="text max-w-sm">{description}</span>
          <SelectImageRegion img="/sat.jpg" onSelect={handleSelect} />
          <button onClick={downloadImage}>Download PNG</button>
        </div>
      </div>
    </main>
  );
}