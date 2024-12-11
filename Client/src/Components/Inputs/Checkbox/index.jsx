import PropTypes from "prop-types";
import { FormControlLabel, Checkbox as MuiCheckbox } from "@mui/material";
import { useTheme } from "@emotion/react";
import CheckboxOutline from "../../../assets/icons/checkbox-outline.svg?react";
import CheckboxFilled from "../../../assets/icons/checkbox-filled.svg?react";

import "./index.css";

/**
 * @param {Object} props
 * @param {string} props.id - The id attribute for the checkbox input.
 * @param {string} props.label - The label to display next to the checkbox.
 * @param {('small' | 'medium' | 'large')} - The size of the checkbox.
 * @param {boolean} props.isChecked - Whether the checkbox is checked or not.
 * @param {string} [props.value] - The value of the checkbox input.
 * @param {function} [props.onChange] - The function to call when the checkbox value changes.
 * @param {boolean} [props.isDisabled] - Whether the checkbox is disabled or not.
 *
 * @returns {JSX.Element}
 *
 * @example
 * <Checkbox
 *  id="checkbox-id"
 *  label="Ping monitoring"
 *  isChecked={checks.type === "ping"}
 *  value="ping"
 *  onChange={handleChange}
 * />
 */

const Checkbox = ({
	id,
	label,
	size = "medium",
	isChecked,
	value,
	onChange,
	isDisabled,
}) => {
	/* TODO move sizes to theme */
	const sizes = { small: "14px", medium: "16px", large: "18px" };
	const theme = useTheme();
	const override = typeof label == "string" ? {} : { alignSelf: "flex-start" };
	return (
		<FormControlLabel
			className="checkbox-wrapper"
			control={
				<MuiCheckbox
					checked={isDisabled ? false : isChecked}
					value={value}
					onChange={onChange}
					icon={<CheckboxOutline />}
					checkedIcon={<CheckboxFilled />}
					inputProps={{
						"aria-label": "controlled checkbox",
						id: id,
					}}
					sx={{						
						"&:hover": { backgroundColor: "transparent" },
						"& svg": { width: sizes[size], height: sizes[size] },
                        ...override						
					}}
				/>
			}
			label={label}
			disabled={isDisabled}
			sx={{
				borderRadius: theme.shape.borderRadius,
				p: theme.spacing(2.5),
				"& .MuiButtonBase-root": {
					width: theme.spacing(10),
					p: 0,
					mr: theme.spacing(6),
				},
				"&:not(:has(.Mui-disabled)):hover": {
					backgroundColor: theme.palette.background.accent,
				},
				"& span.MuiTypography-root": {
					fontSize: 13,
					color: theme.palette.text.tertiary,
				},
				".MuiFormControlLabel-label.Mui-disabled": {
					color: theme.palette.text.tertiary,
					opacity: 0.25,
				},
			}}
		/>
	);
};

Checkbox.propTypes = {
	id: PropTypes.string.isRequired,
	label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
	size: PropTypes.oneOf(["small", "medium", "large"]),
	isChecked: PropTypes.bool.isRequired,
	value: PropTypes.string,
	onChange: PropTypes.func,
	isDisabled: PropTypes.bool,
};

export default Checkbox;
