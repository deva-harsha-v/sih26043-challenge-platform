'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ChallengeCard from '@/components/ChallengeCard';
import { getChallenges } from '@/lib/api';
import { fetchCurrentUser } from '@/lib/auth';
import { Challenge, User } from '@/lib/types';

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [skill, setSkill] = useState('');
  const [status, setStatus] = useState('');

  const loadChallenges = async () => {
    setLoading(true);
    try {
      const data = await getChallenges({
        search: search || undefined,
        skill: skill || undefined,
        status: status || undefined,
      });
      setChallenges(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser().then(setUser);
    loadChallenges();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadChallenges();
  };

  const canCreateChallenge = user && (user.role === 'organization' || user.role === 'university' || user.role === 'admin');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Challenge Statements
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Browse real-world problem statements published by leading organizations and universities.
          </p>
        </div>

        {canCreateChallenge && (
          <Link
            href="/challenges/new"
            className="inline-flex items-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition"
          >
            + Post New Challenge
          </Link>
        )}
      </div>

      {/* Filters Bar */}
      <form onSubmit={handleSearchSubmit} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Search</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search keywords..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Filter Skill</label>
          <input
            type="text"
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            placeholder="e.g. Python, AI"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Filter Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="active">Active</option>
            <option value="submission">Submission</option>
            <option value="review">Review</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            className="w-full py-2 px-4 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-md shadow-sm transition"
          >
            Apply Filters
          </button>
        </div>
      </form>

      {/* Grid of Challenges */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading challenges...</div>
      ) : challenges.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-base">No challenges match your search filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map((c) => (
            <ChallengeCard key={c.id} challenge={c} />
          ))}
        </div>
      )}
    </div>
  );
}
