'use client'
import React, { useState, useEffect } from 'react';
import Camera from "./Camera";
import { Artifact } from '../types';

export default function CameraPage () {
    const [data, setData] = useState<Artifact | null>(null);

    useEffect(() => {
        const fetchData = async () => {
          try {
            const response = await fetch('/data/artifacts.json'); // Path to your JSON file in the public folder
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const json = await response.json();
            setData(json[0]);
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