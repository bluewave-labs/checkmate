import { Link as MuiLink, useTheme } from "@mui/material";
import PropTypes from "prop-types";

/**
 * @component
 * @param {Object} props
 * @param {'primary' | 'secondary' | 'tertiary' | 'error'} props.level - The level of the link
 * @param {string} props.label - The label of the link
 * @param {string} props.url - The URL of the link
 * @returns {JSX.Element}
 */

const Link = ({ level, label, url }) => {
  const theme = useTheme();

  const levelConfig = {
    primary: {},
    secondary: {},
    tertiary: {
      color: theme.palette.tertiary.main,
      sx: {
        textDecoration: "underline",
        textDecorationStyle: "dashed",
        textDecorationColor: theme.palette.primary.main,
        ":hover": {
          color: theme.palette.tertiary.main,
          textDecorationColor: theme.palette.primary.main,
          backgroundColor: theme.palette.tertiary.linkHover,
        },
      },
    },
    error: {},
  };
  const { sx, color } = levelConfig[level];
  return (
    <MuiLink href={url} sx={sx} color={color}>
      {label}
    </MuiLink>
  );
};

Link.propTypes = {
  url: PropTypes.string.isRequired,
  level: PropTypes.oneOf(["primary", "secondary", "tertiary", "error"]),
  label: PropTypes.string.isRequired,
};

export default Link;
