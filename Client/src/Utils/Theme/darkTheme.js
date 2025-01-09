import { createTheme } from "@mui/material";
import { baseTheme } from "./globalTheme";
import { colors, newSemanticColors } from "./constants";

function extractThemeColors(themeType, colorObject) {
	if (!["light", "dark"].includes(themeType)) {
		throw new Error('Invalid theme type. Use "light" or "dark".');
	}

	const extract = (obj) => {
		if (typeof obj !== "object" || obj === null) {
			return obj;
		}

		if ("light" in obj && "dark" in obj) {
			return obj[themeType]; // Return the value for the specified theme
		}

		// Reduce the object, keeping only the extracted themeType values
		return Object.keys(obj).reduce((acc, key) => {
			acc[key] = extract(obj[key]);
			return acc;
		}, {});
	};

	return extract(colorObject);
}
const palette = extractThemeColors("dark", newSemanticColors);

const darkTheme = createTheme({
	palette,
	...baseTheme(palette),
});

export default darkTheme;

// const {
// 	primary,
// 	secondary,
// 	success,
// 	error,
// 	warning,
// 	neutral,
// 	gradient: {
// 		color1: { dark: color1 },
// 		color2: { dark: color2 },
// 		color3: { dark: color3 },
// 		color4: { dark: color4 },
// 		color5: { dark: color5 },
// 	},
// 	background,
// 	text,
// 	border,
// 	unresolved,
// 	other,
// } = colors;

// const palette = {
// 	action: {
// 		disabled: primary.lowContrast.disabled,
// 	},
// 	primary: { main: primary.main.dark },
// 	secondary: {
// 		main: secondary.main.dark,
// 		contrastText: secondary.contrastText.dark,
// 		light: secondary.dark.dark,
// 		dark: secondary.dark.dark,
// 	},
// 	success: {
// 		main: success.main.dark,
// 		contrastText: success.contrastText.dark,
// 		light: success.light.dark,
// 		dark: success.dark.dark,
// 	},
// 	error: {
// 		main: error.main.dark,
// 		contrastText: error.contrastText.dark,
// 		light: error.light.dark,
// 		dark: error.dark.dark,
// 	},
// 	warning: {
// 		main: warning.main.dark,
// 		light: warning.light.dark,
// 		contrastText: warning.contrastText.dark,
// 		dark: warning.dark.dark,
// 	},
// 	neutral: {
// 		contrastText: neutral.contrastText.dark,
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
