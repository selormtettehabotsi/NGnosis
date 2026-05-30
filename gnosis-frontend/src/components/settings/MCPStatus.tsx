import { Terminal, RefreshCw } from 'lucide-react';
import { useState } from 'react';

const MCP_TOOLS = ['search_notes', 'get_document', 'write_to_kb', 'get_student_profile'];

export default function MCPStatus() {
  const [checking, setChecking] = useState(false);
  const [status, _setStatus] = useState<'connected' | 'disconnected'>('connected');

  const recheck = async () => {
    setChecking(true);
    // In prod: ping backend /api/mcp/status
    await new Promise(r => setTimeout(r, 800));
    setChecking(false);
  };

  return (
    <div>
      <div className="bg-white border border-gray-100 rounded-xl p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full inline-block ${status === 'connected' ? 'bg-[#1D9E75]' : 'bg-red-400'}`} />
            <p className={`text-[13px] font-medium ${status === 'connected' ? 'text-[#0F6E56]' : 'text-red-600'}`}>
              {status === 'connected' ? 'Connected to Claude Desktop' : 'Not connected'}
            </p>
          </div>
          <button
            onClick={recheck}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={checking}
          >
            <RefreshCw size={13} className={checking ? 'animate-spin' : ''} />
          </button>
        </div>

        <p className="text-[12px] text-gray-500 mb-4 leading-relaxed">
          {MCP_TOOLS.length} tools active. Claude can search your notes, retrieve documents, write insights back, and read your student profile.
        </p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {MCP_TOOLS.map(tool => (
            <span key={tool} className="text-[11px] px-2 py-0.5 bg-[#E1F5EE] text-[#0F6E56] rounded-full font-medium">
              {tool}
            </span>
          ))}
        </div>

        <div className="bg-gray-50 rounded-lg px-3 py-2.5 font-mono text-[11px] text-gray-500 flex items-center gap-2">
          <Terminal size={12} />
          gnosis-mcp://localhost:8001
        </div>
      </div>

      <p className="text-[12px] font-medium text-gray-400 uppercase tracking-[0.6px] mb-3">Connect Claude Desktop</p>
      <div className="bg-white border border-gray-100 rounded-xl p-5">
        <p className="text-[12px] text-gray-500 mb-3 leading-relaxed">
          Add this to your Claude Desktop config at{' '}
          <code className="text-[11px] bg-gray-100 px-1.5 py-0.5 rounded">~/.config/claude/config.json</code>:
        </p>
        <pre className="bg-gray-50 rounded-lg p-3 text-[11px] text-gray-600 font-mono overflow-x-auto leading-relaxed">{`{
  "mcpServers": {
    "gnosis": {
      "command": "python",
      "args": ["backend/mcp/server.py"]
    }
  }
}`}</pre>
        <button
          onClick={() => navigator.clipboard.writeText(`{"mcpServers":{"gnosis":{"command":"python","args":["backend/mcp/server.py"]}}}`)}
          className="mt-3 text-[12px] text-[#1D9E75] hover:underline font-medium"
        >
          Copy config snippet
        </button>
      </div>
    </div>
  );
}
