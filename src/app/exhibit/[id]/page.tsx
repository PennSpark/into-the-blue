import ExhibitClient from "./ExhibitClient";
import { getFoundObjectsForExhibit } from "@/app/context/IndexedDB";
import exhibits from "@/app/data/exhibits.json";
import artifacts from "@/app/data/artifacts.json";

export async function generateStaticParams() {
  return Object.keys(exhibits).map((key) => ({ id: key }));
}

export default async function ExhibitPage({ params }: { params: { id: string } }) {
  const id = decodeURIComponent(params.id);

  const exhibitItem = exhibits[id];
  if (!exhibitItem) return <div>Exhibit not found</div>;

  const artifactIDs = exhibitItem.items.map((item) => item.id);
  const detailedItems = artifacts.filter((a) => artifactIDs.includes(a.id));

  // initial updates are false
  const updatedItems = detailedItems.map((artifact) => ({
    ...artifact,
    userFound: false,
  }));

  return (
    <ExhibitClient
      id={id}
      exhibit={{
        ...exhibitItem,
        items: updatedItems,
        foundObjects: 0,
      }}
    />
  );
}
