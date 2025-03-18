import { notFound } from "next/navigation";
import ExhibitClient from "./ExhibitClient";

// Generate static paths for your dynamic exhibit pages.
export async function generateStaticParams() {
	const exhibits = [
		{ id: "rome" },
		{ id: "egypt" },
		{ id: "greece" },
		{ id: "asia" },
		{ id: "middle-east" },
		{ id: "assyria" },
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
			items: [
				{
					id: "rome-1",
					name: "Cinerary Urn",
					imageURL: "/images/rome/rome-1-unfound.png",
					userFound: true,
				},
				{
					id: "rome-2",
					name: "Flask",
					imageURL: "/images/rome/rome-2-unfound.png",
					userFound: false,
				},
				{
					id: "rome-3",
					name: "Necklace",
					imageURL: "/images/rome/rome-3-unfound.png",
					userFound: false,
				},
				{
					id: "rome-4",
					name: "Bracelet",
					imageURL: "/images/rome/rome-4-unfound.png",
					userFound: true,
				},
				{
					id: "rome-5",
					name: "Perfume Bottle",
					imageURL: "/images/rome/rome-5-unfound.png",
					userFound: false,
				},
			],
			totalObjects: 5,
			foundObjects: 2,
		},
		egypt: {
			name: "Egypt",
			items: [
				{ id: "egypt-1", name: "Artifact 1" },
				{ id: "egypt-2", name: "Artifact 2" },
				{ id: "egypt-3", name: "Artifact 3" },
				{ id: "egypt-4", name: "Artifact 4" },
			],
		},
		greece: {
			name: "Greece",
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
			items: [
				{
					id: "ME-1",
					name: "Ram in the Thicket",
					imageURL: "/images/middle-east/ME-1-unfound.png",
					userFound: true,
				},
				{
					id: "ME-2",
					name: "3 Beads",
					imageURL: "/images/middle-east/ME-2-unfound.png",
					userFound: false,
				},
				{
					id: "ME-3",
					name: "Diadems of Puabi",
					imageURL: "/images/middle-east/ME-3-unfound.png",
					userFound: false,
				},
				{
					id: "ME-4",
					name: "Bottle",
					imageURL: "/images/middle-east/ME-4-unfound.png",
					userFound: true,
				},
				{
					id: "ME-5",
					name: "Architectural Decoration",
					imageURL: "/images/middle-east/ME-5-unfound.png",
					userFound: false,
				},
				{
					id: "ME-6",
					name: "Dish",
					imageURL: "/images/middle-east/ME-5-unfound.png",
					userFound: true,
				},
				{
					id: "ME-7",
					name: "Bowl",
					imageURL: "/images/middle-east/ME-5-unfound.png",
					userFound: false,
				},
				{
					id: "ME-8",
					name: "Tile Mosaic Panel",
					imageURL: "/images/middle-east/ME-5-unfound.png",
					userFound: false,
				},
				{
					id: "ME-9",
					name: "String of beads",
					imageURL: "/images/middle-east/ME-5-unfound.png",
					userFound: false,
				},
			],
			totalObjects: 9,
			foundObjects: 3,
		},
		assyria: {
			name: "Assyria",
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
