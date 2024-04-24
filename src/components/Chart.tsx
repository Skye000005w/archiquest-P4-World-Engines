//Component for generating a map of coordinates

import { getGroqCompletion } from "@/ai/groq";
import { generateCoordinatesPrompt } from "@/ai/prompts";
import { useEffect, useState } from "react";
export type Location = {
  description: string;
  coordinates: { x: number; y: number };
};

export default function Chart({
  prompt,
  onSelect,
}: {
  prompt: string;
  onSelect: (location: Location) => void;
}) {
  const [locations, setLocations] = useState<Location[]>([]);

  //create some coordinates when the prompt changes
  useEffect(() => {
    //call Groq to generate coordinates
    const generateCoordinates = async () => {
      const coordinatesString = await getGroqCompletion(
        prompt,
        256,
        generateCoordinatesPrompt,
        true
      );
      const coordinates = JSON.parse(coordinatesString);
      setLocations(coordinates.map);
    };
    if (prompt !== "") generateCoordinates();
  }, [prompt]);

  //display coordinates as a full screen map
  return (
    <div className="h-full w-full bg-gray-200">
      {locations.map((location, i) => (
        <button
          key={i}
          onClick={() => onSelect(location)}
          className="p-2 bg-white rounded-lg hover:shadow absolute"
          style={{
            top: `${location.coordinates.y}%`,
            left: `${location.coordinates.x}%`,
          }}
        >
          {location.description}
        </button>
      ))}
    </div>
  );
}
