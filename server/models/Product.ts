import { model, Schema } from 'mongoose';
import { ProductDocument } from '../interfaces/product';

export const ProductSchema = new Schema<ProductDocument>(
	{
		name: {
			type: String,
			required: [true, 'El nombre del producto es obligatorio'],
			trim: true,
			index: true,
		},
		price: {
			type: Number,
			required: [true, 'El precio es obligatorio'],
			min: [0, 'El precio no puede ser negativo'],
		},
		category: {
			type: String,
			required: [true, 'La categoría es obligatoria'],
			trim: true,
			enum: [
				'HAMBURGUESAS',
				'SALCHIPAPAS',
				'POLLO_BROASTER',
				'ALITAS',
				'TWISTER',
				'COMBO',
				'REFRESCOS',
				'FROZEN',
				'CREMOSOS',
				'BATIDOS',
				'JUGOS',
				'CLASICOS',
				'GASEOSAS',
				'PIDELO_CON_CHAUFA',
			],
			uppercase: true,
		},
		image: {
			type: String,
			required: false,
			trim: true,
			default: '',
		},
		ingredients: {
			type: [String],
			required: false,
			default: [],
		},
		description: {
			type: String,
			trim: true,
			maxlength: [500, 'La descripción no puede exceder 500 caracteres'],
		},
		status: {
			type: String,
			enum: ['ACTIVE', 'INACTIVE'],
			uppercase: true,
			default: 'ACTIVE',
		},
		tags: {
			type: [String],
			default: [],
		},
		discount: {
			type: Number,
			min: [0, 'El descuento no puede ser negativo'],
			max: [100, 'El descuento no puede ser mayor a 100%'],
			default: 0,
		},
	},
	{
		timestamps: true,
	}
);

// Índices para mejorar las consultas
ProductSchema.index({ category: 1, status: 1 });
ProductSchema.index({ name: 'text' });

const ProductModel = model<ProductDocument>('Product', ProductSchema);

export default ProductModel;
