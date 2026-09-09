'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSubmissionById, updateSubmissionStatus, getChallengeById } from '@/lib/api';
import { fetchCurrentUser } from '@/lib/auth';
import { Submission, User, SubmissionStatus, Challenge } from '@/lib/types';
import TeamPanel from '@/components/TeamPanel';

export default function SubmissionDetailPage({ params }: { params: { id: string } }) {
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Evaluator Controls State
  const [evalStatus, setEvalStatus] = useState<SubmissionStatus>('submitted');
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const loadData = async () => {
    try {
      const currentUser = await fetchCurrentUser();
      setUser(currentUser);

      const sub = await getSubmissionById(params.id);
      setSubmission(sub);
      setEvalStatus(sub.status);
      setReviewerNotes(sub.reviewer_notes || '');

      if (sub.challenge_id) {
        const c = await getChallengeById(sub.challenge_id);
        setChallenge(c);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load submission details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [params.id]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submission) return;
    setSaving(true);
    setSaveSuccess(false);

    try {
      const updated = await updateSubmissionStatus(submission.id, {
        status: evalStatus,
        reviewer_notes: reviewerNotes,
      });
      setSubmission(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update evaluation status');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-gray-500">Loading submission details...</div>;
  }

  if (error || !submission) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <h2 className="text-xl font-bold text-gray-800">Submission Access Restricted or Not Found</h2>
        <p className="text-sm text-gray-500 mt-2">{error || "You don't have authorization to view this submission."}</p>
        <Link href="/challenges" className="mt-4 inline-block text-indigo-600 font-medium">
          ← Back to Challenges
        </Link>
      </div>
    );
  }

  const isChallengeOwner = user && challenge && (
    user.role === 'admin' || (user.role === 'organization' && user.org_name === challenge.organization_name)
  );

  const statusStyles: Record<SubmissionStatus, string> = {
    submitted: 'bg-blue-50 text-blue-700 border-blue-200',
    under_review: 'bg-purple-50 text-purple-700 border-purple-200',
    shortlisted: 'bg-amber-50 text-amber-700 border-amber-200',
    accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 space-y-8">
      <div className="flex justify-between items-center">
        <Link href={`/challenges/${submission.challenge_id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
          ← Back to Challenge
        </Link>
        <span className="text-xs text-gray-500">Submitted on {new Date(submission.created_at).toLocaleDateString()}</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-6">
        {/* Header */}
        <div className="border-b pb-6 flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-100">
                Solution Submission #{submission.id}
              </span>
              <span className={`text-xs px-3 py-1 rounded-full border font-semibold uppercase tracking-wider ${statusStyles[submission.status]}`}>
                {submission.status.replace('_', ' ')}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900">{submission.title}</h1>
            <p className="text-sm text-gray-600">
              Submitted by Team <Link href={`/teams/${submission.team_id}`} className="font-semibold text-indigo-600 hover:underline">{submission.team_name}</Link>
              {submission.challenge_title && (
                <span> for <span className="font-semibold text-gray-800">{submission.challenge_title}</span></span>
              )}
            </p>
          </div>

          {submission.document_url && (
            <a
              href={submission.document_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-lg transition inline-flex items-center space-x-1"
            >
              <span>🔗 View Repository / Doc</span>
            </a>
          )}
        </div>

        {/* Description */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-2">Solution Overview & Documentation</h3>
          <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
            {submission.description}
          </div>
        </div>

        {/* Submitting Team Roster */}
        {submission.team_members && submission.team_members.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3">Submitting Team Roster</h3>
            <div className="border border-gray-200 rounded-lg p-4 bg-white divide-y divide-gray-100">
              {submission.team_members.map((m) => (
                <div key={m.user_id} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                      {m.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{m.full_name}</p>
                      <p className="text-xs text-gray-500">{m.email}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${
                    m.role_in_team === 'Leader' ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-blue-50 text-blue-800 border-blue-200'
                  }`}>
                    {m.role_in_team}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviewer Feedback Section */}
        {submission.reviewer_notes && !isChallengeOwner && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
            <h4 className="font-bold text-amber-900 text-sm mb-1">Evaluator Feedback & Reviewer Notes</h4>
            <p className="text-sm text-amber-800 leading-relaxed whitespace-pre-wrap">{submission.reviewer_notes}</p>
            {submission.reviewed_at && (
              <span className="block text-[11px] text-amber-700 mt-2 font-medium">
                Evaluated on {new Date(submission.reviewed_at).toLocaleDateString()}
              </span>
            )}
          </div>
        )}

        {/* Evaluator Controls for Challenge Owner */}
        {isChallengeOwner && (
          <div className="bg-gray-50 border border-indigo-100 rounded-xl p-6 space-y-4">
            <div className="border-b pb-2">
              <h3 className="font-bold text-base text-gray-900">📋 Organization Evaluation & Scoring Panel</h3>
              <p className="text-xs text-gray-500">As the challenge publisher, evaluate this solution and provide feedback.</p>
            </div>

            {saveSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 rounded text-xs font-semibold">
                ✓ Evaluation status and reviewer notes saved successfully!
              </div>
            )}

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Submission Status</label>
                <select
                  value={evalStatus}
                  onChange={(e) => setEvalStatus(e.target.value as SubmissionStatus)}
                  className="w-full sm:w-64 px-3 py-2 border rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="submitted">submitted</option>
                  <option value="under_review">under_review</option>
                  <option value="shortlisted">shortlisted</option>
                  <option value="accepted">accepted</option>
                  <option value="rejected">rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Evaluator Notes & Feedback</label>
                <textarea
                  rows={3}
                  value={reviewerNotes}
                  onChange={(e) => setReviewerNotes(e.target.value)}
                  placeholder="Provide constructive feedback or next step instructions for the team..."
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow-sm transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Evaluation'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
