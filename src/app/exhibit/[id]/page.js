import Link from 'next/link';

// Generate static paths for your dynamic exhibit pages.
export async function generateStaticParams() {
  const exhibits = [
    { id: 'rome' },
    { id: 'egypt' },
    { id: 'greece' },
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
          <Link key={item.id} href={`/exhibit/${exhibit.name.toLowerCase()}/${item.id}`}>
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


