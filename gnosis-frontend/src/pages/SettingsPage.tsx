import { useState } from 'react';
import { Copy, Download, Trash2, Sparkles, HelpCircle } from 'lucide-react';
import { useProfile } from '../hooks';

export default function SettingsPage() {
  const { profile, save } = useProfile();
  const [name, setName]           = useState(profile?.name ?? 'Kofi Mensah');
  const [university, setUniversity] = useState(profile?.university ?? 'University of Ghana');
  const [pref, setPref]           = useState<'socratic' | 'explanatory' | 'mixed'>(profile?.study_preference ?? 'socratic');
  const [appearance, setAppearance] = useState<'light' | 'dark' | 'system'>('light');
  const [saved, setSaved]         = useState(false);

  const handleSave = async () => {
    await save({ name, university, study_preference: pref });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const initials = name.slice(0, 2).toUpperCase();

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-[22px] font-semibold text-[#1A1714]">Preferences & Configuration</h2>
        <p className="text-[13px] text-[#6B6560] mt-1 max-w-md">
          Tailor your academic archive experience and manage your Model Context Protocol (MCP) connections for personalized AI tutoring.
        </p>
      </div>

      <div className="grid grid-cols-[1fr_300px] gap-5 items-start">

        {/* ── Left column ── */}
        <div className="space-y-4">

          {/* Student Profile */}
          <div className="bg-white border border-[#E5DDD5] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[14px] font-semibold text-[#1A1714]">Student Profile</h3>
              <button className="text-[#9E9890] hover:text-[#6B6560] transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            </div>

            {/* Avatar + name */}
            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-14 h-14 rounded-full bg-[#D4C5A9] flex items-center justify-center text-[18px] font-semibold text-[#5C4A2A]">
                {initials}
              </div>
              <div>
                <p className="text-[16px] font-semibold text-[#1A1714]">{name}</p>
                <p className="text-[12px] text-[#9E9890]">{university}</p>
              </div>
            </div>

            {/* Form fields */}
            <div className="space-y-3 mb-5">
              <div>
                <label className="text-[10px] uppercase tracking-[1px] text-[#9E9890] block mb-1.5">Display name</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2.5 border border-[#E5DDD5] rounded-xl text-[13px] text-[#1A1714] outline-none focus:border-[#C49A3C] bg-white transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[1px] text-[#9E9890] block mb-1.5">University</label>
                <input
                  value={university}
                  onChange={e => setUniversity(e.target.value)}
                  className="w-full px-3 py-2.5 border border-[#E5DDD5] rounded-xl text-[13px] text-[#1A1714] outline-none focus:border-[#C49A3C] bg-white transition-colors"
                />
              </div>
            </div>

            {/* Study style */}
            <div>
              <p className="text-[10px] uppercase tracking-[1px] text-[#9E9890] mb-2">Study Style Preference</p>
              <div className="flex gap-2 mb-2">
                {(['socratic', 'explanatory', 'mixed'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setPref(p)}
                    className={`flex-1 py-2 rounded-full text-[12px] font-medium border transition-all capitalize ${
                      pref === p
                        ? 'bg-[#1C1C2E] text-white border-[#1C1C2E]'
                        : 'bg-white text-[#6B6560] border-[#E5DDD5] hover:border-[#C4BDB6]'
                    }`}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-[#9E9890] leading-relaxed">
                {pref === 'socratic'    && 'Socratic mode prioritizes guided questioning to help you reach conclusions independently.'}
                {pref === 'explanatory' && 'Explanatory mode gives you direct, clear answers and detailed explanations.'}
                {pref === 'mixed'       && 'Mixed mode adapts between Socratic and explanatory based on the topic.'}
              </p>
            </div>

            <button
              onClick={handleSave}
              className="mt-5 w-full py-2.5 bg-[#1C1C2E] text-white text-[13px] font-semibold rounded-xl hover:bg-[#2D2D42] transition-colors"
            >
              {saved ? '✓ Saved!' : 'Save Changes'}
            </button>
          </div>

          {/* Storage & Data */}
          <div className="bg-white border border-[#E5DDD5] rounded-2xl p-5">
            <h3 className="text-[14px] font-semibold text-[#1A1714] mb-4">Storage & Data</h3>
            <div className="flex items-center justify-between text-[12px] text-[#6B6560] mb-1.5">
              <span>Archive Storage</span>
              <span className="text-[#9E9890]">4.2 GB / 10 GB</span>
            </div>
            <div className="h-1.5 bg-[#EDE8E0] rounded-full mb-4 overflow-hidden">
              <div className="h-1.5 rounded-full bg-[#1C1C2E]" style={{ width: '42%' }} />
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-1.5 px-4 py-2 border border-[#E5DDD5] text-[12px] text-[#1A1714] font-medium rounded-xl hover:bg-[#F5F0EA] transition-colors">
                <Download size={13} strokeWidth={1.5} />
                Export Data
              </button>
              <button className="flex items-center gap-1.5 px-4 py-2 border border-red-200 text-[12px] text-red-600 font-medium rounded-xl hover:bg-red-50 transition-colors">
                <Trash2 size={13} strokeWidth={1.5} />
                Clear Data
              </button>
            </div>
          </div>

          {/* Appearance */}
          <div className="bg-white border border-[#E5DDD5] rounded-2xl p-5">
            <h3 className="text-[14px] font-semibold text-[#1A1714] mb-4">Appearance</h3>
            <div className="flex items-center gap-2 p-1 bg-[#F5F0EA] rounded-xl">
              {(['light', 'dark', 'system'] as const).map(a => (
                <button
                  key={a}
                  onClick={() => setAppearance(a)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-medium transition-all capitalize ${
                    appearance === a
                      ? 'bg-white text-[#1A1714] shadow-sm'
                      : 'text-[#6B6560] hover:text-[#1A1714]'
                  }`}
                >
                  {a === 'light'  && '☀'}
                  {a === 'dark'   && '🌙'}
                  {a === 'system' && '💻'}
                  {a.charAt(0).toUpperCase() + a.slice(1)}
                </button>
              ))}
              <span className="text-[10px] text-[#9E9890] ml-1 whitespace-nowrap hidden sm:block">Interface dynamic theme</span>
            </div>
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="space-y-4">

          {/* MCP Server Status — dark card */}
          <div className="bg-[#1C1C2E] rounded-2xl p-5 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#4A7C59] inline-block" />
                <span className="text-[10px] uppercase tracking-[1.5px] text-[#4ADE80] font-semibold">Connected</span>
              </div>
              <button className="w-7 h-7 rounded-lg bg-[#2D2D42] flex items-center justify-center text-[#9E9890] hover:bg-[#3D3D52] transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="3" /><circle cx="19" cy="5" r="2" /><circle cx="5" cy="19" r="2" />
                  <line x1="12" y1="9" x2="19" y2="7" /><line x1="12" y1="15" x2="5" y2="17" />
                </svg>
              </button>
            </div>

            <h3 className="text-[16px] font-semibold mb-3">MCP Server Status</h3>

            <p className="text-[9px] uppercase tracking-[1.2px] text-[#8585A0] mb-1.5">Server URL</p>
            <div className="flex items-center gap-2 bg-[#2D2D42] rounded-xl px-3 py-2 mb-4">
              <span className="text-[11px] font-mono text-[#C4BDB6] flex-1 truncate">gnosis-mcp.local:8080/v1/c...</span>
              <button className="text-[#8585A0] hover:text-white transition-colors shrink-0">
                <Copy size={12} strokeWidth={1.5} />
              </button>
            </div>

            <div>
              <p className="text-[11px] font-semibold text-white mb-2.5">ℹ Setup Instructions</p>
              <ol className="space-y-2">
                {[
                  'Download the Gnosis Desktop Bridge to enable local file indexing.',
                  'Copy the unique Server URL into your LLM client configuration.',
                  'Refresh this dashboard to confirm active synchronization.',
                ].map((step, i) => (
                  <li key={i} className="flex gap-2.5 text-[11px] text-[#C4BDB6] leading-relaxed">
                    <span className="text-[#8585A0] shrink-0 font-medium">{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Tutor Intelligence */}
          <div className="bg-white border border-[#E5DDD5] rounded-2xl p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles size={13} className="text-[#C49A3C]" strokeWidth={1.5} />
              <span className="text-[11px] font-semibold text-[#1A1714]">Tutor Intelligence</span>
            </div>
            <p className="text-[12px] text-[#6B6560] leading-relaxed">
              Your tutor is currently optimized for{' '}
              <span className="font-semibold italic text-[#1A1714]">Philosophical inquiry</span>
              {' '}based on your recent 12 uploads from the University of Ghana.
            </p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-[#E5DDD5] rounded-2xl p-4">
              <div className="text-[9px] uppercase tracking-[1px] text-[#9E9890] mb-1">
                <svg className="inline w-3 h-3 mr-1 text-[#9E9890]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path d="M8 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-3M17 3l4 4-4 4M13 7h8" />
                </svg>
              </div>
              <p className="text-[28px] font-bold text-[#1A1714] leading-none">98%</p>
              <p className="text-[9px] uppercase tracking-[1px] text-[#9E9890] mt-1">Accuracy Rank</p>
            </div>
            <div className="bg-[#FBF4E1] border border-[#E8D8A0] rounded-2xl p-4">
              <div className="w-7 h-7 rounded-full bg-[#F5E6C8] flex items-center justify-center mb-2">
                <HelpCircle size={13} className="text-[#C49A3C]" strokeWidth={1.5} />
              </div>
              <p className="text-[28px] font-bold text-[#1A1714] leading-none">4.2k</p>
              <p className="text-[9px] uppercase tracking-[1px] text-[#B8860B] mt-1">Nodes Linked</p>
            </div>
          </div>

          {/* Need Technical Assistance */}
          <div className="bg-white border border-[#E5DDD5] rounded-2xl p-5 text-center">
            <div className="w-10 h-10 rounded-full bg-[#F0EBE3] flex items-center justify-center mx-auto mb-3">
              <HelpCircle size={18} className="text-[#9E9890]" strokeWidth={1.5} />
            </div>
            <h4 className="text-[14px] font-semibold text-[#1A1714] mb-1.5">Need Technical Assistance?</h4>
            <p className="text-[12px] text-[#6B6560] leading-relaxed mb-4">
              Our university relations team is available for MCP integration support.
            </p>
            <button className="w-full py-2.5 border border-[#E5DDD5] text-[13px] text-[#1A1714] font-medium rounded-xl hover:bg-[#F5F0EA] transition-colors">
              Contact Support
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
