import React, { useState } from "react";
import PanImage from "./PanImage"; // Import the PanImage component

interface ExploredMap {
  description: string;
  narratives: string[];
  mapImageUrl: string;
}

interface ExploredMapsGalleryProps {
  exploredMaps: ExploredMap[];
  onClose: () => void;
  onSelectMap: (index: number) => void;
}

export default function ExploredMapsGallery({
  exploredMaps,
  onClose,
  onSelectMap,
}: ExploredMapsGalleryProps) {
  const [selectedMap, setSelectedMap] = useState<ExploredMap | null>(null);

  const handleClickImage = (index: number) => {
    setSelectedMap(exploredMaps[index]);
    onSelectMap(index);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "2rem",
          borderRadius: "8px",
          maxWidth: "80%",
          maxHeight: "80%",
          overflowY: "auto",
        }}
      >
        <h2>Explored Maps Gallery</h2>
        <button onClick={onClose}>Close</button>
        <div className="grid grid-cols-3 w-full gap-4">
          {exploredMaps.map((map, index) => (
            <button
              key={index}
              className="rounded-lg overflow-hidden"
              onClick={() => handleClickImage(index)}
            >
              <img src={map.mapImageUrl} alt={`Map ${index}`} />
            </button>
          ))}
        </div>
        {selectedMap && (
          <div style={{ marginTop: "2rem" }}>
            <h3>Selected Map</h3>
            {/* Use the PanImage component for the selected map */}
            <PanImage src={selectedMap.mapImageUrl} />
            <p>{selectedMap.description}</p>
            <h4>Narratives</h4>
            <ul>
              {selectedMap.narratives.map((narrative, index) => (
                <li key={index}>{narrative}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}