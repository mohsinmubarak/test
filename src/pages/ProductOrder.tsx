import React, { useState } from 'react';
import { fetchProductDetails, ProductDetails } from '@/services/orderApi';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

const ProductOrder: React.FC = () => {
	const [url, setUrl] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [product, setProduct] = useState<ProductDetails | null>(null);

	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [phone, setPhone] = useState('');
	const [address, setAddress] = useState('');
	const [quantity, setQuantity] = useState(1);
	const [payment, setPayment] = useState<'COD' | 'UPI' | 'CARD'>('COD');

	const handleFetch = async () => {
		setError(null);
		setLoading(true);
		try {
			const details = await fetchProductDetails(url);
			setProduct(details);
		} catch (e: any) {
			setError(e?.message || 'Failed to fetch');
		} finally {
			setLoading(false);
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		alert(`Order captured for ${product?.title || 'product'}\nQuantity: ${quantity}\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nPayment: ${payment}\nAddress: ${address}\n\nOpen product page to complete purchase: ${url}`);
	};

	return (
		<div className="min-h-screen bg-edelivery-off-white flex flex-col">
			<header className="bg-white border-b border-edelivery-gray py-3 px-4 shadow-sm">
				<div className="max-w-6xl mx-auto flex justify-between items-center">
					<h1 className="text-xl font-bold text-edelivery-dark-blue">Product Order</h1>
					<div className="text-sm text-edelivery-blue">Amazon / Flipkart</div>
				</div>
			</header>
			<main className="flex-1">
				<div className="max-w-4xl mx-auto p-4 grid gap-4">
					<Card>
						<CardHeader>
							<CardTitle>Paste Product URL</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<Label htmlFor="url">Product URL</Label>
							<div className="flex gap-2">
								<Input id="url" placeholder="https://www.amazon.in/... or https://www.flipkart.com/..." value={url} onChange={(e) => setUrl(e.target.value)} />
								<Button disabled={loading || !url} onClick={handleFetch}>{loading ? 'Fetching...' : 'Fetch details'}</Button>
							</div>
							{error && <p className="text-sm text-red-600">{error}</p>}
						</CardContent>
					</Card>

					{product && (
						<Card>
							<CardHeader>
								<CardTitle>Product</CardTitle>
							</CardHeader>
							<CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div className="md:col-span-1">
									{product.image ? (
										<img src={product.image} alt={product.title} className="rounded border" />
									) : (
										<div className="w-full h-48 bg-gray-100 rounded flex items-center justify-center text-gray-400">No Image</div>
									)}
								</div>
								<div className="md:col-span-2 space-y-2">
									<div className="text-lg font-semibold">{product.title || 'Unknown title'}</div>
									<div className="text-edelivery-blue text-xl font-bold">{product.price || '—'}</div>
									<div className="text-sm text-gray-600">Rating: {product.rating || '—'}</div>
									<div className="text-xs text-gray-500">Marketplace: {product.marketplace}</div>
								</div>
							</CardContent>
						</Card>
					)}

					<Card>
						<CardHeader>
							<CardTitle>Order details</CardTitle>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleSubmit} className="grid gap-3">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
									<div>
										<Label htmlFor="name">Full name</Label>
										<Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
									</div>
									<div>
										<Label htmlFor="email">Email</Label>
										<Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
									</div>
									<div>
										<Label htmlFor="phone">Phone</Label>
										<Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
									</div>
									<div>
										<Label htmlFor="quantity">Quantity</Label>
										<Input id="quantity" type="number" min={1} value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value || '1', 10))} required />
									</div>
								</div>
								<div>
									<Label htmlFor="address">Shipping address</Label>
									<Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} required />
								</div>
								<div className="grid grid-cols-3 gap-2">
									<label className="flex items-center gap-2 text-sm">
										<input type="radio" name="payment" checked={payment==='COD'} onChange={() => setPayment('COD')} /> COD
									</label>
									<label className="flex items-center gap-2 text-sm">
										<input type="radio" name="payment" checked={payment==='UPI'} onChange={() => setPayment('UPI')} /> UPI
									</label>
									<label className="flex items-center gap-2 text-sm">
										<input type="radio" name="payment" checked={payment==='CARD'} onChange={() => setPayment('CARD')} /> Card
									</label>
								</div>
								<Button type="submit" disabled={!product || !url}>Generate order</Button>
							</form>
						</CardContent>
						<CardFooter className="text-xs text-gray-500">
							This demo collects your order details and fetches product info. To complete the purchase, you will be redirected to the product page.
						</CardFooter>
					</Card>
				</div>
			</main>
		</div>
	);
};

export default ProductOrder;