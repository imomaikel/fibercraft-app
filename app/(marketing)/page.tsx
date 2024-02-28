import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col text-xl">
        <p>This page is under construction 🚧</p>
        <p>
          Click
          <Link href="/dashboard" className="mx-1 underline">
            here
          </Link>
          to jump into the dashboard.
        </p>
      </div>
    </div>
  );
}
