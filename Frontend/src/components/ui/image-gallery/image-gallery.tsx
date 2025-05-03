"use client";

import React, { useState } from "react";
import Image from "next/image";
import InnerImageZoom from "react-inner-image-zoom";
import 'react-inner-image-zoom/lib/styles.min.css';

interface ImageGalleryProps {
  images: { src: string; alt: string }[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(images[0]);

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Main Display Area */}
      <div className="w-full max-w-md">
        <InnerImageZoom
          src={selectedImage.src}
          zoomSrc={selectedImage.src}
          zoomType="hover"
          zoomPreload={true}
          width={500}
          height={500}
          className="rounded-lg object-cover"
        />
      </div>

      {/* Thumbnail Strip */}
      <div className="flex gap-2 w-full overflow-x-scroll">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(image)}
            className={`w-20 h-20 border-2 rounded-lg overflow-hidden focus:outline-none ${selectedImage.src === image.src
              ? "border-green-700"
              : "border-gray-300 hover:border-gray-400"
              }`}
            aria-label={`View ${image.alt}`}
          >
            <Image
              src={image.src}
              alt={image.alt}
              width={80}
              height={80}
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}