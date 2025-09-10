import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      <h1 className="text-4xl font-bold text-white mb-6">
        🚀 Tailwind Demo Page
      </h1>

      <p className="text-white mb-4">
        If you can see gradient background + styled text,
        <span className="font-semibold"> Tailwind is working!</span>
      </p>

      <button className="px-6 py-2 rounded-full bg-white text-indigo-600 font-medium hover:bg-indigo-100 transition">
        Click Me
      </button>

      <div className="mt-8">
        <Image
          src="/next.svg"
          alt="Next.js Logo"
          width={120}
          height={30}
          className="invert dark:invert-0"
        />
      </div>
    </main>
  );
}
