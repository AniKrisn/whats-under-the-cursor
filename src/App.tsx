import RainbowCursors from './RainbowCursors'
import PlayfulShapes from './PlayfulShapes'
import DebugGeometry from './DebugGeometry'
import ClipCorner from './ClipCorner'

function App() {
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
				Hit-testing is a problem that spans multiple domains.
			</p>

			<p>
				In a canvas application, getting hit-testing right is important.
			</p>

			<h3>Hit-testing in the browser</h3>

			<p>
			For an application on the web, hit-testing is the process of figuring out which element on a page is under the pointer.
			Browsers use a “pointer events” API to do this. A pointer is a point of contact made on the screen with an input device,
			like a stylus, or mouse input. Pointer events in the browser can distinguish between things like types of input device,
			and tilt, twist and pressure of the input signal.
			</p>

			<p>
			Browsers render web pages in a series of steps. Initially, the browser parses the HTML file and converts its objects
			into elements in the DOM. It does the same thing for the styles by parsing CSS files. Nodes that will actually be visible
			on the page get added to a render tree (this excludes metadata and invisible objects). The browser then computes the
			geometry and layout for rendered elements. The final stages are painting and composition, where each node in the render
			tree is converted into pixels on the screen, with the correct dimensions and ordering.
			</p>

			<p>
			Pointer events target the topmost element under the cursor by working backwards through the rendering layers and
			figuring out which element is highest in the stacking order. The last few rendering layers provide the data for overflow,
			clipping, visibility and z-index transforms.
			</p>

			<p>
			For regular HTML elements like divs, buttons and links, the browser hit-tests against the entire content or border box,
			so the whole visual area responds to clicks. There are also ways of going around this. For example, clipped regions don’t
			register pointer events. Below is an example... 
			</p>

			{/* <div style={{ margin: '40px 0', position: 'relative' }}>
				<ClipCorner />
			</div> */}

			<h3>
				Hit-testing in the current implementation
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

		</div>
	)
}

export default App
