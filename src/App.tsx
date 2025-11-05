import RainbowCursors from './RainbowCursors'
import PlayfulShapes from './PlayfulShapes'
import DebugGeometry from './DebugGeometry'
import ClipCorner from './ClipCorner'
import PointInPolygon from './PointInPolygon'
import { useEffect } from 'react'
import Prism from 'prismjs'
import 'prismjs/themes/prism.css'
import 'prismjs/components/prism-typescript'

function App() {
	useEffect(() => {
		Prism.highlightAll()
	}, [])

	return (
		<div style={{ maxWidth: '700px', margin: '0 auto', padding: '20px', marginTop: '50px' }}>
			<PlayfulShapes />
			<div className='header'>What's under the cursor?</div>
			
			<p>
				Check out these circles. Are they under the cursor(s)?
			</p>

			<div style={{ height: '600px', margin: '40px 0', position: 'relative' }}>
				<RainbowCursors />
			</div>

			<p>
			…and if so, how would we know? 
			</p>

			<p>
			This particular problem is called hit-testing, and it appears when building an app with any form of graphical user interface.
			In a canvas application like tldraw, getting hit-testing right is important: it determines the precision and response to user
			interactions, as well as the app’s performance under the hood. 
			</p>

			<p>
			tldraw’s hit-testing mechanism has changed
			quite a bit over time. We’ll explore that journey in this article.
			</p>

			<h3>Hit-testing in the browser</h3>

			<p>
			For an application on the web, hit-testing is the process of figuring out which element on a page is under the pointer. A pointer is a point of contact made on the screen with an input device,
			like a stylus, or mouse input. Pointer events in the browser can distinguish between things like the tilt, twist and pressure of the input signal.
			</p>

			<p>
			Browsers render web pages in a series of steps. Initially, the browser parses the HTML file and adds its elements to the DOM.
			It does the same thing for the styles by parsing CSS files. Nodes that will actually be visible
			on the page get added to a render tree. The browser then computes the geometry and layout for rendered elements.
			The final stages are painting and composition, where each node in the render
			tree is converted into pixels on the screen, with the correct dimensions and ordering.
			</p>

			<p>
			Pointer events target the topmost element under the cursor by working backwards through the rendering layers and
			figuring out which element is highest in the stacking order. For regular HTML elements like divs, buttons and links,
			the browser hit-tests against the entire border box, so the whole visual area responds to clicks.
			Though there are ways of going around this. For example, clipped regions don’t register pointer events.
			Below is an example... 
			</p>

			{/* <div style={{ margin: '40px 0', position: 'relative' }}>
				<ClipCorner />
			</div> */}

			<h3>Hit-testing in old tldraw</h3>

			<p>
			In tldraw, objects on the canvas are elements in the DOM. This makes it possible to use the browser’s in-built functionality to hit-test objects on the canvas. In fact, in the first version of tldraw, hit-testing happened entirely through DOM-based pointer events. 
			</p>

			<p>
			In tldraw v1, shapes were simple data objects…
			</p>

		<pre><code className="language-typescript">{`export interface RectangleShape extends TDBaseShape {
  type: TDShapeType.Rectangle
  size: number[]
  label?: string
  labelPoint?: number[]
}`}</code></pre>

			<p>
			Which allowed for direct React → DOM rendering of geometric shapes.
			</p>

		<pre><code className='language-typescript'>
{`export const BoxComponent = TLShapeUtil.Component<BoxShape, SVGSVGElement>(
  ({ shape, events, isGhost, meta }, ref) => {
    const color = meta.isDarkMode ? 'white' : 'black'

    return (
      <SVGContainer ref={ref} {...events}>
        <rect
          width={shape.size[0]}
          height={shape.size[1]}
          stroke={color}
          strokeWidth={3}
          strokeLinejoin="round"
          fill="none"
          rx={4}
          opacity={isGhost ? 0.3 : 1}
          pointerEvents="all"
        />
      </SVGContainer>
    )
  }
)`}
</code></pre>

			<p>
			Each geometric shape rendered with <i>three</i> SVG layers. 
			</p>

			<p>
			The first, topmost layer was the invisible hit path. The hit path had a stroke-width larger than the path of the shape itself to grab shapes easily. The second layer was an optional fill path. And the third, bottommost layer was the visible stroke path.
			</p>

			<h3>
				Hit-testing in current tldraw
			</h3>

			<p>
				This also made it possible to build a geometry debugging mode...
			</p>

			<div style={{ height: '600px', margin: '40px 0', position: 'relative' }}>
				<DebugGeometry />
			</div>

			<p>
			<b>Red lines</b> trace (1) the shape's perimeter and (2) the bounding box inside the polygon.
			</p>

			<p>
			<b>Green-Blue dots</b> illustrate the the vertices of the shape. These are the points that define the geometrical bounds, with color indicating their ordering (green first, blue last).
			</p>

			<p>
			<b>Dodger Blue lines</b> illustrate the distance to the nearest point on the shape's outline when the cursor is <i>outside</i> the shape (within 150px).
			</p>

			<p>
			<b>Goldenrod lines</b> illustrate the distance to the nearest point on the shape's outline when the cursor is <i>inside</i> the shape (within 150px).
			</p>

		<h2>The Algorithm</h2>

			<p>
			First, we do a check to see the ordering of shapes on the page. The hit-testing operates topmost first, going backwards through the list of shapes sorted by z-index.
			</p>

			<pre><code className='language-typescript'>
		{`const shapesToCheck = (
	opts.renderingOnly
		? this.getCurrentPageRenderingShapesSorted()
		: this.getCurrentPageShapesSorted()
).filter((shape) => {
	if (
		(shape.isLocked && !hitLocked) ||
		this.isShapeHidden(shape) ||
		this.isShapeOfType(shape, 'group')
	)
		return false
	const pageMask = this.getShapeMask(shape)
	if (pageMask && !pointInPolygon(point, pageMask)) return false
	if (filter && !filter(shape)) return false
	return true
})
`}
</code></pre>

			<p>winding number algorithm:</p>

			<div style={{ height: '600px', margin: '40px 0', position: 'relative' }}>
				<PointInPolygon />
			</div>




	</div>
	)
}

export default App
