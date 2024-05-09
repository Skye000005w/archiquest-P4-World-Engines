import React from "react";

type ImageGalleryProps = {
  images: string[];
  handleClickImage?: (id: number) => void;
  fullScreenImage?: string | null;
  onCloseFullScreen?: () => void;
};

export default function ImageGallery({
  images,
  handleClickImage,
  fullScreenImage,
  onCloseFullScreen,
}: ImageGalleryProps) {
  return (
    <div>
      {fullScreenImage ? (
        <div
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={onCloseFullScreen}
        >
          <img src={fullScreenImage} alt="Full Screen" className="max-w-full max-h-full" />
        </div>
      ) : (
        <div className="grid grid-cols-3 w-full gap-4">
          {images.map((url, i) => (
            <button
              key={i}
              className="rounded-lg overflow-hidden"
              onClick={() => handleClickImage && handleClickImage(i)}
            >
              <img src={url} alt={`Image ${i}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}