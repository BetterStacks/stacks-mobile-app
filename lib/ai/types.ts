export type AIToken = {
  ai_preferred_model: string;
  ai_provider: 'openai' | 'anthropic' | 'gemini';
  id: string;
  token: string;
};

export type LinkContext = {
  id: string;
  title: string;
  description: string;
  link_content: string;
};

export type MessageHistory = {
  role: 'user' | 'assistant';
  content: string;
};

export type FileAttachment = {
  id: string;
  name: string;
  type: 'image' | 'pdf' | 'document';
  uri: string;
  base64?: string;
  mimeType: string;
  savedUrl?: string;         // Optional: URL where file is permanently stored
  savedTitle?: string;       // Optional: Title/filename when saved
};

export type GeneratedImage = {
  base64?: string;           // For newly generated images
  url?: string;              // For persisted images  
  mediaType: string;
  prompt: string;
  savedUrl?: string;         // Optional: URL where image is permanently stored
  savedTitle?: string;       // Optional: Title/filename when saved
};

export type Message = {
  id: string;
  text: string;
  isUser: boolean;
  attachments?: FileAttachment[];
  generatedImage?: GeneratedImage;
}; 