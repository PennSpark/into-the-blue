import Link from 'next/link';

// Generate static paths for your dynamic exhibit pages.
export async function generateStaticParams() {
  const exhibits = [
    { id: 'rome' },
    { id: 'egypt' },
    { id: 'greece' },
    { id: 'asia' },
    { id: 'middle-east' },
    { id: 'assyria' },
  ];
  return exhibits.map(exhibit => ({ id: exhibit.id }));
}

// Simulated data fetching based on the exhibit ID.
async function getExhibitData(id) {
  const exhibitData = {
    'rome': {
      name: 'Rome',
      items: [
        { id: 'rome-1', title: 'Artifact 1' },
        { id: 'rome-2', title: 'Artifact 2' },
        { id: 'rome-3', title: 'Artifact 3' },
        { id: 'rome-4', title: 'Artifact 4' },
        { id: 'rome-5', title: 'Artifact 5' },
        { id: 'rome-6', title: 'Artifact 6' },
      ],
    },
    'egypt': {
      name: 'Egypt',
      items: [
        { id: 'egypt-1', title: 'Artifact 1' },
        { id: 'egypt-2', title: 'Artifact 2' },
        { id: 'egypt-3', title: 'Artifact 3' },
        { id: 'egypt-4', title: 'Artifact 4' },
      ],
    },
    'greece': {
      name: 'Greece',
      items: [
        { id: 'greece-1', title: 'Artifact 1' },
        { id: 'greece-2', title: 'Artifact 2' },
        { id: 'greece-3', title: 'Artifact 3' },
        { id: 'greece-4', title: 'Artifact 4' },
        { id: 'greece-5', title: 'Artifact 5' },
      ],
    },
    'asia': {
      name: 'Asia',
      items: [
        { id: 'asia-1', title: 'Artifact 1' },
        { id: 'asia-2', title: 'Artifact 2' },
        { id: 'asia-3', title: 'Artifact 3' },
        { id: 'asia-4', title: 'Artifact 4' },
        { id: 'asia-5', title: 'Artifact 5' },
      ],
    },
    'middle-east': {
      name: 'Middle East',
      items: [
        { id: 'middle-east-1', title: 'Artifact 1' },
        { id: 'middle-east-2', title: 'Artifact 2' },
        { id: 'middle-east-3', title: 'Artifact 3' },
        { id: 'middle-east-4', title: 'Artifact 4' },
      ],
    },
    'assyria': {
      name: 'Assyria',
      items: [
        { id: 'assyria-1', title: 'Artifact 1' },
        { id: 'assyria-2', title: 'Artifact 2' },
        { id: 'assyria-3', title: 'Artifact 3' },
        { id: 'assyria-4', title: 'Artifact 4' },
        { id: 'assyria-5', title: 'Artifact 5' },
        { id: 'assyria-6', title: 'Artifact 6' },
      ],
    },
  };

  return exhibitData[id] || null;
}

// The main exhibit page component.
export default async function ExhibitPage({ params }) {
  const exhibit = await getExhibitData(params.id);

  if (!exhibit) {
    return <div>Exhibit not found.</div>;
  }

  return (
    <main style={{ padding: '2rem' }}>
      <h1>{exhibit.name}</h1>
      <div style={gridStyles}>
        {exhibit.items.map((item) => (
          <Link key={item.id} href={`/exhibit/${params.id}/${item.id}`}>
            {item.title}
          </Link>
        ))}
      </div>
    </main>
  );
}

const gridStyles = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
  gap: '1rem',
  marginTop: '1.5rem',
};