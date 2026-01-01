import api from "@/lib/axios";
import type { Message } from "@/types/Chat";

interface FetchMessageProps {
  messages: Message[];
  total: number;
}

const limit = 20;

const chatService = {  
  fetchMessages: async (
    productId: string,
    offset: number = 0
  ): Promise<FetchMessageProps> => {
    try {
      const res = await api.get(
        `/messages/${productId}?limit=${limit}&offset=${offset}`
      );
      return { messages: res.data.data, total: res.data.total };
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  sendMessage: async (
    recipientId: string,
    content: string,
    productId: string,
    image?: string
  ) => {
    try {
      const res = await api.post(`/messages`, {
        recipientId,
        content: content || null,
        productId,
        image: image || null,
      });
      return res.data.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },  
};

export default chatService;
