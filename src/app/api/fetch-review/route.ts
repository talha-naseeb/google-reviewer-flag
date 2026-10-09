import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ success: false, error: 'Valid URL is required' }, { status: 400 });
    }

    const inputUrl = url.trim();
    let resolvedUrl = inputUrl;
    let reviewerName = '';
    let rating = 1;
    let comment = '';
    let isFetchedFromUrl = false;
    let extractionMethod = 'NONE';

    // Step 1: Follow HTTP redirects to resolve shortlinks (e.g. goo.gl/maps/... -> google.com/maps/reviews/data=...)
    try {
      const httpRes = await fetch(inputUrl, {
        method: 'GET',
        redirect: 'follow',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });

      if (httpRes.url) {
        resolvedUrl = httpRes.url;
      }

      const html = await httpRes.text();

      // Check OpenGraph / Meta Title & Description
      const ogTitleMatch = html.match(/<meta property=["']og:title["'] content=["'](.*?)["']/i);
      const ogDescMatch =
        html.match(/<meta property=["']og:description["'] content=["'](.*?)["']/i) ||
        html.match(/<meta name=["']description["'] content=["'](.*?)["']/i);

      const titleText = ogTitleMatch ? ogTitleMatch[1] : '';
      const descText = ogDescMatch ? ogDescMatch[1] : '';

      if (descText && !descText.toLowerCase().includes('find local businesses') && !descText.toLowerCase().includes('view maps')) {
        const starMatch = descText.match(/([1-5])\s*(?:star|★)/i);
        if (starMatch) rating = parseInt(starMatch[1], 10);

        const reviewAuthorMatch =
          descText.match(/review by (.*?)(?::|—|-|\.|\n)/i) ||
          titleText.match(/review by (.*?)(?::|—|-|\.|\n)/i);
        if (reviewAuthorMatch && reviewAuthorMatch[1]?.trim()) {
          reviewerName = reviewAuthorMatch[1].trim();
        }

        if (descText.length > 15) {
          comment = descText;
          isFetchedFromUrl = true;
          extractionMethod = 'HTTP_META';
        }
      }

      if (!reviewerName && titleText) {
        const titleAuthor = titleText.match(/(?:review by|from)\s+([^·\-|:]+)/i);
        if (titleAuthor && titleAuthor[1]?.trim()) {
          reviewerName = titleAuthor[1].trim();
        }
      }
    } catch (httpErr) {
      console.warn('HTTP Metadata Resolution Notice:', httpErr);
    }

    // Step 2: Headless Browser Extraction (supports both local environment & Vercel serverless via @sparticuz/chromium)
    if (!isFetchedFromUrl) {
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

        await page.goto(resolvedUrl, { waitUntil: 'networkidle2', timeout: 25000 });
        await page.evaluate(() => new Promise((r) => setTimeout(r, 2000)));

        resolvedUrl = page.url();

        const extracted = await page.evaluate(() => {
          let name = '';
          let stars = 1;
          let text = '';

          // 1. Extract Reviewer Name
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

          // 2. Extract Star Rating
          const starEls = document.querySelectorAll('[aria-label*="star"], [aria-label*="Star"], span.kv-star');
          for (const el of starEls) {
            const aria = el.getAttribute('aria-label') || '';
            const m = aria.match(/([1-5])\s*star/i);
            if (m) {
              stars = parseInt(m[1], 10);
              break;
            }
          }

          // 3. Extract Review Comment Text (span.wiI7pd is the direct Google Maps review text element)
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

          // Fallback: parse body innerText around timestamp
          if (!text) {
            const bodyLines = (document.body.innerText || '').split('\n').map((l) => l.trim()).filter(Boolean);
            for (let i = 0; i < bodyLines.length; i++) {
              const line = bodyLines[i];
              if (line.includes('ago') || line.includes('month') || line.includes('year') || line.includes('week') || line.includes('day')) {
                if (i > 0 && !name) {
                  const prev = bodyLines[i - 1];
                  if (!prev.includes('PLACE') && !prev.includes('Search') && prev.length < 40) {
                    name = prev;
                  }
                }
                if (i + 1 < bodyLines.length) {
                  const next = bodyLines[i + 1];
                  if (next.length > 15 && !next.includes('Order type') && !next.includes('Meal type')) {
                    text = next;
                    break;
                  }
                }
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
        console.warn('Headless browser extraction notice:', puppeteerErr);
      } finally {
        if (browser) {
          try {
            await browser.close();
          } catch (cErr) {}
        }
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
        ? 'Review extracted successfully.'
        : 'Google Review link resolved. If automated scraping was blocked by cloud bot protection, please review and enter the comment text below.'
    });
  } catch (error: any) {
    console.error('Fetch Review API Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}
