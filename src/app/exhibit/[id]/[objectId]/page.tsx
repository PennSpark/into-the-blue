'use client'
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Camera from "./Camera";
import { Artifact } from '../../../types';

export default function CameraPage () {
    const [data, setData] = useState<Artifact | null>(null);

    const params = useParams();
    const objectId = params.objectId; 

    useEffect(() => {
        const fetchData = async () => {
          try {
            const response = await fetch('/data/artifacts.json');
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const json: Artifact[] = await response.json();
            const artifact = json.find((item) => item.id === objectId);
    
            setData(artifact || null);
          } catch (e) {
            console.error(e);
          }
        };
    
        fetchData();
      }, []);

    return (
        <>
        {data ? 
        (<Camera artifact={data}/>) :
        (<div>Loading...</div>)
        }
        </>
    )
}