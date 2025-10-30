import { Tldraw, Editor, createShapeId, TLGeoShape } from 'tldraw'
import 'tldraw/tldraw.css'
import { useRef, useEffect } from 'react'

// Access debugFlags from the global window object
declare global {
	interface Window {
		tldrawDebugGeometry?: boolean
	}
}

const SHAPE_TYPES: TLGeoShape['props']['geo'][] = [
	'rectangle',
	'ellipse',
	'triangle',
	'diamond',
	'pentagon',
	'hexagon',
	'octagon',
	'star',
	'rhombus',
	'oval',
	'trapezoid',
	'arrow-right',
	'arrow-left',
	'arrow-up',
	'arrow-down',
]

const COLORS = ['red', 'orange', 'yellow', 'green', 'blue', 'violet', 'grey']

export default function DebugGeometry() {
	const editorRef = useRef<Editor | null>(null)

	useEffect(() => {
		// Enable debug geometry via window property
		if (typeof window !== 'undefined') {
			window.tldrawDebugGeometry = true
		}
		
		return () => {
			// Clean up - disable debug geometry when component unmounts
			if (typeof window !== 'undefined') {
				window.tldrawDebugGeometry = false
			}
		}
	}, [])

	return (
		<div style={{ position: 'relative', width: '100%', height: '100%' }}>
			<Tldraw 
				hideUi
				autoFocus={false}
				onMount={(editor) => {
					editorRef.current = editor
					
					// Enable debug mode
					editor.updateInstanceState({
						isDebugMode: true,
					})

					// Create a variety of shapes with different types, sizes, and positions
					const shapes = []
					
					// Create 20 shapes with erratic placement
					for (let i = 0; i < 20; i++) {
						const shapeType = SHAPE_TYPES[Math.floor(Math.random() * SHAPE_TYPES.length)]
						const color = COLORS[Math.floor(Math.random() * COLORS.length)]
						
						// Random size between 40 and 150
						const width = 40 + Math.random() * 110
						const height = 40 + Math.random() * 110
						
						// Erratic placement in a larger area
						const x = 50 + Math.random() * 800
						const y = 50 + Math.random() * 500
						
						const shapeId = createShapeId(`shape-${i}`)
						
						editor.createShape({
							id: shapeId,
							type: 'geo',
							x,
							y,
							props: {
								geo: shapeType,
								w: width,
								h: height,
								color: color as any,
								fill: Math.random() > 0.5 ? 'solid' : 'semi',
								dash: Math.random() > 0.7 ? 'dashed' : 'draw',
							},
						})
						
						shapes.push(shapeId)
					}

					// Zoom to fit all shapes
					editor.zoomToFit()
				}}
			/>
		</div>
	)
}

