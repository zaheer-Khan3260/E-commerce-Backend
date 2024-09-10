import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
    listProducts,
    viewSingleProduct,
    addProduct,
    updateProduct,
    deleteProduct
} from "../controllers/product.controller.js";


const router = Router();

router.route('/').get(listProducts);
router.route('/:id').get(viewSingleProduct);
router.route('/').post(verifyJwt, addProduct);
router.route('/:id').put(verifyJwt, updateProduct);
router.route('/:id').delete(verifyJwt, deleteProduct);


export default router;


