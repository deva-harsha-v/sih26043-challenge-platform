'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createChallenge } from '@/lib/api';
import { fetchCurrentUser } from '@/lib/auth';
import { User } from '@/lib/types';

export default function NewChallengePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Software Engineering');
  const [difficulty, setDifficulty] = useState('Medium');
  const [reward, setReward] = useState('');
  const [maxTeamSize, setMaxTeamSize] = useState(4);
  const [description, setDescription] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [skillsInput, setSkillsInput] = useState('');

  useEffect(() => {
    fetchCurrentUser().then((u) => {
      if (!u || (u.role !== 'organization' && u.role !== 'university' && u.role !== 'admin')) {
        router.push('/challenges');
        return;
      }
      setUser(u);
      setLoading(false);
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const skillsArray = skillsInput
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const challenge = await createChallenge({
        title,
        category,
        difficulty,
        reward: reward || undefined,
        max_team_size: Number(maxTeamSize),
        description,
        problem_statement: problemStatement,
        skills: skillsArray,
      });

      router.push(`/challenges/${challenge.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to publish challenge');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Checking permissions...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Publish New Challenge</h1>
        <p className="text-sm text-gray-600 mb-6">
          Posting as <span className="font-semibold text-indigo-600">{user?.org_name || user?.full_name}</span>
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Challenge Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g. AI-Powered Soil Health Analyzer"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g. AI/ML, Hardware"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Team Size</label>
              <input
                type="number"
                min="1"
                max="10"
                value={maxTeamSize}
                onChange={(e) => setMaxTeamSize(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reward / Prize (Optional)</label>
            <input
              type="text"
              value={reward}
              onChange={(e) => setReward(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g. ₹1,00,000 Cash Prize"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Brief summary of the challenge..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Problem Statement</label>
            <textarea
              required
              rows={6}
              value={problemStatement}
              onChange={(e) => setProblemStatement(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Comprehensive details about the problem, background context, expected deliverables..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Skill Tags (Comma-separated)</label>
            <input
              type="text"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Python, Computer Vision, PyTorch, IoT"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => router.push('/challenges')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm transition disabled:opacity-50"
            >
              {submitting ? 'Publishing...' : 'Publish Challenge'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
