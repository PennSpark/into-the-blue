'use client';

import React, { useState } from 'react';
import { Artifact } from '@/app/types';
import Camera from './components/Camera';
import CapturedInterface from './components/CapturedInterface';
import { loadImageByName } from '@/app/context/IndexedDB';

export default function CameraClient({ artifact }: { artifact: Artifact }) {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const handleImageCaptured = async () => {
    const image = await loadImageByName(artifact.id);
    if (image) {
      setCapturedImage(image);
    } else {
      console.log('Image not found in IndexedDB');
    }
  };

  return (
    <>
      {capturedImage ? (
        <CapturedInterface image={capturedImage} artifact={artifact} />
      ) : (
        <Camera artifact={artifact} onImageCaptured={handleImageCaptured} />
      )}
    </>
  );
}
