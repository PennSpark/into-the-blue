"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ExhibitClient from "./ExhibitClient";
import { getFoundObjectsForExhibit } from "@/app/context/IndexedDB";

export default function ExhibitPageClient() {
	const { id } = useParams();
  const [exhibit, setExhibit] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const resE = await fetch("/data/exhibits.json");
        const exhibitData = await resE.json();
        const resA = await fetch("/data/artifacts.json");
        const artifactsData = await resA.json();
  
        const exhibitItem = exhibitData[id];
        if (!exhibitItem) {
          console.error("Exhibit not found");
          return;
        }
  
        const artifactIDs = exhibitItem.items.map((item) => item.id);
        const detailedItems = artifactsData.filter((artifact) =>
          artifactIDs.includes(artifact.id)
        );
  
        const found = await getFoundObjectsForExhibit(id);
  
        const updatedItems = detailedItems.map((artifact) => ({
          ...artifact,
          userFound: found.includes(artifact.id),
        }));
  
        setExhibit({
          ...exhibitItem,
          items: updatedItems,
          foundObjects: found.length,
        });
      } catch (err) {
        console.error(err);
      }
    }
  
    fetchData();
  }, [id]);
  

  if (!exhibit) {
    return <p>Loading...</p>;
  }

  return <ExhibitClient exhibit={exhibit} id={id} />;
}
