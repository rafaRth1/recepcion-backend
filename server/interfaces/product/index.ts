import { CategoryProduct, Status } from 'interfaces/shared/interfaces';
import { Document } from 'mongoose';

export interface Product {
	name: string;
	price: number;
	category: CategoryProduct;
	image?: string;
	ingredients?: string[];
	description?: string;
	status?: Status;
	tags?: string[];
	discount?: number;
}

export interface ProductDocument extends Product, Document {
	createdAt: Date;
	updatedAt: Date;
}

export interface ProductQuery {
	category?: CategoryProduct;
	status?: string;
	search?: string;
	page?: string;
	limit?: string;
	sortBy?: string;
	sortOrder?: string;
}

export interface ProductFilter {
	category?: CategoryProduct;
	status?: Status;
}

export interface ProductFilter {
	category?: CategoryProduct;
	status?: Status;
	$or?: Array<{ [key: string]: RegExp }>;
}

export interface PaginationResult {
	products: Product[];
	totalProducts: number;
	totalPages: number;
	currentPage: number;
	limit: number;
	hasNextPage: boolean;
	hasPrevPage: boolean;
}
