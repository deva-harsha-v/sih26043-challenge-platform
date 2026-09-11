'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getOrgProfile, updateOrgProfile } from '@/lib/api';
import { fetchCurrentUser } from '@/lib/auth';
import { OrganizationProfile, User } from '@/lib/types';
import ChallengeCard from '@/components/ChallengeCard';

export default function OrganizationProfilePage({ params }: { params: { id: string } }) {
  const [profile, setProfile] = useState<OrganizationProfile | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editFocusArea, setEditFocusArea] = useState('');
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const loadProfile = async () => {
    try {
      const u = await fetchCurrentUser();
      setUser(u);
      const p = await getOrgProfile(params.id);
      setProfile(p);
      setEditName(p.name);
      setEditDescription(p.description || '');
      setEditWebsite(p.website || '');
      setEditLocation(p.location || '');
      setEditFocusArea(p.focus_area || '');
    } catch (err: any) {
      setError(err.message || 'Organization profile not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [params.id]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setEditError(null);

    try {
      const updated = await updateOrgProfile(profile.id, {
        name: editName,
        description: editDescription,
        website: editWebsite,
        location: editLocation,
        focus_area: editFocusArea,
      });
      setProfile(updated);
      setIsEditing(false);
    } catch (err: any) {
      setEditError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-gray-500">Loading organization profile...</div>;
  }

  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <h2 className="text-xl font-bold text-gray-800">Organization Profile Not Found</h2>
        <p className="text-sm text-gray-500 mt-2">{error}</p>
        <Link href="/challenges" className="mt-4 inline-block text-indigo-600 font-medium">
          ← Back to Challenges
        </Link>
      </div>
    );
  }

  const isOwner = user && (user.id === profile.user_id || user.org_name === profile.name || user.role === 'admin');

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 space-y-8">
      <div>
        <Link href="/challenges" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
          ← Back to Challenges
        </Link>
      </div>

      {/* Header Banner */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-6 gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-xl bg-purple-100 text-purple-700 font-extrabold text-2xl flex items-center justify-center border border-purple-200 shadow-inner">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-extrabold text-gray-900">{profile.name}</h1>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 uppercase">
                  Industry Organization
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {profile.location ? `📍 ${profile.location}` : 'Location Not Specified'}
                {profile.website && (
                  <span className="ml-3">
                    🌐 <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-semibold hover:underline">{profile.website}</a>
                  </span>
                )}
              </p>
            </div>
          </div>

          {isOwner && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
            >
              ✏️ Edit Profile
            </button>
          )}
        </div>

        {/* Metadata Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
          <div>
            <span className="block text-xs text-gray-500 font-medium">Industry Sector / Focus Area</span>
            <span className="font-semibold text-sm text-gray-800">{profile.focus_area || 'General Industry'}</span>
          </div>
          <div>
            <span className="block text-xs text-gray-500 font-medium">Member Since</span>
            <span className="font-semibold text-sm text-gray-800">{new Date(profile.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">About Organization</h3>
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
            {profile.description || 'No detailed organization overview provided yet.'}
          </p>
        </div>

        {/* Posted Challenges Roster */}
        <div className="pt-6 border-t">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Published Challenges ({profile.challenges.length})
          </h3>

          {profile.challenges.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-6 text-center text-sm text-gray-500 border border-dashed">
              No challenges posted by this organization yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profile.challenges.map((c) => (
                <ChallengeCard key={c.id} challenge={c} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Organization Profile</h2>

            {editError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm mb-4">
                {editError}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Organization Name *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Industry Sector / Focus Area</label>
                <input
                  type="text"
                  value={editFocusArea}
                  onChange={(e) => setEditFocusArea(e.target.value)}
                  placeholder="e.g. Healthcare, Manufacturing, AI"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Location (City, Country)</label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  placeholder="e.g. San Francisco, CA"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Website URL</label>
                <input
                  type="url"
                  value={editWebsite}
                  onChange={(e) => setEditWebsite(e.target.value)}
                  placeholder="https://organization.com"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Overview Description</label>
                <textarea
                  rows={4}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Describe your organization's mission and technical focus..."
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
