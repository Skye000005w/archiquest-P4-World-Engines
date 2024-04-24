import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold mb-8">CartoGraphs: Legacy of the Lost</h1>
        <p className="text-xl mb-8">
          Embark on an immersive exploration and uncover the secrets of legendary, mythical, and lost civilizations. Navigate through ancient cities, piece together histories, and discover the legacy of the lost.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link href="/timelapse" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded">
            Timelapse Demo
          </Link>
          <Link href="/artcritic" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded">
            Art Critic Demo
          </Link>
          <Link href="/map" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded">
            Map Demo
          </Link>
          <Link href="/cartographs" className="bg-green-500 hover:bg-green-700 text-white font-bold py-4 px-8 rounded">
            Play CartoGraphs
          </Link>
        </div>
      </div>
    </main>
  );
}