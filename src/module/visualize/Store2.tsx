"use client";

import { useCallback, useEffect, useState } from "react";
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
import {
  ExternalLink,
  Folder,
  FileText,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

import { generateRepoVisualization } from ".";
import { LuLightbulb, LuX } from "react-icons/lu";
import { useTheme } from "next-themes";
import { Separator } from "@/components/ui/separator";

function FolderNode({ data }: any) {
  const isRoot = data.level === 0;
  const { isCollapsible, isCollapsed, onToggleCollapse } = data;

  const getFolderColor = (name: string): string => {
    const colorMap: { [key: string]: string } = {
      src: "#86A5E7",
      app: "#86A5E7",
    };
    return colorMap[name.toLowerCase()] || "#DEE3FF";
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
        className="cursor-pointer overflow-hidden rounded-lg bg-linear-to-br from-gray-900 to-black p-1 shadow-lg transition-all"
        style={{
          border: `1px dashed ${color}`,
        }}
      >
        <div className="flex items-center gap-2 px-4 py-2">
          {/* Collapse/Expand Button */}
          {isCollapsible && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleCollapse?.();
              }}
              className="shrink-0 rounded p-1 transition-colors hover:bg-gray-800"
              title={isCollapsed ? "Expand children" : "Collapse children"}
            >
              {isCollapsed ? (
                <ChevronRight size={20} className="text-red-400" />
              ) : (
                <ChevronDown size={20} className="text-red-400" />
              )}
            </button>
          )}

          <Folder
            className="shrink-0"
            size={20}
            style={{ color: isCollapsed ? "#9CA3AF" : color }}
          />

          <div
            className="min-w-0 flex-1"
            onClick={() => window.open(data.githubUrl, "_blank")}
          >
            <div
              className="truncate text-sm font-bold text-white capitalize"
              style={{
                fontSize: isRoot ? "18px" : "15px",
              }}
            >
              {data.label}
            </div>
          </div>

          <ExternalLink
            className="shrink-0 cursor-pointer opacity-0 transition-opacity group-hover:opacity-100"
            size={14}
            style={{ color: color }}
            onClick={(e) => {
              e.stopPropagation();
              window.open(data.githubUrl, "_blank");
            }}
          />
        </div>

        <Separator
          orientation="horizontal"
          className="mx-auto my-1 h-px bg-gray-600"
        />

        {/* Body */}
        <div className="space-y-2 px-4 py-3">
          {/* File count */}
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-gray-400" />
            <span className="text-muted-foreground text-sm font-medium">
              {data.fileCount} file{data.fileCount !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Path */}
          <div
            className="text-accent truncate font-mono text-sm tracking-tight"
            style={{
              background: "#f1f5f9",
              padding: "4px 8px",
              borderRadius: "4px",
            }}
          >
            {data.path || "/"}
          </div>

          {/* Collapsed Indicator */}
          {isCollapsed && (
            <div className="flex items-center gap-1.5 pt-1">
              <span className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-400">
                Children hidden
              </span>
            </div>
          )}
        </div>

        {/* Hover effect overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
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

export default function RepoVisualizer3({ owner, repo }: RepoVisualizerProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const { theme } = useTheme();

  // Track collapsed state for each node individually
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());

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
  }, [owner, repo, setNodes, setEdges]);

  // Get ALL descendants recursively (children, grandchildren, etc.)
  const getAllDescendants = useCallback(
    (nodeId: string, edgeList: Edge[]): string[] => {
      const directChildren = edgeList
        .filter((edge) => edge.source === nodeId)
        .map((edge) => edge.target);

      const allDescendants = [...directChildren];

      // Recursively get descendants of each child
      directChildren.forEach((childId) => {
        allDescendants.push(...getAllDescendants(childId, edgeList));
      });

      return allDescendants;
    },
    []
  );

  // Check if a node should be hidden (if any ancestor is collapsed)
  const isNodeHidden = useCallback(
    (nodeId: string, edgeList: Edge[], collapsed: Set<string>): boolean => {
      // Find all parent nodes (nodes that have this node as target)
      const parents = edgeList
        .filter((edge) => edge.target === nodeId)
        .map((edge) => edge.source);

      // If any parent is collapsed, this node should be hidden
      for (const parentId of parents) {
        if (collapsed.has(parentId)) {
          return true;
        }
        // Recursively check if any ancestor is collapsed
        if (isNodeHidden(parentId, edgeList, collapsed)) {
          return true;
        }
      }

      return false;
    },
    []
  );

  // Check if a node has children
  const hasChildren = useCallback(
    (nodeId: string): boolean => {
      return edges.some((edge) => edge.source === nodeId);
    },
    [edges]
  );

  // Toggle collapse for a specific node (only affects direct children)
  const toggleNodeCollapse = (nodeId: string) => {
    setCollapsedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  // Update nodes with collapse state and callbacks
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        const nodeHasChildren = edges.some((edge) => edge.source === node.id);
        const isCollapsed = collapsedNodes.has(node.id);
        const shouldHide = isNodeHidden(node.id, edges, collapsedNodes);

        return {
          ...node,
          data: {
            ...node.data,
            isCollapsible: nodeHasChildren,
            isCollapsed,
            onToggleCollapse: () => toggleNodeCollapse(node.id),
          },
          // Hide if any ancestor is collapsed
          hidden: shouldHide,
        };
      })
    );
  }, [collapsedNodes, edges, isNodeHidden, setNodes]);

  // Update edges visibility - hide if source OR target is hidden
  useEffect(() => {
    setEdges((eds) =>
      eds.map((edge) => {
        const sourceHidden = isNodeHidden(edge.source, edges, collapsedNodes);
        const targetHidden = isNodeHidden(edge.target, edges, collapsedNodes);

        return {
          ...edge,
          // Hide edge if source is collapsed OR either node is hidden
          hidden:
            collapsedNodes.has(edge.source) || sourceHidden || targetHidden,
        };
      })
    );
  }, [collapsedNodes, edges, isNodeHidden, setEdges]);

  // Collapse all parent nodes
  const collapseAll = useCallback(() => {
    const parentNodes = nodes.filter((node) => hasChildren(node.id));
    const allParentIds = new Set(parentNodes.map((n) => n.id));
    setCollapsedNodes(allParentIds);
  }, [nodes, hasChildren]);

  // Expand all nodes
  const expandAll = useCallback(() => {
    setCollapsedNodes(new Set());
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900" />
          <p className="text-sm text-gray-600">
            Loading repository structure...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p className="text-gray-500">No folders to display</p>
      </div>
    );
  }

  const visibleNodes = nodes.filter((n) => !n.hidden).length;
  const totalNodes = nodes.length;

  return (
    <div
      className={`h-full w-full ${theme === "dark" ? "bg-slate-950" : "bg-gray-100"}`}
    >
      {/* Header with Stats */}
      <div
        className={`absolute top-3 left-3 z-10 max-w-sm rounded-md ${theme === "dark" ? "bg-white" : "bg-gray-100"} p-3 shadow-md`}
      >
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-slate-800 p-2">
            <Folder className="text-white" size={20} />
          </div>
          <div>
            <h2 className="text-sm font-medium text-black">{repo}</h2>
            <p className="text-xs text-gray-500 italic">{owner}</p>
          </div>
        </div>
        <div className="mt-3 border-t border-gray-200 pt-3">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span className="font-medium">
              {visibleNodes} / {totalNodes} folders
            </span>
            <span className="font-medium">
              {edges.filter((e) => !e.hidden).length} connections
            </span>
          </div>
        </div>

        {/* Collapse/Expand Controls */}
        <div className="mt-2 flex gap-2">
          <button
            onClick={collapseAll}
            className="flex-1 rounded bg-gray-800 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-gray-700"
          >
            Collapse All
          </button>
          <button
            onClick={expandAll}
            className="flex-1 rounded bg-gray-800 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-gray-700"
          >
            Expand All
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute top-4 right-4 z-50">
        {!open && (
          <button
            onClick={() => setOpen(true)}
            className={`flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 ${theme === "dark" ? "bg-white text-black" : "bg-gray-900 text-white"}`}
          >
            <LuLightbulb size={18} />
          </button>
        )}

        {open && (
          <div className="animate-in fade-in slide-in-from-top-2 w-64 rounded-lg bg-gray-100 p-4 shadow-xl duration-200">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-1 text-sm font-medium text-gray-800">
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

            <ul className="space-y-2 text-xs text-gray-600">
              <li>📁 Click folder name to view on GitHub</li>
              <li>🔽 Click chevron to hide/show direct children</li>
              <li>🖱️ Scroll to zoom in / out</li>
              <li>✋ Drag to pan around</li>
              <li>💬 Use buttons to collapse/expand all parents</li>
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
        <Background
          variant={BackgroundVariant.Dots}
          gap={16}
          size={1}
          color="#8A8A8A"
        />
      </ReactFlow>
    </div>
  );
}

{
  /* <Controls className="rounded-lg bg-white shadow-lg" /> */
}
{
  /* <MiniMap
          className="rounded"
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
        /> */
}
