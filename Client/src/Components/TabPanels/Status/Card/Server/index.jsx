import { ServerStartAdornment, ServerEndAdornment } from "../../../../Inputs/TextInput/Adornments";
import Search from "../../../../Inputs/Search";
import {useState} from "react"

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
const Server = ({ id, removeItem, onChange, monitors, value }) => {
	const [search, setSearch] = useState("");	
	const handleSearch = (val) => {
		setSearch(val);
	};
	return (
		<Search
			id={id}
			multiple={false}
			isAdorned={false}
			options={monitors ? monitors : []}
			filteredBy="name"
			inputValue={search}
			value={value}		
			startAdornment={<ServerStartAdornment />}
			endAdornment={
				<ServerEndAdornment
					id={id}
					removeItem={removeItem}
				/>
			}
			handleInputChange={handleSearch}
			handleChange={onChange}
		/>
	);
};

export default Server;