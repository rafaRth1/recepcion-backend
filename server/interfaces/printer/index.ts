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
	items: CustomerReceiptItem[];
	total: number;
}
