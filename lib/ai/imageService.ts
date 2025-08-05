import { AIToken, GeneratedImage } from './types';

export interface ImageGenerationMetadata {
  model: string;
  size: string;
  provider: string;
  seed?: number;
}

export interface ImageGenerationResponse {
  success: boolean;
  image: GeneratedImage;
  metadata: ImageGenerationMetadata;
}

/**
 * Generate an image using the dashboard backend API
 * @param prompt - The image generation prompt
 * @param aiToken - User's AI token for authentication
 * @param size - Image size (default: '1024x1024')
 * @param seed - Optional seed for reproducible generation
 * @returns Promise<ImageGenerationResponse>
 */
export const generateImage = async (
  prompt: string,
  aiToken: AIToken,
  size: string = '1024x1024',
  seed?: number
): Promise<ImageGenerationResponse> => {
  // For Android emulator, use 10.0.2.2 instead of localhost
  const requestUrl = 'http://10.0.2.2:3000/api/ai/generate-image';
  const requestBody = {
    prompt,
    userContext: {
      name: 'Mobile User',
      can_use_stacks_ai: true,
      ai_tokens: [{
        ai_provider: aiToken.ai_provider,
        ai_preferred_model: aiToken.ai_preferred_model,
        token: aiToken.token
      }]
    },
    selectedProvider: aiToken.ai_provider === 'openai' ? 'openai' : 'stacks-default',
    size,
    ...(seed && { seed })
  };

  console.log('🖼️ Starting image generation request...');
  console.log('📍 URL:', requestUrl);
  console.log('📦 Request body:', JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',
      body: JSON.stringify(requestBody),
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Response error text:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result: ImageGenerationResponse = await response.json();
    console.log('✅ Image generation successful!');
    return result;
  } catch (error) {
    console.error('❌ Image generation error details:');
    console.error('   Error type:', error.constructor.name);
    console.error('   Error message:', error.message);
    console.error('   Full error:', error);
    
    if (error.message.includes('Network request failed')) {
      throw new Error('Unable to connect to image generation server. Please ensure the server is running and accessible.');
    }
    
    throw error;
  }
};