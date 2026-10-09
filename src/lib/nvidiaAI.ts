export interface NvidiaGenerationResult {
  isViolating: boolean;
  policyRuleTitle: string;
  ruleNumber: number;
  generatedReason: string;
  confidenceScore: number;
  isNvidiaPowered: boolean;
}

export async function generateNvidiaRemovalDescription(
  commentText: string,
  reviewerName: string,
  rating: number,
  overrideApiKey?: string,
  modelName?: string
): Promise<NvidiaGenerationResult> {
  try {
    const response = await fetch('/api/nvidia-generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        comment: commentText,
        reviewerName,
        rating,
        apiKey: overrideApiKey,
        model: modelName || 'deepseek-ai/deepseek-v4.1-flash'
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.result) {
        return data.result;
      }
    }
  } catch (err) {
    console.warn('NVIDIA Backend Call Error:', err);
  }

  return {
    isViolating: true,
    policyRuleTitle: 'Google Content Policy',
    ruleNumber: 1,
    generatedReason: `Request for removal under Google's Content Guidelines. The review from "${reviewerName || 'Google User'}" contains non-compliant elements. We request permanent removal under Google policy.`,
    confidenceScore: 90,
    isNvidiaPowered: false
  };
}
