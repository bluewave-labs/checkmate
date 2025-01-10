import PropTypes from "prop-types";
import { Stack, Typography } from "@mui/material";
import { useTheme } from "@emotion/react";
import { MuiColorInput } from "mui-color-input";

/**
 *
 * @param {*} id The ID of the component
 * @param {*} label The Label of the component
 * @param {*} value The color value of the component
 * @param {*} error The error of the component
 * @param {*} onChange The Change handler function
 * @param {*} onBlur The Blur handler function
 * @returns The ColorPicker component
 * Example usage:
 * 	<ColorPicker
 *		id="color"
 *		label="Color"
 *		value={form.color}
 *		error={errors["color"]}
 *		onChange={handleColorChange}
 *		onBlur={handleBlur}
 *		>
 *	</ColorPicker>
 */
const ColorPicker = ({ id, label, value, error, onChange, onBlur }) => {
	const theme = useTheme();
	return (
		<Stack gap={theme.spacing(4)}>
			<MuiColorInput
				format="hex"
				value={value}
				id={id}
				label={label}
				onChange={onChange}
				onBlur={onBlur}
			/>
			{error && (
				<Typography
					component="span"
					className="input-error"
					color={theme.palette.error.main}
					mt={theme.spacing(2)}
					sx={{
						opacity: 0.8,
					}}
				>
					{error}
				</Typography>
			)}
		</Stack>
	);
};

ColorPicker.propTypes = {
	id: PropTypes.string.isRequired,
	label: PropTypes.string.isRequired,
	value: PropTypes.string,
	error: PropTypes.string,
	onChange: PropTypes.func.isRequired,
	onBlur: PropTypes.func.isRequired,
};

export default ColorPicker;
