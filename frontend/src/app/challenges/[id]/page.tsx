'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getChallengeById, updateChallenge, getTeams, createTeam, getSubmissionsForChallenge } from '@/lib/api';
import { fetchCurrentUser } from '@/lib/auth';
import { Challenge, User, ChallengeStatus, Team, Submission } from '@/lib/types';

export default function ChallengeDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState<ChallengeStatus>('open');
  const [saving, setSaving] = useState(false);

  // Form Team Modal State
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamDesc, setTeamDesc] = useState('');
  const [teamCreating, setTeamCreating] = useState(false);
  const [teamError, setTeamError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const u = await fetchCurrentUser();
      setUser(u);
      const c = await getChallengeById(params.id);
      setChallenge(c);
      setEditTitle(c.title);
      setEditDescription(c.description);
      setEditStatus(c.status);

      const tList = await getTeams(params.id);
      setTeams(tList);

      if (u && (u.org_name === c.organization_name || u.role === 'admin' || u.role === 'organization')) {
        try {
          const subs = await getSubmissionsForChallenge(params.id);
          setSubmissions(subs);
        } catch {
          // If non-owner or no permissions, ignore
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [params.id]);

  const handleSave = async () => {
    if (!challenge) return;
    setSaving(true);
    try {
      const updated = await updateChallenge(challenge.id, {
        title: editTitle,
        description: editDescription,
        status: editStatus,
      });
      setChallenge(updated);
      setIsEditing(false);
    } catch (err: any) {
      alert(err.message || 'Failed to update challenge');
    } finally {
      setSaving(false);
    }
  };

  const handleFormTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challenge) return;
    setTeamError(null);
    setTeamCreating(true);

    try {
      const newTeam = await createTeam({
        name: teamName,
        challenge_id: challenge.id,
        description: teamDesc || undefined,
      });
      setShowTeamModal(false);
      setTeamName('');
      setTeamDesc('');
      router.push(`/teams/${newTeam.id}`);
    } catch (err: any) {
      setTeamError(err.message || 'Failed to form team');
    } finally {
      setTeamCreating(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-gray-500">Loading challenge details...</div>;
  }

  if (!challenge) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <h2 className="text-xl font-bold text-gray-800">Challenge Not Found</h2>
        <Link href="/challenges" className="mt-4 inline-block text-indigo-600 font-medium">
          ← Back to Challenges
        </Link>
      </div>
    );
  }

  const isOwner = user && (user.org_name === challenge.organization_name || user.role === 'admin');
  const isContributor = user && user.role === 'contributor';

  const statusColors: Record<string, string> = {
    open: 'bg-green-100 text-green-800 border-green-200',
    active: 'bg-blue-100 text-blue-800 border-blue-200',
    submission: 'bg-amber-100 text-amber-800 border-amber-200',
    review: 'bg-purple-100 text-purple-800 border-purple-200',
    completed: 'bg-gray-100 text-gray-800 border-gray-200',
    draft: 'bg-gray-100 text-gray-600 border-gray-200',
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 space-y-8">
      <div className="mb-6">
        <Link href="/challenges" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
          ← Back to All Challenges
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-8">
        {/* Header Section */}
        <div className="border-b pb-6">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-100">
                  {challenge.category}
                </span>
                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium capitalize ${statusColors[challenge.status]}`}>
                  {challenge.status}
                </span>
              </div>

              {isEditing ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="text-2xl font-extrabold w-full border px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <h1 className="text-3xl font-extrabold text-gray-900">{challenge.title}</h1>
              )}

              <p className="text-sm text-gray-600">
                Published by{' '}
                <Link href={`/profiles/org/${challenge.organization_id}`} className="font-semibold text-indigo-600 hover:underline">
                  {challenge.organization_name}
                </Link>
              </p>
            </div>

            {isOwner && (
              <div>
                {isEditing ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded hover:bg-indigo-700 transition"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-medium rounded hover:bg-gray-300 transition"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-semibold rounded-lg transition"
                  >
                    ✏️ Edit Challenge
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Metadata Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg text-center">
          <div>
            <span className="block text-xs text-gray-500 font-medium">Difficulty</span>
            <span className="font-semibold text-sm text-gray-800">{challenge.difficulty}</span>
          </div>
          <div>
            <span className="block text-xs text-gray-500 font-medium">Reward / Prize</span>
            <span className="font-semibold text-sm text-emerald-600">{challenge.reward || 'N/A'}</span>
          </div>
          <div>
            <span className="block text-xs text-gray-500 font-medium">Max Team Size</span>
            <span className="font-semibold text-sm text-gray-800">{challenge.max_team_size} Members</span>
          </div>
          <div>
            <span className="block text-xs text-gray-500 font-medium">Status</span>
            {isEditing ? (
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as ChallengeStatus)}
                className="text-xs border p-1 rounded font-medium"
              >
                <option value="open">open</option>
                <option value="active">active</option>
                <option value="submission">submission</option>
                <option value="review">review</option>
                <option value="completed">completed</option>
              </select>
            ) : (
              <span className="font-semibold text-sm capitalize text-gray-800">{challenge.status}</span>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Overview</h3>
          {isEditing ? (
            <textarea
              rows={3}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full border p-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          ) : (
            <p className="text-gray-700 leading-relaxed text-sm">{challenge.description}</p>
          )}
        </div>

        {/* Problem Statement */}
        {challenge.problem_statement && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Detailed Problem Statement</h3>
            <div className="bg-gray-50 p-4 rounded-lg border text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
              {challenge.problem_statement}
            </div>
          </div>
        )}

        {/* Required Skills */}
        {challenge.skills && challenge.skills.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Required Skills & Expertise</h3>
            <div className="flex flex-wrap gap-2">
              {challenge.skills.map((skill, idx) => (
                <span key={idx} className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-semibold px-3 py-1 rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Submissions Received Section for Challenge Owner */}
        {isOwner && (
          <div className="pt-6 border-t">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">📥 Submissions Received ({submissions.length})</h3>
                <p className="text-xs text-gray-500">Solutions submitted by teams for evaluation and scoring</p>
              </div>
            </div>

            {submissions.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-6 text-center text-sm text-gray-500 border border-dashed">
                No solution submissions received for this challenge yet.
              </div>
            ) : (
              <div className="divide-y divide-gray-200 border rounded-lg overflow-hidden">
                {submissions.map((sub) => (
                  <div key={sub.id} className="p-4 bg-gray-50 flex justify-between items-center hover:bg-gray-100 transition">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-gray-900">{sub.title}</span>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase border bg-blue-50 text-blue-700 border-blue-200">
                          {sub.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Submitted by Team <span className="font-semibold text-gray-700">{sub.team_name}</span></p>
                    </div>
                    <Link
                      href={`/submissions/${sub.id}`}
                      className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded hover:bg-indigo-700 transition"
                    >
                      Review & Score →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Participating Teams Section */}
        <div className="pt-6 border-t">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Teams for this Challenge</h3>
              <p className="text-xs text-gray-500">Student and researcher teams solving this problem statement</p>
            </div>

            {isContributor && (
              <button
                onClick={() => setShowTeamModal(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
              >
                + Form Team for this Challenge
              </button>
            )}
          </div>

          {teams.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-6 text-center text-sm text-gray-500 border border-dashed">
              No teams formed for this challenge yet. Be the first to form a team!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {teams.map((t) => (
                <div key={t.id} className="border p-4 rounded-lg bg-gray-50 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">{t.name}</h4>
                    <p className="text-xs text-gray-500">Leader: {t.leader_name} • {t.members.length} member(s)</p>
                  </div>
                  <Link href={`/teams/${t.id}`} className="text-xs font-semibold text-indigo-600 hover:underline">
                    View →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Form Team Modal */}
      {showTeamModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Form Team</h2>
            <p className="text-xs text-gray-500 mb-4">Challenge: {challenge.title}</p>

            {teamError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm mb-4">
                {teamError}
              </div>
            )}

            <form onSubmit={handleFormTeam} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
                <input
                  type="text"
                  required
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-indigo-500"
                  placeholder="e.g. Innovators Assembly"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <textarea
                  rows={3}
                  value={teamDesc}
                  onChange={(e) => setTeamDesc(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-indigo-500"
                  placeholder="Brief description of your team..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowTeamModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={teamCreating}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {teamCreating ? 'Creating...' : 'Form Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
