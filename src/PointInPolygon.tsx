import { useRef, useEffect, useState } from 'react'
import { Tldraw, Editor, createShapeId } from 'tldraw'
import 'tldraw/tldraw.css'

export default function PointInPolygon() {
  const editorRef = useRef<Editor | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isInside, setIsInside] = useState(false)
  const isInsideRef = useRef(false) // Track current state in a ref
  const animationFrameId = useRef<number>()
  const circleShapeId = createShapeId('circle-demo')
  const rayShapeId = createShapeId('ray-line')
  const intersectionShapeId = createShapeId('intersection-point')

  // Circle in page coordinates
  const CIRCLE_W = 220
  const CIRCLE_H = 220
  const CIRCLE_X = 200
  const CIRCLE_Y = 140

  // Function to find ray-circle intersections
  const findRayIntersections = (px: number, py: number) => {
    const cx = CIRCLE_X + CIRCLE_W / 2
    const cy = CIRCLE_Y + CIRCLE_H / 2
    const rx = CIRCLE_W / 2
    const ry = CIRCLE_H / 2

    // Ray goes horizontally to the right: (px + t, py) for t >= 0
    // Substitute into ellipse equation: ((px + t - cx)^2 / rx^2) + ((py - cy)^2 / ry^2) = 1
    
    const dx = px - cx
    const dy = py - cy
    
    // Expand: (dx + t)^2 / rx^2 + dy^2 / ry^2 = 1
    // (dx^2 + 2*dx*t + t^2) / rx^2 + dy^2 / ry^2 = 1
    // t^2 / rx^2 + 2*dx*t / rx^2 + dx^2 / rx^2 + dy^2 / ry^2 = 1
    
    const a = 1 / (rx * rx)
    const b = 2 * dx / (rx * rx)
    const c = (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) - 1
    
    const discriminant = b * b - 4 * a * c
    
    if (discriminant < 0) return [] // No intersections
    
    const sqrtDisc = Math.sqrt(discriminant)
    const t1 = (-b + sqrtDisc) / (2 * a)
    const t2 = (-b - sqrtDisc) / (2 * a)
    
    const intersections = []
    if (t1 >= 0) intersections.push({ x: px + t1, y: py })
    if (t2 >= 0 && t2 !== t1) intersections.push({ x: px + t2, y: py })
    
    return intersections
  }

  useEffect(() => {
    const animate = () => {
      if (editorRef.current && containerRef.current) {
        const { x, y } = editorRef.current.inputs.currentPagePoint

        // ellipse equation (works for circle too)
        const cx = CIRCLE_X + CIRCLE_W / 2
        const cy = CIRCLE_Y + CIRCLE_H / 2
        const rx = CIRCLE_W / 2
        const ry = CIRCLE_H / 2

        const norm = ((x - cx) * (x - cx)) / (rx * rx) + ((y - cy) * (y - cy)) / (ry * ry)
        const inside = norm <= 1
        
        // Check if near the circle (within 50px)
        const nearbyThreshold = 1.3 // norm threshold for "nearby"
        const isNearby = norm <= nearbyThreshold

        // Find intersections
        const intersections = findRayIntersections(x, y)
        
        // Only show ray and intersection when inside or nearby
        if (isNearby) {
          // Update ray visualization
          const rayEndX = x + 800 // Long ray to the right
          editorRef.current.updateShape({
            id: rayShapeId,
            type: 'line',
            x: Math.min(x, rayEndX),
            y: y,
            props: {
              points: {
                a1: { id: 'a1', index: 'a1', x: 0, y: 0 },
                a2: { id: 'a2', index: 'a2', x: rayEndX - x, y: 0 },
              },
              color: inside ? 'light-green' : 'light-red',
              size: 's',
              dash: 'dashed',
            },
          })

          // Update intersection points visualization
          if (intersections.length > 0) {
            // Just show the first intersection point for clarity
            const intersection = intersections[0]
            editorRef.current.updateShape({
              id: intersectionShapeId,
              type: 'geo',
              x: intersection.x - 5,
              y: intersection.y - 5,
              props: {
                geo: 'ellipse',
                w: 10,
                h: 10,
                color: 'red',
                fill: 'solid',
                size: 's',
              },
            })
          }
        } else {
          // Hide ray and intersection by moving them off-screen
          editorRef.current.updateShape({
            id: rayShapeId,
            type: 'line',
            x: -10000,
            y: -10000,
            props: {
              points: {
                a1: { id: 'a1', index: 'a1', x: 0, y: 0 },
                a2: { id: 'a2', index: 'a2', x: 0, y: 0 },
              },
              color: 'light-red',
              size: 's',
              dash: 'dashed',
            },
          })
          
          editorRef.current.updateShape({
            id: intersectionShapeId,
            type: 'geo',
            x: -10000,
            y: -10000,
            props: {
              geo: 'ellipse',
              w: 10,
              h: 10,
              color: 'red',
              fill: 'solid',
              size: 's',
            },
          })
        }

        // Use ref to compare with previous state
        if (inside !== isInsideRef.current) {
          isInsideRef.current = inside
          setIsInside(inside)

          // Update the circle color
          const shape = editorRef.current.getShape(circleShapeId)
          if (shape) {
            editorRef.current.updateShape({
              ...shape,
              props: {
                ...(shape.props as any),
                color: inside ? 'light-green' : 'grey',
                fill: 'solid',
              },
            })
          }
        }
      }

      animationFrameId.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current)
    }
    // keep deps empty so we don't start multiple RAF loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [/* no deps */])

  return (
    <div style={{
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '20px'
    }}>
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '500px',
          border: '1px solid #ccc',
          borderRadius: '8px',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <Tldraw
          hideUi
          autoFocus={false}
          onMount={(editor) => {
            editorRef.current = editor

            // Create ONE circle
            editor.createShape({
              id: circleShapeId,
              type: 'geo',
              x: CIRCLE_X,
              y: CIRCLE_Y,
              props: {
                geo: 'ellipse',
                w: CIRCLE_W,
                h: CIRCLE_H,
                color: 'grey',
                fill: 'solid',
                size: 'm',
              },
            })

            // Create ray line (will be updated in animation loop)
            editor.createShape({
              id: rayShapeId,
              type: 'line',
              x: 0,
              y: 0,
              props: {
                points: {
                  a1: { id: 'a1', index: 'a1', x: 0, y: 0 },
                  a2: { id: 'a2', index: 'a2', x: 100, y: 0 },
                },
                color: 'light-red',
                size: 's',
                dash: 'dashed',
              },
            })

            // Create intersection point (will be updated in animation loop)
            editor.createShape({
              id: intersectionShapeId,
              type: 'geo',
              x: 0,
              y: 0,
              props: {
                geo: 'ellipse',
                w: 10,
                h: 10,
                color: 'red',
                fill: 'solid',
                size: 's',
              },
            })

            // Zoom to fit the circle
            editor.zoomToFit({ animation: { duration: 0 } })
          }}
        />
      </div>

      <div style={{
        fontSize: '18px',
        fontWeight: '500',
        color: isInside ? '#4CAF50' : '#666',
        transition: 'color 0.2s ease'
      }}>
        Cursor is <strong>{isInside ? 'INSIDE' : 'OUTSIDE'}</strong> the circle
      </div>

      <div style={{
        fontSize: '14px',
        color: '#666',
        textAlign: 'center',
        maxWidth: '500px'
      }}>
      </div>
    </div>
  )
}
