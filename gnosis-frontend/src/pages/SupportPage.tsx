import { HelpCircle, Mail, Book, MessageSquare, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

const FAQS = [
  {
    q: 'How do I connect Gnosis to Claude Desktop?',
    a: 'Go to MCP Status in the sidebar, copy the config snippet, and paste it into your Claude Desktop config file at ~/.config/claude/config.json. Then restart Claude Desktop.',
  },
  {
    q: 'Why is my MCP server showing as disconnected?',
    a: 'Ensure the backend server is running on port 8001. You can start it with: python backend/mcp/server.py. Then click Refresh in the MCP Status page.',
  },
  {
    q: 'How do I export my notes and data?',
    a: 'Go to Settings → Storage & Data and click "Export Data". Your archive will be packaged as a ZIP file for download.',
  },
  {
    q: 'Can I change my study style preference?',
    a: 'Yes. Go to Settings, scroll to Study Style Preference, and select Socratic, Explanatory, or Mixed. Save your changes.',
  },
  {
    q: 'How does knowledge gap detection work?',
    a: 'Gnosis analyzes your uploaded documents and cross-references topics across courses. When a topic appears in course materials but has no corresponding notes or study activity, it is flagged as a gap.',
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-[#E5DDD5] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left bg-white hover:bg-[#F5F0EA] transition-colors"
      >
        <span className="text-[13px] font-medium text-[#1A1714] pr-4">{q}</span>
        {open ? <ChevronUp size={14} className="text-[#9E9890] shrink-0" /> : <ChevronDown size={14} className="text-[#9E9890] shrink-0" />}
      </button>
      {open && (
        <div className="px-4 py-3 bg-[#FAFAF8] border-t border-[#E5DDD5]">
          <p className="text-[12px] text-[#6B6560] leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function SupportPage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-[22px] font-semibold text-[#1A1714]">Support</h2>
        <p className="text-[13px] text-[#6B6560] mt-1 max-w-md">
          Get help with Gnosis, troubleshoot MCP connections, and reach our support team.
        </p>
      </div>

      <div className="grid grid-cols-[1fr_280px] gap-5 items-start">

        {/* Left — FAQ */}
        <div>
          <p className="text-[11px] uppercase tracking-[1.2px] text-[#9E9890] font-medium mb-3">Frequently Asked Questions</p>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>

        {/* Right — Contact cards */}
        <div className="space-y-3">

          {/* Email */}
          <div className="bg-white border border-[#E5DDD5] rounded-2xl p-5">
            <div className="w-9 h-9 rounded-full bg-[#EDE8E0] flex items-center justify-center mb-3">
              <Mail size={15} className="text-[#6B6560]" strokeWidth={1.5} />
            </div>
            <h4 className="text-[13px] font-semibold text-[#1A1714] mb-1">Email Support</h4>
            <p className="text-[12px] text-[#6B6560] leading-relaxed mb-3">
              University relations and technical MCP support.
            </p>
            <a
              href="mailto:support@gnosis.app"
              className="text-[12px] text-[#1D9E75] font-medium hover:underline"
            >
              support@gnosis.app
            </a>
          </div>

          {/* Docs */}
          <div className="bg-white border border-[#E5DDD5] rounded-2xl p-5">
            <div className="w-9 h-9 rounded-full bg-[#EDE8E0] flex items-center justify-center mb-3">
              <Book size={15} className="text-[#6B6560]" strokeWidth={1.5} />
            </div>
            <h4 className="text-[13px] font-semibold text-[#1A1714] mb-1">Documentation</h4>
            <p className="text-[12px] text-[#6B6560] leading-relaxed mb-3">
              Full setup guides for MCP, Claude Desktop integration, and data management.
            </p>
            <button className="flex items-center gap-1 text-[12px] text-[#1D9E75] font-medium hover:underline">
              View docs <ExternalLink size={11} />
            </button>
          </div>

          {/* Community */}
          <div className="bg-[#1C1C2E] rounded-2xl p-5 text-white">
            <div className="w-9 h-9 rounded-full bg-[#2D2D42] flex items-center justify-center mb-3">
              <MessageSquare size={15} className="text-[#8585A0]" strokeWidth={1.5} />
            </div>
            <h4 className="text-[13px] font-semibold mb-1">Community Forum</h4>
            <p className="text-[12px] text-[#8585A0] leading-relaxed mb-3">
              Join other students and share tips on maximizing your archive.
            </p>
            <button className="flex items-center gap-1 text-[12px] text-[#4ADE80] font-medium hover:underline">
              Join forum <ExternalLink size={11} />
            </button>
          </div>

          {/* Version */}
          <div className="px-4 py-3 bg-[#F5F0EA] rounded-xl">
            <div className="flex items-center gap-1.5 mb-0.5">
              <HelpCircle size={11} className="text-[#9E9890]" strokeWidth={1.5} />
              <span className="text-[10px] uppercase tracking-[1px] text-[#9E9890] font-medium">Version Info</span>
            </div>
            <p className="text-[12px] text-[#6B6560]">Gnosis v1.0.0 · MCP Protocol 2.1</p>
          </div>
        </div>
      </div>
    </div>
  );
}
