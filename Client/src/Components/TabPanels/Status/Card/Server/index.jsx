import { ServerStartAdornment, ServerEndAdornment } from "../../../../Inputs/TextInput/Adornments";
import Search from "../../../../Inputs/Search";
import {useState} from "react"

const Server = ({ id, removeItem, onChange, monitors, value, label }) => {
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