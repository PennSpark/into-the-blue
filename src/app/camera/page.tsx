/* Camera page */
// takes an svg image within a pre-configured 100x100 bounding box (for control over size variation) and clips a webcam feed to the svg
// when user clicks the take picture button, saves the current frame as a picture.

"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import Webcam from "react-webcam";

export default function Camera() {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const [clipPathData, setClipPathData] = useState<Path2D[] | null>(null);
  const [viewBox, setViewBox] = useState({ width: 100, height: 100 });

  const [image, setImage] = useState<string | null>(null);

  const clipPath = "/svg-outlines/two-shapes.svg";

  useEffect(() => {
    fetch(clipPath)
      .then((res) => res.text())
      .then((data) => {
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(data, "image/svg+xml");
        const pathElements = svgDoc.querySelectorAll("path");
        const svgElement = svgDoc.querySelector("svg");

        if (pathElements.length > 0) {
            //array of paths in case of multiple elements
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
    setCanvasSize({
      width: 50 * svhToPixels,
      height: 100 * svhToPixels,
    });
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

          //canvas dimensions
          canvas.width = canvasSize.width;
          canvas.height = canvasSize.height;

          //maintain aspect ratio
          const aspectRatio = videoWidth / videoHeight;
          const newHeight = canvasSize.height;
          const newWidth = newHeight * aspectRatio;

          //center webcam feed
          const dx = (canvasSize.width - newWidth) / 2;
          const dy = 0;

          //scale clip path to match canvas size
          const scaleX = canvas.width / viewBox.width;
          const scaleY = canvas.width / viewBox.width;

          //clear canvas before redrawing
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          ctx.save();
          
          //scale and center clip path
          ctx.scale(scaleX, scaleY);
          ctx.translate(0, viewBox.height / 2);
          clipPathData.forEach(path => {
            ctx.clip(path);
          });
          //reset scaling before drawing video
          ctx.scale(1 / scaleX, 1 / scaleY);
          ctx.translate(0, -viewBox.height / 2);
          //draw webcam feed at normal position
          ctx.drawImage(video, dx, dy, newWidth, newHeight);

          ctx.restore();
        }

        requestAnimationFrame(processWebcamFeed);
      }
    };

    requestAnimationFrame(processWebcamFeed);
  }, [canvasSize, clipPathData, viewBox]);

  //set current frame as image
  const captureImage = () => {
    if (canvasRef.current) {
      const imageData = canvasRef.current.toDataURL("image/png");
      setImage(imageData);
    }
  };

    const downloadImage = () => {
        if (image) {
        const link = document.createElement("a");
        link.href = image;
        link.download = "captured-image.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        }
    };
  

  return (
    <div className="relative flex items-center justify-center w-screen h-screen bg-black">
      {/* hidden webcam source */}
      <Webcam ref={webcamRef} className="absolute opacity-0 pointer-events-none" />

      {/* visible canvas */}
      <canvas
        ref={canvasRef}
        style={{
          width: `${canvasSize.width}px`,
          height: `${canvasSize.height}px`,
        }}
        className="absolute"
      />

      <button
        onClick={captureImage}
        className="absolute bottom-10 bg-white text-black px-4 py-2 rounded-md"
      > 
        Take Picture
      </button>

        <button
        onClick={downloadImage}
        className="absolute bottom-10 bg-white text-black px-4 py-2 mb-20 rounded-md z-10"
        >
        Download PNG
        </button>
      

      {image && (
        <div className="absolute inset-0 flex justify-center items-center bg-black/80">
          <img src={image} alt="Captured" className="w-[50svh] h-auto rounded-md" />
        </div>
      )}
    </div>
  );
}
