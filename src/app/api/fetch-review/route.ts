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

    // Step 1: Follow HTTP redirects to resolve shortlinks & inspect OpenGraph / HTML metadata
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

      // Extract OpenGraph / Meta Title & Description
      const ogTitleMatch = html.match(/<meta property=["']og:title["'] content=["'](.*?)["']/i);
      const ogDescMatch = html.match(/<meta property=["']og:description["'] content=["'](.*?)["']/i) ||
                          html.match(/<meta name=["']description["'] content=["'](.*?)["']/i);

      const titleText = ogTitleMatch ? ogTitleMatch[1] : '';
      const descText = ogDescMatch ? ogDescMatch[1] : '';

      // Check if description contains review text or rating
      if (descText && !descText.toLowerCase().includes('find local businesses') && !descText.toLowerCase().includes('view maps')) {
        // Many Google Maps shared links format: "★★★★☆ · [Comment snippet]" or "Review by [Name]: [Comment]"
        const starMatch = descText.match(/([1-5])\s*(?:star|★)/i);
        if (starMatch) {
          rating = parseInt(starMatch[1], 10);
        }

        const reviewAuthorMatch = descText.match(/review by (.*?)(?::|—|-|\.|\n)/i) ||
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

      // Check title for reviewer name
      if (!reviewerName && titleText) {
        const titleAuthor = titleText.match(/(?:review by|from)\s+([^·\-|:]+)/i);
        if (titleAuthor && titleAuthor[1]?.trim()) {
          reviewerName = titleAuthor[1].trim();
        }
      }
    } catch (httpErr) {
      console.warn('HTTP Metadata Resolution Notice:', httpErr);
    }

    // Step 2: Attempt Puppeteer browser extraction if not already resolved and environment supports it
    if (!isFetchedFromUrl) {
      let browser;
      try {
        const puppeteer = await import('puppeteer');
        browser = await puppeteer.default.launch({
          headless: true,
          timeout: 10000,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--single-process',
            '--no-zygote'
          ]
        });

        const page = await browser.newPage();
        await page.setUserAgent(
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
        );
        await page.setViewport({ width: 1280, height: 900 });

        await page.goto(resolvedUrl, { waitUntil: 'domcontentloaded', timeout: 12000 });
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 5000 }).catch(() => {});

        resolvedUrl = page.url();

        const extracted = await page.evaluate(() => {
          let name = '';
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
            const nameSelectors = ['div.d4r55', 'button.alID1d', 'div.fontTitleMedium', 'span[class*="reviewer"]'];
            for (const sel of nameSelectors) {
              const el = document.querySelector(sel);
              if (el && el.textContent?.trim() && !el.textContent.includes('Google Maps') && !el.textContent.includes('Search')) {
                name = el.textContent.trim();
                break;
              }
            }
          }

          let stars = 1;
          const starIcons = document.querySelectorAll('span.kv-star, [aria-label*="star"], [aria-label*="Star"]');
          if (starIcons && starIcons.length > 0) {
            for (let i = 0; i < starIcons.length; i++) {
              const label = starIcons[i].getAttribute('aria-label') || '';
              const match = label.match(/([1-5])/);
              if (match) {
                stars = parseInt(match[1], 10);
                break;
              }
            }
          }

          let text = '';
          const textSelectors = ['span.wi914c', 'div.My5W2e', 'span.rGSub', 'div.fontBodyMedium', 'span[class*="review-text"]'];
          for (const sel of textSelectors) {
            const els = document.querySelectorAll(sel);
            for (let i = 0; i < els.length; i++) {
              const content = els[i].textContent?.trim() || '';
              if (content && content.length > 10 && !content.includes('Share') && !content.includes('Like')) {
                text = content;
                break;
              }
            }
            if (text) break;
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
        console.warn('Puppeteer launch skipped or not supported in this runtime:', puppeteerErr);
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
        : 'Google Review link resolved. Automatic scraping was restricted by Google bot protection. You can enter or refine the reviewer details below.'
    });
  } catch (error: any) {
    console.error('Fetch Review API Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}
