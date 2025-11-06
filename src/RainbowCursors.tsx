import { Tldraw, createShapeId, TLDefaultColorStyle, Editor, TLShapeId } from 'tldraw'
import 'tldraw/tldraw.css'
import { useState, useEffect, useRef } from 'react'

const NUM_CURSORS = 9
const GRID_ROWS = 10
const GRID_COLS = 10
const SHAPE_SIZE = 40
const SHAPE_SPACING = 50

const RAINBOW_COLORS: TLDefaultColorStyle[] = [
	'light-red',     
	'red',           
	'orange',        
	'yellow',        
	'light-green',   
	'green',         
	'light-blue',    
	'blue',          
	'violet',        
	'light-violet'   
]

export default function RainbowCursors() {
	const [cursorPositions, setCursorPositions] = useState<Array<{x: number, y: number}>>([])
	const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
	const [isMouseInCanvas, setIsMouseInCanvas] = useState(false)
	const [isFadingOut, setIsFadingOut] = useState(false)
	const mousePosition = useRef({ x: 0, y: 0 })
	const animationFrameId = useRef<number>()
	const editorRef = useRef<Editor | null>(null)
	const shapeIdsRef = useRef<TLShapeId[]>([])
	const containerRef = useRef<HTMLDivElement>(null)
	const latestCursorPositions = useRef<Array<{x: number, y: number}>>([])

	// Initialize cursor positions based on canvas size
	useEffect(() => {
		if (canvasSize.width > 0 && canvasSize.height > 0 && cursorPositions.length === 0) {
			const centerX = canvasSize.width / 2
			const centerY = canvasSize.height / 2
			const radius = 250
			const positions = Array.from({ length: NUM_CURSORS }, (_, i) => {
				const angle = (i / NUM_CURSORS) * Math.PI * 3
				return {
					x: centerX + Math.cos(angle) * radius,
					y: centerY + Math.sin(angle) * radius
				}
			})
			setCursorPositions(positions)
			latestCursorPositions.current = positions
		}
	}, [canvasSize, cursorPositions.length])

	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			if (containerRef.current) {
				const rect = containerRef.current.getBoundingClientRect()
				mousePosition.current = { 
					x: e.clientX - rect.left, 
					y: e.clientY - rect.top 
				}
			}
		}
		
		// Prevent tldraw from capturing scroll events - capture the event first
		const handleWheel = (e: WheelEvent) => {
			e.stopPropagation()
		}

		const handleResize = () => {
			if (containerRef.current) {
				setCanvasSize({
					width: containerRef.current.offsetWidth,
					height: containerRef.current.offsetHeight
				})
			}
		}
		
		const container = containerRef.current
		if (container) {
			// Use capture phase to intercept before tldraw
			container.addEventListener('wheel', handleWheel, { capture: true })
			// Set initial size
			handleResize()
		}

		window.addEventListener('resize', handleResize)

		const animate = () => {
			// Only update positions if mouse is in canvas
			if (isMouseInCanvas) {
				const prevPositions = latestCursorPositions.current
				const newPositions = [...prevPositions]
				
				// Each cursor follows the previous one (or the mouse for the first one)
				for (let i = 0; i < NUM_CURSORS; i++) {
					const target = i === 0 ? mousePosition.current : newPositions[i - 1]
					const current = prevPositions[i] || { x: 0, y: 0 }
					
					const dx = target.x - current.x
					const dy = target.y - current.y
					
					// Each cursor has progressively more lag
					const baseLerp = 0.075
					const lerp = baseLerp * (1 - i * 0.000001) // Each subsequent cursor is slower
					
					newPositions[i] = {
						x: current.x + dx * lerp,
						y: current.y + dy * lerp,
					}
				}

				// Update ref and state
				latestCursorPositions.current = newPositions
				setCursorPositions(newPositions)

				// Check collision with all shapes
				if (editorRef.current && shapeIdsRef.current.length > 0) {
					const containerRect = containerRef.current?.getBoundingClientRect()
					shapeIdsRef.current.forEach(shapeId => {
						const shape = editorRef.current!.getShape(shapeId)
						if (shape && shape.type === 'geo') {
							const shapeBounds = editorRef.current!.getShapePageBounds(shape)
							if (shapeBounds) {
								let cursorIndex = -1
								
								// Check real mouse position
								const realMousePagePoint = editorRef.current!.screenToPage({ 
									x: mousePosition.current.x + (containerRect?.left || 0), 
									y: mousePosition.current.y + (containerRect?.top || 0)
								})
								
								const realMouseInside = 
									realMousePagePoint.x >= shapeBounds.x &&
									realMousePagePoint.x <= shapeBounds.x + shapeBounds.w &&
									realMousePagePoint.y >= shapeBounds.y &&
									realMousePagePoint.y <= shapeBounds.y + shapeBounds.h
								
								if (realMouseInside) {
									cursorIndex = 0
								} else {
									// Check all cursor images
									for (let i = 0; i < NUM_CURSORS; i++) {
										const pagePoint = editorRef.current!.screenToPage({ 
											x: newPositions[i].x + (containerRect?.left || 0), 
											y: newPositions[i].y + (containerRect?.top || 0)
										})
										
										const isInside = 
											pagePoint.x >= shapeBounds.x &&
											pagePoint.x <= shapeBounds.x + shapeBounds.w &&
											pagePoint.y >= shapeBounds.y &&
											pagePoint.y <= shapeBounds.y + shapeBounds.h
										
										if (isInside) {
											cursorIndex = i + 1
											break
										}
									}
								}

								// Update color
								const currentColor = (shape.props as any).color as TLDefaultColorStyle
								if (cursorIndex >= 0) {
									const newColor = RAINBOW_COLORS[cursorIndex]
									if (currentColor !== newColor) {
										editorRef.current!.updateShape({
											...shape,
											props: { ...(shape.props as any), color: newColor }
										})
									}
								} else if (currentColor !== 'grey') {
									editorRef.current!.updateShape({
										...shape,
										props: { ...(shape.props as any), color: 'grey' }
									})
								}
							}
						}
					})
				}
			} else {
				// Mouse not in canvas - set all shapes to grey
				if (editorRef.current && shapeIdsRef.current.length > 0) {
					shapeIdsRef.current.forEach(shapeId => {
						const shape = editorRef.current!.getShape(shapeId)  
						if (shape && shape.type === 'geo') {
							const currentColor = (shape.props as any).color as TLDefaultColorStyle
							if (currentColor !== 'grey') {
								editorRef.current!.updateShape({
									...shape,
									props: { ...(shape.props as any), color: 'grey' }
								})
							}
						}
					})
				}
			}
			
			animationFrameId.current = requestAnimationFrame(animate)
		}

		window.addEventListener('mousemove', handleMouseMove)
		animate()
		
		return () => {
			window.removeEventListener('mousemove', handleMouseMove)
			window.removeEventListener('resize', handleResize)
			if (container) {
				container.removeEventListener('wheel', handleWheel, { capture: true })
			}
			if (animationFrameId.current) {
				cancelAnimationFrame(animationFrameId.current)
			}
		}
	}, [isMouseInCanvas])

	const handleMouseLeave = () => {
		setIsMouseInCanvas(false)
		setIsFadingOut(true)
		setTimeout(() => setIsFadingOut(false), 400) // Match animation duration
	}

	const shouldShowCursors = isMouseInCanvas || isFadingOut

	return (
		<div 
			ref={containerRef} 
			style={{ position: 'relative', width: '100%', height: '100%' }}
			onMouseEnter={() => setIsMouseInCanvas(true)}
			onMouseLeave={handleMouseLeave}
		>
			<Tldraw 
                hideUi
                autoFocus={false}
				onMount={(editor) => {
					editorRef.current = editor
					
					// Create a grid of shapes
					const shapeIds: TLShapeId[] = []
					const startX = 100
					const startY = 100
					
					for (let row = 0; row < GRID_ROWS; row++) {
						for (let col = 0; col < GRID_COLS; col++) {
							const shapeId = createShapeId(`shape-${row}-${col}`)
							shapeIds.push(shapeId)
							
							editor.createShape({
								id: shapeId,
								type: 'geo',
								x: startX + col * SHAPE_SPACING,
								y: startY + row * SHAPE_SPACING,
								props: {
									geo: 'ellipse',
									w: SHAPE_SIZE,
									h: SHAPE_SIZE,
									color: 'grey',
									fill: 'solid',
								},
							})
						}
					}
					
					shapeIdsRef.current = shapeIds

                    editor.zoomToFit()
				}}
			/>
			{shouldShowCursors && cursorPositions.map((pos, index) => (
				<img
					key={index}
					src="/assets/mac-cursor-6.png"
					alt={`cursor-${index}`}
					style={{
						position: 'absolute',
						left: pos.x,
						top: pos.y,
						width: '14px',
						height: '20px',
						pointerEvents: 'none',
						zIndex: 9999 - index,
						transform: isFadingOut 
							? 'translate(-2px, -2px) scale(0)' 
							: 'translate(-2px, -2px) scale(1)',
						opacity: isFadingOut ? 0 : 1 - index * 0.08,
						transition: 'opacity 0.3s ease-out, transform 0.3s ease-out',
					}}
				/>
			))}
		</div>
	)
}