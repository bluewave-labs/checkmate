import React, { useState } from "react";
import PropTypes from "prop-types";
import { Box, IconButton, Stack, TextField, Typography } from "@mui/material";
import { useTheme } from "@emotion/react";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import "./index.css";
import { checkImage } from "../../../Utils/fileUtils";

/**
 * @param {Object} props - The component props.
 * @param {string} props.id - The unique identifier for the input field.
 * @param {string} props.src - The URL of the image to display.
 * @param {function} props.onChange - The function to handle file input change.
 * @returns {JSX.Element} The rendered component.
 */

const ImageField = ({ id, src, loading, onChange }) => {
	const theme = useTheme();

	const [isDragging, setIsDragging] = useState(false);
	const handleDragEnter = () => {
		setIsDragging(true);
	};
	const handleDragLeave = () => {
		setIsDragging(false);
	};

	return (
		<>
			{!checkImage(src) || loading ? (
				<>
					<Box
						className="image-field-wrapper"
						mt={theme.spacing(8)}
						sx={{
							position: "relative",
							height: "fit-content",
							border: "dashed",
							borderRadius: theme.shape.borderRadius,
							borderColor: isDragging
								? theme.palette.primary.main
								: theme.palette.border.light,
							borderWidth: "2px",
							transition: "0.2s",
							"&:hover": {
								borderColor: theme.palette.primary.main,
								backgroundColor: "hsl(215, 87%, 51%, 0.05)",
							},
						}}
						onDragEnter={handleDragEnter}
						onDragLeave={handleDragLeave}
						onDrop={handleDragLeave}
					>
						<TextField
							id={id}
							type="file"
							onChange={onChange}
							sx={{
								width: "100%",
								"& .MuiInputBase-input[type='file']": {
									opacity: 0,
									cursor: "pointer",
									maxWidth: "500px",
									minHeight: "175px",
								},
								"& fieldset": {
									padding: 0,
									border: "none",
								},
							}}
						/>
						<Stack
							className="custom-file-text"
							alignItems="center"
							gap="4px"
							sx={{
								position: "absolute",
								top: "50%",
								left: "50%",
								transform: "translate(-50%, -50%)",
								zIndex: "-1",
								width: "100%",
							}}
						>
							<IconButton
								sx={{
									pointerEvents: "none",
									borderRadius: theme.shape.borderRadius,
									border: `solid ${theme.shape.borderThick}px ${theme.palette.border.light}`,
									boxShadow: theme.shape.boxShadow,
								}}
							>
								<CloudUploadIcon />
							</IconButton>
							<Typography
								component="h2"
								color={theme.palette.primary.contrastText.tertiary}
							>
								<Typography
									component="span"
									fontSize="inherit"
									color={theme.palette.primary.main}
									fontWeight={500}
								>
									Click to upload
								</Typography>{" "}
								or drag and drop
							</Typography>
							<Typography
								component="p"
								color={theme.palette.primary.contrastText.tertiary}
								sx={{ opacity: 0.6 }}
							>
								(maximum size: 3MB)
							</Typography>
						</Stack>
					</Box>
					<Typography
						component="p"
						color={theme.palette.primary.contrastText.tertiary}
						sx={{ opacity: 0.6 }}
					>
						Supported formats: JPG, PNG
					</Typography>
				</>
			) : (
				<Stack
					direction="row"
					justifyContent="center"
				>
					<Box
						sx={{
							width: "250px",
							height: "250px",
							borderRadius: "50%",
							overflow: "hidden",
							backgroundImage: `url(${src})`,
							backgroundSize: "cover",
						}}
					></Box>
				</Stack>
			)}
		</>
	);
};

ImageField.propTypes = {
	id: PropTypes.string.isRequired,
	src: PropTypes.string,
	onChange: PropTypes.func.isRequired,
};

export default ImageField;
