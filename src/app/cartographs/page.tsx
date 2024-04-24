"use client";

import { useState, useEffect } from "react";
import { getGroqCompletion } from "@/ai/groq";
import { generateImageFal, generateVoice } from "@/ai/fal";
import { generateCivilizationPrompt, generateNarrativePrompt } from "@/ai/prompts";

type City = {
  description: string;
  imageUrl: string;
  focusPoints: FocusPoint[];
};

type FocusPoint = {
  coordinates: { x: number; y: number };
  narrative: string;
  imageUrl: string;
  audioUrl: string;
  visited: boolean;
};

export default function CartoGraphsPage() {
  const [city, setCity] = useState<City | null>(null);
  const [explorationLog, setExplorationLog] = useState<City[]>([]);
  const [timer, setTimer] = useState<number>(50);
  const [selectedFocusPoint, setSelectedFocusPoint] = useState<FocusPoint | null>(null);

  useEffect(() => {
    const generateCity = async () => {
      const description = await getGroqCompletion(generateCivilizationPrompt, 100);
      const imageUrl = await generateImageFal(description, "landscape_16_9");
      const focusPoints = await generateFocusPoints(description);
      setCity({ description, imageUrl, focusPoints });
      setExplorationLog((prevLog) => [...prevLog, { description, imageUrl, focusPoints }]);
    };

    if (!city || timer === 0) {
      generateCity();
      setTimer(50);
    }
  }, [city, timer]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => (prevTimer > 0 ? prevTimer - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [city]);

  const generateFocusPoints = async (description: string): Promise<FocusPoint[]> => {
    const focusPoints: FocusPoint[] = [];
    for (let i = 0; i < 3; i++) {
      const coordinates = { x: Math.random() * 100, y: Math.random() * 100 };
      const narrative = await getGroqCompletion(
        `${description}\n\nGenerate a narrative for the area located at coordinates (${coordinates.x}, ${coordinates.y}).`,
        200,
        generateNarrativePrompt
      );
      const imageUrl = await generateImageFal(narrative, "landscape_16_9");
      const audioUrl = await generateVoice(narrative);
      focusPoints.push({ coordinates, narrative, imageUrl, audioUrl, visited: false });
    }
    return focusPoints;
  };

  const handleFocusPointClick = async (focusPoint: FocusPoint) => {
    setSelectedFocusPoint(focusPoint);
    setCity((prevCity) => ({
      ...prevCity!,
      focusPoints: prevCity!.focusPoints.map((fp) =>
        fp === focusPoint ? { ...fp, visited: true } : fp
      ),
    }));
    setTimer(50);
  };

  const handleCloseNarrative = () => {
    setSelectedFocusPoint(null);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        {city ? (
          <div className="flex flex-col">
            <img src={city.imageUrl} alt={city.description} />
            <p>{city.description}</p>
            <p>Time remaining: {timer} seconds</p>
            {city.focusPoints.map((focusPoint, index) => (
              <button
                key={index}
                className={`absolute ${focusPoint.visited ? "visited" : ""}`}
                style={{
                  top: `${focusPoint.coordinates.y}%`,
                  left: `${focusPoint.coordinates.x}%`,
                }}
                onClick={() => handleFocusPointClick(focusPoint)}
              >
                {focusPoint.visited ? "Visited" : "Explore"}
              </button>
            ))}
          </div>
        ) : (
          <p>Generating city...</p>
        )}
        <div>
          <h2>Exploration Log</h2>
          {explorationLog.map((city, index) => (
            <div key={index}>
              <img src={city.imageUrl} alt={city.description} />
              <p>{city.description}</p>
            </div>
          ))}
        </div>
      </div>
      {selectedFocusPoint && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg">
            <h2>Narrative</h2>
            <img src={selectedFocusPoint.imageUrl} alt={selectedFocusPoint.narrative} />
            <p>{selectedFocusPoint.narrative}</p>
            <audio src={selectedFocusPoint.audioUrl} controls />
            <button onClick={handleCloseNarrative}>Close</button>
          </div>
        </div>
      )}
    </main>
  );
}