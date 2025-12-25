import { Router } from 'express';
import { createBrand, deleteBrand, getBrandById, getBrands, updateBrand } from '../controllers/brand.controller.js';
import { isAuthenticatedSeller } from '@repo/shared-middleware';

const router: Router = Router();

router.post('/', isAuthenticatedSeller, createBrand);
router.get('/', getBrands);
router.get('/:id', getBrandById);
router.put('/:id', isAuthenticatedSeller, updateBrand);
router.delete('/:id', isAuthenticatedSeller, deleteBrand);

export default router;