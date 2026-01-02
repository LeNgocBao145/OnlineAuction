import { create } from "zustand";
import { connect, io, type Socket } from "socket.io-client";
import useAuthStore from "./authStore";
import type { SocketState } from "../types/Store";
import useChatStore from "./chatStore";

const baseUrl = import.meta.env.VITE_SOCKET_URL;

const useSocketStore = create<SocketState>((set, get) => ({
  onlineUsers: [],
  socket: null,
  connectSocket: () => {
    const accessToken = useAuthStore.getState().accessToken;
    const existingSocket = get().socket;

    if (existingSocket) return;

    const socket: Socket = io(baseUrl, {
      auth: { token: accessToken },
      transports: ["websocket"],
    });

    set({ socket });
    socket.on("connect", () => {
      console.log("Connected to socket server");
    });

    socket.on("online-users", (userIds) => {
      set({ onlineUsers: userIds });
    });

    socket.on("new-message", (data) => {
      const message = {
        id: data.id,
        product: data.product,
        sender: data.sender,
        sender_name: data.sender_name,
        content: data.content,
        image: data.image,
        type: data.type,
        created_at: data.created_at,
      };

      useChatStore.getState().addMessage(message);
    });
  },
  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },
}));

export default useSocketStore;
