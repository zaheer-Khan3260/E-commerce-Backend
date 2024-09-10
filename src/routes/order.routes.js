import { Router } from "express";
import {
    placeOrder,
    viewOrderHistory,
    viewSingleOrder,
    cancelOrder
} from "../controllers/order.controller.js"
import { verifyJwt } from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyJwt);


router.route('/').post(placeOrder);
router.route('/').get(viewOrderHistory);
router.route('/:id').get(viewSingleOrder);
router.route('/:id').delete(cancelOrder);


export default router;


