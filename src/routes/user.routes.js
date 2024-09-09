import { Router } from "express";
import {
    userRegistration,
    userLogin,
    viewProfile,
    updateProfile
} from "../controllers/user.controller.js"
import {verifyJwt} from "../middlewares/auth.middleware.js"


const router = Router();


router.route('/register').post(userRegistration);
router.route('/login').post(userLogin);
router.route('/users/:id').get(verifyJwt, viewProfile);
router.route('/users/:id').put(verifyJwt, updateProfile);


export default router;

