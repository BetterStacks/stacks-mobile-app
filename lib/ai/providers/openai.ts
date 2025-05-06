import { LinkContext, MessageHistory } from '../types';
import { AI_CONFIG } from '../config';

export const openAIProvider = {
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
        {
          role: "system",
          content: AI_CONFIG.SYSTEM_PROMPT,
        },
        ...(messageHistory || []),
        {
          role: "user",
          content: userMessage,
        },
      ];

      console.log("OpenAI - Final formatted message:", userMessage);

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from OpenAI");
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

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
      console.error("Error calling OpenAI:", error);
      throw error;
    }
  },
}; 