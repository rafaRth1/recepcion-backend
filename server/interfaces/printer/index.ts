export interface CustomerReceiptItem {
	quantity: number;
	description: string;
	price: number;
	total: number;
}

export interface CustomerReceipt {
	date: string;
	customerName?: string;
	table: string;
	employee: string;
	type: 'TABLE' | 'DELIVERY' | 'PICKUP';
	items: Array<{
		description: string;
		quantity: number;
		price: number;
		total: number;
	}>;
	creams?: string[]; // Array de todas las cremas
	total: number;
}
