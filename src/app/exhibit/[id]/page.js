import { notFound } from "next/navigation";
import ExhibitClient from "./ExhibitClient";

// Generate static paths for your dynamic exhibit pages.
export async function generateStaticParams() {
	const exhibits = [
		{ id: "into-the-blue" },
		{ id: "etruscan" },
		{ id: "greece" },
		{ id: "rome" },
		{ id: "eastern-mediterranean" },
		{ id: "asia" },
		{ id: "egypt" },
		{ id: "middle-east" },
		{ id: "north-america" },
		{ id: "mexico-central-america" },
		{ id: "africa" },
	];
	return exhibits.map((exhibit) => ({ id: exhibit.id }));
}

// Simulated data fetching based on the exhibit ID.
async function getExhibitData(id) {
	const exhibitData = {
		rome: {
			name: "Rome",
			description:
				"A variety of blue glass was found in Ancient Rome. Some glass objects were known for their ability to hold a variety of contents including oils or perhaps even perfume. Some of these have a decorated survival of blue patina.",
			userVisited: true,
			items: [
				{
					id: "rome-1",
					name: "Cinerary Urn",
					imageURL: "/images/artifacts/rome-1-Urn.png",
					userFound: true,
				},
				{
					id: "rome-2",
					name: "Flask",
					imageURL: "/images/artifacts/rome-2-Flask.png",
					userFound: false,
				},
				{
					id: "rome-3",
					name: "Necklace",
					imageURL: "/images/artifacts/rome-3-Necklace.png",
					userFound: false,
				},
				{
					id: "rome-4",
					name: "Bracelet",
					imageURL: "/images/artifacts/rome-4-Bracelet.png",
					userFound: true,
				},
				{
					id: "rome-5",
					name: "Perfume Bottle",
					imageURL: "/images/artifacts/rome-5-Perfume.png",
					userFound: false,
				},
			],
			totalObjects: 5,
			foundObjects: 2,
		},
		egypt: {
			name: "Egypt",
			userVisited: false,
			userVisited: false,
			items: [
				{ id: "egypt-1", name: "Artifact 1" },
				{ id: "egypt-2", name: "Artifact 2" },
				{ id: "egypt-3", name: "Artifact 3" },
				{ id: "egypt-4", name: "Artifact 4" },
			],
		},
		greece: {
			name: "Greece",
			userVisited: false,
			items: [
				{ id: "greece-1", name: "Artifact 1" },
				{ id: "greece-2", name: "Artifact 2" },
				{ id: "greece-3", name: "Artifact 3" },
				{ id: "greece-4", name: "Artifact 4" },
				{ id: "greece-5", name: "Artifact 5" },
			],
		},
		asia: {
			name: "Asia",
			userVisited: false,
			items: [
				{ id: "asia-1", name: "Artifact 1" },
				{ id: "asia-2", name: "Artifact 2" },
				{ id: "asia-3", name: "Artifact 3" },
				{ id: "asia-4", name: "Artifact 4" },
				{ id: "asia-5", name: "Artifact 5" },
			],
		},
		"middle-east": {
			name: "Middle East",
			description:
				"Archaeologists found a plethora of blue in the Middle East. See examples from early history mostly carved from lapis lazuli. Later cultures used bright blue glaze to decorate pottery and tile.",
			userVisited: false,
			items: [
				{
					id: "ME-1",
					name: "Ram in the Thicket",
					imageURL: "/images/artifacts/ME-1-Ram.png",
					userFound: true,
				},
				{
					id: "ME-2",
					name: "3 Beads",
					imageURL: "/images/artifacts/ME-2-3Beads.png",
					userFound: false,
				},
				{
					id: "ME-3",
					name: "Diadems of Puabi",
					imageURL: "/images/artifacts/ME-3-Diadems.png",
					userFound: false,
				},
				{
					id: "ME-4",
					name: "Bottle",
					imageURL: "/images/artifacts/ME-4-Bottle.png",
					userFound: true,
				},
				{
					id: "ME-5",
					name: "Architectural Decoration",
					imageURL: "/images/artifacts/ME-5-ArchDecor.png",
					userFound: false,
				},
				{
					id: "ME-6",
					name: "Dish",
					imageURL: "/images/artifacts/ME-6-Dish.png",
					userFound: true,
				},
				{
					id: "ME-7",
					name: "Bowl",
					imageURL: "/images/artifacts/ME-7-Bowl.png",
					userFound: false,
				},
				{
					id: "ME-8",
					name: "Tile Mosaic Panel",
					imageURL: "/images/artifacts/ME-8-Tile.png",
					userFound: false,
				},
				{
					id: "ME-9",
					name: "String of beads",
					imageURL: "/images/artifacts/ME-9-StringofBeads.png",
					userFound: false,
				},
			],
			totalObjects: 9,
			foundObjects: 3,
		},
		assyria: {
			name: "Assyria",
			userVisited: false,
			items: [
				{ id: "assyria-1", name: "Artifact 1" },
				{ id: "assyria-2", name: "Artifact 2" },
				{ id: "assyria-3", name: "Artifact 3" },
				{ id: "assyria-4", name: "Artifact 4" },
				{ id: "assyria-5", name: "Artifact 5" },
				{ id: "assyria-6", name: "Artifact 6" },
			],
		},
	};

	return exhibitData[id] || null;
}

// The main exhibit page component.
export default async function ExhibitPage(props) {
	const { id } = await props.params;
	const exhibit = await getExhibitData(id);

	if (!exhibit) {
		// Show a 404 if the exhibit doesn't exist
		notFound();
	}

	// Render the client component, passing the exhibit data
	return <ExhibitClient exhibit={exhibit} id={id} />;
}
