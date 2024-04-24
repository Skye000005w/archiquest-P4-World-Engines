"use server";

const fal_key = process.env.FAL;

//This function makes a request to the FAL api and gets an image.
export async function generateImageFal(prompt: string, image_size: string) {
  const response = await fetch(`https://fal.run/fal-ai/fast-turbo-diffusion`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Key ${fal_key}`,
    },
    body: JSON.stringify({
      prompt: prompt,
      image_size: image_size,
    }),
  });

  const responseJSON = await response.json();

  //here we would normally save the image to a database and return the url
  return responseJSON?.images[0].url;
}

//speaker_url should be a link to a 30 second clip of audio
export async function generateVoice(
  text: string,
  speaker_url: string = "https://cdn.themetavoice.xyz/speakers/bria.mp3"
) {
  console.log("generating audio");
  const response = await fetch(`https://fal.run/fal-ai/metavoice-v1`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Key ${fal_key}`,
    },
    body: JSON.stringify({
      text: text,
      audio_url: speaker_url,
      speech_stability: 10,
      speaker_similarity: 4,
    }),
  });

  const responseJSON = await response.json();
  console.log(responseJSON);

  return responseJSON?.audio_url.url;
}

//Speech to text with Whisper
export async function speechToText(
  audio_url: string = "https://storage.googleapis.com/falserverless/model_tests/whisper/dinner_conversation.mp3"
) {
  console.log("generating audio");
  const response = await fetch(`https://fal.run/fal-ai/whisper`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Key ${fal_key}`,
    },
    body: JSON.stringify({
      audio_url: audio_url,
      task: "transcribe",
      chunk_level: "segment",
      version: "3",
      batch_size: 64,
    }),
  });

  const responseJSON = await response.json();
  console.log(responseJSON);

  return responseJSON?.chunks;
}
