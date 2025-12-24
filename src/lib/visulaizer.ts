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

// Main function: Convert tree to React Flow format with proper hierarchy
export function folderTreeToReactFlow(
  tree: FolderNode,
  owner: string,
  repo: string
): ReactFlowData {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  let nodeIdCounter = 0;

  // Better spacing for clear hierarchy
  const HORIZONTAL_SPACING = 350; // More space between siblings
  const VERTICAL_SPACING = 150;   // More space between levels
  const CHILD_OFFSET = 50;         // Offset children from parent

  // Track position counters per level
  const levelCounters: { [key: number]: number } = {};

  function traverse(
    folder: FolderNode,
    parentId: string | null,
    parentX: number,
    level: number
  ) {
    const nodeId = `node-${nodeIdCounter++}`;

    // Initialize level counter if not exists
    if (!(level in levelCounters)) {
      levelCounters[level] = 0;
    }

    // Calculate position
    let x: number;
    let y = level * VERTICAL_SPACING;

    if (level === 0) {
      // Root node - center it
      x = 0;
    } else if (folder.children.length === 0) {
      // Leaf node - use level counter for horizontal positioning
      x = levelCounters[level] * HORIZONTAL_SPACING - (HORIZONTAL_SPACING / 2);
      levelCounters[level]++;
    } else {
      // Parent node - calculate based on children positions
      x = parentX + (levelCounters[level] * HORIZONTAL_SPACING);
      levelCounters[level]++;
    }

    console.log(`📦 ${folder.name} at (${x}, ${y}) - Level ${level}`);

    const node: Node = {
      id: nodeId,
      type: "custom",
      position: { x, y },
      data: {
        label: folder.name,
        fileCount: folder.fileCount,
        githubUrl: folder.githubUrl,
        path: folder.path || "root",
        level: level, // Pass level for styling
      },
    };

    nodes.push(node);

    // Create edge if has parent
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

    // Process children with offset
    if (folder.children && folder.children.length > 0) {
      const childStartX = x - ((folder.children.length - 1) * HORIZONTAL_SPACING) / 2;
      
      folder.children.forEach((child, childIndex) => {
        const childX = childStartX + (childIndex * HORIZONTAL_SPACING);
        traverse(child, nodeId, childX, level + 1);
      });
    }
  }

  console.log("🚀 Starting tree traversal...");
  traverse(tree, null, 0, 0);

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