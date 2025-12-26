"use client";

import { useEffect, useState } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  Node,
  Edge,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ExternalLink, Folder, FileText } from "lucide-react";

import { generateRepoVisualization } from ".";
import { LuLightbulb, LuX } from "react-icons/lu";

function FolderNode({ data }: any) {
  const isRoot = data.level === 0;

  const getFolderColor = (name: string): string => {
    const colorMap: { [key: string]: string } = {
      src: "#D33434",
      app: "#354FD4",
      api: "#10b981",
      components: "#5E80DC",
      lib: "#5E80DC",
      utils: "#5E80DC",
      public: "#49AE35",
      styles: "#5E80DC",
      config: "#5E80DC",
      types: "#5E80DC",
      hooks: "#5E80DC",
      services: "#5E80DC",
      routes: "#5E80DC",
      middleware: "#5E80DC",
    };
    return colorMap[name.toLowerCase()] || "#5E80DC";
  };

  const color = getFolderColor(data.label);

  return (
    <div
      className="group relative"
      style={{
        width: isRoot ? "250px" : "220px",
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: color,
          width: 10,
          height: 10,
          border: "2px solid white",
        }}
      />

      <div
        className="rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
        style={{
          border: `3px solid ${color}`,
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        }}
        onClick={() => window.open(data.githubUrl, "_blank")}
      >
        <div
          className="px-4 py-2 flex items-center gap-2"
          style={{
            background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
            borderBottom: `2px solid ${color}20`,
          }}
        >
          <Folder className="shrink-0" size={20} style={{ color: color }} />
          <div className="flex-1 min-w-0">
            <div
              className="font-bold text-sm truncate capitalize"
              style={{
                color: color,
                fontSize: isRoot ? "18px" : "15px",
              }}
            >
              {data.label}
            </div>
          </div>
          <ExternalLink
            className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            size={14}
            style={{ color: color }}
          />
        </div>

        {/* Body */}
        <div className="px-4 py-3 space-y-2">
          {/* File count */}
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-700">
              {data.fileCount} file{data.fileCount !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Path */}
          <div
            className="text-sm text-accent truncate font-mono tracking-tight"
            style={{
              background: "#f1f5f9",
              padding: "4px 8px",
              borderRadius: "4px",
            }}
          >
            {data.path || "/"}
          </div>
        </div>

        {/* Hover effect overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${color}10 0%, transparent 100%)`,
          }}
        />
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: color,
          width: 10,
          height: 10,
          border: "2px solid white",
        }}
      />
    </div>
  );
}

const nodeTypes = {
  custom: FolderNode,
};

interface RepoVisualizerProps {
  owner: string;
  repo: string;
}

export default function RepoVisualizer({ owner, repo }: RepoVisualizerProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);

        const data = await generateRepoVisualization(owner, repo);

        if (!data.nodes || data.nodes.length === 0) {
          console.warn("⚠️ No nodes received!");
        }

        setNodes(data.nodes || []);
        setEdges(data.edges || []);
      } catch (err) {
        console.error("❌ Error loading visualization:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [owner, repo]);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600 mx-auto"></div>
            <Folder
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-600"
              size={24}
            />
          </div>
          <p className="mt-4 text-lg font-semibold text-gray-700">
            Analyzing repository structure...
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {owner}/{repo}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
        <div className="text-center max-w-md bg-white rounded-xl shadow-xl p-8">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Failed to Load Repository
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <p className="text-gray-500">No folders to display</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white">
      {/* Header */}
      <div className="absolute top-3 left-3 z-10 bg-gray-100 rounded-md shadow-md p-3 max-w-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-800 rounded-lg">
            <Folder className="text-white" size={20} />
          </div>
          <div>
            <h2 className="font-medium text-sm text-accent">{repo}</h2>
            <p className="text-xs italic text-gray-500">{owner}</p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span className="font-medium">{nodes.length} folders</span>
            <span className="font-medium">{edges.length} connections</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute top-4 right-4 z-50">
        {/* CLOSED STATE (CIRCLE) */}
        {!open && (
          <button
            onClick={() => setOpen(true)}
            className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
          >
            <LuLightbulb size={18} />
          </button>
        )}

        {/* OPEN STATE (LEGEND) */}
        {open && (
          <div
            className="
            w-64 bg-gray-100 rounded-lg shadow-xl p-4
            animate-in fade-in slide-in-from-top-2 duration-200
          "
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-sm text-gray-800 flex items-center gap-1">
                <LuLightbulb />
                Quick Guide
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                <LuX size={16} />
              </button>
            </div>

            {/* Content */}
            <ul className="space-y-2 text-xs text-gray-600">
              <li>📁 Click any folder to view on GitHub</li>
              <li>🖱️ Scroll to zoom in / out</li>
              <li>✋ Drag to pan around</li>
              <li>💬 Click on Chat to open a conversation</li>
            </ul>
          </div>
        )}
      </div>

      {/* React Flow */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{
          padding: 0.3,
          minZoom: 0.5,
          maxZoom: 1,
        }}
        minZoom={0.2}
        maxZoom={1.5}
      >
        <Controls className="bg-white rounded-lg shadow-lg" />
        <MiniMap
          className="bg-white rounded-lg shadow-lg border-2 border-gray-200"
          nodeColor={(node) => {
            const name = (node?.data?.label as string)?.toLowerCase();
            const colors: { [key: string]: string } = {
              src: "#D33434",
              app: "#354FD4",
              api: "#49AE35",
              components: "#5E80DC",
              lib: "#5E80DC",
              utils: "#5E80DC",
              ui: "#5E80DC",
              functions: "#5E80DC",
              public: "#49AE35",
            };
            return colors[name] || "#5E80DC";
          }}
        />
        <Background
          variant={BackgroundVariant.Dots}
          gap={16}
          size={1}
          color="#fff"
        />
      </ReactFlow>
    </div>
  );
}
