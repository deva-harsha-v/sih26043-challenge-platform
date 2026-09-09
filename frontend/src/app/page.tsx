import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center space-y-6">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
          Smart India Hackathon 2026 (SIH26043)
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 tracking-tight">
          Publish Real Challenges. <br />
          <span className="text-indigo-600">Build Innovative Solutions.</span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-gray-600">
          A unified digital platform connecting organizations, universities, and student innovators to solve real-world problem statements.
        </p>

        <div className="flex justify-center space-x-4 pt-4">
          <Link
            href="/register"
            className="px-6 py-3 rounded-lg font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md transition"
          >
            Get Started
          </Link>
          <Link
            href="/challenges"
            className="px-6 py-3 rounded-lg font-semibold bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm transition"
          >
            Explore Challenges
          </Link>
        </div>
      </div>
    </div>
  );
}
