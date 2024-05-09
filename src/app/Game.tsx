"use client";

import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { getGroqCompletion } from "../ai/groq";
import { generateImageFal } from "../ai/fal";
import {
  cityDescriptionPrompt,
  mapImagePrompt,
  narrativePrompt,
  zoomImagePrompt,
} from "../ai/prompts";
import ExploredMapsGallery from "../components/ExploredMapsGallery";

export default function Game() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const playerName = searchParams.get("playerName");
  const selectedCities = searchParams.getAll("cities");
  const [cityDescription, setCityDescription] = useState<string>("");
  const [narratives, setNarratives] = useState<string[]>([]);
  const [mapImageUrl, setMapImageUrl] = useState<string>("");
  const [zoomLevel, setZoomLevel] = useState<number>(0);
  const [focusPoints, setFocusPoints] = useState<
    { x: number; y: number; zoomImageDescription: string }[]
  >([]);
  const [exploredMaps, setExploredMaps] = useState<
    { description: string; narratives: string[]; mapImageUrl: string }[]
  >([]);
  const [timer, setTimer] = useState<number>(60);
  const [showExploredMaps, setShowExploredMaps] = useState<boolean>(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);

  const [collectedItems, setCollectedItems] = useState<number[]>([]);
  const [showCollectedItemsModal, setShowCollectedItemsModal] = useState(false);

  useEffect(() => {
    const audio = new Audio("/DeepNight.mp3");
    audio.loop = true;
    audio.play();
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  useEffect(() => {
    const mapElement = mapRef.current;
    let isDragging = false;
    let startX: number;
    let startY: number;

    const startDragging = (e: MouseEvent) => {
      isDragging = true;
      startX = e.pageX - mapElement!.offsetLeft;
      startY = e.pageY - mapElement!.offsetTop;
    };

    const stopDragging = () => {
      isDragging = false;
    };

    const doDragging = (e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - mapElement!.offsetLeft;
      const y = e.pageY - mapElement!.offsetTop;
      setTranslateX(translateX + (x - startX));
      setTranslateY(translateY + (y - startY));
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 1.1 : 0.9;
      const newScale = scale * delta;
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const imageSize = { width: 1440, height: 1024 };
      const minScale = Math.min(
        screenWidth / imageSize.width,
        screenHeight / imageSize.height,
      );
      setScale(Math.max(minScale, newScale));
    };

    mapElement?.addEventListener("mousedown", startDragging);
    mapElement?.addEventListener("mousemove", doDragging);
    mapElement?.addEventListener("mouseup", stopDragging);
    mapElement?.addEventListener("mouseleave", stopDragging);
    mapElement?.addEventListener("wheel", handleWheel);

    return () => {
      mapElement?.removeEventListener("mousedown", startDragging);
      mapElement?.removeEventListener("mousemove", doDragging);
      mapElement?.removeEventListener("mouseup", stopDragging);
      mapElement?.removeEventListener("mouseleave", stopDragging);
      mapElement?.removeEventListener("wheel", handleWheel);
    };
  }, [mapRef, scale, translateX, translateY]);

  async function generateCity(selectedCities: string[]) {
    const description = await getGroqCompletion(
      `Generate a city description that includes elements from the following selected cities: ${selectedCities.join(", ")}`,
      128
    );
    setCityDescription(description);
    setNarratives([]);

    const mapImageDescription = await getGroqCompletion(
      description,
      64,
      mapImagePrompt,
    );

    const url = await generateImageFal(mapImageDescription, "landscape_16_9");
    setMapImageUrl(url);

    const FocusPoints = await Promise.all(
      Array.from({ length: 3 }, async () => {
        const narrative = await getGroqCompletion(
          `Zoom point: ${description}`,
          64,
          narrativePrompt,
        );
        const zoomImageDescription = await getGroqCompletion(
          narrative,
          64,
          zoomImagePrompt,
        );
        return {
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          zoomImageDescription,
        };
      }),
    );
    setFocusPoints(FocusPoints);

    setZoomLevel(0);
    setTimer(60);
    setCollectedItems([]);
  }

  async function zoomAndExplore(focusPoint: {
    x: number;
    y: number;
    zoomImageDescription: string;
  }) {
    const narrative = await getGroqCompletion(
      `Zoom level ${zoomLevel + 1}: ${cityDescription}`,
      200,
      narrativePrompt,
    );
    setNarratives([...narratives, narrative]);

    const url = await generateImageFal(
      focusPoint.zoomImageDescription,
      "landscape_16_9",
    );
    setMapImageUrl(url);

    setZoomLevel((prevZoomLevel) => prevZoomLevel + 1);

    if (zoomLevel === 2) {
      setExploredMaps([
        ...exploredMaps,
        { description: cityDescription, narratives, mapImageUrl },
      ]);
      generateCity(selectedCities);
    }
  }

  function generateCollectibleItems() {
    const collectibleItems = Array.from({ length: 3 }, (_, index) => (
      <div
        key={index}
        style={{
          position: "absolute",
          left: Math.random() * window.innerWidth,
          top: Math.random() * window.innerHeight,
          border: "4px dotted yellow",
          borderRadius: "50%",
          width: "40px",
          height: "40px",
          backgroundColor: "rgba(255, 255, 0, 0.2)",
          cursor: "pointer",
          display: collectedItems.includes(index) ? "none" : "block",
        }}
        onClick={() => collectItem(index)}
      />
    ));

    const backpackIcon = (
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          width: "100px",
          height: "100px",
          backgroundImage:
            "url('https://cdn.midjourney.com/16d81da7-a19a-42c8-8710-146de7a49751/0_0.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          cursor: "pointer",
        }}
        onClick={openCollectedItemsModal}
      />
    );

    return { collectibleItems, backpackIcon };
  }

  const { collectibleItems, backpackIcon } = generateCollectibleItems();

  function collectItem(itemIndex: number) {
    setCollectedItems([...collectedItems, itemIndex]);
  }

  useEffect(() => {
    if (collectedItems.length === 3) {
      generateCity(selectedCities);
    }
  }, [collectedItems, selectedCities]);

  function openCollectedItemsModal() {
    setShowCollectedItemsModal(true);
  }

  function closeCollectedItemsModal() {
    setShowCollectedItemsModal(false);
  }

  function loadExploredMap(index: number) {
    const { description, narratives, mapImageUrl } = exploredMaps[index];
    setCityDescription(description);
    setNarratives(narratives);
    setMapImageUrl(mapImageUrl);
  }

  useEffect(() => {
    generateCity(selectedCities);
  }, [selectedCities]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => prevTimer - 1);
    }, 1000);

    if (timer === 0) {
      generateCity(selectedCities);
    }

    return () => clearInterval(interval);
  }, [timer, selectedCities]);

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <div
        ref={mapRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: `url(${mapImageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          cursor: "grab",
          transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
        }}
      >
        {mapImageUrl && (
          <>
            {focusPoints.map((focusPoint, index) => (
              <button
                key={index}
                style={{
                  position: "absolute",
                  left: focusPoint.x,
                  top: focusPoint.y,
                  border: "4px dashed white",
                  borderRadius: "50%",
                  width: "120px",
                  height: "120px",
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  cursor: "pointer",
                  display: zoomLevel === index ? "block" : "none",
                }}
                onClick={() => zoomAndExplore(focusPoint)}
              ></button>
            ))}
            {collectibleItems}
            {backpackIcon}
          </>
        )}
      </div>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          padding: "1rem",
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          color: "white",
        }}
      >
        <h2>Welcome, {playerName}!</h2>
        <p>Time Remaining: {timer} seconds</p>
        <p>Zoom Level: {zoomLevel}</p>
        <h2>Current City:</h2>
        <p>{cityDescription}</p>
        <h3>Narratives:</h3>
        <ul>
          {narratives.map((narrative, index) => (
            <li key={index}>{narrative}</li>
          ))}
        </ul>
        <button onClick={() => setShowExploredMaps(true)}>Explored Maps</button>
      </div>
      {showExploredMaps && (
        <ExploredMapsGallery
          exploredMaps={exploredMaps}
          onClose={() => setShowExploredMaps(false)}
          onSelectMap={loadExploredMap}
        />
      )}
      {showCollectedItemsModal && (
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
            zIndex: 1000,
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
            <h2>Collected Items</h2>
            <button onClick={closeCollectedItemsModal}>Close</button>
            <div className="grid grid-cols-3 gap-4">
              {collectedItems.map((itemIndex) => (
                <div
                  key={itemIndex}
                  style={{
                    border: "4px dotted yellow",
                    borderRadius: "50%",
                    width: "80px",
                    height: "80px",
                    backgroundColor: "rgba(255, 255, 0, 0.2)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}