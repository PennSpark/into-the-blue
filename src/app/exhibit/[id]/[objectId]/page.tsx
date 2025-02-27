'use client'
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Artifact } from '../../../types';

import Camera from "./components/Camera";
import CapturedInterface from './components/CapturedInterface';
import { loadLastImage } from "../../../context/IndexedDB";

export default function CameraPage() {
    const [data, setData] = useState<Artifact | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);

    const params = useParams();
    const objectId = params.objectId; 

    useEffect(() => {
        const fetchData = async () => {
          try {
            const response = await fetch('/data/artifacts.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json: Artifact[] = await response.json();
            const artifact = json.find((item) => item.id === objectId);
    
            setData(artifact || null);
          } catch (e) {
            console.error(e);
          }
        };
    
        fetchData();
    }, [objectId]);

    // When an image is saved, switch to CapturedInterface
    const handleImageCaptured = async () => {
        const lastImage = await loadLastImage(); // Fetch the saved image
        setCapturedImage(lastImage); // Update state to trigger UI change
    };

    return (
        <>
            {data ? (
                capturedImage ? (
                    <CapturedInterface image={capturedImage} artifact={data} />
                ) : (
                    <Camera artifact={data} onImageCaptured={handleImageCaptured} />
                )
            ) : (
                <div>Loading...</div>
            )}
        </>
    );
}
