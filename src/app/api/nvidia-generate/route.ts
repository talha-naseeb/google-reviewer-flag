import { NextResponse } from 'next/server';
import { analyzeReview } from '@/lib/analyzerEngine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { comment, reviewerName, rating, apiKey: clientApiKey, model: requestedModel } = body;

    const apiKey =
      clientApiKey?.trim() ||
      process.env.NVIDIA_API_KEY?.trim() ||
      process.env.NEXT_PUBLIC_NVIDIA_API_KEY?.trim();

    const selectedModel = requestedModel || 'deepseek-ai/deepseek-v4.1-flash';

    // 1. Run local policy rule engine to identify rule candidate
    const localAnalysis = analyzeReview({
      comment: comment || '',
      rating: rating || 1,
      reviewerName: reviewerName || 'Google User',
      locationName: 'Google Business Profile'
    });

    const rule = localAnalysis.primaryViolation;

    // 2. Call NVIDIA NIM API to ALWAYS generate a policy removal description
    if (apiKey && apiKey !== 'nvapi-your-key-here') {
      try {
        const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
          method: 'POST',
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

Your objective is to write a compelling, formal, evidence-backed Google Review Removal Request description designed to persuade Google's moderation team to delete the flagged review.

RULES FOR REMOVAL DESCRIPTION:
1. Identify and state the primary broken Google Maps Content Policy Clause (e.g. Conflict of Interest, Spam & Fake Content, Deceptive Ratings, Harassment/Profanity, Off-Topic Commentary, or Misattributed Experience).
2. If specific text is present, quote the exact phrases in quotation marks. If minimal or no text is present (e.g. blank 1-star review or bot profile), cite Google's policy on "Deceptive Content & Lack of Genuine First-Hand Customer Experience".
3. Cite official Google Maps User-Contributed Content Guidelines.
4. Conclude with a direct, formal request for immediate permanent removal.
5. Keep response between 3 to 5 clear sentences.`
              },
              {
                role: 'user',
                content: `Please generate a formal Google Policy Removal Request description to paste into Google's "Report Review" form for this review:

Reviewer Name: "${reviewerName || 'Google User'}"
Star Rating: ${rating || 1}/5 Stars
Review Comment: "${comment || 'Rating only / minimal text'}"
Candidate Rule Category: ${rule ? rule.ruleTitle : 'Deceptive & Unsubstantiated Rating'}`
              }
            ],
            temperature: 0.1,
            top_p: 0.95,
            max_tokens: 450
          })
        });

        if (response.ok) {
          const data = await response.json();
          const choice = data.choices?.[0];
          const aiMessage = choice?.message?.content?.trim() || choice?.delta?.content?.trim();

          if (aiMessage) {
            return NextResponse.json({
              success: true,
              modelUsed: selectedModel,
              result: {
                isViolating: true,
                policyRuleTitle: rule ? rule.ruleTitle : 'Google Maps Content Policy',
                ruleNumber: rule ? rule.ruleNumber : 1,
                generatedReason: aiMessage,
                confidenceScore: 95,
                isNvidiaPowered: true
              }
            });
          }
        } else {
          const errText = await response.text();
          console.warn('NVIDIA Backend API Error:', errText);
        }
      } catch (err: any) {
        console.warn('NVIDIA Fetch Error:', err);
      }
    }

    // Fallback response if API key is missing
    const fallbackReason = comment && comment.length > 5
      ? `Request for removal under Google Maps Content Policy. The review from "${reviewerName || 'Google User'}" contains non-compliant elements: "${comment}". This content violates Google User Contributed Content Guidelines.`
      : `Request for removal under Google's Spam & Deceptive Content Policy. The review from "${reviewerName || 'Google User'}" represents an unverified rating lacking genuine customer interaction details. We request permanent deletion under Google guidelines.`;

    return NextResponse.json({
      success: true,
      modelUsed: 'Built-in Engine',
      result: {
        isViolating: true,
        policyRuleTitle: rule ? rule.ruleTitle : 'Spam & Deceptive Content',
        ruleNumber: rule ? rule.ruleNumber : 1,
        generatedReason: fallbackReason,
        confidenceScore: 90,
        isNvidiaPowered: false
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
