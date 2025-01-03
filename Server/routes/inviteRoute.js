import { Router } from "express";
import { verifyJWT } from "../middleware/verifyJWT.js";
import { isAllowed } from "../middleware/isAllowed.js";
import {
	issueInvitation,
	inviteVerifyController,
} from "../controllers/inviteController.js";

const router = Router();

router.post("/", isAllowed(["admin", "superadmin"]), verifyJWT, issueInvitation);
router.post("/verify", inviteVerifyController);

export default router;
