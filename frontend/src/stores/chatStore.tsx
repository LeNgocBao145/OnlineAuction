import { create } from "zustand";
import type { ChatState } from "@/types/Store";
import { persist } from "zustand/middleware";
import chatService from "@/services/chatService";
import useAuthStore from "./authStore";
import type { Message } from "@/types/Chat";

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

      setActiveProductId: (id: string | number | null) => {
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
            
            // If offset is 0, replace; otherwise append
            const mergedMessages = offset === 0
              ? processedMessages
              : [...prevMessages, ...processedMessages];
            
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
          const { user } = useAuthStore.getState();
          if (!activeProductId || !user) {
            console.error("No active product ID or user");
            return;
          }

          // Optimistic update: Add message immediately
          const tempMessage: Message = {
            id: Date.now(), // Temporary ID
            product: Number(activeProductId),
            sender: user.id,
            sender_name: user.name,
            content: content || null,
            image: image || null,
            type: image ? (content ? 'text_and_image' : 'image') : 'text',
            created_at: new Date().toISOString(),
            isOwn: true,
          };

          set((state) => {
            const prevMessages = state.messages?.[activeProductId]?.items ?? [];
            // Backend trả DESC, message mới nhất ở đầu mảng
            const updatedMessages = [tempMessage, ...prevMessages];
            return {
              messages: {
                ...state.messages,
                [activeProductId]: {
                  items: updatedMessages,
                  hasMore: state.messages?.[activeProductId]?.hasMore ?? true,
                },
              },
            };
          });

          // Send to server
          await chatService.sendMessage(
            recipientId,
            content,
            activeProductId.toString(),
            image
          );
        } catch (error) {
          console.error("Error when sending message!!", error);
          // TODO: Remove optimistic message on error
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
            
            // Backend trả DESC, thêm message mới vào đầu
            const mergedMessages = [message, ...prevMessages];
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
      partialize: (state) => ({
        // Chỉ lưu activeProductId, không lưu messages
        activeProductId: state.activeProductId,
      }),
    }
  )
);

export default useChatStore;
