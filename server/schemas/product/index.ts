import { z } from 'zod';
import { CategoryProduct, Status } from 'interfaces/shared/interfaces';

export const createProductSchema = z.object({
	name: z.string('El nombre es obligatorio').min(1, 'El nombre del producto es obligatorio').trim(),
	price: z.number('El precio es obligatorio').min(0, 'El precio no puede ser negativo'),
	category: z.enum(
		[
			CategoryProduct.HAMBURGUESAS,
			CategoryProduct.SALCHIPAPAS,
			CategoryProduct.POLLO_BROASTER,
			CategoryProduct.ALITAS,
			CategoryProduct.TWISTER,
			CategoryProduct.COMBO,
			CategoryProduct.REFRESCOS,
			CategoryProduct.FROZEN,
			CategoryProduct.CREMOSOS,
			CategoryProduct.BATIDOS,
			CategoryProduct.JUGOS,
			CategoryProduct.CLASICOS,
			CategoryProduct.GASEOSAS,
			CategoryProduct.PIDELO_CON_CHAUFA,
		],
		'Categoría inválida'
	),
	image: z.string().trim().optional(),
	ingredients: z.array(z.string()).optional().default([]),
	description: z.string().max(500, 'La descripción no puede exceder 500 caracteres').trim().optional(),
	tags: z.array(z.string()).optional().default([]),
	discount: z
		.number()
		.min(0, 'El descuento no puede ser negativo')
		.max(100, 'El descuento no puede ser mayor a 100%')
		.optional()
		.default(0),
});

export const updateProductSchema = z
	.object({
		name: z.string().min(1, 'El nombre del producto es obligatorio').trim().optional(),
		price: z.number('El precio debe ser un numero').min(0, 'El precio no puede ser negativo').optional(),
		category: z
			.enum(
				[
					CategoryProduct.HAMBURGUESAS,
					CategoryProduct.SALCHIPAPAS,
					CategoryProduct.POLLO_BROASTER,
					CategoryProduct.ALITAS,
					CategoryProduct.TWISTER,
					CategoryProduct.COMBO,
					CategoryProduct.REFRESCOS,
					CategoryProduct.FROZEN,
					CategoryProduct.CREMOSOS,
					CategoryProduct.BATIDOS,
					CategoryProduct.JUGOS,
					CategoryProduct.CLASICOS,
					CategoryProduct.GASEOSAS,
					CategoryProduct.PIDELO_CON_CHAUFA,
				],
				'Categoría inválida'
			)
			.optional(),
		image: z.string().trim().optional(),
		ingredients: z.array(z.string()).optional(),
		description: z.string().max(500, 'La descripción no puede exceder 500 caracteres').trim().optional(),
		status: z.enum([Status.ACTIVE, Status.INACTIVE], 'El status debe ser ACTIVE o INACTIVE').optional(),
		tags: z.array(z.string()).optional(),
		discount: z
			.number()
			.min(0, 'El descuento no puede ser negativo')
			.max(100, 'El descuento no puede ser mayor a 100%')
			.optional(),
	})
	.refine((data) => Object.keys(data).length > 0, {
		message: 'Debe proporcionar al menos un campo para actualizar',
	});

export type CreateProductRequest = z.infer<typeof createProductSchema>;
export type UpdateProductRequest = z.infer<typeof updateProductSchema>;
