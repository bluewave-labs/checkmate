import "maplibre-gl/dist/maplibre-gl.css";
import PropTypes from "prop-types";
import { useRef, useState, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import style from "./DistributedUptimeMapStyle.json";
import maplibregl from "maplibre-gl";
const DistributedUptimeMap = ({ width = "100%", height = "100%", checks }) => {
	const mapContainer = useRef(null);
	const map = useRef(null);
	const theme = useTheme();
	const [mapLoaded, setMapLoaded] = useState(false);

	const colorLookup = (avgResponseTime) => {
		if (avgResponseTime <= 150) {
			return "#00FF00"; // Green
		} else if (avgResponseTime <= 250) {
			return "#FFFF00"; // Yellow
		} else {
			return "#FF0000"; // Red
		}
	};

	useEffect(() => {
		if (mapContainer.current && !map.current) {
			map.current = new maplibregl.Map({
				container: mapContainer.current,
				style,
				center: [0, 20],
				zoom: 0.8,
			});
		}
		map.current.on("load", () => {
			setMapLoaded(true);
		});

		return () => {
			if (map.current) {
				map.current.remove();
				map.current = null;
			}
		};
	}, []);

	useEffect(() => {
		if (map.current && checks?.length > 0) {
			// Convert dots to GeoJSON
			const geojson = {
				type: "FeatureCollection",
				features: checks.map((check) => {
					return {
						type: "Feature",
						geometry: {
							type: "Point",
							coordinates: [check.lng, check.lat],
						},
						properties: {
							color: theme.palette.accent.main,
							// color: colorLookup(check.avgResponseTime) || "blue", // Default to blue if no color specified
						},
					};
				}),
			};

			// Update the source with new dots
			const source = map.current.getSource("data-dots");
			if (source) {
				source.setData(geojson);
			}
		}
	}, [checks, theme, mapLoaded]);
	return (
		<div
			ref={mapContainer}
			style={{
				width: width,
				height: height,
			}}
		/>
	);
};

DistributedUptimeMap.propTypes = {
	checks: PropTypes.array,
	width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default DistributedUptimeMap;
