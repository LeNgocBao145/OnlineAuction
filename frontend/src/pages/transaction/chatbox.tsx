import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { useRef, useState, useEffect } from "react";
import { set } from "zod";

export default function Chatbox(
{
    sideCalling
} : {
    sideCalling: "bidder" | "seller"
}
) {
    const dragger = useRef<HTMLDivElement>(null);
    const [newMessage, setNewMessage] = useState<string>("");
    const [messages, setMessages] = useState<Array<{ sender: "bidder" | "seller"; content: string; timestamp: string }>>([
        { sender: "seller", content: "Hello, please proceed with the payment.", timestamp: "2025-12-27T05:02:36.716Z" },
        { sender: "seller", content: "Please make sure to double-check the amount.", timestamp: "2025-12-27T05:03:36.716Z" },
        { sender: "bidder", content: "Sure, I will do it today.", timestamp: "2025-12-27T05:04:36.716Z" },
        { sender: "seller", content: "Thank you! Let me know once it's done.", timestamp: "2025-12-28T05:05:36.716Z" },
        { sender: "bidder", content: "Payment completed. Please confirm.", timestamp: "2025-12-28T05:06:36.716Z" },
        { sender: "seller", content: "Received the payment. Preparing the shipment.", timestamp: "2025-12-29T05:07:36.716Z" }
    ]);
    
    const rightSide = sideCalling;
    const leftSide = sideCalling === "seller" ? "bidder" : "seller";

    const handleMessageSend = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (newMessage.trim() === "") return;
        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: rightSide, content: newMessage, timestamp: new Date().toISOString() }
        ]);
        setNewMessage("");
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
                    const previousDate = index > 0 ? messages[index - 1].timestamp : null;
                    return (
                        <>
                            {previousDate === null || new Date(msg.timestamp).toDateString() !== new Date(previousDate).toDateString() ? (
                                <li key={`date-${index}`} className="flex justify-center mt-12">
                                    <span className="bg-white/10 text-white/60 px-3 py-1 rounded-full text-sm">
                                        {new Date(msg.timestamp).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </span>
                                </li>
                            ) : null}
                            <li key={index} className={`flex max-w-[400px] [overflow-wrap:anywhere] whitespace-pre-wrap items-center rounded-lg ${msg.sender === rightSide ? "justify-end self-end text-right" : "justify-start self-start text-left"} ${previousSender !== msg.sender ? "mt-6" : "mt-1"}`}>
                                {msg.sender === leftSide && <img src="" alt={`${leftSide} Avatar`} className={`flex shrink-0 h-10 w-10 border text-(--third) border-white rounded-full mr-2 ${previousSender !== leftSide ? "" : "invisible"}`} />}
                                {msg.sender === rightSide && <span className="whitespace-nowrap mr-2 text-white/50 text-sm">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                                <p className={`${msg.sender === rightSide ? "bg-(--primary) text-black px-3 py-2 rounded-lg" : "bg-(--secondary) text-white px-3 py-2 rounded-lg"}`}>{msg.content}</p>
                                {msg.sender === leftSide && <span className="whitespace-nowrap ml-2 text-white/50 text-sm">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                                {msg.sender === rightSide && <img src="" alt={`${rightSide} Avatar`} className={`flex shrink-0 h-10 w-10 border border-(--primary) text-(--third) rounded-full ml-2 ${previousSender !== rightSide ? "" : "invisible"}`} />}
                            </li>
                        </>
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
                    <button className="bg-(--secondary) h-full w-1/10 text-black font-bold py-2 px-4 rounded-md border border-(--primary)"
                        type="submit"
                    >
                    <PaperAirplaneIcon className="absolute h-6 w-6 right-2.5 top-2.5 rotate-320 text-(--primary)"/>
                    </button>
                </form>
            </div>
        </div>
    );
}
            