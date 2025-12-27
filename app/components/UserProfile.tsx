import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

type ProfileState = {
  fullName?: string;
  age?: number | string;
  height?: number | string;
  weight?: number | string;
  medicalConditions?: string[] | string;
  allergies?: string[] | string;
  activityLevel?: string;
  smokingStatus?: string;
  language?: string;
  enablePush?: boolean;
  enableVoice?: boolean;
};

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export default function UserProfileComponent() {
  const { user, token, refreshMe } = useAuth();
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState<ProfileState>({
    fullName: '',
    age: '',
    height: '',
    weight: '',
    medicalConditions: '',
    allergies: '',
    activityLevel: 'Moderate',
    smokingStatus: 'Never smoked',
    language: 'English',
    enablePush: true,
    enableVoice: true,
  });

  // prefill from auth user
  useEffect(() => {
    if (!user?.profile) return;
    const p = user.profile || {};
    setProfile({
      fullName: p.fullName ?? '',
      age: p.age ?? '',
      height: p.height ?? '',
      weight: p.weight ?? '',
      medicalConditions: Array.isArray(p.medicalConditions) ? p.medicalConditions.join(', ') : (p.medicalConditions ?? ''),
      allergies: Array.isArray(p.allergies) ? p.allergies.join(', ') : (p.allergies ?? ''),
      activityLevel: p.activityLevel ?? 'Moderate',
      smokingStatus: p.smokingStatus ?? 'Never smoked',
      language: p.language ?? 'English',
      enablePush: p.enablePush ?? true,
      enableVoice: p.enableVoice ?? true,
    });
  }, [user?.profile]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as any;
    setProfile((s) => ({ ...s, [name]: type === 'checkbox' ? checked : value }));
  };

  async function onSave() {
    if (!token) return;
    setSaving(true);
    try {
      const toList = (v: any) =>
        Array.isArray(v)
          ? v
          : typeof v === 'string'
          ? v.split(',').map((s) => s.trim()).filter(Boolean)
          : [];

      const payload = {
        ...profile,
        age: profile.age ? Number(profile.age) : undefined,
        height: profile.height ? Number(profile.height) : undefined,
        weight: profile.weight ? Number(profile.weight) : undefined,
        medicalConditions: toList(profile.medicalConditions),
        allergies: toList(profile.allergies),
      };

      const res = await fetch(`${BASE}/api/profile/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'Profile update failed');
      }

      await refreshMe();
      alert('Profile saved ✅');
    } catch (e: any) {
      alert(e?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">My Profile</h2>
          {user?.email && <p className="text-sm text-gray-500">Signed in as {user.email}</p>}
        </div>
        <button
          onClick={onSave}
          disabled={saving || !token}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      {/* Basic */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-700">Full Name</label>
          <input
            name="fullName" value={profile.fullName ?? ''} onChange={onChange}
            className="mt-1 w-full border rounded px-3 py-2 bg-white text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Language</label>
          <select
            name="language" value={profile.language ?? 'English'} onChange={onChange}
            className="mt-1 w-full border rounded px-3 py-2 bg-white text-gray-900"
          >
            <option>English</option>
            <option>Hindi</option>
          </select>
        </div>
      </div>

      {/* Numbers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-gray-700">Age</label>
          <input
            type="number" name="age" value={profile.age ?? ''} onChange={onChange}
            className="mt-1 w-full border rounded px-3 py-2 bg-white text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Height (cm)</label>
          <input
            type="number" name="height" value={profile.height ?? ''} onChange={onChange}
            className="mt-1 w-full border rounded px-3 py-2 bg-white text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Weight (kg)</label>
          <input
            type="number" name="weight" value={profile.weight ?? ''} onChange={onChange}
            className="mt-1 w-full border rounded px-3 py-2 bg-white text-gray-900"
          />
        </div>
      </div>

      {/* Lists */}
      <div>
        <label className="block text-sm text-gray-700">Medical Conditions (comma-separated)</label>
        <input
          name="medicalConditions" value={String(profile.medicalConditions ?? '')} onChange={onChange}
          placeholder="asthma, allergy"
          className="mt-1 w-full border rounded px-3 py-2 bg-white text-gray-900 placeholder-gray-500"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-700">Allergies (comma-separated)</label>
        <input
          name="allergies" value={String(profile.allergies ?? '')} onChange={onChange}
          placeholder="pollen"
          className="mt-1 w-full border rounded px-3 py-2 bg-white text-gray-900 placeholder-gray-500"
        />
      </div>

      {/* Selects */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-gray-700">Activity Level</label>
          <select
            name="activityLevel" value={profile.activityLevel ?? 'Moderate'} onChange={onChange}
            className="mt-1 w-full border rounded px-3 py-2 bg-white text-gray-900"
          >
            <option>Sedentary</option>
            <option>Light</option>
            <option>Moderate</option>
            <option>Active</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-700">Smoking Status</label>
          <select
            name="smokingStatus" value={profile.smokingStatus ?? 'Never smoked'} onChange={onChange}
            className="mt-1 w-full border rounded px-3 py-2 bg-white text-gray-900"
          >
            <option>Never smoked</option>
            <option>Former smoker</option>
            <option>Current smoker</option>
          </select>
        </div>
      </div>

      {/* Toggles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox" name="enablePush" checked={!!profile.enablePush} onChange={onChange}
          />
          <span>Enable Push Notifications</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox" name="enableVoice" checked={!!profile.enableVoice} onChange={onChange}
          />
          <span>Enable Voice Assistant</span>
        </label>
      </div>
    </div>
  );
}
