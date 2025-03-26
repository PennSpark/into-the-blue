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
		{ id: "assyria" },
	];
	return exhibits.map((exhibit) => ({ id: exhibit.id }));
}

// Simulated data fetching based on the exhibit ID.
async function getExhibitData(id) {
	const exhibitData = {
		"into-the-blue": {
			name: "Into the Blue",
			description:
				"This special exhibition explores the use of blue pigments and materials across ancient civilizations, highlighting their cultural and historical significance.",
			items: [
				{
					id: "blue-1",
					name: "Blue Artifact",
					imageURL: "/images/into-the-blue/blue-1-unfound.png",
					userFound: false,
				},
			],
			totalObjects: 1,
			foundObjects: 0,
		},
		etruscan: {
			name: "Etruscan",
			description:
				"The Etruscans were known for their fine metalwork and artistic achievements that influenced Roman culture.",
			items: [
				{
					id: "etruscan-1",
					name: "Etruscan Artifact",
					imageURL: "/images/etruscan/etruscan-1-unfound.png",
					userFound: false,
				},
			],
			totalObjects: 1,
			foundObjects: 0,
		},
		greece: {
			name: "Greece",
			description:
				"Ancient Greek artifacts showcase their advanced artistic techniques and cultural values.",
			items: [
				{ 
					id: "greece-1", 
					name: "Greek Vase",
					imageURL: "/images/greece/greece-1-unfound.png",
					userFound: false,
				},
				{ 
					id: "greece-2", 
					name: "Greek Statue",
					imageURL: "/images/greece/greece-2-unfound.png",
					userFound: false,
				},
			],
			totalObjects: 2,
			foundObjects: 0,
		},
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
		"eastern-mediterranean": {
			name: "Eastern Mediterranean",
			description:
				"The Eastern Mediterranean region was a crossroads of ancient civilizations, with unique artistic traditions and cultural exchanges.",
			items: [
				{
					id: "em-1",
					name: "Mediterranean Artifact 1",
					imageURL: "/images/eastern-mediterranean/em-1-unfound.png",
					userFound: false,
				},
				{
					id: "em-2",
					name: "Mediterranean Artifact 2",
					imageURL: "/images/eastern-mediterranean/em-2-unfound.png",
					userFound: false,
				},
				{
					id: "em-3",
					name: "Mediterranean Artifact 3",
					imageURL: "/images/eastern-mediterranean/em-3-unfound.png",
					userFound: false,
				},
				{
					id: "em-4",
					name: "Mediterranean Artifact 4",
					imageURL: "/images/eastern-mediterranean/em-4-unfound.png",
					userFound: false,
				},
			],
			totalObjects: 4,
			foundObjects: 0,
		},
		asia: {
			name: "Asia",
			description:
				"Asian artifacts display the rich cultural heritage and artistic traditions of various Asian civilizations.",
			items: [
				{
					id: "asia-1", 
					name: "Asian Artifact 1",
					imageURL: "/images/asia/asia-1-unfound.png",
					userFound: false,
				},
				{
					id: "asia-2", 
					name: "Asian Artifact 2",
					imageURL: "/images/asia/asia-2-unfound.png",
					userFound: false,
				},
			],
			totalObjects: 2,
			foundObjects: 0,
		},
		egypt: {
			name: "Special Exhibition: Egypt",
			description:
				"Ancient Egyptian artifacts showcase their sophisticated use of blue in art and religious objects.",
			items: [
				{ 
					id: "egypt-1", 
					name: "Egyptian Artifact 1",
					imageURL: "/images/egypt/egypt-1-unfound.png",
					userFound: false,
				},
				{ 
					id: "egypt-2", 
					name: "Egyptian Artifact 2",
					imageURL: "/images/egypt/egypt-2-unfound.png",
					userFound: false,
				},
				{ 
					id: "egypt-3", 
					name: "Egyptian Artifact 3",
					imageURL: "/images/egypt/egypt-3-unfound.png",
					userFound: false,
				},
			],
			totalObjects: 3,
			foundObjects: 0,
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
					imageURL: "/images/middle-east/ME-6-unfound.png",
					userFound: true,
				},
				{
					id: "ME-7",
					name: "Bowl",
					imageURL: "/images/middle-east/ME-7-unfound.png",
					userFound: false,
				},
				{
					id: "ME-8",
					name: "Tile Mosaic Panel",
					imageURL: "/images/middle-east/ME-8-unfound.png",
					userFound: false,
				},
				{
					id: "ME-9",
					name: "String of beads",
					imageURL: "/images/middle-east/ME-9-unfound.png",
					userFound: false,
				},
			],
			totalObjects: 9,
			foundObjects: 3,
		},
		"north-america": {
			name: "North America",
			description:
				"Artifacts from indigenous North American cultures showcase their artistic traditions and material culture.",
			items: [
				{
					id: "na-1",
					name: "North American Artifact 1",
					imageURL: "/images/north-america/na-1-unfound.png",
					userFound: false,
				},
				{
					id: "na-2",
					name: "North American Artifact 2",
					imageURL: "/images/north-america/na-2-unfound.png",
					userFound: false,
				},
				{
					id: "na-3",
					name: "North American Artifact 3",
					imageURL: "/images/north-america/na-3-unfound.png",
					userFound: false,
				},
				{
					id: "na-4",
					name: "North American Artifact 4",
					imageURL: "/images/north-america/na-4-unfound.png",
					userFound: false,
				},
			],
			totalObjects: 4,
			foundObjects: 0,
		},
		"mexico-central-america": {
			name: "Mexico & Central America",
			description:
				"Mesoamerican artifacts highlight the sophisticated artistic and cultural achievements of ancient civilizations in this region.",
			items: [
				{
					id: "mca-1",
					name: "Mesoamerican Artifact",
					imageURL: "/images/mexico-central-america/mca-1-unfound.png",
					userFound: false,
				},
			],
			totalObjects: 1,
			foundObjects: 0,
		},
		africa: {
			name: "Africa",
			description:
				"African artifacts represent the diverse artistic traditions across the continent's many cultures and regions.",
			items: [
				{
					id: "africa-1",
					name: "African Artifact 1",
					imageURL: "/images/africa/africa-1-unfound.png",
					userFound: false,
				},
				{
					id: "africa-2",
					name: "African Artifact 2",
					imageURL: "/images/africa/africa-2-unfound.png",
					userFound: false,
				},
				{
					id: "africa-3",
					name: "African Artifact 3",
					imageURL: "/images/africa/africa-3-unfound.png",
					userFound: false,
				},
				{
					id: "africa-4",
					name: "African Artifact 4",
					imageURL: "/images/africa/africa-4-unfound.png",
					userFound: false,
				},
			],
			totalObjects: 4,
			foundObjects: 0,
		},
		assyria: {
			name: "Assyria",
			description:
				"Assyrian artifacts showcase the artistic and cultural achievements of this ancient Mesopotamian civilization.",
			items: [
				{
					id: "assyria-1",
					name: "Assyrian Artifact",
					imageURL: "/images/assyria/assyria-1-unfound.png",
					userFound: false,
				},
			],
			totalObjects: 1,
			foundObjects: 0,
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