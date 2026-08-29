import React, { useMemo } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Position,
  Handle,
  MarkerType
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useAppStore } from '../../stores/useAppStore'
import { ProcessInfo } from '@shared/types'
import { Cpu, HardDrive, Activity } from 'lucide-react'

interface CustomNodeData {
  node: ProcessInfo
  index: number
  total: number
  isTarget: boolean
  [key: string]: unknown
}

// Custom Node Component for React Flow
const ProcessNode: React.FC<{ data: CustomNodeData }> = ({ data }) => {
  const { node, index, isTarget } = data

  const isRoot = index === 0
  const hasDocker = Boolean(node.Container)

  const formatBytes = (bytes?: number) => {
    if (!bytes) return null
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  }

  return (
    <div
      className={`w-64 p-3.5 rounded-xl border transition-all shadow-xl backdrop-blur-md ${
        isTarget
          ? 'bg-neutral-900/95 border-blue-500 ring-2 ring-blue-500/40 shadow-blue-950/50'
          : isRoot
            ? 'bg-neutral-900/90 border-purple-500/60 shadow-purple-950/30'
            : hasDocker
              ? 'bg-neutral-900/90 border-cyan-500/60'
              : 'bg-neutral-900/80 border-neutral-700/80 hover:border-neutral-500'
      }`}
    >
      {/* Input Handle for incoming ancestor edge */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !bg-blue-400 !border-neutral-950"
      />

      {/* Node Top Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
              isTarget
                ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                : isRoot
                  ? 'bg-purple-950 text-purple-300 border border-purple-800/40'
                  : 'bg-neutral-800 text-neutral-400'
            }`}
          >
            {isTarget ? 'TARGET' : isRoot ? 'ROOT' : `L${index}`}
          </span>
          <span className="font-bold text-xs text-neutral-100 font-mono truncate">
            {node.Command}
          </span>
        </div>

        <span className="text-[10px] text-neutral-400 font-mono">
          PID:{node.PID}
        </span>
      </div>

      {/* Cmdline Preview */}
      <div className="p-1.5 rounded bg-neutral-950/90 border border-neutral-800 text-[10px] font-mono text-neutral-300 truncate mb-2">
        {node.Cmdline || node.Command}
      </div>

      {/* Node Footer Badges */}
      <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
        <div className="flex items-center gap-1">
          {node.MemoryRSS ? (
            <span className="text-cyan-400 flex items-center gap-0.5">
              <HardDrive className="w-2.5 h-2.5" />
              {formatBytes(node.MemoryRSS)}
            </span>
          ) : null}
          {node.CPUPercent !== undefined && node.CPUPercent > 0 ? (
            <span className="text-amber-400 flex items-center gap-0.5">
              <Cpu className="w-2.5 h-2.5" />
              {node.CPUPercent.toFixed(1)}%
            </span>
          ) : null}
        </div>

        <span className="text-neutral-500">{node.User || 'system'}</span>
      </div>

      {/* Output Handle for outgoing child edge */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !bg-blue-400 !border-neutral-950"
      />
    </div>
  )
}

const nodeTypes = {
  processNode: ProcessNode
}

export const TopologyGraph: React.FC = () => {
  const { witrResult, inspecting } = useAppStore()

  const ancestry = witrResult?.Ancestry || []

  const { nodes, edges } = useMemo(() => {
    if (ancestry.length === 0) {
      return { nodes: [], edges: [] }
    }

    const calculatedNodes: Node[] = ancestry.map((item, idx) => ({
      id: `node-${item.PID}-${idx}`,
      type: 'processNode',
      position: { x: 40 + idx * 300, y: 150 },
      data: {
        node: item,
        index: idx,
        total: ancestry.length,
        isTarget: idx === ancestry.length - 1
      }
    }))

    const calculatedEdges: Edge[] = []
    for (let i = 1; i < calculatedNodes.length; i++) {
      calculatedEdges.push({
        id: `edge-${i - 1}-${i}`,
        source: calculatedNodes[i - 1].id,
        target: calculatedNodes[i].id,
        animated: true,
        style: { stroke: '#3b82f6', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#3b82f6'
        }
      })
    }

    return { nodes: calculatedNodes, edges: calculatedEdges }
  }, [ancestry])

  if (inspecting) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-neutral-400 gap-3">
        <Activity className="w-8 h-8 text-blue-500 animate-spin" />
        <span className="text-sm font-medium">正在构建 React Flow 交互拓扑节点...</span>
      </div>
    )
  }

  if (nodes.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-neutral-500 text-sm">
        无可用拓扑图数据
      </div>
    )
  }

  return (
    <div className="flex-1 h-full w-full relative bg-neutral-950">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.2}
        maxZoom={1.5}
      >
        <Background color="#27272a" gap={20} size={1} />
        <Controls className="!bg-neutral-900 !border-neutral-800 text-neutral-100" />
        <MiniMap
          nodeColor={(n) => {
            const data = n.data as unknown as CustomNodeData
            if (data?.isTarget) return '#3b82f6'
            if (data?.index === 0) return '#a855f7'
            return '#52525b'
          }}
          maskColor="rgba(0, 0, 0, 0.7)"
          className="!bg-neutral-900 !border-neutral-800 !rounded-lg"
        />
      </ReactFlow>
    </div>
  )
}
