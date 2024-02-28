import Link from 'next/link';

export default function Home() {
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-destructive">
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
