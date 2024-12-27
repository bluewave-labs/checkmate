import {
	issueToken,
	registerUser,
	loginUser,
	refreshAuthToken,
	editUser,
	checkSuperadminExists,
	requestRecovery,
	validateRecovery,
	resetPassword,
	deleteUser,
	getAllUsers,
} from "../../controllers/authController.js";
import jwt from "jsonwebtoken";
import { errorMessages, successMessages } from "../../utils/messages.js";
import sinon from "sinon";
import { getTokenFromHeaders, tokenType } from "../../utils/utils.js";
import logger from "../../utils/logger.js";
import e from "cors";

describe("Auth Controller - issueToken", () => {
	let stub;

	afterEach(() => {
		sinon.restore(); // Restore stubs after each test
	});

	it("should reject with an error if jwt.sign fails", () => {
		const error = new Error("jwt.sign error");
		stub = sinon.stub(jwt, "sign").throws(error);
		const payload = { id: "123" };
		const appSettings = { jwtSecret: "my_secret" };
		expect(() => issueToken(payload, tokenType.ACCESS_TOKEN, appSettings)).to.throw(
			error
		);
	});

	it("should return a token if jwt.sign is successful and appSettings.jwtTTL is not defined", () => {
		const payload = { id: "123" };
		const appSettings = { jwtSecret: "my_secret" };
		const expectedToken = "mockToken";

		stub = sinon.stub(jwt, "sign").returns(expectedToken);
		const token = issueToken(payload, tokenType.ACCESS_TOKEN, appSettings);
		expect(token).to.equal(expectedToken);
	});

	it("should return a token if jwt.sign is successful and appSettings.jwtTTL is defined", () => {
		const payload = { id: "123" };
		const appSettings = { jwtSecret: "my_secret", jwtTTL: "1s" };
		const expectedToken = "mockToken";

		stub = sinon.stub(jwt, "sign").returns(expectedToken);
		const token = issueToken(payload, tokenType.ACCESS_TOKEN, appSettings);
		expect(token).to.equal(expectedToken);
	});

	it("should return a refresh token if jwt.sign is successful and appSettings.refreshTokenTTL is not defined", () => {
		const payload = {};
		const appSettings = { refreshTokenSecret: "my_refresh_secret" };
		const expectedToken = "mockRefreshToken";

		stub = sinon.stub(jwt, "sign").returns(expectedToken);
		const token = issueToken(payload, tokenType.REFRESH_TOKEN, appSettings);
		expect(token).to.equal(expectedToken);
	});

	it("should return a refresh token if jwt.sign is successful and appSettings.refreshTokenTTL is defined", () => {
		const payload = {};
		const appSettings = {
			refreshTokenSecret: "my_refresh_secret",
			refreshTokenTTL: "7d",
		};
		const expectedToken = "mockRefreshToken";

		stub = sinon.stub(jwt, "sign").returns(expectedToken);
		const token = issueToken(payload, tokenType.REFRESH_TOKEN, appSettings);
		expect(token).to.equal(expectedToken);
	});
});

describe("Auth Controller - registerUser", () => {
	let req, res, next;
	beforeEach(() => {
		req = {
			body: {
				firstName: "firstname",
				lastName: "lastname",
				email: "test@test.com",
				password: "Uptime1!",
				role: ["admin"],
				teamId: "123",
				inviteToken: "invite",
			},
			db: {
				checkSuperadmin: sinon.stub(),
				getInviteTokenAndDelete: sinon.stub(),
				updateAppSettings: sinon.stub(),
				insertUser: sinon.stub(),
			},
			settingsService: {
				getSettings: sinon.stub().resolves({
					jwtSecret: "my_secret",
					refreshTokenSecret: "my_refresh_secret",
				}),
			},
			emailService: {
				buildAndSendEmail: sinon.stub(),
			},
			file: {},
		};
		res = {
			status: sinon.stub().returnsThis(),
			json: sinon.stub(),
		};
		next = sinon.stub();
		sinon.stub(logger, "error");
	});
	afterEach(() => {
		sinon.restore();
	});

	it("should reject with an error if body validation fails", async () => {
		req.body = {};
		await registerUser(req, res, next);
		expect(next.firstCall.args[0]).to.be.an("error");
		expect(next.firstCall.args[0].status).to.equal(422);
	});

	it("should reject with an error if checkSuperadmin fails", async () => {
		req.db.checkSuperadmin.throws(new Error("checkSuperadmin error"));
		await registerUser(req, res, next);
		expect(next.firstCall.args[0]).to.be.an("error");
		expect(next.firstCall.args[0].message).to.equal("checkSuperadmin error");
	});

	it("should reject with an error if getInviteTokenAndDelete fails", async () => {
		req.db.checkSuperadmin.returns(true);
		req.db.getInviteTokenAndDelete.throws(new Error("getInviteTokenAndDelete error"));
		await registerUser(req, res, next);
		expect(next.firstCall.args[0]).to.be.an("error");
		expect(next.firstCall.args[0].message).to.equal("getInviteTokenAndDelete error");
	});

	it("should reject with an error if updateAppSettings fails", async () => {
		req.db.checkSuperadmin.returns(false);
		req.db.updateAppSettings.throws(new Error("updateAppSettings error"));
		await registerUser(req, res, next);
		expect(next.firstCall.args[0]).to.be.an("error");
		expect(next.firstCall.args[0].message).to.equal("updateAppSettings error");
	});

	it("should reject with an error if insertUser fails", async () => {
		req.db.checkSuperadmin.resolves(false);
		req.db.updateAppSettings.resolves();
		req.db.insertUser.rejects(new Error("insertUser error"));
		await registerUser(req, res, next);
		expect(next.firstCall.args[0]).to.be.an("error");
		expect(next.firstCall.args[0].message).to.equal("insertUser error");
	});

	it("should reject with an error if settingsService.getSettings fails", async () => {
		req.db.checkSuperadmin.resolves(false);
		req.db.updateAppSettings.resolves();
		req.db.insertUser.resolves({ _id: "123" });
		req.settingsService.getSettings.rejects(
			new Error("settingsService.getSettings error")
		);
		await registerUser(req, res, next);
		expect(next.firstCall.args[0]).to.be.an("error");
		expect(next.firstCall.args[0].message).to.equal("settingsService.getSettings error");
	});

	it("should log an error if emailService.buildAndSendEmail fails", async () => {
		req.db.checkSuperadmin.resolves(false);
		req.db.updateAppSettings.resolves();
		req.db.insertUser.returns({ _id: "123" });
		req.settingsService.getSettings.returns({
			jwtSecret: "my_secret",
			refreshTokenSecret: "my_secret",
		});
		req.emailService.buildAndSendEmail.rejects(new Error("emailService error"));
		await registerUser(req, res, next);
		expect(logger.error.calledOnce).to.be.true;
		expect(logger.error.firstCall.args[0].message).to.equal("emailService error");
	});
	it("should return a success message and data if all operations are successful", async () => {
		const user = { _id: "123" };
		req.db.checkSuperadmin.resolves(false);
		req.db.updateAppSettings.resolves();
		req.db.insertUser.returns(user);
		req.settingsService.getSettings.returns({
			jwtSecret: "my_secret",
			refreshTokenSecret: "my_secret",
		});
		req.emailService.buildAndSendEmail.resolves("message-id");
		await registerUser(req, res, next);
		expect(res.status.calledWith(200)).to.be.true;
		expect(
			res.json.calledWith({
				success: true,
				msg: successMessages.AUTH_CREATE_USER,
				data: { user, token: sinon.match.string, refreshToken: sinon.match.string },
			})
		).to.be.true;
		expect(next.notCalled).to.be.true;
	});
	it("should return a success message and data if all operations are successful and superAdmin true", async () => {
		const user = { _id: "123" };
		req.db.checkSuperadmin.resolves(true);
		req.db.updateAppSettings.resolves();
		req.db.insertUser.returns(user);
		req.settingsService.getSettings.returns({
			jwtSecret: "my_secret",
			refreshTokenSecret: "my_secret",
		});
		req.emailService.buildAndSendEmail.resolves("message-id");
		await registerUser(req, res, next);
		expect(res.status.calledWith(200)).to.be.true;
		expect(
			res.json.calledWith({
				success: true,
				msg: successMessages.AUTH_CREATE_USER,
				data: { user, token: sinon.match.string, refreshToken: sinon.match.string },
			})
		).to.be.true;
		expect(next.notCalled).to.be.true;
	});
});

describe("Auth Controller - loginUser", () => {
	let req, res, next, user;
	beforeEach(() => {
		req = {
			body: { email: "test@example.com", password: "Password123!" },
			db: {
				getUserByEmail: sinon.stub(),
			},
			settingsService: {
				getSettings: sinon.stub().resolves({
					jwtSecret: "my_secret",
					refreshTokenSecret: "my_refresh_token",
				}),
			},
		};
		res = {
			status: sinon.stub().returnsThis(),
			json: sinon.stub(),
		};
		next = sinon.stub();
		user = {
			_doc: {
				email: "test@example.com",
			},
			comparePassword: sinon.stub(),
		};
	});
	it("should reject with an error if validation fails", async () => {
		req.body = {};
		await loginUser(req, res, next);
		expect(next.firstCall.args[0]).to.be.an("error");
		expect(next.firstCall.args[0].status).to.equal(422);
	});

	it("should reject with an error if getUserByEmail fails", async () => {
		req.db.getUserByEmail.rejects(new Error("getUserByEmail error"));
		await loginUser(req, res, next);
		expect(next.firstCall.args[0]).to.be.an("error");
		expect(next.firstCall.args[0].message).to.equal("getUserByEmail error");
	});

	it("should login user successfully", async () => {
		req.db.getUserByEmail.resolves(user);
		user.comparePassword.resolves(true);
		await loginUser(req, res, next);
		expect(res.status.calledWith(200)).to.be.true;
		expect(
			res.json.calledWith({
				success: true,
				msg: successMessages.AUTH_LOGIN_USER,
				data: {
					user: {
						email: "test@example.com",
						avatarImage: undefined,
					},
					token: sinon.match.string,
					refreshToken: sinon.match.string,
				},
			})
		).to.be.true;
		expect(next.notCalled).to.be.true;
	});
	it("should reject a user with an incorrect password", async () => {
		req.body = {
			email: "test@test.com",
			password: "Password123!",
		};
		req.db.getUserByEmail.resolves(user);
		user.comparePassword.resolves(false);
		await loginUser(req, res, next);
		expect(next.firstCall.args[0]).to.be.an("error");
		expect(next.firstCall.args[0].message).to.equal(
			errorMessages.AUTH_INCORRECT_PASSWORD
		);
	});
});

describe("Auth Controller - refreshAuthToken", () => {
	let req, res, next, issueTokenStub;

	beforeEach(() => {
		req = {
			headers: {
				"x-refresh-token": "valid_refresh_token",
				authorization: "Bearer old_auth_token",
			},
			settingsService: {
				getSettings: sinon.stub().resolves({
					jwtSecret: "my_secret",
					refreshTokenSecret: "my_refresh_secret",
				}),
			},
		};
		res = {
			status: sinon.stub().returnsThis(),
			json: sinon.stub(),
		};
		next = sinon.stub();
		sinon.stub(jwt, "verify");

		issueTokenStub = sinon.stub().returns("new_auth_token");
		sinon.replace({ issueToken }, "issueToken", issueTokenStub);
	});

	afterEach(() => {
		sinon.restore();
	});

	it("should reject if no refresh token is provided", async () => {
		delete req.headers["x-refresh-token"];
		await refreshAuthToken(req, res, next);

		expect(next.firstCall.args[0]).to.be.an("error");
		expect(next.firstCall.args[0].message).to.equal(errorMessages.NO_REFRESH_TOKEN);
		expect(next.firstCall.args[0].status).to.equal(401);
	});

	it("should reject if the refresh token is invalid", async () => {
		jwt.verify.yields(new Error("invalid token"));
		await refreshAuthToken(req, res, next);

		expect(next.firstCall.args[0]).to.be.an("error");
		expect(next.firstCall.args[0].message).to.equal(errorMessages.INVALID_REFRESH_TOKEN);
		expect(next.firstCall.args[0].status).to.equal(401);
	});

	it("should reject if the refresh token is expired", async () => {
		const error = new Error("Token expired");
		error.name = "TokenExpiredError";
		jwt.verify.yields(error);
		await refreshAuthToken(req, res, next);
		expect(next.firstCall.args[0]).to.be.an("error");
		expect(next.firstCall.args[0].message).to.equal(errorMessages.EXPIRED_REFRESH_TOKEN);
		expect(next.firstCall.args[0].status).to.equal(401);
	});

	it("should reject if settingsService.getSettings fails", async () => {
		req.settingsService.getSettings.rejects(
			new Error("settingsService.getSettings error")
		);
		await refreshAuthToken(req, res, next);

		expect(next.firstCall.args[0]).to.be.an("error");
		expect(next.firstCall.args[0].message).to.equal("settingsService.getSettings error");
	});

	it("should generate a new auth token if the refresh token is valid", async () => {
		const decodedPayload = { expiresIn: "60" };
		jwt.verify.callsFake(() => {
			return decodedPayload;
		});
		await refreshAuthToken(req, res, next);

		expect(res.status.calledWith(200)).to.be.true;
		expect(
			res.json.calledWith({
				success: true,
				msg: successMessages.AUTH_TOKEN_REFRESHED,
				data: {
					user: decodedPayload,
					token: sinon.match.string,
					refreshToken: "valid_refresh_token",
				},
			})
		).to.be.true;
	});
});

describe("Auth Controller - editUser", async () => {
	let req, res, next, stub, user;
	beforeEach(() => {
		req = {
			params: { userId: "123" },
			body: { password: "Password1!", newPassword: "Password2!" },
			headers: { authorization: "Bearer token" },
			user: { _id: "123" },
			settingsService: {
				getSettings: sinon.stub().returns({ jwtSecret: "my_secret" }),
			},
			db: {
				getUserByEmail: sinon.stub(),
				updateUser: sinon.stub(),
			},
		};
		res = {
			status: sinon.stub().returnsThis(),
			json: sinon.stub(),
		};
		next = sinon.stub();
		stub = sinon.stub(jwt, "verify").returns({ email: "test@example.com" });
	});
	afterEach(() => {
		sinon.restore();
		stub.restore();
	});

	it("should reject with an error if param validation fails", async () => {
		req.params = {};
		await editUser(req, res, next);
		expect(next.firstCall.args[0]).to.be.an("error");
		expect(next.firstCall.args[0].status).to.equal(422);
	});

	it("should reject with an error if body validation fails", async () => {
		req.body = { invalid: 1 };
		await editUser(req, res, next);
		expect(next.firstCall.args[0]).to.be.an("error");
		expect(next.firstCall.args[0].status).to.equal(422);
	});

	it("should reject with an error if param.userId !== req.user._id", async () => {
		req.params = { userId: "456" };
		await editUser(req, res, next);
		expect(next.firstCall.args[0]).to.be.an("error");
		expect(next.firstCall.args[0].status).to.equal(401);
	});

	it("should reject with an error if !req.body.password and getUserByEmail fails", async () => {
		req.db.getUserByEmail.rejects(new Error("getUserByEmail error"));
		await editUser(req, res, next);
		expect(next.firstCall.args[0]).to.be.an("error");
		expect(next.firstCall.args[0].message).to.equal("getUserByEmail error");
	});

	it("should reject with an error if user.comparePassword fails", async () => {
		req.db.getUserByEmail.returns({
			comparePassword: sinon.stub().rejects(new Error("Bad Password Match")),
		});
		await editUser(req, res, next);
		expect(next.firstCall.args[0]).to.be.an("error");
		expect(next.firstCall.args[0].message).to.equal("Bad Password Match");
	});

	it("should reject with an error if user.comparePassword returns false", async () => {
		req.db.getUserByEmail.returns({
			comparePassword: sinon.stub().returns(false),
		});
		await editUser(req, res, next);
		expect(next.firstCall.args[0]).to.be.an("error");
		expect(next.firstCall.args[0].status).to.equal(401);
		expect(next.firstCall.args[0].message).to.equal(
			errorMessages.AUTH_INCORRECT_PASSWORD
		);
	});

	it("should edit a user if it receives a proper request", async () => {
		const user = {
			comparePassword: sinon.stub().resolves(true),
		};
		req.db.getUserByEmail.resolves(user);
		req.db.updateUser.resolves({ email: "test@example.com" });

		await editUser(req, res, next);

		expect(req.db.getUserByEmail.calledOnce).to.be.true;
		expect(req.db.updateUser.calledOnce).to.be.true;
		expect(res.status.calledWith(200)).to.be.true;
		expect(
			res.json.calledWith({
				success: true,
				msg: successMessages.AUTH_UPDATE_USER,
				data: { email: "test@example.com" },
			})
		).to.be.true;
		expect(next.notCalled).to.be.true;
	});

	it("should edit a user if it receives a proper request and both password fields are undefined", async () => {
		req.body.password = undefined;
		req.body.newPassword = undefined;
		req.db.getUserByEmail.resolves(user);
		req.db.updateUser.resolves({ email: "test@example.com" });

		await editUser(req, res, next);
		expect(res.status.calledWith(200)).to.be.true;
		expect(
			res.json.calledWith({
				success: true,
				msg: successMessages.AUTH_UPDATE_USER,
				data: { email: "test@example.com" },
			})
		).to.be.true;
		expect(next.notCalled).to.be.true;
	});

	it("should reject an edit request if password format is incorrect", async () => {
		req.body = { password: "bad_password", newPassword: "bad_password" };
		const user = {
			comparePassword: sinon.stub().resolves(true),
		};
		req.db.getUserByEmail.resolves(user);

		await editUser(req, res, next);

		expect(next.firstCall.args[0]).to.be.an("error");
		expect(next.firstCall.args[0].status).to.equal(422);
	});
});

describe("Auth Controller - checkSuperadminExists", async () => {
	let req, res, next;
	beforeEach(() => {
		req = {
			db: {
				checkSuperadmin: sinon.stub(),
			},
		};
		res = {
			status: sinon.stub().returnsThis(),
			json: sinon.stub(),
		};
		next = sinon.stub();
	});

	it("should reject with an error if checkSuperadmin fails", async () => {
		req.db.checkSuperadmin.rejects(new Error("checkSuperadmin error"));
		await checkSuperadminExists(req, res, next);
		expect(next.firstCall.args[0]).to.be.an("error");
		expect(next.firstCall.args[0].message).to.equal("checkSuperadmin error");
	});

	it("should return true if a superadmin exists", async () => {
		req.db.checkSuperadmin.resolves(true);
		await checkSuperadminExists(req, res, next);
		expect(res.status.calledWith(200)).to.be.true;
		expect(
			res.json.calledWith({
				success: true,
				msg: successMessages.AUTH_SUPERADMIN_EXISTS,
				data: true,
			})
		).to.be.true;
		expect(next.notCalled).to.be.true;
	});

	it("should return false if a superadmin does not exist", async () => {
		req.db.checkSuperadmin.resolves(false);
		await checkSuperadminExists(req, res, next);
		expect(res.status.calledWith(200)).to.be.true;
		expect(
			res.json.calledWith({
				success: true,
				msg: successMessages.AUTH_SUPERADMIN_EXISTS,
				data: false,
			})
		).to.be.true;
		expect(next.notCalled).to.be.true;
	});
});

describe("Auth Controller - requestRecovery", () => {
	let req, res, next;
	beforeEach(() => {
		req = {
			body: { email: "test@test.com" },
			db: {
				getUserByEmail: sinon.stub(),
				requestRecoveryToken: sinon.stub(),
			},
			settingsService: {
				getSettings: sinon.stub().returns({ clientHost: "http://localhost" }),
			},
			emailService: {
				buildAndSendEmail: sinon.stub(),
			},
		};
		res = {
			status: sinon.stub().returnsThis(),
			json: sinon.stub(),
		};
		next = sinon.stub();
	});

	it("should reject with an error if validation fails", async () => {
		req.body = {};
		await requestRecovery(req, res, next);
		expect(next.firstCall.args[0]).to.be.an("error");
		expect(next.firstCall.args[0].status).to.equal(422);
	});

	it("should reject with an error if getUserByEmail fails", async () => {
		req.db.getUserByEmail.rejects(new Error("getUserByEmail error"));
		await requestRecovery(req, res, next);
		expect(next.firstCall.args[0]).to.be.an("error");
		expect(next.firstCall.args[0].message).to.equal("getUserByEmail error");
	});

	it("should throw an error if the user is not found", async () => {
		req.db.getUserByEmail.resolves(null);
		await requestRecovery(req, res, next);
		expect(next.firstCall.args[0]).to.be.an("error");
		// expect(next.firstCall.args[0].message).to.equal(
		//   errorMessages.FRIENDLY_ERROR
		// );
	});

	it("should throw an error if the email is not provided", async () => {
		req.body = {};
		await requestRecovery(req, res, next);
		expect(next.firstCall.args[0]).to.be.an("error");
		expect(next.firstCall.args[0].status).to.equal(422);
	});
	it("should return a success message if the email is provided", async () => {
		const user = { firstName: "John" };
		const recoveryToken = { token: "recovery-token" };
		const msgId = "message-id";
		req.db.getUserByEmail.resolves(user);
		req.db.requestRecoveryToken.resolves(recoveryToken);
		req.emailService.buildAndSendEmail.resolves(msgId);
		await requestRecovery(req, res, next);
		expect(req.db.getUserByEmail.calledOnceWith("test@test.com")).to.be.true;
		expect(req.db.requestRecoveryToken.calledOnceWith(req, res)).to.be.true;
		expect(
			req.emailService.buildAndSendEmail.calledOnceWith(
				"passwordResetTemplate",
				{
					name: "John",
					email: "test@test.com",
					url: "http://localhost/set-new-password/recovery-token",
				},
				"test@test.com",
				"Checkmate Password Reset"
			)
		).to.be.true;
		expect(res.status.calledOnceWith(200)).to.be.true;
		expect(
			res.json.calledOnceWith({
				success: true,
				msg: successMessages.AUTH_CREATE_RECOVERY_TOKEN,
				data: msgId,
			})
		).to.be.true;
		expect(next.notCalled).to.be.true;
	});
});

describe("Auth Controller - validateRecovery", () => {
	let req, res, next;
	beforeEach(() => {
		req = {
			body: { recoveryToken: "recovery-token" },
			db: {
				validateRecoveryToken: sinon.stub(),
			},
		};
		res = {
			status: sinon.stub().returnsThis(),
			json: sinon.stub(),
		};
		next = sinon.stub();
	});

	it("should reject with an error if validation fails", async () => {
		req.body = {};
		await validateRecovery(req, res, next);
		expect(next.firstCall.args[0]).to.be.an("error");
		expect(next.firstCall.args[0].status).to.equal(422);
	});

	it("should reject with an error if validateRecoveryToken fails", async () => {
		req.db.validateRecoveryToken.rejects(new Error("validateRecoveryToken error"));
		await validateRecovery(req, res, next);
		expect(next.firstCall.args[0]).to.be.an("error");
		expect(next.firstCall.args[0].message).to.equal("validateRecoveryToken error");
	});

	it("should return a success message if the token is valid", async () => {
		req.db.validateRecoveryToken.resolves();
		await validateRecovery(req, res, next);
		expect(res.status.calledOnceWith(200)).to.be.true;
		expect(
			res.json.calledOnceWith({
				success: true,
				msg: successMessages.AUTH_VERIFY_RECOVERY_TOKEN,
			})
		).to.be.true;
		expect(next.notCalled).to.be.true;
	});
});

describe("Auth Controller - resetPassword", () => {
	let req, res, next, newPasswordValidation, handleValidationError, handleError;
	beforeEach(() => {
		req = {
			body: {
				recoveryToken: "recovery-token",
				password: "Password1!",
			},
			db: {
				resetPassword: sinon.stub(),
			},
			settingsService: {
				getSettings: sinon.stub(),
			},
		};
		res = {
			status: sinon.stub().returnsThis(),
			json: sinon.stub(),
		};
		next = sinon.stub();
		newPasswordValidation = {
			validateAsync: sinon.stub(),
		};
		handleValidationError = sinon.stub();
		handleError = sinon.stub();
	});
	it("should reject with an error if validation fails", async () => {
		req.body = { password: "bad_password" };
		await resetPassword(req, res, next);
		expect(next.firstCall.args[0]).to.be.an("error");
		expect(next.firstCall.args[0].status).to.equal(422);
	});

	it("should reject with an error if resetPassword fails", async () => {
		const error = new Error("resetPassword error");
		newPasswordValidation.validateAsync.resolves();
		req.db.resetPassword.rejects(error);
		await resetPassword(req, res, next);
		expect(next.firstCall.args[0]).to.be.an("error");
		expect(next.firstCall.args[0].message).to.equal("resetPassword error");
	});

	it("should reset password successfully", async () => {
		const user = { _doc: {} };
		const appSettings = { jwtSecret: "my_secret" };
		const token = "token";

		newPasswordValidation.validateAsync.resolves();
		req.db.resetPassword.resolves(user);
		req.settingsService.getSettings.resolves(appSettings);

		await resetPassword(req, res, next);

		expect(req.db.resetPassword.calledOnceWith(req, res)).to.be.true;
		expect(req.settingsService.getSettings.calledOnce).to.be.true;
		expect(res.status.calledOnceWith(200)).to.be.true;
		expect(
			res.json.calledOnceWith({
				success: true,
				msg: successMessages.AUTH_RESET_PASSWORD,
				data: { user: sinon.match.object, token: sinon.match.string },
			})
		).to.be.true;
		expect(next.notCalled).to.be.true;
	});
});

describe("Auth Controller - deleteUser", () => {
	let req, res, next, handleError;
	beforeEach(() => {
		req = {
			headers: {
				authorization: "Bearer token",
			},
			db: {
				getUserByEmail: sinon.stub(),
				getMonitorsByTeamId: sinon.stub(),
				deleteJob: sinon.stub(),
				deleteChecks: sinon.stub(),
				deletePageSpeedChecksByMonitorId: sinon.stub(),
				deleteNotificationsByMonitorId: sinon.stub(),
				deleteTeam: sinon.stub(),
				deleteAllOtherUsers: sinon.stub(),
				deleteMonitorsByUserId: sinon.stub(),
				deleteUser: sinon.stub(),
			},
			jobQueue: {
				deleteJob: sinon.stub(),
			},
		};
		res = {
			status: sinon.stub().returnsThis(),
			json: sinon.stub(),
		};
		next = sinon.stub();

		sinon.stub(jwt, "decode");

		handleError = sinon.stub();
	});

	afterEach(() => {
		sinon.restore();
	});
	it("should throw an error if user is not found", async () => {
		jwt.decode.returns({ email: "test@example.com" });
		req.db.getUserByEmail.throws(new Error(errorMessages.DB_USER_NOT_FOUND));

		await deleteUser(req, res, next);

		expect(req.db.getUserByEmail.calledOnceWith("test@example.com")).to.be.true;
		expect(next.calledOnce).to.be.true;
		expect(next.firstCall.args[0].message).to.equal(errorMessages.DB_USER_NOT_FOUND);
		expect(res.status.notCalled).to.be.true;
		expect(res.json.notCalled).to.be.true;
	});

	it("should delete user and associated data if user is superadmin", async () => {
		const user = {
			_id: "user_id",
			email: "test@example.com",
			role: ["superadmin"],
			teamId: "team_id",
		};
		const monitors = [{ _id: "monitor_id" }];

		jwt.decode.returns({ email: "test@example.com" });
		req.db.getUserByEmail.resolves(user);
		req.db.getMonitorsByTeamId.resolves({ monitors });

		await deleteUser(req, res, next);

		expect(req.db.getUserByEmail.calledOnceWith("test@example.com")).to.be.true;
		expect(
			req.db.getMonitorsByTeamId.calledOnceWith({
				params: { teamId: "team_id" },
			})
		).to.be.true;
		expect(req.jobQueue.deleteJob.calledOnceWith(monitors[0])).to.be.true;
		expect(req.db.deleteChecks.calledOnceWith("monitor_id")).to.be.true;
		expect(req.db.deletePageSpeedChecksByMonitorId.calledOnceWith("monitor_id")).to.be
			.true;
		expect(req.db.deleteNotificationsByMonitorId.calledOnceWith("monitor_id")).to.be.true;
		expect(req.db.deleteTeam.calledOnceWith("team_id")).to.be.true;
		expect(req.db.deleteAllOtherUsers.calledOnce).to.be.true;
		expect(req.db.deleteMonitorsByUserId.calledOnceWith("user_id")).to.be.true;
		expect(req.db.deleteUser.calledOnceWith("user_id")).to.be.true;
		expect(res.status.calledOnceWith(200)).to.be.true;
		expect(
			res.json.calledOnceWith({
				success: true,
				msg: successMessages.AUTH_DELETE_USER,
			})
		).to.be.true;
		expect(next.notCalled).to.be.true;
	});

	it("should delete user if user is not superadmin", async () => {
		const user = {
			_id: "user_id",
			email: "test@example.com",
			role: ["user"],
			teamId: "team_id",
		};

		jwt.decode.returns({ email: "test@example.com" });
		req.db.getUserByEmail.resolves(user);

		await deleteUser(req, res, next);

		expect(req.db.getUserByEmail.calledOnceWith("test@example.com")).to.be.true;
		expect(
			req.db.getMonitorsByTeamId.calledOnceWith({
				params: { teamId: "team_id" },
			})
		).to.be.true;
		expect(req.db.deleteUser.calledOnceWith("user_id")).to.be.true;
		expect(res.status.calledOnceWith(200)).to.be.true;
		expect(
			res.json.calledOnceWith({
				success: true,
				msg: successMessages.AUTH_DELETE_USER,
			})
		).to.be.true;
		expect(next.notCalled).to.be.true;
	});

	it("should handle errors", async () => {
		const error = new Error("Something went wrong");
		const SERVICE_NAME = "AuthController";
		jwt.decode.returns({ email: "test@example.com" });
		req.db.getUserByEmail.rejects(error);
		await deleteUser(req, res, next);
		expect(next.calledOnce).to.be.true;
		expect(next.firstCall.args[0].message).to.equal("Something went wrong");
		expect(res.status.notCalled).to.be.true;
		expect(res.json.notCalled).to.be.true;
	});
});

describe("Auth Controller - getAllUsers", () => {
	let req, res, next;

	beforeEach(() => {
		req = {
			db: {
				getAllUsers: sinon.stub(),
			},
		};
		res = {
			status: sinon.stub().returnsThis(),
			json: sinon.stub(),
		};
		next = sinon.stub();
	});

	afterEach(() => {
		sinon.restore(); // Restore the original methods after each test
	});

	it("should return 200 and all users", async () => {
		const allUsers = [{ id: 1, name: "John Doe" }];
		req.db.getAllUsers.resolves(allUsers);

		await getAllUsers(req, res, next);

		expect(req.db.getAllUsers.calledOnce).to.be.true;
		expect(res.status.calledOnceWith(200)).to.be.true;
		expect(
			res.json.calledOnceWith({
				success: true,
				msg: "Got all users",
				data: allUsers,
			})
		).to.be.true;
		expect(next.notCalled).to.be.true;
	});

	it("should call next with error when an exception occurs", async () => {
		const error = new Error("Something went wrong");
		req.db.getAllUsers.rejects(error);
		await getAllUsers(req, res, next);
		expect(req.db.getAllUsers.calledOnce).to.be.true;
		expect(next.calledOnce).to.be.true;
		expect(res.status.notCalled).to.be.true;
		expect(res.json.notCalled).to.be.true;
	});
});
