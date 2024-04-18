"use client";

import { useState, useEffect } from "react";
import { getGroqCompletion, generateImageFal, generateVoice } from "./ai";
import {
  mainGamePrompt,
  describeImagePrompt,
  generateButtonPrompt,
} from "./prompts";

type SelectableButton = {
  text: string;
  selected: boolean;
};

export default function Game() {
  const [prompt, setPrompt] = useState<string>("");
  const [keywords, setKeywords] = useState<string>(
    "Your game instructions go here..."
  );
  const [img, setImg] = useState<string>("");
  const [score, setScore] = useState<string>("0");
  const [buttonText, setButtonText] = useState<SelectableButton[]>([
    { text: "Option 1", selected: false },
    { text: "Option 1", selected: false },
  ]);
  const [audioURL, setAudioURL] = useState<string>("");

  const [imageGallery, setImageGallery] = useState<string[]>([]);

  async function handleClick() {
    setKeywords("Generating...");
    const buttonString = await getGroqCompletion(
      prompt,
      128,
      generateButtonPrompt
    );

    const buttonOptions = buttonString.split(",");
    setButtonText(
      buttonOptions.map((text:string) => ({ text: text, selected: false }))
    );
  }

  async function generateImage() {
    //Prompt Groq again to get an image description
    const imageDescription = await getGroqCompletion(
      `Describe an artpiece that includes: ${keywords}`,
      64,
      describeImagePrompt
    );

    //Generate the image with Fal
    const url = await generateImageFal(imageDescription, "landscape_16_9");
    return url;
  }

  const handleSelectButton = (buttonIndex: number) => {
    const newButtons = buttonText.map((b, i) => {
      if (i === buttonIndex) {
        return { text: b.text, selected: !b.selected };
      }
      return b;
    });
    setButtonText(newButtons);
    setKeywords(
      buttonText
        .filter((b) => b.selected)
        .map((b) => b.text)
        .join(",")
    );
  };

  const handleCreateImage = async () => {
    const url = await generateImage();

    //Prompt Groq again to decide what the new game state should be
    const newScore = await getGroqCompletion(
      `The player made an artpiece using the following keywords: ${keywords}.`,
      4,
      "Give the artwork a score out of 10. Only output the new score value with no explanation or other characters."
    );

    // generateImage();
    const existingImages = imageGallery;
    existingImages.push(url);
    setImageGallery(existingImages);

    /*
    const critique = await getGroqCompletion(
      `The player made an artpiece using the following keywords: ${response}.`,
      64,
      "Critique the merit of the artwork"
    );

    //const audio = await generateVoice(critique);
    //setAudioURL(audio);
    */
    //update your game state however you want
    setScore(newScore);
  };

  return (
    <div className="flex flex-col">
      <p> Score: {score}</p>
      <input
        className="p-2 mr-2"
        type="text"
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="What do you want to do?"
      />
      <button className="p-4" onClick={handleClick}>
        Create Options
      </button>
      <button className="p-4" onClick={handleCreateImage}>
        Create Image
      </button>
      <div className="flex justify-between w-full flex-wrap">
        {buttonText.map((b, i) => (
          <button
            onClick={() => handleSelectButton(i)}
            key={i}
            className={`rounded-lg ${
              b.selected ? "bg-slate-500" : "bg-white"
            } p-2 hover:shadow m-2`}
          >
            {b.text}
          </button>
        ))}
      </div>
      <p className="py-2">{keywords}</p>
      <div className="grid grid-cols-3 w-full gap-4">
        {imageGallery.map((url, i) => (
          <img className="rounded-lg" key={i} src={url} />
        ))}
      </div>

      <audio src={audioURL} controls />
    </div>
  );
}
