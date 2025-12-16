// src/routes/product.routes.ts
import express from 'express';
import {
	createProduct,
	getProducts,
	editProduct,
	getProduct,
	deleteProduct,
	deactivateProduct,
} from '../controllers/product-controller';
import { validate } from 'middleware/validate';
import { createProductSchema, updateProductSchema } from 'schemas/product';

const router = express.Router();

// GET /api/products - Obtener todos los productos (con paginación y filtros)
router.get('/', getProducts);

// POST /api/products - Crear un nuevo producto (con validación)
router.post('/', validate(createProductSchema), createProduct);

// GET /api/products/:id - Obtener un producto específico
router.get('/:id', getProduct);

// PUT /api/products/:id - Actualizar un producto
router.put('/:id', validate(updateProductSchema), editProduct);

// PUT /api/products/:id/deactivate - Desactivar un producto (soft delete)
router.put('/:id/desactive', deactivateProduct);

// DELETE /api/products/:id - Eliminar un producto
router.delete('/:id', deleteProduct);

export default router;
