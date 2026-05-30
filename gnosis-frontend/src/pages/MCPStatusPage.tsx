import MCPStatus from '../components/settings/MCPStatus';

export default function MCPStatusPage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-[22px] font-semibold text-[#1A1714]">MCP Server Status</h2>
        <p className="text-[13px] text-[#6B6560] mt-1 max-w-md">
          Monitor your Model Context Protocol connection and configure Claude Desktop integration.
        </p>
      </div>
      <div className="max-w-xl">
        <MCPStatus />
      </div>
    </div>
  );
}
