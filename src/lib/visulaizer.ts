import { Node, Edge } from "@xyflow/react";

interface FolderNode {
  path: string;
  name: string;
  fileCount: number;
  githubUrl: string;
  children: FolderNode[];
}

interface ReactFlowData {
  nodes: Node[];
  edges: Edge[];
}

function shouldIncludeFolder(folderName: string, path: string): boolean {
  const excludedFolders = [
    "migrations",
    "node_modules",
    ".git",
    ".next",
    "dist",
    "build",
    "coverage",
  ];

  const lowerName = folderName.toLowerCase();
  const lowerPath = path.toLowerCase();

  return !excludedFolders.some(
    (excluded) => lowerName === excluded || lowerPath.includes(`/${excluded}/`)
  );
}

function filterTree(folder: FolderNode): FolderNode | null {
  if (!shouldIncludeFolder(folder.name, folder.path)) {
    return null;
  }

  const filteredChildren = folder.children
    .map((child) => filterTree(child))
    .filter((child): child is FolderNode => child !== null);

  return {
    ...folder,
    children: filteredChildren,
  };
}

function calculateTreeWidth(folder: FolderNode, spacing: number): number {
  if (folder.children.length === 0) {
    return spacing;
  }

  let totalWidth = 0;
  folder.children.forEach((child) => {
    totalWidth += calculateTreeWidth(child, spacing);
  });

  return Math.max(spacing, totalWidth);
}

function calculateTreeDepth(folder: FolderNode): number {
  if (folder.children.length === 0) {
    return 1;
  }

  let maxChildDepth = 0;
  folder.children.forEach((child) => {
    maxChildDepth = Math.max(maxChildDepth, calculateTreeDepth(child));
  });

  return 1 + maxChildDepth;
}

export function folderTreeToReactFlow(
  tree: FolderNode,
  owner: string,
  repo: string
): ReactFlowData {
  const filteredTree = filterTree(tree);

  if (!filteredTree) {
    return { nodes: [], edges: [] };
  }

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  let nodeIdCounter = 0;

  const HORIZONTAL_SPACING = 280;
  const VERTICAL_SPACING = 200;

  // Track the maximum Y position used at each X coordinate to prevent overlap
  const xPositionTracker: { [key: number]: number } = {};

  function getAvailableY(x: number, baseY: number): number {
    const roundedX = Math.round(x / 10) * 10;

    if (!(roundedX in xPositionTracker)) {
      xPositionTracker[roundedX] = baseY;
      return baseY;
    }

    const availableY = Math.max(
      baseY,
      xPositionTracker[roundedX] + VERTICAL_SPACING
    );
    xPositionTracker[roundedX] = availableY;
    return availableY;
  }

  function traverse(
    folder: FolderNode,
    parentId: string | null,
    x: number,
    baseY: number,
    level: number
  ): { width: number; height: number } {
    const nodeId = `node-${nodeIdCounter++}`;

    // Get an available Y position that won't overlap
    const y = getAvailableY(x, baseY);

    console.log(`📦 ${folder.name} at (${x}, ${y}) - Level ${level}`);

    const node: Node = {
      id: nodeId,
      type: "custom",
      position: { x, y },
      data: {
        label: folder.name,
        fileCount: folder.fileCount,
        githubUrl: folder.githubUrl,
        path: folder.path || "/",
        level: level,
      },
    };

    nodes.push(node);

    if (parentId) {
      edges.push({
        id: `edge-${parentId}-${nodeId}`,
        source: parentId,
        target: nodeId,
        type: "smoothstep",
        animated: false,
        style: {
          stroke: "#64748b",
          strokeWidth: 2,
        },
      });
    }

    if (folder.children && folder.children.length > 0) {
      const childBaseY = y + VERTICAL_SPACING;

      const totalChildrenWidth = folder.children.length * HORIZONTAL_SPACING;
      let childX = x - totalChildrenWidth / 2 + HORIZONTAL_SPACING / 2;

      let maxChildHeight = 0;

      folder.children.forEach((child) => {
        const { height } = traverse(
          child,
          nodeId,
          childX,
          childBaseY,
          level + 1
        );
        maxChildHeight = Math.max(maxChildHeight, height);
        childX += HORIZONTAL_SPACING;
      });

      return {
        width: totalChildrenWidth,
        height: VERTICAL_SPACING + maxChildHeight,
      };
    }

    return {
      width: HORIZONTAL_SPACING,
      height: VERTICAL_SPACING,
    };
  }

  console.log("🚀 Starting tree traversal...");

  const startX = 0;
  traverse(filteredTree, null, startX, 0, 0);

  // console.log(`✅ Generated ${nodes.length} nodes and ${edges.length} edges`);

  return { nodes, edges };
}

// import {
//   LuBringToFront,
//   LuBraces,
//   LuBrackets,
//   LuCable,
//   LuCommand,
//   LuCog,
//   LuFiles,
//   LuFolderCode,
//   LuFolderRoot,
// } from "react-icons/lu";
