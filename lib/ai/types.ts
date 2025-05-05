export type AIToken = {
  ai_preferred_model: string;
  ai_provider: 'openai' | 'anthropic';
  id: string;
  token: string;
};

export type LinkContext = {
  title: string;
  description: string;
  link_content: string;
};

export type MessageHistory = {
  role: 'user' | 'assistant';
  content: string;
};

export type Message = {
  id: string;
  text: string;
  isUser: boolean;
}; 