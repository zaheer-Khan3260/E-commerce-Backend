import { Router } from "express";
import {
    placeOrder,
    viewOrderHistory,
    viewSingleOrder
} from "../controllers/order.controller.js"
import { verifyJwt } from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyJwt);


router.route('/').post(placeOrder);
router.route('/').get(viewOrderHistory);



export default router;


