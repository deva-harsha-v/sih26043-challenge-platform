'use client';

import { useState } from 'react';
import { submitSolution } from '@/lib/api';
import { Submission } from '@/lib/types';

interface SubmissionFormProps {
  teamId: number;
  challengeId: number;
  existingSubmission?: Submission | null;
  onSuccess: (submission: Submission) => void;
}

export default function SubmissionForm({ teamId, challengeId, existingSubmission, onSuccess }: SubmissionFormProps) {
  const [title, setTitle] = useState(existingSubmission?.title || '');
  const [description, setDescription] = useState(existingSubmission?.description || '');
  const [documentUrl, setDocumentUrl] = useState(existingSubmission?.document_url || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const sub = await submitSolution({
        title,
        description,
        document_url: documentUrl.trim() || undefined,
        team_id: teamId,
        challenge_id: challengeId,
      });
      onSuccess(sub);
    } catch (err: any) {
      setError(err.message || 'Failed to submit solution');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
      <div className="border-b pb-3 mb-4">
        <h3 className="font-bold text-lg text-gray-900">
          {existingSubmission ? '✏️ Update Solution Submission' : '🚀 Submit Project Solution'}
        </h3>
        <p className="text-xs text-gray-500">
          {existingSubmission
            ? 'Resubmitting will update your team’s solution details.'
            : 'Submit your team’s project description, documentation, and repository link.'}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Solution Title *</label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Autonomous Vision AI Engine v1.0"
          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Detailed Description & Methodology *</label>
        <textarea
          required
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Explain your approach, architecture, algorithm, performance metrics, and results..."
          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Repository / Documentation URL (Optional)</label>
        <input
          type="url"
          value={documentUrl}
          onChange={(e) => setDocumentUrl(e.target.value)}
          placeholder="https://github.com/your-org/your-repo or https://demo-link.com"
          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow-sm transition disabled:opacity-50"
        >
          {loading ? 'Submitting...' : existingSubmission ? 'Update Submission' : 'Submit Solution'}
        </button>
      </div>
    </form>
  );
}
