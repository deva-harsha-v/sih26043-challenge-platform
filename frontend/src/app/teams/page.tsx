'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getTeams, createTeam, getChallenges } from '@/lib/api';
import { fetchCurrentUser } from '@/lib/auth';
import { Team, User, Challenge } from '@/lib/types';

export default function TeamsPage() {
  const searchParams = useSearchParams();
  const challengeIdParam = searchParams.get('challenge_id');

  const [teams, setTeams] = useState<Team[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Modal Form State
  const [teamName, setTeamName] = useState('');
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>(challengeIdParam || '');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const u = await fetchCurrentUser();
      setUser(u);
      const data = await getTeams(challengeIdParam || undefined);
      setTeams(data);
      const chList = await getChallenges();
      setChallenges(chList);
      if (!selectedChallengeId && chList.length > 0) {
        setSelectedChallengeId(chList[0].id.toString());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [challengeIdParam]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCreating(true);

    try {
      await createTeam({
        name: teamName,
        challenge_id: Number(selectedChallengeId),
        description: description || undefined,
      });
      setShowCreateModal(false);
      setTeamName('');
      setDescription('');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to create team');
    } finally {
      setCreating(false);
    }
  };

  const isContributor = user && user.role === 'contributor';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Teams Directory</h1>
          <p className="mt-1 text-sm text-gray-600">
            Discover student and researcher teams formed around hackathon problem statements.
          </p>
        </div>

        {isContributor && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition"
          >
            + Form New Team
          </button>
        )}
      </div>

      {/* Teams Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading teams...</div>
      ) : teams.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-base">No teams formed yet for this challenge.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((t) => (
            <div key={t.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-gray-900">{t.name}</h3>
                  <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-medium border border-indigo-100">
                    {t.members.length} Members
                  </span>
                </div>

                <p className="text-xs font-semibold text-gray-500 mb-3">
                  Challenge:{' '}
                  <Link href={`/challenges/${t.challenge_id}`} className="text-indigo-600 hover:underline">
                    {t.challenge_title}
                  </Link>
                </p>

                {t.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{t.description}</p>
                )}

                <div className="text-xs text-gray-500 mb-4">
                  Leader: <span className="font-semibold text-gray-700">{t.leader_name}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end">
                <Link
                  href={`/teams/${t.id}`}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
                >
                  View Team Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Form New Team</h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
                <input
                  type="text"
                  required
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-indigo-500"
                  placeholder="e.g. CyberKnights"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Challenge</label>
                <select
                  required
                  value={selectedChallengeId}
                  onChange={(e) => setSelectedChallengeId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-indigo-500 bg-white"
                >
                  {challenges.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-indigo-500"
                  placeholder="Brief statement about your team's goal..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
