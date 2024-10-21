import { Router } from "express";
import pssprt from "../passport/check.js";
import userController from "../controllers/userController.js";
const router = Router();


router.post('/displayName', pssprt.ensureAuthenticated, userController.displayName);
router.post('/username', pssprt.ensureAuthenticated, userController.username);
router.post('/email', pssprt.ensureAuthenticated, userController.email);
router.post('/password', pssprt.ensureAuthenticated, userController.password);
router.post('/profilePhoto', pssprt.ensureAuthenticated, userController.profilePhoto);


export default router;