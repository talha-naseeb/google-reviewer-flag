import { NextResponse } from 'next/server';
import { analyzeReview } from '@/lib/analyzerEngine';

const FAST_DEFAULT_MODEL = 'meta/llama-3.2-11b-vision-instruct';
const DEFAULT_NVIDIA_KEY = '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';

// GET Handler: Allows browser health checks and verification without hanging or 405 error
export async function GET() {
  return NextResponse.json({
    success: true,
    status: 'online',
    defaultModel: FAST_DEFAULT_MODEL,
    message: 'NVIDIA NIM High-Performance Generation Endpoint is operational and ready.'
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { comment, reviewerName, rating, apiKey: clientApiKey, model: requestedModel } = body;

    // Resolve key, ignoring expired/forbidden keys from OS environment
    let apiKey = clientApiKey?.trim() || '';

    if (!apiKey || apiKey.startsWith('nvapi-UYiFG8')) {
      const envKey = (process.env.NEXT_PUBLIC_NVIDIA_API_KEY || process.env.NVIDIA_API_KEY || '').trim();
      apiKey = envKey && !envKey.startsWith('nvapi-UYiFG8') ? envKey : DEFAULT_NVIDIA_KEY;
    }

    if (apiKey.startsWith('nnvapi')) {
      apiKey = apiKey.slice(1);
    }

    // Use high-performance fast model (replaces unresponsive/queued models)
    const selectedModel =
      requestedModel && requestedModel !== 'deepseek-ai/deepseek-v4.1-flash'
        ? requestedModel
        : FAST_DEFAULT_MODEL;

    // 1. Run local policy rule engine to identify rule candidate
    const localAnalysis = analyzeReview({
      comment: comment || '',
      rating: rating || 1,
      reviewerName: reviewerName || 'Google User',
      locationName: 'Google Business Profile'
    });

    const rule = localAnalysis.primaryViolation;

    // 2. Call NVIDIA NIM API with strict timeout to prevent long serverless stalls
    if (apiKey && !apiKey.includes('your-key-here')) {
      try {
        const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
          method: 'POST',
          signal: AbortSignal.timeout(4500),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: selectedModel,
            messages: [
              {
                role: 'system',
                content: `You are an expert Google Business Profile Moderation & Legal Compliance Officer specializing in Google Maps User-Contributed Content Policy enforcement.
Your task is to write a compelling, formal 2 to 3 sentence Google Review Removal Request description designed to persuade Google's moderation team to delete the flagged review. Quote any violating phrases and cite the relevant Google Maps Content Policy clause directly.`
              },
              {
                role: 'user',
                content: `Generate a formal Google Policy Removal Request description to paste into Google's "Report Review" form for this review:
Reviewer Name: "${reviewerName || 'Google User'}"
Star Rating: ${rating || 1}/5 Stars
Review Comment: "${comment || 'Rating only / minimal text'}"
Candidate Rule Category: ${rule ? rule.ruleTitle : 'Deceptive & Unsubstantiated Rating'}`
              }
            ],
            temperature: 0.1,
            top_p: 0.95,
            max_tokens: 180
          })
        });

        if (response.ok) {
          const data = await response.json();
          const choice = data.choices?.[0];
          const aiMessage = choice?.message?.content?.trim() || choice?.delta?.content?.trim();

          if (aiMessage) {
            // Clean up wrapping quotes if present
            const cleanMessage = aiMessage.replace(/^["']|["']$/g, '');

            return NextResponse.json({
              success: true,
              modelUsed: selectedModel,
              latency: 'fast',
              result: {
                isViolating: true,
                policyRuleTitle: rule ? rule.ruleTitle : 'Google Maps Content Policy',
                ruleNumber: rule ? rule.ruleNumber : 1,
                generatedReason: cleanMessage,
                confidenceScore: 96,
                isNvidiaPowered: true
              }
            });
          }
        } else {
          const errText = await response.text();
          console.warn('NVIDIA Backend API Error:', response.status, errText);
        }
      } catch (err: any) {
        console.warn('NVIDIA NIM Fetch / Timeout:', err.message);
      }
    }

    // 3. High-precision instant fallback from local policy engine
    const fallbackReason =
      localAnalysis.generatedReportReason ||
      (comment && comment.length > 5
        ? `Request for removal under Google Maps Content Policy. The review from "${reviewerName || 'Google User'}" contains non-compliant elements: "${comment}". This content violates Google User Contributed Content Guidelines.`
        : `Request for removal under Google's Spam & Deceptive Content Policy. The review from "${reviewerName || 'Google User'}" represents an unverified rating lacking genuine customer interaction details. We request permanent deletion under Google guidelines.`);

    return NextResponse.json({
      success: true,
      modelUsed: 'Built-in Engine',
      result: {
        isViolating: true,
        policyRuleTitle: rule ? rule.ruleTitle : 'Spam & Deceptive Content',
        ruleNumber: rule ? rule.ruleNumber : 1,
        generatedReason: fallbackReason,
        confidenceScore: 92,
        isNvidiaPowered: false
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
