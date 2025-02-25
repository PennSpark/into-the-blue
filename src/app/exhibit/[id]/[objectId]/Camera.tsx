"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { saveImage, loadAllImages, clearImages } from "../../../context/IndexedDB";
import Webcam from "react-webcam";
import Image from "next/image";
import './camera.css';
import { Artifact } from "../../../types";

export interface CameraProps {
  artifact: Artifact;
}

export default function Camera({ artifact }: CameraProps) {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [clipPathData, setClipPathData] = useState<Path2D[] | null>(null);
  const [viewBox, setViewBox] = useState({ width: 100, height: 100 });
  const [svgSource, setSvgSource] = useState<string>(artifact.svgURL);
  const [showStroke, setShowStroke] = useState(false);

  const [image, setImage] = useState<string | null>(null);
  const [imageGallery, setImageGallery] = useState<string[]>([]);

  const [text, setText] = useState<string>("line the image to the outline");

  useEffect(() => {
    fetch(svgSource)
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
      setShowStroke(false);
      setTimeout(() => setShowStroke(true), 50000);
      await saveImage(imageData);
      loadAllSavedImages();
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
      <Webcam ref={webcamRef} 
      videoConstraints={{ facingMode: { exact: "environment" } }}
      className="absolute opacity-0 pointer-events-none" />

      {/* visible canvas */}
      <canvas
        ref={canvasRef}
        style={{ width: `${canvasSize.width}px`, height: `${canvasSize.height}px` }}
        className="absolute"
      />

      <div id="caption" className='absolute z-[10] top-24 text-white'><p>{text}</p></div>

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
            <Image
              key={index}
              src={img}
              width={100} height={100}
              alt={`Captured ${index}`}
              className="w-full h-20 object-cover cursor-pointer rounded-md hover:opacity-80"
              onClick={() => setImage(img)}
            />
          ))}
        </div>
      </div>

      {image && (
      <div
          className="absolute inset-0 flex justify-center items-center pointer-events-none"
        >
        <svg
        key={Number(showStroke)}
          className="w-[50svh] h-auto rounded-md stroke-animation"
          width="100" height="100" viewBox="0 0 100 100" fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            pathLength={100}
            stroke="white" strokeWidth="0.8svh" strokeLinejoin="round"
            d="M30.0728 49.345C30.9055 49.7783 31.7937 50.9235 28.685 52.0377C24.7991 53.4304 22.8561 74.8792 24.7066 74.5078C26.557 74.1364 29.7027 73.3007 31.0906 75.2506C32.2008 76.8105 36.5494 82.4002 38.5848 85L61.3452 83.6072C64.1209 81.9668 69.6907 77.999 69.7647 75.2506C69.8387 72.5022 69.7955 69.8342 69.7647 68.8438C70.9983 70.0199 73.8172 71.6665 75.2235 68.8438C76.6298 66.0211 75.8095 62.8394 75.2235 61.6014C75.3777 56.5564 75.094 46.4294 72.7254 46.2809C70.3568 46.1323 69.7647 43.7429 69.7647 42.5668C70.5666 42.1025 72.1148 40.9883 71.8927 40.2455C71.6706 39.5027 69.518 38.8837 68.4694 38.667L67.3591 34.303L69.7647 31.2389C68.1918 30.4961 65.0276 28.7876 64.9536 27.8962C64.8795 27.0049 64.1825 23.9965 63.8433 22.6037L59.5873 25.1107L56.7191 19.7253L54.036 22.6037L52.3706 23.2537C51.8463 19.6944 50.2611 12.8914 48.1146 14.1542C45.9681 15.417 45.4931 14.6804 45.524 14.1542C46.6034 16.816 48.2996 22.3623 46.4492 23.2537C44.5988 24.145 42.5941 24.8631 41.8231 25.1107C41.8539 23.7489 41.5825 21.0252 40.2502 21.0252C38.5848 21.0252 38.4923 24.4607 37.012 25.1107C35.5316 25.7607 37.1045 27.3391 32.4784 26.2249C27.8523 25.1107 31.4607 25.1107 30.0728 25.1107C28.9626 25.1107 29.6102 29.1962 30.0728 31.2389C29.9186 32.0746 28.87 34.1544 25.9093 35.7886C22.9486 37.4228 26.5262 38.3885 28.685 38.667V41.9168L24.7066 42.5668L28.685 47.0237C28.3458 47.7974 28.1484 49.345 30.0728 49.345Z"/>
        </svg>
        </div>
      )}

      <div
          className="absolute inset-0 flex justify-center items-center pointer-events-none"
        >
        <svg
          className="w-[50svh] h-auto rounded-md z-[10]"
          width="100" height="100" viewBox="0 0 100 100" fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            pathLength={100}
            stroke="white" strokeDasharray={1} strokeWidth="0.1svh" strokeLinejoin="round"
            d="M30.0728 49.345C30.9055 49.7783 31.7937 50.9235 28.685 52.0377C24.7991 53.4304 22.8561 74.8792 24.7066 74.5078C26.557 74.1364 29.7027 73.3007 31.0906 75.2506C32.2008 76.8105 36.5494 82.4002 38.5848 85L61.3452 83.6072C64.1209 81.9668 69.6907 77.999 69.7647 75.2506C69.8387 72.5022 69.7955 69.8342 69.7647 68.8438C70.9983 70.0199 73.8172 71.6665 75.2235 68.8438C76.6298 66.0211 75.8095 62.8394 75.2235 61.6014C75.3777 56.5564 75.094 46.4294 72.7254 46.2809C70.3568 46.1323 69.7647 43.7429 69.7647 42.5668C70.5666 42.1025 72.1148 40.9883 71.8927 40.2455C71.6706 39.5027 69.518 38.8837 68.4694 38.667L67.3591 34.303L69.7647 31.2389C68.1918 30.4961 65.0276 28.7876 64.9536 27.8962C64.8795 27.0049 64.1825 23.9965 63.8433 22.6037L59.5873 25.1107L56.7191 19.7253L54.036 22.6037L52.3706 23.2537C51.8463 19.6944 50.2611 12.8914 48.1146 14.1542C45.9681 15.417 45.4931 14.6804 45.524 14.1542C46.6034 16.816 48.2996 22.3623 46.4492 23.2537C44.5988 24.145 42.5941 24.8631 41.8231 25.1107C41.8539 23.7489 41.5825 21.0252 40.2502 21.0252C38.5848 21.0252 38.4923 24.4607 37.012 25.1107C35.5316 25.7607 37.1045 27.3391 32.4784 26.2249C27.8523 25.1107 31.4607 25.1107 30.0728 25.1107C28.9626 25.1107 29.6102 29.1962 30.0728 31.2389C29.9186 32.0746 28.87 34.1544 25.9093 35.7886C22.9486 37.4228 26.5262 38.3885 28.685 38.667V41.9168L24.7066 42.5668L28.685 47.0237C28.3458 47.7974 28.1484 49.345 30.0728 49.345Z"/>
        </svg>
      </div>
      

      {image && (
        <div
          className="absolute inset-0 flex justify-center items-center"
          onClick={() => setImage(null)}
        >
          <Image src={image} alt="Captured" className="w-[50svh] h-auto" width={500} height={500} />
        </div>
      )}
    </div>
  );
}
