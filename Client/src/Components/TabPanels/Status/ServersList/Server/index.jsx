import { ServerStartAdornment, ServerEndAdornment } from "../../../../Inputs/TextInput/Adornments";
import Search from "../../../../Inputs/Search";
import {useState} from "react"
import React from "react"; 
import { Stack } from "@mui/material";

/**
 * 
 * @param {*} id The Id of the Server component
 * @param {*} monitors The server monitors options
 * @param {*} value the option label of the server/monitor, namely the monitor name field
 * @param {*} removeItem The function used to remove a single server
 * @param {*} onChange The Change handler function to handle when the server value is changed
 * used to update the server(monitor) lists* 
 * @param {*} dragHandleProps the dragHandleProps passed on to the designated dom node 
 * so that there will be a draging indicator when mouse over it
 * @returns A single server whose value is one of the existing monitors
 */

const Server = ({ id, value, monitors, onChange, removeItem, dragHandleProps }) => {
	const [search, setSearch] = useState("");
	const handleSearch = (val) => {
		setSearch(val);
	};
	return (
		<Stack direction={"row"}>
			<Search
				id={id}
				multiple={false}
				isAdorned={false}
				options={monitors ? monitors : []}
				filteredBy="name"
				inputValue={search}
				value={value}
				startAdornment={<ServerStartAdornment dragHandleProps={dragHandleProps} />}
				endAdornment={
					<ServerEndAdornment
						id={id}
						removeItem={removeItem}
					/>
				}
				handleInputChange={handleSearch}
				handleChange={onChange}
			/>
		</Stack>
	);
};

Server.propTypes = {
	id: PropTypes.string.isRequired,
	monitors: PropTypes.array.isRequired,
	value: PropTypes.string.isRequired,
	removeItem: PropTypes.function.isRequired,
	onChange: PropTypes.function.isRequired,
	dragHandleProps: PropTypes.object.isRequired,
};

export default Server;