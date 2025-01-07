import "maplibre-gl/dist/maplibre-gl.css";
import PropTypes from "prop-types";
import { useRef, useEffect } from "react";
import style from "./DistributedUptimeMapStye.json";
import maplibregl from "maplibre-gl";
const DistributedUptimeMap = ({ width = "100%", height = "100%", checks }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (mapContainer.current && !map.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style,
        center: [0, 20],
        zoom: 0.8,
      });
    }

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
        features: checks.map((check) => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [check.location.long, check.location.lat],
          },
          properties: {
            color: check.color || "blue", // Default to red if no color specified
          },
        })),
      };

      // Update the source with new dots
      const source = map.current.getSource("data-dots");
      if (source) {
        source.setData(geojson);
      }
    }
  }, [checks]);

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
