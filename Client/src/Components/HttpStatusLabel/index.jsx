import PropTypes from "prop-types";
import { useTheme } from "@mui/material";
import { BaseLabel } from "../Label";

/**
 * @component
 * @param {Object} props
 * @param {number} props.status - The http status for the label
 * @param {Styles} props.customStyles - CSS Styles passed from parent component
 * @returns {JSX.Element}
 * @example
 * // Render a http status label
 * <HttpStatusLabel status={404} />
 */

const DEFAULT_CODE = 9999; // Default code for unknown status

const handleStatusCode = (status) => {
	if (status >= 100 && status < 600) {
		return status;
	}
	return DEFAULT_CODE;
};

const getRoundedStatusCode = (status) => {
	return Math.floor(status / 100) * 100;
};

const HttpStatusLabel = ({ status, customStyles }) => {
	const theme = useTheme();
	const colors = {
		400: {
			dotColor: theme.palette.warning.main,
			bgColor: theme.palette.warning.dark,
			borderColor: theme.palette.warning.light,
		},
		500: {
			dotColor: theme.palette.error.main,
			bgColor: theme.palette.error.dark,
			borderColor: theme.palette.error.light,
		},
		default: {
			dotColor: theme.palette.unresolved.main,
			bgColor: theme.palette.primary.lowContrast,
			borderColor: theme.palette.unresolved.light,
		},
	};

	const statusCode = handleStatusCode(status);

	const { borderColor, bgColor, dotColor } =
		colors[getRoundedStatusCode(statusCode)] || colors.default;
	return (
		<BaseLabel
			label={String(statusCode)}
			styles={{
				color: dotColor,
				backgroundColor: bgColor,
				borderColor: borderColor,
				...customStyles,
			}}
		/>
	);
};

HttpStatusLabel.propTypes = {
	status: PropTypes.number,
	customStyles: PropTypes.object,
};

export { HttpStatusLabel };
