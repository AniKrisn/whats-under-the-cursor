import { useRef, useEffect, useState } from 'react'
import { Tldraw, Editor, createShapeId, pointInPolygon, type VecLike } from 'tldraw'
import 'tldraw/tldraw.css'

export default function PointInPolygon() {
	const editorRef = useRef<Editor | null>(null)
	const containerRef = useRef<HTMLDivElement>(null)
	const [isInside, setIsInside] = useState(false)
	const animationFrameId = useRef<number>()
	const polygonShapeId = createShapeId('polygon-demo')

	// Define a star-like polygon in page coordinates
	const polygon: VecLike[] = [
		{ x: 300, y: 100 },
		{ x: 380, y: 200 },
		{ x: 500, y: 200 },
		{ x: 410, y: 280 },
		{ x: 450, y: 400 },
		{ x: 300, y: 330 },
		{ x: 150, y: 400 },
		{ x: 190, y: 280 },
		{ x: 100, y: 200 },
		{ x: 220, y: 200 },
	]

	useEffect(() => {
		const animate = () => {
			if (editorRef.current && containerRef.current) {
				const mouseX = editorRef.current.inputs.currentPagePoint.x
				const mouseY = editorRef.current.inputs.currentPagePoint.y
				
				const point = { x: mouseX, y: mouseY }
				const inside = pointInPolygon(point, polygon)
				
				if (inside !== isInside) {
					setIsInside(inside)
					
					// Update the polygon color
					const shape = editorRef.current.getShape(polygonShapeId)
					if (shape) {
						editorRef.current.updateShape({
							...shape,
							props: {
								...(shape.props as any),
								color: inside ? 'light-green' : 'grey',
								fill: 'solid'
							}
						})
					}
				}
			}
			
			animationFrameId.current = requestAnimationFrame(animate)
		}

		animate()
		
		return () => {
			if (animationFrameId.current) {
				cancelAnimationFrame(animationFrameId.current)
			}
		}
	}, [isInside])

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

						// Create the polygon shape using draw tool
						editor.createShape({
							id: polygonShapeId,
							type: 'draw',
							x: 0,
							y: 0,
							props: {
								segments: [
									{
										type: 'straight',
										points: polygon.map(p => ({ x: p.x, y: p.y, z: 0.5 }))
									}
								],
								color: 'grey',
								fill: 'solid',
								size: 'm',
								isClosed: true,
							},
						})

						// Zoom to fit the polygon
						setTimeout(() => {
							editor.zoomToFit({ animation: { duration: 0 } })
						}, 100)
					}}
				/>
			</div>
			<div style={{ 
				fontSize: '18px', 
				fontWeight: '500',
				color: isInside ? '#4CAF50' : '#666',
				transition: 'color 0.2s ease'
			}}>
				Cursor is <strong>{isInside ? 'INSIDE' : 'OUTSIDE'}</strong> the polygon
			</div>
			<div style={{ 
				fontSize: '14px', 
				color: '#666',
				textAlign: 'center',
				maxWidth: '500px'
			}}>
				Move your cursor over the canvas. The <strong>pointInPolygon</strong> function uses a winding number algorithm
				to determine if a point is inside the polygon. The polygon changes color when your cursor enters it.
			</div>
		</div>
	)
}

