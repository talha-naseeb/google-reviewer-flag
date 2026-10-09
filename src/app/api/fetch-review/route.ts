import { NextResponse } from 'next/server';
import { parseGoogleReviewUrl } from '@/lib/urlParser';
import puppeteer from 'puppeteer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ success: false, error: 'Valid URL is required' }, { status: 400 });
    }

    const inputUrl = url.trim();
    let finalUrl = inputUrl;
    let reviewerName = 'Google Reviewer';
    let rating = 1;
    let comment = '';
    let isFetchedFromUrl = false;

    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
      });

      const page = await browser.newPage();
      await page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      );
      await page.setViewport({ width: 1280, height: 900 });

      // Navigate with domcontentloaded to handle client-side JS redirects
      await page.goto(inputUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

      // Wait for JavaScript navigation to finish
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
      await page.evaluate(() => new Promise((r) => setTimeout(r, 2000)));

      finalUrl = page.url();

      // Extract details from Google Maps DOM elements
      const extracted = await page.evaluate(() => {
        let name = '';

        // Strategy 1: Extract Reviewer Name from Google Maps 3-dot Action Button ("Actions for {Name}'s review")
        const actionBtns = Array.from(document.querySelectorAll('button[aria-label]'));
        for (const btn of actionBtns) {
          const aria = btn.getAttribute('aria-label') || '';
          const actionMatch = aria.match(/Actions for (.*?)(?:'s|’s) review/i);
          if (actionMatch && actionMatch[1]?.trim()) {
            name = actionMatch[1].trim();
            break;
          }
          const photoMatch = aria.match(/Photo of (.*?)$/i);
          if (photoMatch && photoMatch[1]?.trim() && !photoMatch[1].includes('Google')) {
            name = photoMatch[1].trim();
            break;
          }
        }

        // Strategy 2: Extract Name from author DOM selectors if Strategy 1 did not match
        if (!name) {
          const nameSelectors = [
            'div.d4r55',
            'button.alID1d',
            'div.fontTitleMedium',
            'span[class*="reviewer"]',
            'div[class*="name"]'
          ];
          for (const sel of nameSelectors) {
            const el = document.querySelector(sel);
            if (el && el.textContent?.trim() && !el.textContent.includes('Google Maps') && !el.textContent.includes('Search')) {
              name = el.textContent.trim();
              break;
            }
          }
        }

        // Strategy 3: Star Rating (Count  star icons or read aria-label)
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
          if (stars === 1 && starIcons.length >= 1 && starIcons.length <= 5) {
            stars = starIcons.length;
          }
        }

        // Strategy 4: Review Comment Text
        let text = '';
        const textSelectors = [
          'span.wi914c',
          'div.My5W2e',
          'span.rGSub',
          'div.fontBodyMedium',
          'span[class*="review-text"]',
          'div[class*="review-text"]'
        ];

        for (const sel of textSelectors) {
          const els = document.querySelectorAll(sel);
          for (let i = 0; i < els.length; i++) {
            const content = els[i].textContent?.trim() || '';
            if (
              content &&
              content.length > 10 &&
              !content.includes('Share') &&
              !content.includes('Like') &&
              !content.includes('Save') &&
              !content.includes('Photos') &&
              !content.includes('German')
            ) {
              text = content;
              break;
            }
          }
          if (text) break;
        }

        // Body text fallback parsing
        if (!name || !text) {
          const bodyLines = (document.body.innerText || '').split('\n').map((l) => l.trim()).filter(Boolean);
          for (let i = 0; i < bodyLines.length; i++) {
            const line = bodyLines[i];
            if (line.includes('ago') || line.includes('month') || line.includes('year') || line.includes('week')) {
              if (i > 0 && !name) {
                const prev = bodyLines[i - 1];
                if (!prev.includes('PLACE') && !prev.includes('Search') && prev.length < 50) {
                  name = prev;
                }
              }
              if (i + 1 < bodyLines.length && !text) {
                const next = bodyLines[i + 1];
                if (next.length > 15) {
                  text = next;
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
      }
    } catch (puppeteerErr) {
      console.warn('Puppeteer Extraction Error:', puppeteerErr);
    } finally {
      if (browser) {
        await browser.close();
      }
    }

    return NextResponse.json({
      success: true,
      url: inputUrl,
      resolvedUrl: finalUrl,
      isFetchedFromUrl,
      reviewDetails: {
        reviewerName: reviewerName || 'Google User',
        rating: rating || 1,
        comment: comment || '',
        googleReviewUrl: finalUrl
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
