"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { saveImage, loadAllImages, clearImages } from "../context/IndexedDB";
import Webcam from "react-webcam";

export default function Camera() {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [clipPathData, setClipPathData] = useState<Path2D[] | null>(null);
  const [viewBox, setViewBox] = useState({ width: 100, height: 100 });
  const [image, setImage] = useState<string | null>(null);
  const [imageGallery, setImageGallery] = useState<string[]>([]);

  const clipPath = "/svg-outlines/face.svg";

  useEffect(() => {
    fetch(clipPath)
      .then((res) => res.text())
      .then((data) => {
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(data, "image/svg+xml");
        const pathElements = svgDoc.querySelectorAll("path");
        const svgElement = svgDoc.querySelector("svg");

        if (pathElements.length > 0) {
          const pathsArray = Array.from(pathElements).map((path) => new Path2D(path.getAttribute("d") || ""));
          setClipPathData(pathsArray);
        }

        if (svgElement) {
          const viewBoxValues = svgElement.getAttribute("viewBox")?.split(" ").map(Number);
          if (viewBoxValues && viewBoxValues.length === 4) {
            setViewBox({ width: viewBoxValues[2], height: viewBoxValues[3] });
          }
        }
      })
      .catch(console.error);
  }, []);

  const updateCanvasSize = useCallback(() => {
    const svhToPixels = window.innerHeight / 100;
    setCanvasSize({ width: 50 * svhToPixels, height: 100 * svhToPixels });
  }, []);

  useEffect(() => {
    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, [updateCanvasSize]);

  useEffect(() => {
    const processWebcamFeed = () => {
      if (webcamRef.current && canvasRef.current) {
        const video = webcamRef.current.video as HTMLVideoElement;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        if (ctx && video.readyState === 4 && clipPathData) {
          const videoWidth = video.videoWidth;
          const videoHeight = video.videoHeight;
          canvas.width = canvasSize.width;
          canvas.height = canvasSize.height;

          const aspectRatio = videoWidth / videoHeight;
          const newHeight = canvasSize.height;
          const newWidth = newHeight * aspectRatio;

          const dx = (canvasSize.width - newWidth) / 2;
          const dy = 0;

          const scaleX = canvas.width / viewBox.width;
          const scaleY = canvas.width / viewBox.width;

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.save();
          ctx.scale(scaleX, scaleY);
          ctx.translate(0, viewBox.height / 2);

          const region = new Path2D();
          for (const path of clipPathData) {
            region.addPath(path);
          }

          ctx.clip(region, "evenodd");

          ctx.scale(1 / scaleX, 1 / scaleY);
          ctx.translate(0, -viewBox.height / 2);
          ctx.drawImage(video, dx, dy, newWidth, newHeight);
          ctx.restore();
        }

        requestAnimationFrame(processWebcamFeed);
      }
    };

    requestAnimationFrame(processWebcamFeed);
  }, [canvasSize, clipPathData, viewBox]);

  const captureImage = async () => {
    if (canvasRef.current) {
      const imageData = canvasRef.current.toDataURL("image/png");
      setImage(imageData);
      await saveImage(imageData);
      loadAllSavedImages(); // Refresh gallery
    }
  };

  const loadAllSavedImages = async () => {
    const savedImages = await loadAllImages();
    setImageGallery(savedImages);
  };

  const clearAllImages = async () => {
    await clearImages();
    setImageGallery([]);
  };

  useEffect(() => {
    loadAllSavedImages();
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center w-screen h-screen bg-black">
      {/* hidden webcam source */}
      <Webcam ref={webcamRef} className="absolute opacity-0 pointer-events-none" />

      {/* visible canvas */}
      <canvas
        ref={canvasRef}
        style={{ width: `${canvasSize.width}px`, height: `${canvasSize.height}px` }}
        className="absolute"
      />

      {/* Buttons */}
      <div className="absolute bottom-10 flex flex-col gap-4">
        <button onClick={captureImage} className="bg-white text-black px-4 py-2 rounded-md">
          Take Picture
        </button>

        <button onClick={clearAllImages} className="bg-red-500 text-white px-4 py-2 rounded-md">
          Clear All Images
        </button>
      </div>

      {/* Gallery Panel */}
      <div className="absolute top-10 right-10 w-60 h-80 bg-white/20 p-4 rounded-lg overflow-auto">
        <h2 className="text-white text-center mb-2">Gallery</h2>
        <div className="grid grid-cols-2 gap-2">
          {imageGallery.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Captured ${index}`}
              className="w-full h-20 object-cover cursor-pointer rounded-md hover:opacity-80"
              onClick={() => setImage(img)}
            />
          ))}
        </div>
      </div>

      {/* Fullscreen Image Viewer */}
      {image && (
        <div
          className="absolute inset-0 flex justify-center items-center bg-black/80"
          onClick={() => setImage(null)}
        >
          <img src={image} alt="Captured" className="w-[50svh] h-auto rounded-md" />
        </div>
      )}
    </div>
  );
}
