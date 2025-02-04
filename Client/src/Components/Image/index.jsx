import { Box } from "@mui/material";
import PropTypes from "prop-types";

const Image = ({
	src,
	alt,
	width = "auto",
	height = "auto",
	maxWidth = "auto",
	maxHeight = "auto",
}) => {
	return (
		<Box
			component="img"
			src={src}
			alt={alt}
			maxWidth={maxWidth}
			maxHeight={maxHeight}
			width={width}
			height={height}
		/>
	);
};

Image.propTypes = {
	src: PropTypes.string,
	alt: PropTypes.string.isRequired,
	width: PropTypes.string,
	height: PropTypes.string,
};

export default Image;
