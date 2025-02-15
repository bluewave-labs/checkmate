import Team from "../../models/Team.js";
import TeamMember from "../../models/TeamMember.js";
const SERVICE_NAME = "TeamModule";

const insertTeam = async (teamData) => {
	try {
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

const getTeamsByUserId = async (userId) => {
	try {
		console.log(userId);
		const teams = await TeamMember.find({ userId: userId }).select("teamId").lean();
		return teams.map((team) => team.teamId);
	} catch (error) {
		error.service = SERVICE_NAME;
		error.method = "getTeamsByUserId";
		throw error;
	}
};

export { insertTeam, insertTeamMember, getTeamsByUserId };
