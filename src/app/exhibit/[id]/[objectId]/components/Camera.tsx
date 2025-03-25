"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { FaArrowLeft, FaLightbulb, FaRegLightbulb, FaUndo } from 'react-icons/fa'; // Importing icons from react-icons
import { saveImage } from "../../../../context/IndexedDB";
import Webcam from "react-webcam";
import Image from "next/image";
import './camera.css';
import { Artifact } from "../../../../types";
import { Dialog } from '@headlessui/react'; // Optional: You can use any modal dialog library
import Link from 'next/link';

import ImageCutout from "@/utils/ProcessSticker";

export interface CameraProps {
  artifact: Artifact;
  onImageCaptured: () => void;
}

export default function Camera({ artifact, onImageCaptured }: CameraProps) {


  const [imagePath, setImagePath] = useState(`/images/artifacts/${artifact.id}.png`);

  console.log(imagePath)


  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  //need to store svg paths as path2d for clipping and string for svg (i don't like it but we can fix later)
  const [clipPathData, setClipPathData] = useState<Path2D[] | null>(null);
  const [svgPaths, setSvgPaths] = useState<string[] | null>(null);
  console.log(artifact)


  const [hintActive, setHintActive] = useState(false); // State to toggle the hint active state
  const [dialogOpen, setDialogOpen] = useState(false); // State to manage dialog visibility

  const [shouldProcess, setShouldProcess] = useState(false);


  // Function to toggle hint state
  const toggleHint = () => {
    setHintActive((prev) => !prev);  // Toggle the hint button state
    setDialogOpen(true); // Show dialog when the hint is activated
  };

  // Function to close the dialog
  const closeDialog = () => setDialogOpen(false);

  //all svg outlines must have 100x100 coordinate system for simplicity and design freedom in scaling
  const viewBox = { width: 300, height: 360 };

  const [image, setImage] = useState<string | null>(null);
  const [text, setText] = useState<string>("Line up the image to the outline");

  useEffect(() => {
    fetch(artifact.svgURL)
      .then((res) => res.text())
      .then((data) => {
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(data, "image/svg+xml");
        const pathElements = svgDoc.querySelectorAll("path");
        

        if (pathElements.length > 0) {
          const dStrings = Array.from(pathElements).map((path) => path.getAttribute("d") || "");
          setSvgPaths(dStrings);
          console.log(dStrings);

          const pathsArray = Array.from(pathElements).map((path) => new Path2D(path.getAttribute("d") || ""));
          setClipPathData(pathsArray);
        }
      })
      .catch(console.error);
  }, [artifact.svgURL]);

  const updateCanvasSize = useCallback(() => {
    const svhToPixels = window.innerHeight / 100;
    setCanvasSize({ width: 40 * svhToPixels, height: 60 * svhToPixels });
  }, []);

  useEffect(() => {
    console.log(artifact.foundImageURL, artifact.svgURL);
  }, [artifact.foundImageURL, artifact.svgURL]);

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
  }, [canvasSize, clipPathData]);

  const captureImage = async () => {

    if (webcamRef.current && canvasRef.current) {
      const video = webcamRef.current.video as HTMLVideoElement;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (ctx && video.readyState === 4) {
        //create new canvas for safety + more freedom
        const clipCanvas = document.createElement("canvas");
        clipCanvas.width = 300;
        clipCanvas.height = 360;
        const clipCtx = clipCanvas.getContext("2d");

        if (clipCtx) {
          //ensure there's nothing on canvas yet
          clipCtx.clearRect(0, 0, clipCanvas.width, clipCanvas.height);
          clipCtx.save();

          //scaling factors to put rectangular input into square picture
          const scaleX = clipCanvas.width / viewBox.width;
          const scaleY = (clipCanvas.width * 360) / (viewBox.height * 300);

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
          clipCtx.scale(1 / scaleX, 1 / scaleY);
          clipCtx.translate(-clipCanvas.width / 2, -clipCanvas.height / 2);

          //draw the image
          clipCtx.drawImage(canvas, 0, -clipCanvas.height * 45 / 360, clipCanvas.width, canvasSize.height);

          clipCtx.restore();
          setImage(clipCanvas.toDataURL("image/png"));
          setText("");
          setImagePath(`/images/artifacts/${artifact.id}.png`);

        } else {
          console.error("canvas not initialized properly");
        }
      }
    }

    
  };

  const saveClippedImage = () => {
    if (image && image.length > 50) {
      setShouldProcess(true);
    } else {
      console.error("empty captured image");
    }
  };
  

  const rejectClippedImage = async () => {
    setImage(null);
    setText("Line up the image to the outline");
    setImagePath(`/images/artifacts/${artifact.id}.png`);
  };


  return (
    <div className="relative flex flex-col items-center justify-center w-screen h-screen bg-black">

      {/* back*/}

      <div className='absolute top-5 flex flex-row w-[40svh] h-[10svh] justify-between items-center'>
      <Link href={`/exhibit/${artifact.exhibitID}`}>
        <button
          className="bg-transparent text-[#89aFEF] rounded-full p-3 shadow-lg z-10 border-none flex items-center justify-center"
          aria-label="Go Back"
        >
          <FaArrowLeft style={{ width: "20px", height: "18px" }} />
        </button>
      </Link>

      {/* hint button */}
      <button
        onClick={toggleHint}
        className={`absolute top-4 right-4 rounded-full p-3 shadow-lg z-10 flex items-center gap-2 border-none ${dialogOpen ? 'bg-white text-[#3e65c8]' : 'bg-transparent text-[#3e65c8]'}`}
        aria-label="Hint"
      >
        {dialogOpen ? (
          <FaLightbulb className="text-[#3e65c8]" />
        ) : (
          <FaRegLightbulb className="text-[#3e65c8]" />
        )}
        <span
          style={{ fontSize: '14px' }}
          className={dialogOpen ? 'text-[#3e65c8]' : 'text-[#3e65c8]'}
        >
          Hint
        </span>
      </button>
      </div>

      {/* Hintbox */}
      {dialogOpen && (
        <Dialog open={dialogOpen} onClose={closeDialog} className="fixed inset-0 z-20 flex justify-center items-center">
          <div className="bg-white rounded-lg p-6 w-80 max-w-xs flex flex-col justify-center items-center">
            <h2
              style={{ fontSize: '16px', color: '#3e65c8', fontWeight: '600', textAlign: 'center' }}
              className="mb-4"
            >
              Text about the object goes here
            </h2>
            <button
              onClick={closeDialog}
              className="bg-[#3e65c8] text-white rounded-md px-4 py-2 w-full"
            >
              OK
            </button>
          </div>
        </Dialog>
      )}



      {/* Webcam container with relative positioning */}
      <div className="relative w-[40svh] h-[60svh]">

        <div className="relative w-full h-full">

          {/* Webcam Overlay */}
          <div
            className="absolute inset-0 bg-black z-[5] pointer-events-none"
            style={{
              clipPath: 'inset(0 0 0 0)', // Apply the inverse of the SVG outline clipping
              opacity: 0.3, // Set 50% opacity
              width: '100%',
              height: '100%',
              position: 'absolute', // Ensuring the overlay is outside
            }}
          />


          <Webcam ref={webcamRef}
            className="absolute opacity-0 pointer-events-none" />

          <canvas
            ref={canvasRef}
            style={{
              width: `${canvasSize.width}px`,
              height: `${canvasSize.height}px`,
            }}
            className="absolute rounded-lg shadow-lg"
          />

         {/* SVG Element */}
<div className="absolute inset-0 flex justify-center items-center pointer-events-none">
  <svg
    className="w-full h-full rounded-md z-[10]"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <clipPath id="clip-path">
      {svgPaths && svgPaths.length > 0 ? (
        svgPaths.map((d, index) => (
          <path key={index} d={d} fill="white" />
        ))
      ) : (
        <circle cx="50" cy="50" r="50" fill="white" /> // Default circle if no svgPaths
      )}
    </clipPath>

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
      <text x="10" y="50" fill="white">
        Loading...
      </text>
    )}
  </svg>
</div>

{/* PNG Image with 30% opacity */}
<div className="absolute inset-0 flex justify-center items-center pointer-events-none z-[11]">
  <Image 
    src={imagePath} 
    alt="Artifact Image"
    className="w-[50%] h-[50%] object-contain"  // Use the same size as the SVG
    width={100} 
    height={100} 
    style={{ opacity: 0.5 }}  // Set opacity to 30%
  />
</div>

</div>

      {/* instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black text-white py-2 px-2 rounded-full opacity-80 z-[10]">
        <p style={{ fontSize: '16px' }}>{text}</p>
      </div>
      </div>


      {/* visible before taking picture: white circular button to take picture */}
      {
        !image && (
          <div className="absolute bottom-24 flex flex-col gap-4">
            <button
              onClick={captureImage}
              className="bg-white text-black rounded-full w-14 h-14 flex items-center justify-center shadow-lg border-none ring-2"
              style={{
                width: '56px',
                height: '56px',
                boxShadow: '0 0 0 8px #6d6d6d', // Gray ring with hex color
              }}
              aria-label="Take Picture"
            >
            </button>
          </div>
        )
      }

      {/* visible after taking picture: button to take picture */}
      {
        image && (
          <>
            {/* Retake Button (Black with white text and outline) */}
            {image && (
              <button
                onClick={rejectClippedImage}
                className="absolute bottom-10 left-4 bg-black text-white border-2 border-white px-4 py-2 rounded-full z-[10] flex items-center gap-2"
              >
                <FaUndo className="text-white" /> Retake
              </button>
            )}
            {/* Submit Button (Blue with black text, oval, bottom-right with right-facing arrow) */}
            {image && (
              <button
                onClick={saveClippedImage}
                className="absolute bottom-10 right-4 bg-[#89aFEF] text-black px-6 py-2 rounded-full z-[10] flex items-center gap-2"
              >
                Confirm
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 text-black"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 12h14M12 5l7 7-7 7"
                  />
                </svg>
              </button>
            )}

            <div style={{ width: `${canvasSize.width}px`, height: `${canvasSize.height}px` }}
              className="bg-black opacity-50 absolute rounded-lg shadow-lg z-[5]"
            />

            <div className="absolute inset-0 flex justify-center items-center pointer-events-none z-[6]">
              <svg
                className="w-[40svh] h-auto rounded-md stroke-animation"
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
                      strokeWidth="0.8svh"
                      strokeLinejoin="round"
                    />
                  ))
                ) : (<text x="10" y="50" fill="white">Loading...</text>)}
              </svg>
            </div>

            <div
              className="absolute inset-0 flex justify-center items-center z-[10] pointer-events-none"
            >
              <Image src={image} alt="Captured" className="w-[40svh] h-auto" width={500} height={500} />
            </div>
          </>
        )
      }
    </div >
  );
}
