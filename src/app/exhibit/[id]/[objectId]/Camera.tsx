"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { saveImage } from "../../../context/IndexedDB";
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
  //need to store svg paths as path2d for clipping and string for svg (i don't like it but we can fix later)
  const [clipPathData, setClipPathData] = useState<Path2D[] | null>(null);
  const [svgPaths, setSvgPaths] = useState<string[] | null>(null);

  const [viewBox, setViewBox] = useState({ width: 100, height: 100 });
  const [svgSource, setSvgSource] = useState<string>(artifact.svgURL);
  const [showStroke, setShowStroke] = useState(false);

  const [image, setImage] = useState<string | null>(null);

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
          const dStrings = Array.from(pathElements).map((path) => path.getAttribute("d") || "");
          setSvgPaths(dStrings);

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
    setCanvasSize({ width: 40 * svhToPixels, height: 60 * svhToPixels });
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

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(video, dx, dy, newWidth, newHeight);
        }

        requestAnimationFrame(processWebcamFeed);
      }
    };

    requestAnimationFrame(processWebcamFeed);
  }, [canvasSize, clipPathData, viewBox]);

  const captureImage = async () => {
    if (webcamRef.current && canvasRef.current) {
      const video = webcamRef.current.video as HTMLVideoElement;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
  
      if (ctx && video.readyState === 4) {
        //create new canvas for safety + more freedom
        const clipCanvas = document.createElement("canvas");
        clipCanvas.width = canvasSize.width;
        clipCanvas.height = canvasSize.width;
        const clipCtx = clipCanvas.getContext("2d");
  
        if (clipCtx) {
          //ensure there's nothing on canvas yet
          clipCtx.clearRect(0, 0, clipCanvas.width, clipCanvas.height);
          clipCtx.save();

          //scaling factors to put rectangular input into square picture
          const scaleX = clipCanvas.width / viewBox.width;
          const scaleY = clipCanvas.width / viewBox.height;

          //initially move the canvas to position clippath correctly (nothing drawn yet)
          clipCtx.translate(clipCanvas.width / 2, clipCanvas.height / 2);
          clipCtx.scale(scaleX, scaleY);
          clipCtx.translate(-viewBox.width / 2, -viewBox.height / 2);
  
          //clip, handle multiple images by grouping everything into same region
          if (clipPathData) {
            const region = new Path2D();
            for (const path of clipPathData) {
              region.addPath(path);
            }
            clipCtx.clip(region, "evenodd");
          } else {
            console.error("no clippath");
          }

          //reset transformations before drawing image onto clipped canvas so image isn't distorted
          clipCtx.translate(viewBox.width / 2, viewBox.height / 2);
          clipCtx.scale(1/scaleX, 1/scaleY);
          clipCtx.translate(-clipCanvas.width / 2, -clipCanvas.height / 2);
  
          //draw the image
          clipCtx.drawImage(canvas, 0, -clipCanvas.height / 4, clipCanvas.width, canvasSize.height);

          clipCtx.restore();
  
          const clippedImageData = clipCanvas.toDataURL("image/png");
  
          //put into inddexeddb, return error if the image is empty
          if (clippedImageData.length > 50) {
            setImage(clippedImageData);
            await saveImage(clippedImageData, artifact.id);
          } else {
            console.error("empty captured image");
          }
        } else {
          console.error("canvas not initialized properly");
        }
      }
    }
  };
  
  
  return (
    <div className="relative flex flex-col items-center justify-center w-screen h-screen bg-white">
      {/* hidden webcam source */}
      <Webcam ref={webcamRef} 
      // videoConstraints={{ facingMode: { exact: "environment" } }}
      className="absolute opacity-0 pointer-events-none" />

      {/* visible canvas */}
      <canvas
        ref={canvasRef}
        style={{ width: `${canvasSize.width}px`, height: `${canvasSize.height}px` }}
        className="absolute rounded-lg shadow-lg"
      />

      <div id="caption" className='absolute z-[10] top-10'><p>{text}</p></div>
      <div id="caption" className='absolute z-[10] top-16'><p>artifact name: {artifact.name}</p></div>
      <div id="caption" className='absolute z-[10] top-24'><p>exhibit name: {artifact.exhibit}</p></div>
      {/* Buttons */}
      <div className="absolute bottom-10 flex flex-col gap-4">
        <button onClick={captureImage} className="bg-white text-black px-4 py-2 rounded-md">
          Take Picture
        </button>
      </div>

      {image && (
      <div
          className="absolute inset-0 flex justify-center items-center pointer-events-none"
        >
        <svg
        key={Number(showStroke)}
          className="w-[40svh] h-auto rounded-md stroke-animation"
          width="100" height="100" viewBox="0 0 100 100" fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {svgPaths && svgPaths.length > 0 ? (
            svgPaths.map((d, index) => (
              <path
                key={index}
                d={d} // Use stored SVG `d` strings
                pathLength={100}
                stroke="white"
                strokeWidth="0.8svh"
                strokeLinejoin="round"
              />
            ))
          ) : (
            <text x="10" y="50" fill="white">Loading...</text>
          )}
              </svg>
            </div>
          )}

      <div
          className="absolute inset-0 flex justify-center items-center pointer-events-none"
        >
        <svg
          className="w-[40svh] h-auto rounded-md z-[10]"
          width="100" height="100" viewBox="0 0 100 100" fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {svgPaths && svgPaths.length > 0 ? (
            svgPaths.map((d, index) => (
              <path
                key={index}
                d={d}
                pathLength={100}
                stroke="white"
                strokeDasharray="0.5 1"
                strokeWidth="0.1svh"
                strokeLinejoin="round"
              />
            ))
          ) : (
            <text x="10" y="50" fill="white">Loading...</text>
          )}
      </svg>
      </div>
      

      {image && (
        <div
          className="absolute inset-0 flex justify-center items-center z-[10]"
          onClick={() => setImage(null)}
        >
          <Image src={image} alt="Captured" className="w-[40svh] h-auto" width={500} height={500} />
        </div>
      )}
    </div>
  );
}
