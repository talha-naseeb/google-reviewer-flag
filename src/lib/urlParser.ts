export interface ParsedGoogleReviewUrl {
  isValid: boolean;
  rawUrl: string;
  extractedReviewId?: string;
  extractedPlaceId?: string;
  directReportUrl?: string;
  urlType: 'MAPS_DATA_URL' | 'MAPS_SHARE_URL' | 'BUSINESS_PROFILE_URL' | 'GENERIC_URL';
}

export function parseGoogleReviewUrl(urlStr: string): ParsedGoogleReviewUrl {
  const trimmed = urlStr.trim();
  if (!trimmed) {
    return { isValid: false, rawUrl: '', urlType: 'GENERIC_URL' };
  }

  try {
    const url = new URL(trimmed);

    // Case 1: Google Maps Review Data URL (e.g., https://www.google.com/maps/reviews/data=...)
    if (url.hostname.includes('google.com') && url.pathname.includes('/maps/reviews/data')) {
      const dataParam = url.searchParams.get('data') || '';
      const skidParam = url.searchParams.get('skid') || '';
      
      return {
        isValid: true,
        rawUrl: trimmed,
        extractedReviewId: skidParam || 'maps_data_id',
        directReportUrl: trimmed,
        urlType: 'MAPS_DATA_URL'
      };
    }

    // Case 2: Google Maps Share Link or CID link
    if (url.hostname.includes('google.com') || url.hostname.includes('maps.app.goo.gl')) {
      const cid = url.searchParams.get('cid');
      return {
        isValid: true,
        rawUrl: trimmed,
        extractedPlaceId: cid || undefined,
        directReportUrl: trimmed,
        urlType: 'MAPS_SHARE_URL'
      };
    }

    return {
      isValid: true,
      rawUrl: trimmed,
      directReportUrl: trimmed,
      urlType: 'GENERIC_URL'
    };
  } catch (e) {
    // If not a full URL string, treat as potential raw text or link fragment
    return {
      isValid: trimmed.startsWith('http') || trimmed.includes('google.com'),
      rawUrl: trimmed,
      directReportUrl: trimmed.startsWith('http') ? trimmed : `https://${trimmed}`,
      urlType: 'GENERIC_URL'
    };
  }
}
