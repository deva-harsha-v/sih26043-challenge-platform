'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TeamPanel from '@/components/TeamPanel';
import { getTeamById, joinTeam, leaveTeam, removeTeamMember } from '@/lib/api';
import { fetchCurrentUser } from '@/lib/auth';
import { Team, User } from '@/lib/types';

export default function TeamDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [team, setTeam] = useState<Team | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const u = await fetchCurrentUser();
      setUser(u);
      const t = await getTeamById(params.id);
      setTeam(t);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [params.id]);

  const handleJoin = async () => {
    if (!team) return;
    setActionLoading(true);
    setError(null);
    try {
      const updated = await joinTeam(team.id);
      setTeam(updated);
    } catch (err: any) {
      setError(err.message || 'Failed to join team');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!team) return;
    setActionLoading(true);
    setError(null);
    try {
      await leaveTeam(team.id);
      router.push('/teams');
    } catch (err: any) {
      setError(err.message || 'Failed to leave team');
      setActionLoading(false);
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!team) return;
    try {
      const updated = await removeTeamMember(team.id, userId);
      setTeam(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to remove member');
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-gray-500">Loading team details...</div>;
  }

  if (!team) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <h2 className="text-xl font-bold text-gray-800">Team Not Found</h2>
        <Link href="/teams" className="mt-4 inline-block text-indigo-600 font-medium">
          ← Back to Teams
        </Link>
      </div>
    );
  }

  const isMember = user && team.members.some((m) => m.user_id === user.id);
  const isLeader = user && team.leader_id === user.id;
  const isContributor = user && user.role === 'contributor';
  const canJoin = isContributor && !isMember;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
      <div className="mb-6">
        <Link href="/teams" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
          ← Back to Teams Directory
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-8">
        {/* Team Header */}
        <div className="flex justify-between items-start border-b pb-6">
          <div>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-100 mb-2 inline-block">
              Hackathon Team
            </span>
            <h1 className="text-3xl font-extrabold text-gray-900">{team.name}</h1>
            <p className="text-sm text-gray-600 mt-1">
              Participating in:{' '}
              <Link href={`/challenges/${team.challenge_id}`} className="font-semibold text-indigo-600 hover:underline">
                {team.challenge_title}
              </Link>
            </p>
          </div>

          <div>
            {isMember ? (
              <button
                onClick={handleLeave}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 text-xs font-semibold rounded-lg transition disabled:opacity-50"
              >
                {actionLoading ? 'Leaving...' : 'Leave Team'}
              </button>
            ) : canJoin ? (
              <button
                onClick={handleJoin}
                disabled={actionLoading}
                className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 shadow-sm transition disabled:opacity-50"
              >
                {actionLoading ? 'Joining...' : 'Join Team'}
              </button>
            ) : null}
          </div>
        </div>

        {/* Team Description */}
        {team.description && (
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-1">About the Team</h3>
            <p className="text-gray-700 text-sm">{team.description}</p>
          </div>
        )}

        {/* Team Members List Panel */}
        <TeamPanel
          team={team}
          currentUserId={user?.id}
          isLeader={Boolean(isLeader)}
          onRemoveMember={handleRemoveMember}
        />
      </div>
    </div>
  );
}
