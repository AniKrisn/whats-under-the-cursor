import { Tldraw, createShapeId, Editor, TLShapeId, toRichText } from 'tldraw'
import 'tldraw/tldraw.css'
import { useRef, useState } from 'react'

export default function HitTestLayers() {
  const editorRef = useRef<Editor | null>(null)
  const bottomRectIdRef = useRef<TLShapeId>(createShapeId('bottom-rect'))
  const middleRectIdRef = useRef<TLShapeId>(createShapeId('middle-rect'))
  const topRectIdRef = useRef<TLShapeId>(createShapeId('top-rect'))
  const [topClicked, setTopClicked] = useState(false)
  const [_, setMiddleClicked] = useState(false)

  const rectWidth = 120
  const rectHeight = 75
  const hitAreaPadding = 30

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Tldraw 
        hideUi
        autoFocus={false}
        onMount={(editor) => {
          editorRef.current = editor
          
          const centerX = 400
          const centerY = 300

          // Bottom Rectangle - Stroke only (always visible)
          editor.createShape({
            id: bottomRectIdRef.current,
            type: 'geo',
            x: centerX - rectWidth / 2,
            y: centerY - rectHeight / 2,
            props: {
              geo: 'rectangle',
              w: rectWidth,
              h: rectHeight,
              color: 'black',
              fill: 'none',
              dash: 'draw',
              size: 'm',
            },
          })

          // Middle Rectangle - Fill (invisible until clicked)
          editor.createShape({
            id: middleRectIdRef.current,
            type: 'geo',
            x: centerX - rectWidth / 2,
            y: centerY - rectHeight / 2,
            opacity: 0.01,
            props: {
              geo: 'rectangle',
              w: rectWidth,
              h: rectHeight,
              color: 'blue',
              fill: 'semi',
              dash: 'draw',
              size: 'm',
            },
          })

          // Top Rectangle - Larger hit area (invisible until clicked)
          editor.createShape({
            id: topRectIdRef.current,
            type: 'geo',
            x: centerX - (rectWidth + hitAreaPadding) / 2,
            y: centerY - (rectHeight + hitAreaPadding) / 2,
            opacity: 0.01, // Nearly invisible
            props: {
              geo: 'rectangle',
              w: rectWidth + hitAreaPadding,
              h: rectHeight + hitAreaPadding,
              color: 'red',
              fill: 'semi',
              dash: 'dashed',
              size: 's',
            },
          })

          editor.zoomToFit()

          // Listen for shape changes to detect clicks/interactions
          const handlePointerDown = () => {
            const selectedShapes = editor.getSelectedShapeIds()
            
            if (selectedShapes.includes(topRectIdRef.current) && !topClicked) {
              editor.updateShape({
                id: topRectIdRef.current,
                type: 'geo',
                opacity: 0.25,
                props: { richText: toRichText('hit') }
              })
              setTopClicked(true)
            } else if (selectedShapes.includes(middleRectIdRef.current)) {
              editor.updateShape({
                id: middleRectIdRef.current,
                type: 'geo',
                opacity: 0.5,
                props: { color: 'green', fill: 'solid', richText: toRichText('fill') },
              })
              setMiddleClicked(true)
            } else if (selectedShapes.includes(bottomRectIdRef.current)) {
                editor.updateShape({
                  id: bottomRectIdRef.current,
                  type: 'geo',
                  props: { richText: toRichText('stroke') },
                })
                setMiddleClicked(true)
            }

          }

          const cleanup = editor.store.listen(handlePointerDown)
          
          return () => {
            cleanup()
          }
        }}
      />
    </div>
  )
}

