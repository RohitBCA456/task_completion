import { Router } from "express";
import { fetchUser, login, registerUser } from "../controllers/user.controller.js";
import { verifyAuthentication } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(login);
router.route("/users/:id").get(verifyAuthentication, fetchUser);

export { router as userRouter };
