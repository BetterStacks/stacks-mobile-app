import { LinkContext, MessageHistory, FileAttachment } from '../types';
import { AI_CONFIG } from '../config';

export const anthropicProvider = {
  getChatCompletion: async (
    message: string,
    token: string,
    model: string,
    onPartialResponse: (text: string) => void,
    contextLinks?: LinkContext[],
    messageHistory?: MessageHistory[],
    attachments?: FileAttachment[]
  ): Promise<string> => {
    try {
      // Format context as part of user message
      const contextText = contextLinks?.length
        ? `Context:\n${contextLinks
            .map(
              link => `Title: ${link.title}
Description: ${link.description}
Content: ${link.link_content}`,
            )
            .join("\n\n")}\n\n`
        : "";
      
      const textContent = `${contextText}Question: ${message}`;

      // Create user message content (multimodal if attachments exist)
      const userContent = attachments?.length
        ? [
            ...attachments
              .filter(att => att.type === 'image' && att.base64)
              .map(att => ({
                type: "image",
                source: {
                  type: "base64",
                  media_type: att.mimeType,
                  data: att.base64,
                },
              })),
            {
              type: "text",
              text: textContent,
            },
          ]
        : textContent;

      // Construct messages array with history
      const messages = [
        ...(messageHistory || []),
        {
          role: "user",
          content: userContent,
        },
      ];

      console.log("Anthropic - Final formatted message:", textContent);

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