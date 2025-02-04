import { Box } from "@mui/material";
import PropTypes from "prop-types";

const isValidBase64Image = (data) => {
	return /^[A-Za-z0-9+/=]+$/.test(data);
};

const Image = ({
	shouldRender = true,
	src,
	alt,
	width = "auto",
	height = "auto",
	maxWidth = "auto",
	maxHeight = "auto",
	base64,
}) => {
	if (shouldRender === false) {
		return null;
	}

	if (typeof src !== "undefined" && typeof base64 !== "undefined") {
		console.warn("base64 takes precedence over src and overwrites it");
	}

	if (typeof base64 !== "undefined" && isValidBase64Image(base64)) {
		src = `data:image/png;base64,${base64}`;
	}

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
	shouldRender: PropTypes.bool,
	src: PropTypes.string,
	alt: PropTypes.string.isRequired,
	width: PropTypes.string,
	height: PropTypes.string,
	maxWidth: PropTypes.string,
	maxHeight: PropTypes.string,
	base64: PropTypes.string,
};

export default Image;
