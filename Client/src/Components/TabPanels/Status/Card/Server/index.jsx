import {
	ServerEndAdornment,
} from "../../../../Inputs/TextInput/Adornments";
import Search from "../../../../Inputs/Search";
import { useState } from "react";
import ReorderRoundedIcon from "@mui/icons-material/ReorderRounded";
import { Stack, IconButton } from "@mui/material";
import React from "react";
/**
 *
 * @param {*} id The Id of the Server component
 * @param {*} removeItem The function used to remove a single server
 * @param {*} onChange The Change handler function to handle when the server value is changed
 * used to update the server(monitor) lists
 * @param {*} monitors The server monitors options
 * @param {*} value the option label of the server/monitor, namely the monitor name field
 * @returns
 */
const Server = (props) => {
	const [search, setSearch] = useState("");
	const handleSearch = (val) => {
		setSearch(val);
	};
	return (
		<Stack direction={"row"}>
			<IconButton>
				<ReorderRoundedIcon />
			</IconButton>
			<Search
				id={props.id}
				multiple={false}
				isAdorned={false}
				options={props.monitors ? props.monitors : []}
				filteredBy="name"
				inputValue={search}
				value={props.value}
				endAdornment={
					<ServerEndAdornment
						id={props.id}
						removeItem={props.removeItem}
					/>
				}
				handleInputChange={handleSearch}
				handleChange={props.onChange}
			/>
		</Stack>
	);
};

export default Server;
