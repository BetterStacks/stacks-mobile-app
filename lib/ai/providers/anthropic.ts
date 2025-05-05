import { LinkContext, MessageHistory } from '../types';
import { AI_CONFIG } from '../config';

export const anthropicProvider = {
  getChatCompletion: async (
    message: string,
    token: string,
    model: string,
    onPartialResponse: (text: string) => void,
    contextLinks?: LinkContext[],
    messageHistory?: MessageHistory[]
  ): Promise<string> => {
    try {
      // Format context as part of user message
      const userMessage = contextLinks?.length
        ? `Context:\n${contextLinks
            .map(
              link => `Title: ${link.title}
Description: ${link.description}
Content: ${link.link_content}`,
            )
            .join("\n\n")}\n\nQuestion: ${message}`
        : message;

      // Construct messages array with history
      const messages = [
        ...(messageHistory || []),
        {
          role: "user",
          content: userMessage,
        },
      ];

      console.log("Anthropic - Final formatted message:", userMessage);

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": token,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: model,
          system: AI_CONFIG.SYSTEM_PROMPT,
          messages: messages,
          max_tokens: 1024,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Anthropic API Error:", errorData);
        throw new Error(
          `Failed to get response from Anthropic: ${response.status}`,
        );
      }

      const data = await response.json();
      const content = data.content[0].text;

      const chunkSize = 15;
      let currentPosition = 0;

      while (currentPosition < content.length) {
        const chunk = content.slice(0, currentPosition + chunkSize);
        onPartialResponse(chunk);
        currentPosition += chunkSize;

        await new Promise(resolve => setTimeout(resolve, 20));
      }

      return content;
    } catch (error) {
      console.error("Error calling Anthropic:", error);
      throw error;
    }
  },
}; 