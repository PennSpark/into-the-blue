import React from 'react';
import exhibits from "@/app/data/exhibits.json";
import artifacts from "@/app/data/artifacts.json";
import CameraClient from "./CameraClient";

export async function generateStaticParams() {
  // Generate all possible [id]/[objectId] combinations
  const paths = [];
  
  for (const exhibitId of Object.keys(exhibits)) {
    const exhibit = exhibits[exhibitId as keyof typeof exhibits];
    
    // For each exhibit, add all its artifacts
    for (const item of exhibit.items) {
      paths.push({
        id: exhibitId,
        objectId: item.id
      });
    }
  }
  
  return paths;
}

export default function CameraPage({ params }: { params: { id: string, objectId: string } }) {
  // Find the artifact data server-side
  const objectId = params.objectId;
  const artifact = artifacts.find((item) => item.id === objectId);
  
  if (!artifact) {
    return <div>Artifact not found</div>;
  }

  return <CameraClient artifact={artifact} />;
}