'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getChallengeById, updateChallenge } from '@/lib/api';
import { fetchCurrentUser } from '@/lib/auth';
import { Challenge, User, ChallengeStatus } from '@/lib/types';

export default function ChallengeDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState<ChallengeStatus>('open');
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      const u = await fetchCurrentUser();
      setUser(u);
      const c = await getChallengeById(params.id);
      setChallenge(c);
      setEditTitle(c.title);
      setEditDescription(c.description);
      setEditStatus(c.status);
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

  const statusColors: Record<string, string> = {
    open: 'bg-green-100 text-green-800 border-green-200',
    active: 'bg-blue-100 text-blue-800 border-blue-200',
    submission: 'bg-amber-100 text-amber-800 border-amber-200',
    review: 'bg-purple-100 text-purple-800 border-purple-200',
    completed: 'bg-gray-100 text-gray-800 border-gray-200',
    draft: 'bg-gray-100 text-gray-600 border-gray-200',
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
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
                Published by <span className="font-semibold text-gray-800">{challenge.organization_name}</span>
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
      </div>
    </div>
  );
}
