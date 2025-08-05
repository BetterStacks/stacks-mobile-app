import { AIToken, LinkContext, MessageHistory, FileAttachment } from './types';

// API endpoint for the Next.js chat route
// For Android emulator, use 10.0.2.2 instead of localhost
const CHAT_API_ENDPOINT = 'http://10.0.2.2:3000/api/extension/chat';

export const getChatCompletion = async (
  message: string,
  aiToken: AIToken,
  onPartialResponse: (text: string) => void,
  contextLinks?: LinkContext[],
  messageHistory?: MessageHistory[],
  attachments?: FileAttachment[],
) => {
  try {
    // Debug attachments
    if (attachments?.length) {
      console.log('🔗 Processing attachments:', attachments.length);
      attachments.forEach((att, index) => {
        console.log(`📎 Attachment ${index + 1}:`, {
          name: att.name,
          type: att.type,
          mimeType: att.mimeType,
          hasBase64: !!att.base64,
          base64Length: att.base64?.length || 0,
        });
      });
    }

    // Prepare the request payload for the Next.js API route
    const requestPayload = {
      operation: 'mobileChat',
      provider: aiToken.ai_provider,
      token: aiToken.token,
      model: aiToken.ai_preferred_model,
      messages: [
        ...(messageHistory || []),
        {
          role: 'user' as const,
          content: message,
          id: Date.now().toString(),
        }
      ],
      contextLinks: contextLinks || [],
      attachments: attachments?.map(att => ({
        name: att.name,
        contentType: att.mimeType,
        data: att.base64,
      })) || [],
    };

    // console.log('🤖 Starting mobile chat request...');
    // console.log('📍 URL:', CHAT_API_ENDPOINT);
    // console.log('📦 Request payload:', JSON.stringify(requestPayload, null, 2));

    const response = await fetch(CHAT_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',
      body: JSON.stringify(requestPayload),
    });

    // console.log('📡 Response status:', response.status);
    // console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Response error text:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    // console.log('📡 Response body available:', !!response.body);
    // console.log('📡 Response bodyUsed:', response.bodyUsed);

    // React Native compatible streaming approach
    try {
      // React Native doesn't support response.body.getReader()
      // So we'll use a different approach with faster simulated streaming
      const responseText = await response.text();
      // console.log('📡 Full response received, processing streaming format...');
      
      // Parse the streaming response manually
      let fullResponse = '';
      const lines = responseText.split('\n');
      
      // Process lines in real-time with minimal delays
      for (const line of lines) {
        if (line.startsWith('0:')) {
          try {
            const jsonStr = line.slice(2);
            const textChunk = JSON.parse(jsonStr);
            fullResponse += textChunk;
            
            // Update UI immediately for each chunk
            onPartialResponse(fullResponse);
            
            // console.log('📡 Processed chunk:', textChunk);
            
            // Very small delay to prevent UI blocking (much faster than before)
            await new Promise(resolve => setTimeout(resolve, 10));
          } catch (parseError) {
            console.log('Parse error for line:', line, parseError);
          }
        }
      }
      
      return fullResponse;
    } catch (textError) {
      console.error('❌ Error reading response as text:', textError);
      throw textError;
    }
  } catch (error) {
    console.error(`Error with mobile chat API:`, error);
    throw error;
  }
}; 