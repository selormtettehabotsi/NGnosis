import { useEffect, useState } from "react";
import { settingsApi } from "../../lib/api";

const FIELDS = [
  { key: "theme", label: "Theme", options: ["dark", "light"] },
  { key: "claude_model", label: "Claude Model", options: ["claude-sonnet-4-6", "claude-opus-4-6", "claude-haiku-4-5-20251001"] },
  { key: "tutor_style", label: "Tutor Style", options: ["socratic", "direct", "quiz"] },
];

export default function Settings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    settingsApi.getAll().then(setSettings);
  }, []);

  const update = async (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    await settingsApi.set(key, value);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="max-w-lg space-y-6">
      {saved && (
        <div className="text-sm text-green-400 bg-green-900/20 border border-green-800 rounded-md px-3 py-2">
          Settings saved.
        </div>
      )}

      {FIELDS.map(({ key, label, options }) => (
        <div key={key}>
          <label className="text-sm font-medium text-zinc-300">{label}</label>
          <select
            value={settings[key] ?? ""}
            onChange={(e) => update(key, e.target.value)}
            className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {options.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>
      ))}

      <div>
        <label className="text-sm font-medium text-zinc-300">Chunk Size (chars)</label>
        <input
          type="number"
          value={settings["chunk_size"] ?? "512"}
          onChange={(e) => update("chunk_size", e.target.value)}
          className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
    </div>
  );
}
