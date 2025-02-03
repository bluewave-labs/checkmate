import { TabContext, TabList } from "@mui/lab";
import { Stack, Tab } from "@mui/material";
import Settings from "./Settings";
import Content from "./Content";
const Tabs = ({
	form,
	errors,
	monitors,
	selectedMonitors,
	setSelectedMonitors,
	handleFormChange,
	handleImageChange,
	progress,
	removeLogo,
	tab,
	setTab,
	TAB_LIST,
}) => {
	return (
		<TabContext value={TAB_LIST[tab]}>
			<TabList
				onChange={(_, tab) => {
					setTab(TAB_LIST.indexOf(tab));
				}}
			>
				{TAB_LIST.map((tab, idx) => (
					<Tab
						key={Math.random()}
						label={TAB_LIST[idx]}
						value={TAB_LIST[idx]}
					/>
				))}
			</TabList>
			{tab === 0 ? (
				<Settings
					tabValue={TAB_LIST[0]}
					form={form}
					handleFormChange={handleFormChange}
					handleImageChange={handleImageChange}
					progress={progress}
					removeLogo={removeLogo}
					errors={errors}
				/>
			) : (
				<Content
					tabValue={TAB_LIST[1]}
					form={form}
					monitors={monitors}
					handleFormChange={handleFormChange}
					errors={errors}
					selectedMonitors={selectedMonitors}
					setSelectedMonitors={setSelectedMonitors}
				/>
			)}
		</TabContext>
	);
};

export default Tabs;
