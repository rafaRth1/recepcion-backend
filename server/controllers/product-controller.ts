import mongoose from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import Product from '../models/Product';
import { PaginationResult, ProductFilter, ProductQuery } from '../interfaces/product';
import { Status } from '../interfaces/shared/interfaces';
import { CreateProductRequest, UpdateProductRequest } from 'schemas/product';

interface AppError extends Error {
	statusCode?: number;
}

const createError = (message: string, statusCode: number): AppError => {
	const error: AppError = new Error(message);
	error.statusCode = statusCode;
	return error;
};

const validateObjectId = (id: string): boolean => {
	return mongoose.Types.ObjectId.isValid(id);
};

const getProducts = async (req: Request<{}, {}, {}, ProductQuery>, res: Response, next: NextFunction): Promise<void> => {
	try {
		const { category, status, search, page = '1', limit = '10', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

		// Construir filtros
		const filter: ProductFilter = {};

		if (category) {
			filter.category = category;
		}

		if (typeof status === 'string') {
			filter.status = status as Status;
		}

		// Búsqueda por nombre, descripción o ingredientes
		if (search) {
			filter.$or = [
				{ name: new RegExp(search, 'i') },
				{ description: new RegExp(search, 'i') },
				{ ingredients: new RegExp(search, 'i') },
			];
		}

		// Paginación
		const pageNumber = parseInt(page, 10);
		const limitNumber = parseInt(limit, 10);
		const skip = (pageNumber - 1) * limitNumber;

		// Validar valores de paginación
		if (pageNumber < 1 || limitNumber < 1) {
			return next(createError('Los valores de página y límite deben ser mayores a 0', 400));
		}

		if (limitNumber > 100) {
			return next(createError('El límite máximo es 100 productos por página', 400));
		}

		// Ordenamiento
		const sortOptions: { [key: string]: 1 | -1 } = {};
		sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

		// Consultas
		const [products, totalProducts] = await Promise.all([
			Product.find(filter).sort(sortOptions).skip(skip).limit(limitNumber).select('-__v'),
			Product.countDocuments(filter),
		]);

		const totalPages = Math.ceil(totalProducts / limitNumber);

		const paginationResult: PaginationResult = {
			products,
			totalProducts,
			totalPages,
			currentPage: pageNumber,
			limit: limitNumber,
			hasNextPage: pageNumber < totalPages,
			hasPrevPage: pageNumber > 1,
		};

		res.success(paginationResult, 200);
	} catch (error) {
		next(error);
	}
};

const getProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const { id } = req.params;

		if (!validateObjectId(id)) {
			return next(createError('ID de producto inválido', 400));
		}

		const product = await Product.findById(id).select('-__v');

		if (!product) {
			return next(createError('Producto no encontrado', 404));
		}

		res.success(product, 200);
	} catch (error) {
		next(error);
	}
};

const createProduct = async (req: Request<{}, {}, CreateProductRequest>, res: Response, next: NextFunction): Promise<void> => {
	try {
		const productData = req.body;

		const product = await Product.create({
			...productData,
			status: Status.ACTIVE,
		});

		res.success(product, 201);
	} catch (error) {
		next(error);
	}
};

const editProduct = async (
	req: Request<{ id: string }, {}, UpdateProductRequest>,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { id } = req.params;

		if (!validateObjectId(id)) {
			return next(createError('ID de producto inválido', 400));
		}

		const productData = req.body;

		// Actualizar el producto
		const updatedProduct = await Product.findByIdAndUpdate(id, productData, {
			new: true,
			runValidators: true,
		}).select('-__v');

		if (!updatedProduct) {
			return next(createError('Producto no encontrado', 400));
		}

		res.success(updatedProduct, 200);
	} catch (error) {
		next(error);
	}
};

const deleteProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const { id } = req.params;

		if (!validateObjectId(id)) {
			return next(createError('ID de producto inválido', 400));
		}

		const deletedProduct = await Product.findByIdAndDelete(id);

		if (!deletedProduct) {
			return next(createError('Producto no encontrado', 404));
		}

		res.success('Producto eliminado correctamente', 200);
	} catch (error) {
		next(error);
	}
};

const deactivateProduct = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
	try {
		const { id } = req.params;

		if (!validateObjectId(id)) {
			return next(createError('ID de producto inválido', 400));
		}

		const product = await Product.findByIdAndUpdate(id, { status: Status.INACTIVE }, { new: true, runValidators: true }).select(
			'-__v'
		);

		if (!product) {
			return next(createError('Producto no encontrado', 404));
		}

		res.success('Producto desactivado correctamente', 200);
	} catch (error) {
		next(error);
	}
};

export { getProducts, createProduct, editProduct, getProduct, deleteProduct, deactivateProduct };
