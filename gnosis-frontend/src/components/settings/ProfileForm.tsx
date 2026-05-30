import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { StudentProfile } from '../../lib/types';

interface Props {
  profile: StudentProfile;
  onSave: (data: Partial<StudentProfile>) => Promise<void>;
}

export default function ProfileForm({ profile, onSave }: Props) {
  const [name, setName] = useState(profile.name);
  const [university, setUniversity] = useState(profile.university);
  const [pref, setPref] = useState<StudentProfile['study_preference']>(profile.study_preference);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ name, university, study_preference: pref });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const initials = name.slice(0, 2).toUpperCase();

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5">
      {/* Avatar */}
      <div className="flex items-center gap-3.5 mb-5 pb-5 border-b border-gray-100">
        <div className="w-12 h-12 rounded-full bg-[#E1F5EE] flex items-center justify-center text-[16px] font-medium text-[#0F6E56]">
          {initials}
        </div>
        <div>
          <p className="text-[14px] font-medium text-gray-900">{name}</p>
          <p className="text-[12px] text-gray-400">{university}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-[11px] text-gray-400 block mb-1.5 font-medium uppercase tracking-[0.5px]">Display name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] text-gray-800 outline-none focus:border-[#5DCAA5] transition-colors"
          />
        </div>
        <div>
          <label className="text-[11px] text-gray-400 block mb-1.5 font-medium uppercase tracking-[0.5px]">University</label>
          <input
            value={university}
            onChange={e => setUniversity(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] text-gray-800 outline-none focus:border-[#5DCAA5] transition-colors"
          />
        </div>
        <div>
          <label className="text-[11px] text-gray-400 block mb-1.5 font-medium uppercase tracking-[0.5px]">Study preference</label>
          <select
            value={pref}
            onChange={e => setPref(e.target.value as typeof pref)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] text-gray-800 outline-none focus:border-[#5DCAA5] bg-white transition-colors"
          >
            <option value="socratic">Socratic — guided questions</option>
            <option value="explanatory">Explanatory — direct answers</option>
            <option value="mixed">Mixed</option>
          </select>
          <p className="text-[11px] text-gray-400 mt-1.5">
            {pref === 'socratic' && 'Claude will guide you with questions instead of giving direct answers.'}
            {pref === 'explanatory' && 'Claude will explain concepts directly when you ask.'}
            {pref === 'mixed' && 'Claude will adapt its style based on the question type.'}
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-2 bg-[#1D9E75] text-white text-[13px] font-medium rounded-lg hover:bg-[#0F6E56] disabled:opacity-60 transition-all flex items-center justify-center gap-2"
        >
          {saved ? <><CheckCircle2 size={14} /> Saved!</> : saving ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </div>
  );
}
