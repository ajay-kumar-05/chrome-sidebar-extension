import OpenAI from 'openai';
import { Message } from '../store';

export class AIService {
  private openai: OpenAI | null = null;
  private apiKey: string = '';

  constructor(apiKey?: string) {
    if (apiKey) {
      this.setApiKey(apiKey);
    }
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    if (apiKey) {
      this.openai = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true,
      });
    }
  }

  async sendMessage(
    messages: Message[],
    model: string = 'gpt-3.5-turbo',
    pageContext?: {
      url: string;
      title: string;
      selectedText?: string;
      content?: string;
    }
  ): Promise<string> {
    if (!this.openai) {
      throw new Error('OpenAI API key not set');
    }

    // Prepare system message with context
    let systemMessage = `You are an AI assistant integrated into a browser sidebar. You help users with web content analysis, questions, and tasks.`;
    
    if (pageContext) {
      systemMessage += `\n\nCurrent page context:
- URL: ${pageContext.url}
- Title: ${pageContext.title}`;
      
      if (pageContext.selectedText) {
        systemMessage += `\n- Selected text: "${pageContext.selectedText}"`;
      }
      
      if (pageContext.content) {
        systemMessage += `\n- Page content (truncated): ${pageContext.content.substring(0, 2000)}...`;
      }
    }

    // Convert messages to OpenAI format
    const openAIMessages = [
      { role: 'system' as const, content: systemMessage },
      ...messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
    ];

    try {
      const completion = await this.openai.chat.completions.create({
        model,
        messages: openAIMessages,
        max_tokens: 1000,
        temperature: 0.7,
        stream: false,
      });

      return completion.choices[0]?.message?.content || 'No response generated';
    } catch (error) {
      console.error('AI Service Error:', error);
      throw new Error('Failed to get AI response');
    }
  }

  async analyzePageContent(content: string, question?: string): Promise<string> {
    if (!this.openai) {
      throw new Error('OpenAI API key not set');
    }

    const prompt = question 
      ? `Analyze this web page content and answer the question: "${question}"\n\nContent: ${content.substring(0, 3000)}`
      : `Analyze and summarize this web page content:\n\n${content.substring(0, 3000)}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful AI assistant that analyzes web content.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 800,
        temperature: 0.5,
      });

      return completion.choices[0]?.message?.content || 'No analysis generated';
    } catch (error) {
      console.error('AI Analysis Error:', error);
      throw new Error('Failed to analyze content');
    }
  }

  async generateSummary(text: string): Promise<string> {
    if (!this.openai) {
      throw new Error('OpenAI API key not set');
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { 
            role: 'system', 
            content: 'You are a helpful assistant that creates concise summaries of text content. Keep summaries clear and under 200 words.' 
          },
          { role: 'user', content: `Please summarize this text:\n\n${text}` },
        ],
        max_tokens: 300,
        temperature: 0.3,
      });

      return completion.choices[0]?.message?.content || 'No summary generated';
    } catch (error) {
      console.error('Summary Error:', error);
      throw new Error('Failed to generate summary');
    }
  }
}

// Singleton instance
export const aiService = new AIService();
