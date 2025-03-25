"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ExhibitClient from "./ExhibitClient";

export default function ExhibitPageClient() {
	const { id } = useParams();

  const [exhibit, setExhibit] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
		console.log("id: ", id);
        const resE = await fetch("/data/exhibits.json");
        const exhibitData = await resE.json();
        const resA = await fetch("/data/artifacts.json");
        const artifactsData = await resA.json();

        const exhibitItem = exhibitData[id];
        if (!exhibitItem) {
          console.error("Exhibit not found");
          return;
        }
        // Map artifact IDs from exhibit.items
        const artifactIDs = exhibitItem.items.map((item) => item.id);
        // Match full artifact data
        const detailedItems = artifactsData.filter((artifact) =>
          artifactIDs.includes(artifact.id)
        );

        setExhibit({
          ...exhibitItem,
          items: detailedItems,
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
