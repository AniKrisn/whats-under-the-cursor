import { Tldraw, Editor } from 'tldraw'
import 'tldraw/tldraw.css'
import React, { useRef, useEffect } from 'react'

// Access debugFlags from the global window object
declare global {
	interface Window {
		tldrawDebugGeometry?: boolean
	}
}

export default function DebugGeometry() {
	const editorRef = useRef<Editor | null>(null)
	const containerRef = useRef<HTMLDivElement>(null)
	const [isHovered, setIsHovered] = React.useState(false)

	useEffect(() => {
		// Only enable debug geometry when this specific canvas is hovered
		if (typeof window !== 'undefined') {
			window.tldrawDebugGeometry = isHovered
		}
	}, [isHovered])

	const loadInitialShapes = (editor: Editor) => {
		fetch('/assets/for-debug.tldr')
			.then((response) => response.json())
			.then((content) => {
				content.records.forEach((record: any) => {
					if (record.typeName !== 'shape') return

					const shapeData: any = {
						type: record.type,
						x: record.x,
						y: record.y,
						props: { ...record.props },
					}

					if (record.rotation) {
						shapeData.rotation = record.rotation
					}

					if (record.opacity) {
						shapeData.opacity = record.opacity
					}

					if (record.type === 'text') {
						const text = record.props.richText?.content?.[0]?.content?.[0]?.text || ''
						shapeData.props.richText = {
							type: 'doc',
							content: [
								{
									type: 'paragraph',
									content: [{ type: 'text', text }],
								},
							],
						}
					}

					if (record.type === 'draw') {
						shapeData.props.segments = record.props.segments || []
					}

					editor.createShape(shapeData)
				})

				// Zoom to fit all content after loading
				setTimeout(() => {
					editor.zoomToFit({ animation: { duration: 0 } })
				}, 100)
			})
			.catch((err) => console.error('Failed to load shapes:', err))
	}

	return (
		<div 
			ref={containerRef}
			style={{ position: 'relative', width: '100%', height: '100%' }}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			<Tldraw 
				hideUi
				autoFocus={false}
				onMount={(editor) => {
					editorRef.current = editor
					
					// Enable debug mode
					editor.updateInstanceState({
						isDebugMode: true,
					})

					// Load shapes from the file
					loadInitialShapes(editor)
				}}
			/>
		</div>
	)
}

