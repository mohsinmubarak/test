export interface ProductDetails {
	title: string;
	price: string;
	rating: string;
	image: string;
	marketplace: 'amazon' | 'flipkart' | 'unknown';
}

export async function fetchProductDetails(url: string): Promise<ProductDetails> {
	const res = await fetch('http://localhost:8787/api/product/details', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ url })
	});
	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err?.error || `Failed to fetch product details (${res.status})`);
	}
	const data = await res.json();
	return data.product as ProductDetails;
}