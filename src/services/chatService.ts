// services/chatService.ts
import api from './axiosInstance';

interface SessionResponse {
  session_id: string;
}


const getConversationId = (): string | null => {
  return localStorage.getItem('conversationId');
};

const getSessionId = (): string | null => {
  return localStorage.getItem('sessionId');
};

export const chatService = {
  async existsChat() {
    const conversationId = getConversationId();
    if (!conversationId) return false;

    const response = await api.get<boolean>('/chat/exists', {
      params: { conversationId },
    });
    return response.data;
  },

  async startChat() {
    const response = await api.post('/chat/start', {});
    const { conversationId, message } = response.data;

    localStorage.setItem('conversationId', conversationId);

    return message as string;
  },

  async getChatHistory() {
    const conversationId = getConversationId();
    if (!conversationId) return [];

    const response = await api.get('/chat/history', {
      params: { conversationId },
    });

    const { messageHistory } = response.data;

    const formattedMessages = messageHistory
      .map((msg: { role: 'USER' | 'ASSISTANT'; content: string }) => ({
        role: msg.role === 'USER' ? 'user' : 'bot',
        message: msg.content,
      }))
      .slice(1);

    return formattedMessages;
  },

  async createChatSession(): Promise<SessionResponse> {
    const response = await api.post('/chat/session');
    return response.data
  },

  async sendMessageToAgent(inputMessage: string, file: File | null) {
    const conversationId = getConversationId();
    if (!conversationId) throw new Error('No conversation ID found.');

    const formData = new FormData();

    if (file) {
      formData.append('documents', file, file.name);
    }

    const params = new URLSearchParams({ conversationId });
    if (inputMessage.trim()) {
      params.append('message', inputMessage);
    }

    const response = await api.post(
      `/chat/message?${params.toString()}`,
      formData,
    );

    return response.data.message as string;
  },

  async sendMessage(message: string): Promise<string> {
    const sessionId = getSessionId();
    if (!sessionId) throw new Error('No session ID found.');
    const response = await api.post(`/chat/session/${sessionId}/message`, { text: message });
    return response.data.messages.join('\n')
  },
};
