/**
 * Utility to detect if a user prompt is requesting image generation
 */

const IMAGE_GENERATION_KEYWORDS = [
  'generate image',
  'create image',
  'make image',
  'draw',
  'create a picture',
  'generate a picture',
  'make a picture',
  'create art',
  'generate art',
  'make art',
  'design',
  'illustrate',
  'sketch',
  'paint',
  'create visual',
  'generate visual',
  'make visual',
  'create graphic',
  'generate graphic',
  'make graphic'
];

const IMAGE_GENERATION_PHRASES = [
  /^(generate|create|make|draw)\s+(an?\s+)?(image|picture|photo|artwork|art|illustration|sketch|painting|visual|graphic)/i,
  /^(can you|could you|please)\s+(generate|create|make|draw)\s+(an?\s+)?(image|picture|photo|artwork|art|illustration|sketch|painting|visual|graphic)/i,
  /^(i want|i need|i would like)\s+(an?\s+)?(image|picture|photo|artwork|art|illustration|sketch|painting|visual|graphic)/i
];

/**
 * Detects if a user prompt is requesting image generation
 * @param prompt - The user's input text
 * @returns boolean indicating if image generation is requested
 */
export function isImageGenerationRequest(prompt: string): boolean {
  const normalizedPrompt = prompt.toLowerCase().trim();
  
  // Check for exact keyword matches
  const hasKeyword = IMAGE_GENERATION_KEYWORDS.some(keyword => 
    normalizedPrompt.includes(keyword)
  );
  
  // Check for pattern matches
  const hasPattern = IMAGE_GENERATION_PHRASES.some(pattern => 
    pattern.test(normalizedPrompt)
  );
  
  return hasKeyword || hasPattern;
}

/**
 * Extracts the image description from a generation prompt
 * @param prompt - The user's input text
 * @returns cleaned prompt for image generation
 */
export function extractImagePrompt(prompt: string): string {
  let cleanPrompt = prompt.trim();
  
  // Remove common prefixes
  const prefixesToRemove = [
    /^(generate|create|make|draw)\s+(an?\s+)?(image|picture|photo|artwork|art|illustration|sketch|painting|visual|graphic)\s+(of\s+)?/i,
    /^(can you|could you|please)\s+(generate|create|make|draw)\s+(an?\s+)?(image|picture|photo|artwork|art|illustration|sketch|painting|visual|graphic)\s+(of\s+)?/i,
    /^(i want|i need|i would like)\s+(an?\s+)?(image|picture|photo|artwork|art|illustration|sketch|painting|visual|graphic)\s+(of\s+)?/i
  ];
  
  for (const pattern of prefixesToRemove) {
    cleanPrompt = cleanPrompt.replace(pattern, '');
  }
  
  return cleanPrompt.trim() || prompt;
}