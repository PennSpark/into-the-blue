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
	const resE = await fetch(
		`${process.env.NEXT_PUBLIC_BASE_URL}/data/exhibits.json`
	);
	const exhibitData = await resE.json();

	const resA = await fetch(
		`${process.env.NEXT_PUBLIC_BASE_URL}/data/artifacts.json`
	);
	const artifactsData = await resA.json();

	const exhibit = exhibitData[id];
	if (!exhibit) return null;

	console.log(exhibit);
	// Map artifact IDs from exhibit.items
	const artifactIDs = exhibit.items.map((item) => item.id);

	// Match full artifact data
	const detailedItems = artifactsData.filter((artifact) =>
		artifactIDs.includes(artifact.id)
	);

	return {
		...exhibit,
		items: detailedItems, // Replace item IDs with full artifact objects
	};
}

// The main exhibit page component.
export default async function ExhibitPage(props) {
	const { id } = await props.params;
	const exhibit = await getExhibitData(id);

	if (!exhibit) {
		// Show a 404 if the exhibit doesn't exist
		notFound();
	}

	console.log(exhibit);

	// Render the client component, passing the exhibit data
	return <ExhibitClient exhibit={exhibit} id={id} />;
}
