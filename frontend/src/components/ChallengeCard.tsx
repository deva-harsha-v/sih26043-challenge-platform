import Link from 'next/link';
import { Challenge } from '@/lib/types';

interface ChallengeCardProps {
  challenge: Challenge;
}

export default function ChallengeCard({ challenge }: ChallengeCardProps) {
  const statusColors: Record<string, string> = {
    open: 'bg-green-100 text-green-800 border-green-200',
    active: 'bg-blue-100 text-blue-800 border-blue-200',
    submission: 'bg-amber-100 text-amber-800 border-amber-200',
    review: 'bg-purple-100 text-purple-800 border-purple-200',
    completed: 'bg-gray-100 text-gray-800 border-gray-200',
    draft: 'bg-gray-100 text-gray-600 border-gray-200',
  };

  const difficultyColors: Record<string, string> = {
    Hard: 'bg-red-50 text-red-700 border-red-200',
    Medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    Easy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-3">
          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
            {challenge.category}
          </span>
          <span className={`text-xs px-2.5 py-1 rounded-full border font-medium capitalize ${statusColors[challenge.status] || 'bg-gray-100'}`}>
            {challenge.status}
          </span>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-1 hover:text-indigo-600 transition">
          <Link href={`/challenges/${challenge.id}`}>
            {challenge.title}
          </Link>
        </h3>

        <p className="text-xs font-medium text-gray-500 mb-3">
          By {challenge.organization_name}
        </p>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {challenge.description}
        </p>

        {challenge.skills && challenge.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {challenge.skills.map((skill, idx) => (
              <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-medium">
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className={`text-xs px-2 py-0.5 rounded border font-medium ${difficultyColors[challenge.difficulty] || 'bg-gray-100'}`}>
            {challenge.difficulty}
          </span>
          {challenge.reward && (
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
              {challenge.reward}
            </span>
          )}
        </div>

        <Link
          href={`/challenges/${challenge.id}`}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
}
