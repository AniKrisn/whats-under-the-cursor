import RainbowCursors from './RainbowCursors'
import PlayfulShapes from './PlayfulShapes'
import DebugGeometry from './DebugGeometry'
import ClipCorner from './ClipCorner'
import PointInPolygon from './PointInPolygon'
import HitTestLayers from './HitTestLayers'
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
			This particular problem is called hit-testing, and it appears when building an app with any form of GUI. In a canvas application like tldraw, getting hit-testing right is important: it determines the precision and quality of response to user interactions, as well as the app's performance under the hood.
			</p>

			<p>
			Collision detection (e.g. in 2D and 3D simulations) is a related area of research; it is full of interesting problems—and solutions involving complex math. Luckily, the browser’s in-built hit-testing infrastructure makes it possible to offload some of this work. Despite this, tldraw’s hit-testing mechanism has evolved quite a bit over time. We’ll explore that journey in this post.
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
			In tldraw, objects on the canvas are elements in the DOM. This makes it possible to use the browser’s in-built functionality to hit-test objects on the canvas. In fact, in the first version of tldraw, hit-testing happened almost entirely through DOM-based pointer events. 
			</p>

			<p>
			In tldraw v1, shapes were simple data objects:
			</p>

		<pre><code className="language-typescript">{`export interface RectangleShape extends TDBaseShape {
  type: TDShapeType.Rectangle
  size: number[]
  label?: string
  labelPoint?: number[]
}`}</code></pre>

			<p>
			Which allowed for direct React → DOM rendering of geometric shapes:
			</p>

		<pre><code className='language-typescript'>
{`export const BoxComponent = TLShapeUtil.Component<BoxShape, SVGSVGElement>(
  ({ shape, events, isGhost, meta }, ref) => {
    return (
      <SVGContainer ref={ref} {...events}>
        <rect
          ...
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

		<div style={{ height: '600px', margin: '40px 0', position: 'relative' }}>
			<HitTestLayers />
		</div>

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
			<span style={{ color: '#ff0000' }}>Red</span> lines trace the shape's perimeter and the bounding box inside the polygon. <span style={{ color: '#00ff00' }}>Green</span><span style={{ color: '#00e680' }}>/</span><span style={{ color: '#00ccff' }}>blue</span> dots illustrate the the vertices of the shape (green first, blue last). <span style={{ color: '#1e90ff' }}>Dodger blue</span> lines illustrate the distance to the nearest point on the shape's outline when the cursor is <i>outside</i> the shape—and <span style={{ color: '#daa520' }}>goldenrod</span> lines illustrate the distance to the nearest point when the cursor is <i>inside</i> (within 150px).
			</p>

			<p>
			Now let’s look at the hit-testing algorithm itself.
			</p>

		<h3>The Algorithm</h3>

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

			<p>
			This check is part of the broad-phase initial search to rule out obvious non-contenders, like locked and hidden shapes. It’s worth zooming into these lines in particular:
			</p>

			<pre><code className='language-typescript'>
		{`const pageMask = this.getShapeMask(shape)
if (pageMask && !pointInPolygon(point, pageMask)) return false
`}
</code></pre>

			<p>
			<code>getShapeMask</code> returns an array of points that define a polygon mask for a shape. The mask represents the clipping region applied to a shape when it’s a child of a container (like a frame). 
			</p>

			<p>
			<code>pointInPolygon</code> is an implementation of the 'winding number algorithm'. This is a technique to find whether a point is within a polygon by computing the ‘winding number’ relative to the point. The winding number is a count of how many times a horizontal ray, shot to the right of the point, intersects the polygon. An odd winding number means the point is inside; an even winding number means the point is outside.
			</p>

			<div style={{ height: '600px', margin: '40px 0', position: 'relative' }}>
				<PointInPolygon />
			</div>

			<p>
			Next, a preliminary check for labels. If the point is inside a label's bounds, return that shape immediately. This gives priority to label hits for easier text editing. It also ensures that selection works on frame headers.
			</p>

			<pre><code className='language-typescript'>

{`if (
  this.isShapeOfType<TLFrameShape>(shape, 'frame') ||
  ((this.isShapeOfType<TLNoteShape>(shape, 'note') ||
    this.isShapeOfType<TLArrowShape>(shape, 'arrow') ||
    (this.isShapeOfType<TLGeoShape>(shape, 'geo') && shape.props.fill === 'none')) &&
    this.getShapeUtil(shape).getText(shape)?.trim())
) {
  for (const childGeometry of (geometry as Group2d).children) {
    if (childGeometry.isLabel && childGeometry.isPointInBounds(pointInShapeSpace)) {
      return shape
    }
  }
}`}

</code></pre>

						<p>
						What happens if we hit a frame? If we hit its margin, then we select the frame itself. If we hit the frame’s blank space, we need to make sure we can hit the shapes inside. 
						</p>

						<p></p>

						<p>
						Shapes partially outside the frame are clipped, and this happens in the shapesToCheck section at the top. Only masked bounds are used for hit-testing, so only the visible portion of the shape in the frame can be hit-tested. 
						</p>

	</div>
	)
}

export default App


