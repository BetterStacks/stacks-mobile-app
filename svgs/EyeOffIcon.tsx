import * as React from "react"
import Svg, { Path } from "react-native-svg"
const SvgComponent = (props: any) => (
	<Svg
		xmlns="http://www.w3.org/2000/svg"
		width={24}
		height={24}
		fill="none"
		{...props}
	>
		<Path
			stroke="#6B7280"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={1.5}
			d="m3 3 18 18"
		/>
		<Path
			stroke="#6B7280"
			strokeWidth={1.5}
			d="M15.25 12c0 .54-.29 1.085-.872 1.521-.582.437-1.42.729-2.378.729-.958 0-1.796-.292-2.378-.729-.582-.436-.872-.982-.872-1.521 0-.54.29-1.085.872-1.521.582-.437 1.42-.729 2.378-.729.958 0 1.796.292 2.378.729.582.436.872.982.872 1.521Z"
		/>
		<Path
			stroke="#6B7280"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={1.5}
			d="M9.363 5.365A9.466 9.466 0 0 1 12 5c4 0 7.333 2.333 10 7-.778 1.361-1.612 2.524-2.503 3.488m-2.14 1.861C15.726 18.45 13.942 19 12 19c-4 0-7.333-2.333-10-7 1.369-2.395 2.913-4.175 4.632-5.34"
		/>
	</Svg>
)
export default SvgComponent
