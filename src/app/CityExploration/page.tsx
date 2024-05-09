"use client";
import { useState } from "react";
import { getGroqCompletion } from "@/ai/groq";
import { generateImageFal } from "@/ai/fal";
import { cityDescriptionPrompt, mapImagePrompt } from "@/ai/prompts";
import ImageGallery from "@/components/ImageGallery";
import SelectImageRegion from "@/components/SelectImageRegion";

export default function CityExploration() {
  const [cityDescription, setCityDescription] = useState("");
  const [cityMapImages, setCityMapImages] = useState<string[]>([]);
  const [collectedMapFragments, setCollectedMapFragments] = useState<string[]>([]);
  const [selectedFullScreenImage, setSelectedFullScreenImage] = useState<string | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [isCropping, setIsCropping] = useState(false);

  const generateCity = async () => {
    // Generate a new city description using Groq
    const description = await getGroqCompletion(cityDescriptionPrompt, 200);
    setCityDescription(description);

    // Generate a city map image based on the description using FAL
    const imagePrompt = `${mapImagePrompt}\n\nCity Description:\n${description}`;
    const mapImageUrl = await generateImageFal(imagePrompt, "landscape_16_9");
    setCityMapImages([...cityMapImages, mapImageUrl]);
    setSelectedFullScreenImage(mapImageUrl);
  };

  const handleImageClick = (index: number) => {
    setSelectedFullScreenImage(cityMapImages[index]);
    setShowGallery(false);
  };

  const handleCloseFullScreen = () => {
    setSelectedFullScreenImage(null);
  };

  const handleCropClick = () => {
    setIsCropping(true);
  };

  const handleImageCrop = (croppedImageUrl: string) => {
    // Add the cropped image to the collected map fragments
    setCollectedMapFragments([...collectedMapFragments, croppedImageUrl]);
    setIsCropping(false);
    setSelectedFullScreenImage(null);
  };

  const handleCropCancel = () => {
    setIsCropping(false);
  };

  return (
    <div className="flex flex-col gap-4 bg-green-900 text-white p-4 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">City Explorer</h1>
        <button
          onClick={generateCity}
          className="bg-yellow-500 text-green-900 px-4 py-2 rounded-lg font-bold hover:bg-yellow-600"
        >
          Generate New City
        </button>
      </div>

      {cityDescription && (
        <div className="bg-green-800 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-2">City Description:</h2>
          <p>{cityDescription}</p>
        </div>
      )}

      {selectedFullScreenImage && !isCropping && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={handleCloseFullScreen}
        >
          <img src={selectedFullScreenImage} alt="Full Screen" className="max-w-full max-h-full" />
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCropClick();
            }}
            className="absolute bottom-4 right-4 bg-yellow-500 text-green-900 px-4 py-2 rounded-lg font-bold hover:bg-yellow-600"
          >
            Crop
          </button>
        </div>
      )}

      {isCropping && selectedFullScreenImage && (
        <SelectImageRegion img={selectedFullScreenImage} onSelect={handleImageCrop} onCancel={handleCropCancel} />
      )}

      <div className="flex justify-between items-center">
        <button
          onClick={() => setShowGallery(!showGallery)}
          className="bg-yellow-500 text-green-900 px-4 py-2 rounded-lg font-bold hover:bg-yellow-600"
        >
          {showGallery ? "Hide Gallery" : "Show Gallery"}
        </button>
      </div>

      {showGallery && (
        <div className="bg-green-800 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-2">City Map Gallery:</h2>
          <ImageGallery images={cityMapImages} handleClickImage={handleImageClick} />
        </div>
      )}

      <div className="bg-green-800 p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-2">Collected Map Fragments:</h2>
        <ImageGallery images={collectedMapFragments} />
      </div>
    </div>
  );
}