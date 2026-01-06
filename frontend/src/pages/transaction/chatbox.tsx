import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { useRef, useState, useEffect } from "react";
import useChatStore from "@/stores/chatStore";
import useAuthStore from "@/stores/authStore";
import { formatDateOnly, formatTimeOnly } from "@/utils/dateUtils";

export default function Chatbox(
{
    sideCalling,
    productId,
    recipientId
} : {
    sideCalling: "bidder" | "seller";
    productId: string | number;
    recipientId: string | number | undefined;
}
) {
    const dragger = useRef<HTMLDivElement>(null);
    const [newMessage, setNewMessage] = useState<string>("");
    const { user, accessToken } = useAuthStore();
    const { messages: chatMessages, fetchMessages, sendMessage, setActiveProductId } = useChatStore();
    
    const messages = (chatMessages[productId]?.items || []).slice().reverse();
    
    useEffect(() => {
        if (!accessToken) return;
        setActiveProductId(productId);
        fetchMessages(productId);
    }, [productId, accessToken]);

    const handleMessageSend = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (newMessage.trim() === "" || !recipientId) return;
        
        await sendMessage(recipientId.toString(), newMessage);
        setNewMessage("");
        // Message đã được thêm optimistically, không cần fetch lại
    };

    useEffect(() => {
        dragger.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [messages]);

    return (
        <div className="border border-white/10 rounded-lg p-4 bg-(--third)">
            <h2 className="text-(--primary) text-xl font-bold mb-4">Transaction Messages</h2>
            <ul className="h-[500px] w-full overflow-y-auto scrollbar-hide flex flex-col">
                {messages.map((msg, index) => {
                    const previousSender = index > 0 ? messages[index - 1].sender : null;
                    const previousDate = index > 0 ? messages[index - 1].created_at : null;
                    const isOwn = msg.isOwn;
                    const showDate = previousDate === null || new Date(msg.created_at).toDateString() !== new Date(previousDate).toDateString();
                    return (
                        <div key={`${productId}-msg-${msg.id}-${index}`}>
                            {showDate && (
                                <li className="flex justify-center mt-12">
                                    <span className="bg-white/10 text-white/60 px-3 py-1 rounded-full text-sm">
                                        {formatDateOnly(msg.created_at)}
                                    </span>
                                </li>
                            )}
                            <li className={`flex max-w-full [overflow-wrap:anywhere] whitespace-pre-wrap items-center rounded-lg ${isOwn ? "justify-end self-end text-right" : "justify-start self-start text-left"} ${previousSender !== msg.sender ? "mt-6" : "mt-1"}`}>
                                {!isOwn && <div className={`flex shrink-0 h-10 w-10 border text-(--third) border-white rounded-full mr-2 bg-gray-600 items-center justify-center ${previousSender !== msg.sender ? "" : "invisible"}`}>{msg.sender_name?.[0]}</div>}
                                {isOwn && <span className="whitespace-nowrap mr-2 text-white/50 text-sm">{formatTimeOnly(msg.created_at)}</span>}
                                <p className={`${isOwn ? "bg-(--primary) text-black px-3 py-2 rounded-lg " : "bg-(--secondary) text-white px-3 py-2 rounded-lg"}`}>{msg.content}</p>
                                {!isOwn && <span className="whitespace-nowrap ml-2 text-white/50 text-sm">{formatTimeOnly(msg.created_at)}</span>}
                                {isOwn && <div className={`flex shrink-0 h-10 w-10 border border-(--primary) text-(--third) rounded-full ml-2 bg-gray-600 items-center justify-center ${previousSender !== msg.sender ? "" : "invisible"}`}>{user?.name?.[0]}</div>}
                            </li>
                        </div>
                    );
                })}
                <div ref={dragger}></div>
            </ul>
            <div className="flex h-12 mt-4 relative gap-2">
                <form onSubmit={handleMessageSend} className="w-full flex h-full gap-2">
                    <input type="text" className="w-9/10 h-full p-2 bg-(--fourth) border border-white/10 rounded-md text-white" placeholder="Type your message..." 
                        onChange={(e) => setNewMessage(e.target.value)}
                        value={newMessage}
                    />
                    <button
                        type="submit"
                        className="bg-(--secondary) h-full text-black font-bold aspect-square
                                    flex items-center justify-center
                                    rounded-md border border-(--primary) relative"
                        >
                        <PaperAirplaneIcon className="absolute top-2.5 left-3 h-6 w-6 rotate-320 text-(--primary)" />
                    </button>
                </form>
            </div>
        </div>
    );
}