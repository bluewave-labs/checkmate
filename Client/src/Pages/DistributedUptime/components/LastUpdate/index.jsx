import { StatBox } from "../../Details";
import { useState, useEffect } from "react";
const LastUpdate = ({ heading, suffix, lastUpdateTime, trigger }) => {
	const [elapsedMs, setElapsedMs] = useState(lastUpdateTime);

	useEffect(() => {
		setElapsedMs(lastUpdateTime);
		const timer = setInterval(() => {
			setElapsedMs((prev) => prev + 10);
		}, 10);
		return () => clearInterval(timer);
	}, [lastUpdateTime, trigger]);

	return (
		<StatBox
			heading={heading}
			value={`${Math.floor(elapsedMs / 1000)} ${suffix}`}
		/>
	);
};
export default LastUpdate;
