import { generateImageFal } from "@/ai/fal";
import { getGroqCompletion } from "@/ai/groq";
import { describeImagePrompt } from "@/ai/prompts";
import { useEffect, useState } from "react";

type FastImageProps = {
  prompt: string;
  systemPrompt: string;
  imageSize: "landscape_16_9" | "square";
  animate: number;
  onChange?: (url: string) => void;
};

//Component that generates images on a timer.
//Provides a callback function that is run every time an image is generated.
export default function FastImage({
  prompt,
  systemPrompt,
  imageSize,
  animate,
  onChange,
}: FastImageProps) {
  const [img, setImg] = useState<string>("");

  //Animation code - if animate is not zero then we generate images every animate milliseconds
  useEffect(() => {
    async function generateImage() {
      //Prompt Groq again to get an image description
      const imageDescription = await getGroqCompletion(
        prompt,
        64,
        systemPrompt
      );

      //Generate the image with Fal
      const url = await generateImageFal(imageDescription, imageSize);
      return url;
    }

    //if not animating then generate a single image
    if (animate == 0) {
      generateImage().then((url) => setImg(url));
    } else {
      //otherwise generate on a loop
      const interval = setInterval(async () => {
        const url = await generateImage();
        setImg(url);
        if (onChange) onChange(url);
      }, animate); // Update interval

      return () => clearInterval(interval); // Cleanup to avoid memory leaks if the component unmounts
    }
  }, [prompt, animate]);

  return <img src={img} />;
}
