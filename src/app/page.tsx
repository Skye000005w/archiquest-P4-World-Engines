import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <Link href="/timelapse">Timelapse Demo </Link>
        <Link href="/artcritic">Art Critic Demo </Link>
        <Link href="/map">Map Demo </Link>
      </div>
    </main>
  );
}




