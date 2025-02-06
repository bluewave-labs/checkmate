import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, MenuItem, Select, Stack } from "@mui/material";
import { useTheme } from "@emotion/react";
import Flag from "react-world-flags";

// Dil kodlarını ülke kodlarına eşleştirme
const COUNTRY_CODES = {
	en: "GB",
	tr: "TR",
};

const LanguageSelector = () => {
	const { i18n } = useTranslation();
	const theme = useTheme();
	const [language, setLanguage] = useState(i18n.language || "en");

	const handleChange = (event) => {
		const newLang = event.target.value;
		setLanguage(newLang);
		i18n.changeLanguage(newLang);
	};

	// i18n instance'ından mevcut dilleri al
	const languages = Object.keys(i18n.options.resources || {});

	return (
		<Select
			value={language}
			onChange={handleChange}
			size="small"
			sx={{
				height: 28,
				width: 64,
				backgroundColor: theme.palette.primary.main,
				color: theme.palette.primary.contrastText,
				borderRadius: theme.shape.borderRadius,
				fontSize: 10,
				"& .MuiOutlinedInput-notchedOutline": {
					borderColor: theme.palette.primary.lowContrast,
					borderRadius: theme.shape.borderRadius,
				},
				"&:hover .MuiOutlinedInput-notchedOutline": {
					borderColor: theme.palette.primary.lowContrast,
				},
				"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
					borderColor: theme.palette.primary.lowContrast,
				},
				"& .MuiSvgIcon-root": {
					color: theme.palette.primary.contrastText,
					width: 16,
					height: 16,
					right: 4,
					top: "calc(50% - 8px)",
				},
				"& .MuiSelect-select": {
					padding: "2px 20px 2px 6px",
					display: "flex",
					alignItems: "center",
					fontSize: 10,
				},
			}}
			MenuProps={{
				PaperProps: {
					sx: {
						backgroundColor: theme.palette.primary.main,
						borderRadius: theme.shape.borderRadius,
						marginTop: 1,
						width: 64,
						"& .MuiMenuItem-root": {
							padding: "2px 6px",
							minHeight: 28,
							fontSize: 10,
						},
					},
				},
				anchorOrigin: {
					vertical: "bottom",
					horizontal: "left",
				},
				transformOrigin: {
					vertical: "top",
					horizontal: "left",
				},
			}}
		>
			{languages.map((lang) => (
				<MenuItem
					key={lang}
					value={lang}
					sx={{
						color: theme.palette.primary.contrastText,
						"&:hover": {
							backgroundColor: theme.palette.primary.lowContrast,
						},
						"&.Mui-selected": {
							backgroundColor: theme.palette.primary.lowContrast,
							"&:hover": {
								backgroundColor: theme.palette.primary.lowContrast,
							},
						},
					}}
				>
					<Stack
						direction="row"
						spacing={2}
						alignItems="center"
					>
						<Box
							component="span"
							sx={{
								width: 16,
								height: 12,
								display: "flex",
								alignItems: "center",
								"& img": {
									width: "100%",
									height: "100%",
									objectFit: "cover",
									borderRadius: 0.5,
								},
							}}
						>
							<Flag code={lang} />
						</Box>
						<Box
							component="span"
							sx={{ textTransform: "uppercase", fontSize: 10 }}
						>
							{lang}
						</Box>
					</Stack>
				</MenuItem>
			))}
		</Select>
	);
};

export default LanguageSelector;
