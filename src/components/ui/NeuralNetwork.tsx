'use client'

import { useEffect, useRef, useCallback } from 'react'
import { MONOKAI } from '@/lib/monokai-colors'

/**
 * Neural Network - Dynamic connection lines and flowing orbs
 * Lines connect to actual text centers and move with floating keywords
 */

// Node definitions with IDs matching keyword indices
interface NodeDef {
  id: number
  color: string
}

// Connection definitions referencing node IDs
interface ConnectionDef {
  from: number
  to: number
  color: string
}

// Define which keyword indices connect to which
// Keywords array indices (from EnhancedHero):
// 0: function, 1: <Component />, 2: return, 3: const, 4: interface
// 5: { }, 6: color.primary, 7: TS, 8: =>, 9: spacing.xl, 10: dev
// 11: design, 12: [ ], 13: code, 14: <T>, 15: type
// 16: async, 17: font.sans, 18: JS, 19: design systems
// 20: export, 21: [...skills], 22: components, 23: import, 24: border.radius, 25: props
// 26: default, 27: ?., 28: tokens, 29: shadow.lg, 30: await, 31: &&
// 32: class, 33: <Props>, 34: accessibility, 35: variables, 36: transition
// 37: JSX, 38: </>, 39: theme, 40: motion, 41: ( )
// 42: hooks, 43: state, 44: utils, 45: wcag
// 46: responsive, 47: grid, 48: flex, 49: scale

const CONNECTIONS: ConnectionDef[] = [
  // TOP LEFT cluster
  { from: 0, to: 2, color: MONOKAI.pink },      // function -> return
  { from: 0, to: 4, color: MONOKAI.pink },      // function -> interface
  { from: 0, to: 1, color: MONOKAI.cyan },      // function -> <Component />
  { from: 1, to: 4, color: MONOKAI.cyan },      // <Component /> -> interface
  { from: 2, to: 4, color: MONOKAI.cyan },      // return -> interface
  { from: 2, to: 3, color: MONOKAI.pink },      // return -> const
  { from: 4, to: 5, color: MONOKAI.yellow },    // interface -> { }
  { from: 4, to: 7, color: MONOKAI.cyan },      // interface -> TS
  { from: 3, to: 6, color: MONOKAI.yellow },    // const -> color.primary
  { from: 7, to: 5, color: MONOKAI.yellow },    // TS -> { }
  { from: 7, to: 8, color: MONOKAI.pink },      // TS -> =>
  { from: 6, to: 9, color: MONOKAI.orange },    // color.primary -> spacing.xl
  { from: 9, to: 10, color: MONOKAI.purple },   // spacing.xl -> dev

  // TOP RIGHT cluster
  { from: 11, to: 12, color: MONOKAI.purple },  // design -> [ ]
  { from: 11, to: 13, color: MONOKAI.purple },  // design -> code
  { from: 11, to: 18, color: MONOKAI.yellow },  // design -> JS
  { from: 12, to: 45, color: MONOKAI.yellow },  // [ ] -> wcag
  { from: 13, to: 18, color: MONOKAI.cyan },    // code -> JS
  { from: 13, to: 15, color: MONOKAI.pink },    // code -> type
  { from: 18, to: 14, color: MONOKAI.cyan },    // JS -> <T>
  { from: 15, to: 16, color: MONOKAI.pink },    // type -> async
  { from: 16, to: 17, color: MONOKAI.yellow },  // async -> font.sans
  { from: 17, to: 19, color: MONOKAI.cyan },    // font.sans -> design systems

  // LEFT EDGE
  { from: 10, to: 20, color: MONOKAI.pink },    // dev -> export
  { from: 20, to: 21, color: MONOKAI.orange },  // export -> [...skills]
  { from: 20, to: 22, color: MONOKAI.green },   // export -> components
  { from: 22, to: 25, color: MONOKAI.orange },  // components -> props
  { from: 22, to: 23, color: MONOKAI.pink },    // components -> import
  { from: 25, to: 23, color: MONOKAI.orange },  // props -> import
  { from: 23, to: 24, color: MONOKAI.orange },  // import -> border.radius
  { from: 24, to: 32, color: MONOKAI.cyan },    // border.radius -> class

  // RIGHT EDGE
  { from: 19, to: 26, color: MONOKAI.pink },    // design systems -> default
  { from: 26, to: 27, color: MONOKAI.pink },    // default -> ?.
  { from: 26, to: 28, color: MONOKAI.purple },  // default -> tokens
  { from: 28, to: 29, color: MONOKAI.yellow },  // tokens -> shadow.lg
  { from: 29, to: 30, color: MONOKAI.pink },    // shadow.lg -> await
  { from: 30, to: 31, color: MONOKAI.pink },    // await -> &&
  { from: 30, to: 37, color: MONOKAI.yellow },  // await -> JSX

  // BOTTOM LEFT cluster
  { from: 32, to: 33, color: MONOKAI.cyan },    // class -> <Props>
  { from: 32, to: 34, color: MONOKAI.green },   // class -> accessibility
  { from: 33, to: 34, color: MONOKAI.green },   // <Props> -> accessibility
  { from: 34, to: 35, color: MONOKAI.purple },  // accessibility -> variables
  { from: 35, to: 36, color: MONOKAI.orange },  // variables -> transition
  { from: 35, to: 46, color: MONOKAI.cyan },    // variables -> responsive

  // BOTTOM RIGHT cluster
  { from: 37, to: 38, color: MONOKAI.cyan },    // JSX -> </>
  { from: 37, to: 39, color: MONOKAI.purple },  // JSX -> theme
  { from: 38, to: 40, color: MONOKAI.pink },    // </> -> motion
  { from: 39, to: 41, color: MONOKAI.yellow },  // theme -> ( )
  { from: 40, to: 49, color: MONOKAI.pink },    // motion -> scale
  { from: 39, to: 40, color: MONOKAI.purple },  // theme -> motion

  // TOP EDGE
  { from: 8, to: 42, color: MONOKAI.green },    // => -> hooks
  { from: 42, to: 43, color: MONOKAI.cyan },    // hooks -> state
  { from: 43, to: 44, color: MONOKAI.orange },  // state -> utils
  { from: 44, to: 45, color: MONOKAI.green },   // utils -> wcag
  { from: 42, to: 44, color: MONOKAI.orange },  // hooks -> utils

  // BOTTOM EDGE
  { from: 46, to: 47, color: MONOKAI.purple },  // responsive -> grid
  { from: 47, to: 48, color: MONOKAI.cyan },    // grid -> flex
  { from: 48, to: 49, color: MONOKAI.pink },    // flex -> scale
  { from: 46, to: 48, color: MONOKAI.cyan },    // responsive -> flex
  { from: 47, to: 49, color: MONOKAI.purple },  // grid -> scale
]

interface Orb {
  id: number
  connectionIndex: number
  progress: number
  direction: 1 | -1
  speed: number
  color: string
}

interface NodePosition {
  x: number
  y: number
}

export default function NeuralNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const orbsRef = useRef<Orb[]>([])
  const orbIdRef = useRef(0)
  const nodePositionsRef = useRef<Map<number, NodePosition>>(new Map())
  const dimensionsRef = useRef({ width: 0, height: 0 })
  const linesRef = useRef<SVGLineElement[]>([])
  const dotsRef = useRef<SVGCircleElement[]>([])

  // Get center position of a keyword element
  const getNodeCenter = useCallback((index: number): NodePosition | null => {
    const keywords = document.querySelectorAll('.bg-keyword')
    const el = keywords[index] as HTMLElement
    if (!el) return null

    const rect = el.getBoundingClientRect()
    const containerRect = el.offsetParent?.getBoundingClientRect() || { left: 0, top: 0 }

    return {
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top + rect.height / 2,
    }
  }, [])

  // Update all node positions
  const updateNodePositions = useCallback(() => {
    const keywords = document.querySelectorAll('.bg-keyword')
    keywords.forEach((_, index) => {
      const pos = getNodeCenter(index)
      if (pos) {
        nodePositionsRef.current.set(index, pos)
      }
    })
  }, [getNodeCenter])

  // Update SVG lines and dots
  const updateSVGElements = useCallback(() => {
    const { width, height } = dimensionsRef.current
    if (width === 0 || height === 0) return

    // Update lines
    linesRef.current.forEach((line, i) => {
      const conn = CONNECTIONS[i]
      if (!conn) return

      const fromPos = nodePositionsRef.current.get(conn.from)
      const toPos = nodePositionsRef.current.get(conn.to)

      if (fromPos && toPos) {
        line.setAttribute('x1', String(fromPos.x))
        line.setAttribute('y1', String(fromPos.y))
        line.setAttribute('x2', String(toPos.x))
        line.setAttribute('y2', String(toPos.y))
      }
    })

    // Update dots - collect unique node positions
    const uniqueNodes = new Set<number>()
    CONNECTIONS.forEach((conn) => {
      uniqueNodes.add(conn.from)
      uniqueNodes.add(conn.to)
    })

    const nodeArray = Array.from(uniqueNodes).sort((a, b) => a - b)
    nodeArray.forEach((nodeId, i) => {
      const dot = dotsRef.current[i]
      if (!dot) return

      const pos = nodePositionsRef.current.get(nodeId)
      if (pos) {
        dot.setAttribute('cx', String(pos.x))
        dot.setAttribute('cy', String(pos.y))
      }
    })
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const svg = svgRef.current
    if (!canvas || !svg) return

    const updateDimensions = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      dimensionsRef.current = { width: rect.width, height: rect.height }

      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.scale(dpr, dpr)
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)

    // Create SVG elements
    // Lines - with 0.1 opacity for subtle appearance
    CONNECTIONS.forEach((conn) => {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
      line.setAttribute('stroke', conn.color)
      line.setAttribute('stroke-width', '1')
      line.setAttribute('stroke-opacity', '0.1')
      svg.appendChild(line)
      linesRef.current.push(line)
    })

    // Dots - one per unique node
    const uniqueNodes = new Set<number>()
    CONNECTIONS.forEach((conn) => {
      uniqueNodes.add(conn.from)
      uniqueNodes.add(conn.to)
    })

    // Get colors for each node from keywords
    const keywords = document.querySelectorAll('.bg-keyword')
    uniqueNodes.forEach((nodeId) => {
      const el = keywords[nodeId] as HTMLElement
      const color = el?.style.color || MONOKAI.cyan

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      circle.setAttribute('r', '3')
      circle.setAttribute('fill', color)
      circle.setAttribute('fill-opacity', '0.1')
      svg.appendChild(circle)
      dotsRef.current.push(circle)
    })

    let animationId: number

    const spawnOrb = () => {
      if (orbsRef.current.length >= 18) return // Increased from 12 to 18

      const connIdx = Math.floor(Math.random() * CONNECTIONS.length)
      const conn = CONNECTIONS[connIdx]
      const direction = Math.random() > 0.5 ? 1 : -1

      orbsRef.current.push({
        id: orbIdRef.current++,
        connectionIndex: connIdx,
        progress: direction === 1 ? 0 : 1,
        direction: direction as 1 | -1,
        speed: 0.0015 + Math.random() * 0.002, // Slightly faster
        color: conn.color,
      })
    }

    const render = () => {
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        animationId = requestAnimationFrame(render)
        return
      }

      const { width, height } = dimensionsRef.current

      // Update node positions from DOM
      updateNodePositions()

      // Update SVG lines and dots
      updateSVGElements()

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Spawn new orbs more frequently
      if (Math.random() < 0.025) {
        spawnOrb()
      }

      // Update and draw orbs
      for (let i = orbsRef.current.length - 1; i >= 0; i--) {
        const orb = orbsRef.current[i]
        const conn = CONNECTIONS[orb.connectionIndex]

        // Get actual positions
        const fromPos = nodePositionsRef.current.get(conn.from)
        const toPos = nodePositionsRef.current.get(conn.to)

        if (!fromPos || !toPos) {
          // Remove orb if positions not available
          orbsRef.current.splice(i, 1)
          continue
        }

        // Update position
        orb.progress += orb.speed * orb.direction

        // Remove if finished
        if (orb.progress > 1 || orb.progress < 0) {
          orbsRef.current.splice(i, 1)
          continue
        }

        // Calculate position along line
        const x = fromPos.x + (toPos.x - fromPos.x) * orb.progress
        const y = fromPos.y + (toPos.y - fromPos.y) * orb.progress

        // Fade at endpoints
        let alpha = 0.5
        if (orb.progress < 0.1) {
          alpha = (orb.progress / 0.1) * 0.5
        } else if (orb.progress > 0.9) {
          alpha = ((1 - orb.progress) / 0.1) * 0.5
        }

        // Draw orb
        ctx.beginPath()
        ctx.arc(x, y, 3, 0, Math.PI * 2)
        ctx.fillStyle = orb.color
        ctx.globalAlpha = alpha
        ctx.fill()
        ctx.globalAlpha = 1
      }

      animationId = requestAnimationFrame(render)
    }

    // Start with more orbs for immediate activity
    for (let i = 0; i < 10; i++) {
      spawnOrb()
      if (orbsRef.current.length > 0) {
        orbsRef.current[orbsRef.current.length - 1].progress = Math.random()
      }
    }

    animationId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', updateDimensions)
      // Clean up SVG elements
      linesRef.current.forEach((line) => line.remove())
      dotsRef.current.forEach((dot) => dot.remove())
      linesRef.current = []
      dotsRef.current = []
    }
  }, [updateNodePositions, updateSVGElements])

  return (
    <>
      {/* SVG for lines and dots - opacity controlled via stroke-opacity on elements */}
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
      {/* Canvas for animated orbs */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 1 }}
      />
    </>
  )
}
