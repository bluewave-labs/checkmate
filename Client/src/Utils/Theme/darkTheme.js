import { createTheme } from "@mui/material";
import { baseTheme } from "./globalTheme";
import { /* colors, */ newSemanticColors } from "./constants";
import { extractThemeColors } from "./extractColorObject";

const palette = extractThemeColors("dark", newSemanticColors);

const darkTheme = createTheme({
	palette,
	...baseTheme(palette),
});

export default darkTheme;

// 	action: {
// 		disabled: primary.lowContrast.disabled,
// 	},
// 	/* From this part on, try to create semantic structure, not feature based structure */
// 	percentage: {
// 		uptimePoor: error.main.dark,
// 		uptimeFair: warning.contrastText.dark,
// 		uptimeGood: warning.main.dark /* Change for a success color? ?*/,
// 		uptimeExcellent: success.main.dark,
// 	},
// 	unresolved: {
// 		main: unresolved.main.dark,
// 		light: unresolved.light.dark,
// 		bg: unresolved.bg.dark,
// 	},
// 	divider: border.light.dark,
// 	other: {
// 		icon: text.secondary.dark,
// 		line: border.light.dark,
// 		fill: background.accent.dark,
// 		grid: other.grid.dark,
// 		autofill: secondary.main.dark,
// 	},
// 	gradient: {
// 		color1,
// 		color2,
// 		color3,
// 		color4,
// 		color5,
// 	},
// 	text: {
// 		primary: text.primary.dark,
// 		secondary: text.secondary.dark,
// 		tertiary: text.tertiary.dark,
// 		accent: text.accent.dark,
// 	},
// 	background: {
// 		main: background.main.dark,
// 		alt: background.alt.dark,
// 		fill: background.fill.dark,
// 		accent: background.accent.dark,
// 	},
// 	border: {
// 		light: border.light.dark,
// 		dark: primary.lowContrast.dark,
// 	},
// 	info: {
// 		text: text.primary.dark,
// 		main: text.secondary.dark,
// 		bg: background.main.dark,
// 		light: background.main.dark,
// 		border: border.light.dark,
// 	},
// };
