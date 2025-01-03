import { typographyLevels } from "./constants";

const fontFamilyPrimary = '"Inter" , sans-serif';
// const fontFamilySecondary = '"Avenir", sans-serif';

/* TODO take the color out from here */
const shadow =
	"0px 4px 24px -4px rgba(16, 24, 40, 0.08), 0px 3px 3px -3px rgba(16, 24, 40, 0.03)";

const baseTheme = (palette) => ({
	typography: {
		fontFamily: fontFamilyPrimary,
		fontSize: 14,
		h1: {
			fontSize: typographyLevels.xl,
			color: palette.text.primary,
			fontWeight: 500,
		},
		h2: {
			fontSize: typographyLevels.l,
			color: palette.text.secondary,
			fontWeight: 400,
		},
		body1: {
			fontSize: typographyLevels.m,
			color: palette.text.tertiary,
			fontWeight: 400,
		},
		body2: {
			fontSize: typographyLevels.s,
			color: palette.text.tertiary,
			fontWeight: 400,
		},
	},
	/* TODO we can skip using the callback functions on the next lines since we are already accessing it on line 10. That was the last thing I managed to do, so we are sort of doing it twice*/

	spacing: 2,
	/* TODO All these should live inside of a component*/
	components: {
		MuiButton: {
			defaultProps: {
				disableRipple: true,
			},
			styleOverrides: {
				root: ({ theme }) => ({
					variants: [
						{
							props: (props) => props.variant === "group",
							style: {
								/* color: theme.palette.secondary.contrastText, */
								color: theme.palette.neutral.contrastText,
								backgroundColor: theme.palette.background.main,
								border: 1,
								borderStyle: "solid",
								borderColor: theme.palette.border.light,
							},
						},
						{
							props: (props) => props.variant === "group" && props.filled === "true",
							style: {
								backgroundColor: theme.palette.secondary.main,
							},
						},
						{
							props: (props) =>
								props.variant === "contained" && props.color === "secondary",
							style: {
								border: 1,
								borderStyle: "solid",
								borderColor: theme.palette.border.light,
							},
						},
						{
							props: (props) => {
								return (
									props.variant === "contained" &&
									props.disabled &&
									props.classes.loadingIndicator === undefined // Do not apply to loading button
								);
							},
							style: {
								backgroundColor: `${theme.palette.secondary.main} !important`,
								color: `${theme.palette.secondary.contrastText} !important`,
							},
						},
					],
					fontWeight: 400,
					borderRadius: 4,
					boxShadow: "none",
					textTransform: "none",
					"&:focus": {
						outline: "none",
					},
					"&:hover": {
						boxShadow: "none",
					},
					"&.MuiLoadingButton-root": {
						"&:disabled": {
							backgroundColor: theme.palette.secondary.main,
							color: theme.palette.text.primary,
						},
					},
					"&.MuiLoadingButton-loading": {
						"& .MuiLoadingButton-label": {
							color: "transparent",
						},
						"& .MuiLoadingButton-loadingIndicator": {
							color: "inherit",
						},
					},
				}),
			},
		},

		MuiIconButton: {
			styleOverrides: {
				root: ({ theme }) => ({
					padding: 4,
					transition: "none",
					"&:hover": {
						backgroundColor: theme.palette.background.fill,
					},
				}),
			},
		},
		MuiPaper: {
			styleOverrides: {
				root: ({ theme }) => {
					return {
						marginTop: 4,
						padding: 0,
						border: 1,
						borderStyle: "solid",
						borderColor: theme.palette.border.light,
						borderRadius: 4,
						boxShadow: shadow,
						backgroundColor: theme.palette.background.main,
						backgroundImage: "none",
					};
				},
			},
		},
		MuiList: {
			styleOverrides: {
				root: {
					padding: 0,
				},
			},
		},
		MuiListItemButton: {
			styleOverrides: {
				root: {
					transition: "none",
				},
			},
		},
		MuiMenuItem: {
			styleOverrides: {
				root: ({ theme }) => ({
					borderRadius: 4,
					backgroundColor: "inherit",
					padding: "4px 6px",
					color: theme.palette.text.secondary,
					fontSize: 13,
					margin: 2,
					minWidth: 100,
					"&:hover, &.Mui-selected, &.Mui-selected:hover, &.Mui-selected.Mui-focusVisible":
						{
							backgroundColor: theme.palette.background.fill,
						},
				}),
			},
		},
		MuiTableCell: {
			styleOverrides: {
				root: ({ theme }) => ({
					borderBottomColor: theme.palette.border.light,
				}),
			},
		},
		MuiTableHead: {
			styleOverrides: {
				root: ({ theme }) => ({
					backgroundColor: theme.palette.background.accent,
				}),
			},
		},
		MuiPagination: {
			styleOverrides: {
				root: ({ theme }) => ({
					backgroundColor: theme.palette.background.main,
					border: 1,
					borderStyle: "solid",
					borderColor: theme.palette.border.light,
					"& button": {
						color: theme.palette.text.tertiary,
						borderRadius: 4,
					},
					"& li:first-of-type button, & li:last-of-type button": {
						border: 1,
						borderStyle: "solid",
						borderColor: theme.palette.border.light,
					},
				}),
			},
		},
		MuiPaginationItem: {
			styleOverrides: {
				root: ({ theme }) => ({
					"&:not(.MuiPaginationItem-ellipsis):hover, &.Mui-selected": {
						backgroundColor: theme.palette.background.fill,
					},
				}),
			},
		},
		MuiSkeleton: {
			styleOverrides: {
				root: ({ theme }) => ({
					backgroundColor: theme.palette.unresolved.bg,
				}),
			},
		},
		MuiTextField: {
			styleOverrides: {
				root: ({ theme }) => ({
					"& fieldset": {
						borderColor: theme.palette.border.dark,
						borderRadius: theme.shape.borderRadius,
					},
					"& .MuiInputBase-input": {
						padding: ".75em",
						minHeight: "var(--env-var-height-2)",
						fontSize: "var(--env-var-font-size-medium)",
						fontWeight: 400,
						color: palette.text.secondary,
						"&.Mui-disabled": {
							opacity: 0.3,
							WebkitTextFillColor: "unset",
						},
					},
					"& .MuiInputBase-input:-webkit-autofill": {
						transition: "background-color 5000s ease-in-out 0s",
						WebkitBoxShadow: `0 0 0px 1000px ${theme.palette.background.main} inset`,
						WebkitTextFillColor: theme.palette.text.primary,
					},
					"& .MuiInputBase-input.MuiOutlinedInput-input": {
						padding: "0 var(--env-var-spacing-1-minus) !important",
					},
					"& .MuiOutlinedInput-root": {
						borderRadius: 4,
					},
					"& .MuiOutlinedInput-notchedOutline": {
						borderRadius: 4,
					},

					"& .MuiFormHelperText-root": {
						color: palette.error.main,
						opacity: 0.8,
						fontSize: "var(--env-var-font-size-medium)",

						marginLeft: 0,
					},
					"& .MuiFormHelperText-root.Mui-error": {
						opacity: 0.8,
						fontSize: "var(--env-var-font-size-medium)",
						color: palette.error.main,
					},
				}),
			},
		},
	},
	shape: {
		borderRadius: 2,
		borderThick: 2,
		boxShadow: shadow,
	},
});

export { baseTheme };
