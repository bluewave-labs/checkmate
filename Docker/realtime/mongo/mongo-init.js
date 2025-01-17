const ADMIN_USER = process.env.ADMIN_USERNAME_ENV_VAR;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD_ENV_VAR;
const DB_USER = process.env.USERNAME_ENV_VAR;
const DB_PASSWORD = process.env.PASSWORD_ENV_VAR;

// Initialize the replica set

rs.initiate({
	_id: "rs0",
	members: [{ _id: 0, host: "localhost:27017" }],
});

rs.status();
while (!db.isMaster().ismaster) {
	sleep(1000);
}

// Use admin then create user root
console.log("Creating admin user");
try {
	var adminDB = db.getSiblingDB("admin");
	adminDB.createUser({
		user: ADMIN_USER,
		pwd: ADMIN_PASSWORD,
		roles: [{ role: "root", db: "admin" }],
	});
} catch (error) {
	console.log(error);
}

// Authenticate as the root user
adminDB.auth("superuser", "superuser");

var dbName = "uptime_db";
// Create a new user in the target database
console.log("creating user");
try {
	adminDB.createUser({
		user: DB_USER,
		pwd: DB_PASSWORD,
		roles: [{ role: "readWrite", db: dbName }],
	});
} catch (error) {
	console.log(error);
}
