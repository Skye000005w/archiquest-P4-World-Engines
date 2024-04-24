"use client";

import { useState } from "react";
import { describeImagePrompt } from "@/ai/prompts";
import TagCloud from "@/components/TagCloud";
import FastImage from "@/components/FastImage";

//An example of using the tag cloud and fast image component to generate a timelapse of images

export default function TimelapsePage() {
  const [keywords, setKeywords] = useState<string>("Selected Keywords...");
  const [year, setYear] = useState<number>(2024);
  const [animateImages, setAnimateImages] = useState<boolean>(false);
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <div className="flex flex-col">
          <button
            className={`p-4 bg-white rounded-lg hover:shadow ${
              animateImages && "bg-red-600"
            }`}
            onClick={() => setAnimateImages(!animateImages)}
          >
            {animateImages ? "⏹" : "▶"}
          </button>
          <TagCloud
            prompt="A cityscape"
            totalTags={20}
            handleSelect={(tags) => setKeywords(tags.join(", "))}
          />
          <FastImage
            prompt={`A cityscape in the year ${year.toString()}, ${keywords}`}
            systemPrompt={describeImagePrompt}
            imageSize="landscape_16_9"
            animate={animateImages ? 5000 : 0}
            onChange={(url) => setYear((year) => year + 5)}
          />
        </div>
      </div>
    </main>
  );
}
