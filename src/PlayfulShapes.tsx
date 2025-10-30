import { useState, useEffect } from 'react'

interface ShapeConfig {
	src: string
	size: number
	offset: number // Phase offset to stagger animations
}

const shapes: ShapeConfig[] = [
	{ src: '/assets/rectangle.png', size: 70, offset: 0.5 },
	{ src: '/assets/triangle.png', size: 80, offset: 1 },
]

export default function PlayfulShapes() {
	const [time, setTime] = useState(0)

	useEffect(() => {
		const timer = setInterval(() => {
			setTime(prev => {
				// Stop incrementing after animation completes (once through all phases)
				if (prev >= 75) return prev
				return prev + 1
			})
		}, 750)
		return () => clearInterval(timer)
	}, [])

	const getShapeStyle = (shape: ShapeConfig) => {
		// Each shape cycles through phases - plays once only
		const totalCycle = 60
		const phase = Math.min(Math.floor((time + shape.offset) / totalCycle * 5), 6)

		const baseStyle = {
			position: 'fixed' as const,
			width: `${shape.size}px`,
			height: `${shape.size}px`,
			pointerEvents: 'none' as const,
			zIndex: 10000,
			transition: 'all 1.5s cubic-bezier(0.45, 0.05, 0.55, 0.95)',
		}

		// Different movement patterns for each shape based on its offset
		const variation = shape.offset * 5 // Creates variety in movements, subtle spacing

		switch(phase) {
			case 0: // Off screen (waiting)
			case 1: // Still off screen
			case 2: // Still off screen
				return {
					...baseStyle,
					left: '0vw',
					top: `${45 + variation * 1.5}%`,
					transform: 'translateY(-50%)',
					opacity: 0,
				}
			case 3: // Move to left edge - first position
				return {
					...baseStyle,
					left: `${30 + variation * 3}px`,
					top: `${40 + variation * 2}%`,
					transform: `translateY(-1%) rotate(${3 - variation * 1}deg)`,
					opacity: 1,
				}
			case 4: // Playful movement 1 - small movement
				return {
					...baseStyle,
					left: `${35 + variation * -2}px`,
					top: `${42 + variation * 2.5}%`,
					transform: `translateY(-10%) rotate(${-4 + variation * 1.5}deg) scale(${1.03 - variation * 0.01})`,
					opacity: 1,
				}
			case 5: // Playful movement 2 - small movement
				return {
					...baseStyle,
					left: `${32 + variation * 2.5}px`,
					top: `${44 + variation * -2}%`,
					transform: `translateY(-10%) rotate(${2 + variation * 2}deg) scale(${0.97 + variation * 0.02})`,
					opacity: 0,
				}
			case 6: // Start exiting off screen left
				return {
					...baseStyle,
					left: '-120px',
					top: `${33 + variation * 2}%`,
					transform: `translateY(-50%) rotate(${-10 + variation * 3}deg)`,
					opacity: 0,
				}
			case 7: // Off screen (waiting before next cycle)
				return {
					...baseStyle,
					left: '-120px',
					top: `${43 + variation * 3}%`,
					transform: `translateY(-50%) rotate(${-10 + variation * 3}deg)`,
					opacity: 0,
				}
			default:
				return baseStyle
		}
	}

	const getRightCircleStyle = () => {
		const phase = Math.min(Math.floor(time / 60 * 5), 6)
		const baseStyle = {
			position: 'fixed' as const,
			width: '75px',
			height: '75px',
			pointerEvents: 'none' as const,
			zIndex: 10000,
			transition: 'all 1.5s cubic-bezier(0.45, 0.05, 0.55, 0.95)',
		}

		switch(phase) {
			case 0: case 1: case 2:
				return { ...baseStyle, right: '0vw', top: '75%', transform: 'translateY(-50%)', opacity: 0 }
			case 3:
				return { ...baseStyle, right: '30px', top: '70%', transform: 'translateY(-1%) rotate(-3deg)', opacity: 1 }
			case 4:
				return { ...baseStyle, right: '35px', top: '72.5%', transform: 'translateY(-10%) rotate(4deg) scale(1.03)', opacity: 1 }
			case 5:
				return { ...baseStyle, right: '32px', top: '74%', transform: 'translateY(-10%) rotate(-2deg) scale(0.97)', opacity: 0 }
			case 6:
				return { ...baseStyle, right: '-120px', top: '73%', transform: 'translateY(-50%) rotate(10deg)', opacity: 0 }
			default:
				return baseStyle
		}
	}

	return (
		<>
			{shapes.map((shape, index) => (
				<img 
					key={index}
					src={shape.src} 
					alt={`playful shape ${index}`}
					style={getShapeStyle(shape)}
				/>
			))}
			<img src="/assets/circle.png" alt="playful circle" style={getRightCircleStyle()} />
		</>
	)
}

