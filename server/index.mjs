import express from 'express';
import cors from 'cors';
import { load as loadHtml } from 'cheerio';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8787;

function isValidUrl(candidate) {
	try {
		new URL(candidate);
		return true;
	} catch {
		return false;
	}
}

// Simple LangChain-like tool interface for scraping
async function scrapePageTool({ url }) {
	// Try LangChain community Cheerio loader first
	try {
		const mod = await import('@langchain/community/document_loaders/web/cheerio');
		const { CheerioWebBaseLoader } = mod;
		const loader = new CheerioWebBaseLoader(url);
		const docs = await loader.load();
		const htmlFromLoader = docs?.[0]?.pageContent || '';
		if (htmlFromLoader) return { html: htmlFromLoader };
	} catch {}
	// Fallback to raw fetch
	const res = await fetch(url, {
		headers: {
			'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
			'Accept-Language': 'en-US,en;q=0.9'
		}
	});
	if (!res.ok) {
		throw new Error(`Failed to fetch page: ${res.status} ${res.statusText}`);
	}
	const html = await res.text();
	return { html };
}

function detectMarketplace(url) {
	const hostname = new URL(url).hostname;
	if (hostname.includes('amazon')) return 'amazon';
	if (hostname.includes('flipkart')) return 'flipkart';
	return 'unknown';
}

function extractAmazon($) {
	const title = $('#productTitle').text().trim() || $('h1 span#title').text().trim();
	let price = $('#priceblock_ourprice').text().trim() || $('#priceblock_dealprice').text().trim();
	if (!price) {
		const whole = $('span.a-price > span.a-offscreen').first().text().trim();
		price = whole;
	}
	const ratingText = $('#acrPopover').attr('title') || $('span[data-hook="rating-out-of-text"]').text().trim();
	const rating = ratingText ? ratingText.replace(/[^0-9.]/g, '') : '';
	const image = $('#imgTagWrapperId img').attr('data-old-hires') || $('#imgTagWrapperId img').attr('src') || $('img#landingImage').attr('src') || '';
	return { title, price, rating, image };
}

function extractFlipkart($) {
	const title = $('span.B_NuCI').first().text().trim();
	const price = $('div._30jeq3._16Jk6d').first().text().trim();
	const rating = $('div._3LWZlK').first().text().trim();
	const image = $('img._396cs4').attr('src') || $('img._2r_T1I').attr('src') || '';
	return { title, price, rating, image };
}

function extractDetails({ html, url }) {
	const $ = loadHtml(html);
	const marketplace = detectMarketplace(url);
	let details = { title: '', price: '', rating: '', image: '' };
	if (marketplace === 'amazon') {
		details = extractAmazon($);
	} else if (marketplace === 'flipkart') {
		details = extractFlipkart($);
	}
	return { marketplace, ...details };
}

// Optional: Attempt to use LangGraph if available, otherwise fallback to sequential steps
async function runGraph(input) {
	try {
		const langgraph = await import('@langchain/langgraph');
		const { StateGraph, START, END } = langgraph;
		const graph = new StateGraph({
			channels: {
				url: null,
				html: null,
				product: null
			}
		});
		graph.addNode('scrape', async (state) => {
			const { html } = await scrapePageTool({ url: state.url });
			return { html };
		});
		graph.addNode('parse', async (state) => {
			const product = extractDetails({ html: state.html, url: state.url });
			return { product };
		});
		graph.addEdge(START, 'scrape');
		graph.addEdge('scrape', 'parse');
		graph.addEdge('parse', END);
		const appGraph = graph.compile();
		const result = await appGraph.invoke({ url: input.url });
		return result.product;
	} catch {
		// Fallback sequential flow
		const { html } = await scrapePageTool({ url: input.url });
		const product = extractDetails({ html, url: input.url });
		return product;
	}
}

app.post('/api/product/details', async (req, res) => {
	try {
		const { url } = req.body || {};
		if (!url || !isValidUrl(url)) {
			return res.status(400).json({ error: 'Please provide a valid product URL from Amazon or Flipkart as "url".' });
		}
		const product = await runGraph({ url });
		return res.json({ success: true, product, url });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ error: err?.message || 'Failed to fetch product details' });
	}
});

app.post('/api/product/automate', async (req, res) => {
	const { url, action = 'addToCart' } = req.body || {};
	if (!url || !isValidUrl(url)) {
		return res.status(400).json({ error: 'Please provide a valid product URL as "url".' });
	}
	let browser;
	try {
		const { chromium } = await import('playwright');
		browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-gpu'] });
		const context = await browser.newContext({
			viewport: { width: 1280, height: 800 },
			userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36'
		});
		const page = await context.newPage();
		await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

		const marketplace = detectMarketplace(url);
		let message = 'Opened product page';

		if (action === 'addToCart') {
			if (marketplace === 'amazon') {
				const addToCart = page.locator('#add-to-cart-button');
				if (await addToCart.count()) {
					await addToCart.first().click({ timeout: 15000 });
					message = 'Attempted to add to cart on Amazon';
					await page.waitForTimeout(2000);
				} else {
					message = 'Add to Cart button not found on Amazon';
				}
			} else if (marketplace === 'flipkart') {
				// Close login popup if present
				const closeBtn = page.locator('button[title="Close"]');
				if (await closeBtn.count()) {
					await closeBtn.first().click().catch(() => {});
				}
				const addToCart = page.getByText('Add to cart', { exact: false });
				if (await addToCart.count()) {
					await addToCart.first().click({ timeout: 15000 });
					message = 'Attempted to add to cart on Flipkart';
					await page.waitForTimeout(2000);
				} else {
					message = 'Add to Cart button not found on Flipkart';
				}
			} else {
				message = 'Unknown marketplace; opened page only';
			}
		}

		const screenshot = await page.screenshot({ fullPage: true });
		await browser.close();
		browser = null;
		return res.json({ success: true, message, screenshotBase64: Buffer.from(screenshot).toString('base64') });
	} catch (err) {
		console.error(err);
		if (browser) {
			try { await browser.close(); } catch {}
		}
		return res.status(500).json({ error: err?.message || 'Automation failed' });
	}
});

app.listen(PORT, () => {
	console.log(`[server] listening on http://localhost:${PORT}`);
});