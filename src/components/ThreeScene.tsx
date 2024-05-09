// src\components\ThreeScene.tsx
import React, { useRef, Suspense } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { TextureLoader, BackSide } from "three";
import { OrbitControls } from "@react-three/drei";

const SphericalProjection = ({ imageUrl }: { imageUrl: string | null }) => {
  const { scene } = useThree();
  const texture = useRef<THREE.Texture | null>(null);

  useFrame(() => {
    if (texture.current) {
      texture.current.needsUpdate = true;
    }
  });

  if (imageUrl) {
    const loader = new TextureLoader();
    texture.current = loader.load(imageUrl);
  }

  return (
    <mesh>
      <sphereGeometry args={[500, 60, 40]} />
      <meshBasicMaterial map={texture.current} side={BackSide} />
    </mesh>
  );
};

const ThreeScene = ({ imageUrl }: { imageUrl: string | null }) => {
  return (
    <Canvas camera={{ position: [0, 0, 0.1] }}>
      <Suspense fallback={null}>
        <SphericalProjection imageUrl={imageUrl} />
        <OrbitControls enableZoom={false} enablePan={false} />
      </Suspense>
    </Canvas>
  );
};

export default ThreeScene;