export interface AutomationResult {
  message: string;
  screenshotBase64: string;
}

export async function automateProduct(url: string, action: 'open' | 'addToCart' | 'proceedToCheckout' = 'addToCart'): Promise<AutomationResult> {
  const res = await fetch('http://localhost:8787/api/product/automate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, action })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || `Automation failed (${res.status})`);
  }
  const data = await res.json();
  return { message: data.message, screenshotBase64: data.screenshotBase64 };
}