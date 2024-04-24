import { generateVoice } from "@/ai/fal";
import { useEffect, useState } from "react";

export default function TextToSpeech({
  text,
  showControls,
  autoPlay,
}: {
  text: string;
  showControls: boolean;
  autoPlay: boolean;
}) {
  const [audioURL, setAudioURL] = useState<string>("");

  useEffect(() => {
    if (text !== "") generateVoice(text).then((url) => setAudioURL(url));
  }, [text]);

  if (!audioURL) return <div>Loading...</div>;

  return <audio src={audioURL} controls={showControls} autoPlay={autoPlay} />;
}
