import express from 'express';
import cors from 'cors';
import { load as loadHtml } from 'cheerio';
import rateLimit from 'express-rate-limit';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8787;
const ENABLE_AUTOMATION = String(process.env.ENABLE_AUTOMATION || '').toLowerCase() === 'true';
const HUMANIZE = String(process.env.HUMANIZE || 'true').toLowerCase() !== 'false';
const TIMEZONE = process.env.TIMEZONE || 'UTC';
const LOCALE = process.env.LOCALE || 'en-US';
const STORAGE_STATE_PATH = process.env.STORAGE_STATE_PATH || '';
const PLAYWRIGHT_PROXY = process.env.PLAYWRIGHT_PROXY || '';

const limiter = rateLimit({
	windowMs: 60 * 1000,
	max: 15,
	standardHeaders: true,
	legacyHeaders: false,
});
app.use('/api/', limiter);

function isValidUrl(candidate) {
	try {
		new URL(candidate);
		return true;
	} catch {
		return false;
	}
}

// Human-like utilities
function randomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}

async function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function randomUserAgent() {
	const userAgents = [
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15',
		'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0'
	];
	return pickRandom(userAgents);
}

function randomViewport() {
	return {
		width: randomInt(1280, 1920),
		height: randomInt(720, 1080),
		deviceScaleFactor: pickRandom([1, 1.25, 1.5, 2]),
		colorScheme: pickRandom(['light', 'dark'])
	};
}

async function humanizeNavigation(page) {
	if (!HUMANIZE) return;
	// Small random pause before interacting
	await sleep(randomInt(800, 2000));
	// Random mouse move
	const vp = await page.viewportSize();
	if (vp) {
		const moves = randomInt(2, 5);
		for (let i = 0; i < moves; i++) {
			await page.mouse.move(randomInt(0, vp.width), randomInt(0, vp.height), { steps: randomInt(8, 20) });
			await sleep(randomInt(100, 300));
		}
	}
	// Scroll down in small chunks
	for (let i = 0; i < randomInt(2, 5); i++) {
		const delta = randomInt(300, 700);
		await page.evaluate((d) => window.scrollBy(0, d), delta);
		await sleep(randomInt(200, 700));
	}
	// Scroll back slightly
	await page.evaluate((d) => window.scrollBy(0, -d), randomInt(100, 300));
	await sleep(randomInt(200, 500));
}

async function moveMouseToLocator(page, locator) {
	const box = await locator.boundingBox().catch(() => null);
	if (!box) return;
	const targetX = box.x + box.width / 2 + randomInt(-5, 5);
	const targetY = box.y + box.height / 2 + randomInt(-5, 5);
	await page.mouse.move(targetX + randomInt(-30, 30), targetY + randomInt(-30, 30), { steps: randomInt(10, 25) });
	await sleep(randomInt(80, 200));
	await page.mouse.move(targetX, targetY, { steps: randomInt(8, 18) });
	await sleep(randomInt(120, 300));
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
	if (!ENABLE_AUTOMATION) {
		return res.status(403).json({ error: 'Automation disabled. Set ENABLE_AUTOMATION=true to enable.' });
	}
	const { url, action = 'addToCart' } = req.body || {};
	if (!url || !isValidUrl(url)) {
		return res.status(400).json({ error: 'Please provide a valid product URL as "url".' });
	}
	let browser;
	try {
		const { chromium } = await import('playwright');
		const launchOptions = {
			headless: true,
			args: ['--no-sandbox', '--disable-gpu', '--disable-blink-features=AutomationControlled']
		};
		if (PLAYWRIGHT_PROXY) {
			launchOptions.proxy = { server: PLAYWRIGHT_PROXY };
		}
		browser = await chromium.launch(launchOptions);

		const vp = randomViewport();
		const contextOptions = {
			viewport: { width: vp.width, height: vp.height },
			deviceScaleFactor: vp.deviceScaleFactor,
			userAgent: randomUserAgent(),
			locale: LOCALE,
			timezoneId: TIMEZONE,
			colorScheme: vp.colorScheme,
			extraHTTPHeaders: { 'Accept-Language': `${LOCALE},en;q=0.9` }
		};
		if (STORAGE_STATE_PATH) {
			contextOptions.storageState = STORAGE_STATE_PATH;
		}
		const context = await browser.newContext(contextOptions);
		const page = await context.newPage();

		await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
		await humanizeNavigation(page);

		const marketplace = detectMarketplace(url);
		let message = 'Opened product page';

		if (action === 'addToCart') {
			if (marketplace === 'amazon') {
				const addToCart = page.locator('#add-to-cart-button');
				if (await addToCart.count()) {
					await addToCart.scrollIntoViewIfNeeded().catch(() => {});
					await moveMouseToLocator(page, addToCart);
					await sleep(randomInt(180, 600));
					await addToCart.first().click({ timeout: 15000, trial: false });
					message = 'Attempted to add to cart on Amazon';
					await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
					await sleep(randomInt(600, 1400));
				} else {
					message = 'Add to Cart button not found on Amazon';
				}
			} else if (marketplace === 'flipkart') {
				// Close login popup if present
				const closeBtn = page.locator('button[title="Close"]');
				if (await closeBtn.count()) {
					await closeBtn.first().click().catch(() => {});
					await sleep(randomInt(200, 600));
				}
				const addToCart = page.getByText('Add to cart', { exact: false });
				if (await addToCart.count()) {
					await addToCart.scrollIntoViewIfNeeded().catch(() => {});
					await moveMouseToLocator(page, addToCart);
					await sleep(randomInt(180, 600));
					await addToCart.first().click({ timeout: 15000, trial: false });
					message = 'Attempted to add to cart on Flipkart';
					await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
					await sleep(randomInt(600, 1400));
				} else {
					message = 'Add to Cart button not found on Flipkart';
				}
			} else {
				message = 'Unknown marketplace; opened page only';
			}
		}

		if (STORAGE_STATE_PATH) {
			try { await context.storageState({ path: STORAGE_STATE_PATH }); } catch {}
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