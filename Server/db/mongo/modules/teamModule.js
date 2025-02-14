import Team from "../../models/Team.js";
import TeamMember from "../../models/TeamMember.js";
const SERVICE_NAME = "TeamModule";

const insertTeam = async (teamData) => {
	try {
		console.log(teamData);
		const team = await Team.create(teamData);
		return team;
	} catch (error) {
		error.service = SERVICE_NAME;
		error.method = "insertTeam";
		throw error;
	}
};

const insertTeamMember = async (teamMemberData) => {
	try {
		const teamMember = await TeamMember.create(teamMemberData);
		return teamMember;
	} catch (error) {
		error.service = SERVICE_NAME;
		error.method = "insertTeamMember";
		throw error;
	}
};

export { insertTeam, insertTeamMember };
