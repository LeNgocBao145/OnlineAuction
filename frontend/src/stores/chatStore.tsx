import { create } from "zustand";
import type { ChatState } from "@/types/Store";
import { persist } from "zustand/middleware";
import chatService from "@/services/chatService";
import useAuthStore from "./authStore";
import type { Conversation, Message } from "@/types/Chat";

const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: {},
      activeProductId: null,
      messageLoading: false,
      reset: () => {
        set({
          messages: {},
          activeProductId: null,
          messageLoading: false,
        });
      },

      setActiveProductId: (id: string | null) => {
        set({ activeProductId: id });
      },      
      fetchMessages: async (productId) => {
        const { activeProductId, messages } = get();
        const { user } = useAuthStore.getState();

        const currentProductId = productId ?? activeProductId;
        if (!currentProductId) return;

        const current = messages?.[currentProductId];
        const offset = current?.items?.length ?? 0;

        set({ messageLoading: true });
        try {
          const { messages: fetchedMessages } =
            await chatService.fetchMessages(currentProductId, offset);
          
          const processedMessages = fetchedMessages.map((message) => {
            return {
              ...message,
              isOwn: message.sender === user?.id,
            };
          });
          
          set((state) => {
            const prevMessages = state.messages?.[currentProductId]?.items ?? [];
            const mergedMessages =
              prevMessages.length > 0
                ? [...prevMessages, ...processedMessages]
                : processedMessages;
            
            return {
              messages: {
                ...state.messages,
                [currentProductId]: {
                  items: mergedMessages,
                  hasMore: fetchedMessages.length > 0,
                },
              },
            };
          });
        } catch (error) {
          console.error("Error when fetch messages!!", error);
        } finally {
          set({ messageLoading: false });
        }
      },
      sendMessage: async (
        recipientId: string,
        content: string,
        image?: string
      ) => {
        try {
          const { activeProductId } = get();
          if (!activeProductId) {
            console.error("No active product ID");
            return;
          }

          await chatService.sendMessage(
            recipientId,
            content,
            activeProductId,
            image
          );
        } catch (error) {
          console.error("Error when sending message!!", error);
        }
      },      
      addMessage: async (message: Message) => {
        try {
          const { user } = useAuthStore();
          const { fetchMessages } = get();

          message.isOwn = message.sender === user?.id;
          const productId = message.product;
          
          let prevMessages = get().messages?.[productId]?.items ?? [];

          if (prevMessages.length === 0) {
            await fetchMessages(productId);
            prevMessages = get().messages?.[productId]?.items ?? [];
          }

          set((state) => {
            if (prevMessages.some((m) => m.id === message.id)) return state;
            
            const mergedMessages = [...prevMessages, message];
            return {
              messages: {
                ...state.messages,
                [productId]: {
                  items: mergedMessages,
                  hasMore: state.messages?.[productId]?.hasMore ?? true,
                },
              },
            };
          });
        } catch (error) {
          console.error("Error when adding message!", error);
        }
      },      
    }),
    {
      name: "chat-storage",      
    }
  )
);

export default useChatStore;
