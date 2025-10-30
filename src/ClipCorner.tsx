import { useState } from 'react'

const ClipCorner = () => {
	const [isClipped, setIsClipped] = useState(false)
	const [hoverTopRight, setHoverTopRight] = useState(false)
	const [hoverBottomRight, setHoverBottomRight] = useState(false)

	const cornerSize = 80 // Size of the triangle corner

	return (
		<div className="flex items-center justify-center p-8">
			<div className="relative w-96 h-96">
				{/* Main box with image */}
				<div
					className="absolute inset-0 bg-white border-4 border-black rounded-2xl overflow-hidden transition-all duration-300"
					style={{
						clipPath: isClipped
							? `polygon(0 0, calc(100% - ${cornerSize}px) 0, 100% ${cornerSize}px, 100% 100%, 0 100%)`
							: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
					}}
				>
					{/* Background with the clip-box image */}
					<div className="w-full h-full flex items-center justify-center p-8">
						<img 
							src="/assets/clip-box.png" 
							alt="Clip box with diagonal line"
							className="w-full h-full object-contain"
						/>
					</div>
				</div>

				{/* Top-right triangle - visible when NOT clipped */}
				{!isClipped && (
					<button
						className="absolute top-0 right-0 cursor-pointer z-10 transition-opacity"
						style={{
							width: 0,
							height: 0,
							borderStyle: 'solid',
							borderWidth: `0 ${cornerSize}px ${cornerSize}px 0`,
							borderColor: `transparent ${hoverTopRight ? '#94a3b8' : '#cbd5e1'} transparent transparent`,
							pointerEvents: 'auto',
						}}
						onMouseEnter={() => setHoverTopRight(true)}
						onMouseLeave={() => setHoverTopRight(false)}
						onClick={() => setIsClipped(true)}
						aria-label="Fold corner"
					/>
				)}

				{/* Bottom-right triangle - visible when clipped */}
				{isClipped && (
					<button
						className="absolute cursor-pointer z-10 transition-opacity"
						style={{
							top: 0,
							right: 0,
							width: 0,
							height: 0,
							borderStyle: 'solid',
							borderWidth: `0 ${cornerSize}px ${cornerSize}px 0`,
							borderColor: `transparent ${hoverBottomRight ? '#94a3b8' : '#cbd5e1'} transparent transparent`,
							transform: 'rotate(180deg)',
							transformOrigin: `${cornerSize/2}px ${cornerSize/2}px`,
							pointerEvents: 'auto',
						}}
						onMouseEnter={() => setHoverBottomRight(true)}
						onMouseLeave={() => setHoverBottomRight(false)}
						onClick={() => setIsClipped(false)}
						aria-label="Unfold corner"
					/>
				)}

				{/* Clipped region indicator - the folded corner that appears after clipping */}
				{isClipped && (
					<div
						className="absolute top-0 right-0 z-20"
						style={{
							width: 0,
							height: 0,
							borderStyle: 'solid',
							borderWidth: `0 ${cornerSize}px ${cornerSize}px 0`,
							borderColor: 'transparent #64748b transparent transparent',
							pointerEvents: 'none',
						}}
					/>
				)}
			</div>

			{/* Instructions */}
			<div className="ml-8 max-w-xs">
				<p className="text-sm text-gray-700 mb-2">
					{!isClipped ? (
						<>
							<strong>Click the top-right corner</strong> to fold it along the diagonal line.
						</>
					) : (
						<>
							<strong>Click the bottom-right corner</strong> to unfold it back.
						</>
					)}
				</p>
				<p className="text-xs text-gray-500">
					The clipped area doesn't receive pointer events.
				</p>
			</div>
		</div>
	)
}

export default ClipCorner

