import * as express from "express";
import * as passport from "passport";
import UserController from "../controllers/UserController";

const router: express.Router = express.Router();

// User authentication routes
router.get("/verify-email", UserController.checkVerificationStatus);
router.get("/access-token", passport.authenticate("jwt", {session: false}), UserController.accessToken);

router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.post("/verify-email", UserController.verifyEmail);
router.post("/resend-code", UserController.resendCode);
router.post("/forgot-password", UserController.forgotPassword);
router.post("/reset-password", UserController.resetPassword);

export default router;