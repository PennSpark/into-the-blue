"use client";

import React, { useEffect, useRef } from "react";
import { Noise } from "noisejs";

interface ImageCutoutProps {
  imageUrl: string;
  svgUrl: string;
}

const ImageCutout: React.FC<ImageCutoutProps> = ({ imageUrl, svgUrl }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const noise = new Noise(Math.random());
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    //load png
    const img = new Image();
    img.src = imageUrl;
    img.crossOrigin = "anonymous";

    img.onload = async () => {
      const borderSize = 20;
      const scaleFactor = 2;
      const imageWidth = img.width; // 300px
      const imageHeight = img.height; // 360px
      const canvasWidth = imageWidth + borderSize * 2;
      const canvasHeight = imageHeight + borderSize * 2;

      canvas.width = canvasWidth * scaleFactor;
      canvas.height = canvasHeight * scaleFactor;
      ctx.setTransform(scaleFactor, 0, 0, scaleFactor, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = false;

      // load and parse svg
      const response = await fetch(svgUrl);
      const svgText = await response.text();
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
      const pathElements = svgDoc.querySelectorAll("path");

      // draw outline
      ctx.save();
      ctx.translate(borderSize, borderSize);
      ctx.strokeStyle = "white";
      ctx.fillStyle = "white";

      pathElements.forEach((path) => {
        const d = path.getAttribute("d");
        if (!d) return;

        const path2D = new Path2D(d);
        ctx.lineWidth = 4;
        ctx.stroke(path2D);
        ctx.lineCap = "round";
        ctx.fill(path2D);

        // path to points
        const pathLength = path.getTotalLength();
        const numPoints = Math.max(100, pathLength / 3); // dynamically adjust number of points depending on path length
        const newPath = new Path2D();

        for (let i = 0; i < numPoints; i++) {
          const pos = path.getPointAtLength((i / numPoints) * pathLength); // get point
          let { x, y } = pos;

          // apply noise
          const variationStrength = 4;
          const noiseX = noise.perlin2(x * 0.05, y * 0.05) * variationStrength;
          const noiseY = noise.perlin2(y * 0.05, x * 0.05) * variationStrength;
          x += noiseX;
          y += noiseY;

          // draw distorted outline
          if (i === 0) {
            newPath.moveTo(x, y);
          } else {
            newPath.lineTo(x, y);
          }
        }

        ctx.lineWidth = 10;
        ctx.stroke(newPath);
        ctx.fill(newPath);
      });

      ctx.restore();

      // draw image
      ctx.drawImage(img, borderSize, borderSize, imageWidth, imageHeight);
    };
  }, [imageUrl, svgUrl]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-auto"
      style={{ width: "300px", height: "360px" }}
    />
  );
};

export default ImageCutout;
