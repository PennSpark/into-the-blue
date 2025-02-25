import GlobeWrapper from '@/components/GlobeWrapper';

export default function Home() {
  return (
    <div className="min-h-screen p-8 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col items-center gap-8">
        <h1 className="text-3xl font-bold text-center">
          choose a region to begin
        </h1>
        
        <div className="w-full max-w-4xl">
          <GlobeWrapper />
        </div>

        <div className="text-center text-sm opacity-70">
          swipe to see all galleries
        </div>
      </main>
    </div>
  );
}