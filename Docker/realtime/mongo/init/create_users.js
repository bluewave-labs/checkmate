var username = process.env.USERNAME_ENV_VAR;
var password = process.env.PASSWORD_ENV_VAR;

// Check if the current node is the primary
var isMaster = db.isMaster();
if (isMaster.ismaster) {
	db = db.getSiblingDB("uptime_db");

	db.createUser({
		user: username,
		pwd: password,
		roles: [
			{
				role: "readWrite",
				db: "uptime_db",
			},
		],
	});
	print("User " + username + " created successfully");
} else {
	print("Not the primary node, skipping user creation");
}
