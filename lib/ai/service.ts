import { AIToken, LinkContext, MessageHistory } from './types';
import { openAIProvider } from './providers/openai';
import { anthropicProvider } from './providers/anthropic';

export const getChatCompletion = async (
  message: string,
  aiToken: AIToken,
  onPartialResponse: (text: string) => void,
  contextLinks?: LinkContext[],
  messageHistory?: MessageHistory[],
) => {
  try {
    const provider =
      aiToken.ai_provider === "openai" ? openAIProvider : anthropicProvider;
    return await provider.getChatCompletion(
      message,
      aiToken.token,
      aiToken.ai_preferred_model,
      onPartialResponse,
      contextLinks,
      messageHistory,
    );
  } catch (error) {
    console.error(`Error with ${aiToken.ai_provider}:`, error);
    throw error;
  }
}; 