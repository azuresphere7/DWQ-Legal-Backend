import * as express from "express";
import * as passport from "passport";

import UserController from "../controllers/UserController";

const router: express.Router = express.Router();

// User authentication routes
router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/verify-email", UserController.checkVerificationStatus);
router.post("/verify-email", UserController.verifyEmail);
router.get("/access-token", passport.authenticate("jwt", {session: false}), UserController.accessToken);

export default router;