import { createTheme } from "@mui/material";
import { baseTheme } from "./globalTheme";
import { /* colors, */ newSemanticColors } from "./constants";
import { extractThemeColors } from "./extractColorObject";

const palette = extractThemeColors("light", newSemanticColors);

/* TODO I figured out we could have just one theme by passing mode as parameter for theme function. Implement later */
const lightTheme = createTheme({
	palette,
	...baseTheme(palette),
});

export default lightTheme;

/* 
TODO
Next step: check if all keys here are being used in the codebase. e.g.: Search codebase for palette.primary; also check for destructuring palette ('= theme.palette')
*/

// 	action: {
// 		disabled: border.light.disabled,
// 	},
// 	percentage: {
// 		uptimePoor: error.main.light,
// 		uptimeFair: warning.contrastText.light,
// 		uptimeGood: warning.main.light /* Change for a success color? */,
// 		uptimeExcellent: success.main.light,
// 	},
// 	unresolved: {
// 		main: unresolved.main.light,
// 		light: unresolved.light.light,
// 		bg: unresolved.bg.light,
// 	},
// 	divider: border.light.light,
// 	other: {
// 		icon: other.icon.light,
// 		line: other.line.light,
// 		fill: secondary.dark.light,
// 		grid: other.grid.light,
// 		autofill: other.autofill.light,
// 	},
// 	gradient: {
// 		color1,
// 		color2,
// 		color3,
// 		color4,
// 		color5,
// 	},
// 	text: {
// 		primary: text.primary.light,
// 		secondary: text.secondary.light,
// 		tertiary: text.tertiary.light,
// 		accent: text.accent.light,
// 	},
// 	background: {
// 		main: background.main.light,
// 		alt: background.alt.light,
// 		fill: background.fill.light,
// 		accent: background.accent.light,
// 	},
// 	border: {
// 		light: border.light.light,
// 		dark: primary.lowContrast.light,
// 	},
// 	info: {
// 		text: text.primary.light,
// 		main: text.tertiary.light,
// 		bg: background.main.light,
// 		light: background.main.light,
// 		border: primary.lowContrast.light,
// 	},
// };
