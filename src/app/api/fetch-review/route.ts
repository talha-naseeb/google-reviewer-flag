import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 45;

/**
 * Resolves shortlinks (e.g. maps.app.goo.gl, goo.gl/maps) to their real canonical Google Maps URL.
 * Google's Firebase Dynamic Link servers return a 302 Location header when queried with redirect: 'manual' and bot User-Agent.
 */
async function resolveGoogleMapsUrl(inputUrl: string): Promise<string> {
  let currentUrl = inputUrl.trim();
  if (!currentUrl.includes('goo.gl') && !currentUrl.includes('app.goo.gl')) {
    return currentUrl;
  }

  let hops = 0;
  while (hops < 6) {
    hops++;
    try {
      const res = await fetch(currentUrl, {
        method: 'GET',
        redirect: 'manual',
        headers: {
          'User-Agent': 'curl/8.0.0',
          'Accept': '*/*'
        }
      });

      const location = res.headers.get('location');
      if (location) {
        if (location.startsWith('http')) {
          currentUrl = location;
        } else {
          currentUrl = new URL(location, currentUrl).toString();
        }

        // If we reached the full google.com/maps url, we're done resolving
        if (!currentUrl.includes('goo.gl') && !currentUrl.includes('app.goo.gl')) {
          break;
        }
      } else {
        break;
      }
    } catch (e) {
      break;
    }
  }

  return currentUrl;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ success: false, error: 'Valid URL is required' }, { status: 400 });
    }

    const inputUrl = url.trim();

    // Step 1: Resolve shortlink to canonical Google Maps URL
    let resolvedUrl = await resolveGoogleMapsUrl(inputUrl);

    let reviewerName = '';
    let rating = 1;
    let comment = '';
    let isFetchedFromUrl = false;
    let extractionMethod = 'NONE';

    // Step 2: Headless Browser Extraction
    let browser;
    try {
      if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_VERSION) {
        const chromium = (await import('@sparticuz/chromium')).default;
        const puppeteerCore = (await import('puppeteer-core')).default;

        browser = await puppeteerCore.launch({
          args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
          defaultViewport: { width: 1280, height: 900 },
          executablePath: await chromium.executablePath(),
          headless: true
        });
      } else {
        const puppeteer = (await import('puppeteer')).default;
        browser = await puppeteer.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
        });
      }

      const page = await browser.newPage();
      await page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
      );
      await page.setViewport({ width: 1280, height: 900 });

      // Navigate to the resolved Google Maps review URL
      await page.goto(resolvedUrl, { waitUntil: 'networkidle2', timeout: 25000 });
      await page.evaluate(() => new Promise((r) => setTimeout(r, 2000)));

      // Update resolved URL if Google navigated internally
      if (page.url() && page.url().includes('google.com/maps')) {
        resolvedUrl = page.url();
      }

      const extracted = await page.evaluate(() => {
        let name = '';
        let stars = 1;
        let text = '';

        // 1. Reviewer Name from "Actions for {Name}'s review" aria-label
        const actionBtns = Array.from(document.querySelectorAll('button[aria-label]'));
        for (const btn of actionBtns) {
          const aria = btn.getAttribute('aria-label') || '';
          const actionMatch = aria.match(/Actions for (.*?)(?:'s|’s) review/i);
          if (actionMatch && actionMatch[1]?.trim()) {
            name = actionMatch[1].trim();
            break;
          }
        }

        if (!name) {
          const nameEl = document.querySelector(
            'button.fontTitleSmall, button.sZ0S5, div.d4r55, button.alID1d, div.fontTitleMedium, span[class*="reviewer"]'
          );
          if (nameEl && nameEl.textContent?.trim() && !nameEl.textContent.includes('Google') && !nameEl.textContent.includes('Search')) {
            name = nameEl.textContent.trim();
          }
        }

        // 2. Star Rating from aria-label
        const starEls = document.querySelectorAll('[aria-label*="star"], [aria-label*="Star"], span.kv-star');
        for (const el of starEls) {
          const aria = el.getAttribute('aria-label') || '';
          const m = aria.match(/([1-5])\s*star/i);
          if (m) {
            stars = parseInt(m[1], 10);
            break;
          }
        }

        // 3. Review Comment Text
        // span.wiI7pd is Google Maps's primary container for review comments
        const exactEl = document.querySelector('span.wiI7pd, span[class*="wiI7pd"]');
        if (exactEl && exactEl.textContent?.trim()) {
          text = exactEl.textContent.trim();
        }

        if (!text) {
          const textSelectors = [
            'div.MyEned',
            'span.wi914c',
            'span.rGSub',
            'div.fontBodyMedium',
            'span[class*="review-text"]'
          ];
          for (const sel of textSelectors) {
            const el = document.querySelector(sel);
            if (el && el.textContent?.trim() && el.textContent.trim().length > 10) {
              text = el.textContent.trim();
              break;
            }
          }
        }

        return { reviewerName: name, rating: stars, comment: text };
      });

      if (extracted.comment || extracted.reviewerName) {
        if (extracted.reviewerName) reviewerName = extracted.reviewerName;
        if (extracted.rating) rating = extracted.rating;
        if (extracted.comment) comment = extracted.comment;
        isFetchedFromUrl = true;
        extractionMethod = 'PUPPETEER_DOM';
      }
    } catch (puppeteerErr) {
      console.warn('Browser extraction warning:', puppeteerErr);
    } finally {
      if (browser) {
        try {
          await browser.close();
        } catch (cErr) {}
      }
    }

    return NextResponse.json({
      success: true,
      url: inputUrl,
      resolvedUrl,
      isFetchedFromUrl,
      extractionMethod,
      reviewDetails: {
        reviewerName: reviewerName || '',
        rating: rating || 1,
        comment: comment || '',
        googleReviewUrl: resolvedUrl
      },
      message: isFetchedFromUrl
        ? 'Review extracted successfully from Google Maps.'
        : 'Google Review link resolved. If cloud bot protection prevented live text scraping, please review or paste the comment below.'
    });
  } catch (error: any) {
    console.error('Fetch Review API Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}
