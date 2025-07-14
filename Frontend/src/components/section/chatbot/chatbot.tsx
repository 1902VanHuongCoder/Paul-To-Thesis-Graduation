"use client";
import {  Paperclip, Mic, CornerDownLeft } from "lucide-react";
import {
    ExpandableChat,
    ExpandableChatHeader,
    ExpandableChatBody,
    ExpandableChatFooter,
} from "@/components/section/chatbot/chatbot-items";
import { useState, useRef, useEffect } from "react";
import { ChatInput } from "@/components/ui/input/chat-input";
import { Button } from "../../ui/button/button";
import { baseUrl } from "@/lib/base-url";
import { useUser } from "@/contexts/user-context";
import { io, Socket } from "socket.io-client";

interface User {
    userID: string;
    username: string;
    email: string;
}

interface Message {
    messageID: number;
    conversationID: string;
    senderID: string;
    content: string;
    createdAt: string;
    sender?: User;
}

interface Conversation {
    conversationID: string;
    conversationName: string;
    participants: User[];
    isGroup: boolean;
}

export default function ChatBot() {
    const { user } = useUser();
    const socketRef = useRef<Socket | null>(null);
    const [, setConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [joinedConversationID, setJoinedConversationID] = useState<string | null>(null);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    // const [isOpen, setIsOpen] = useState(false);

    // Initialize socket only once
    useEffect(() => {
        if (!socketRef.current) {
            socketRef.current = io("http://localhost:3001");
        }
        return () => {
            socketRef.current?.disconnect();
        };
    }, []);

    // Listen for incoming messages
    useEffect(() => {
        if (!socketRef.current) return;
        const handleReceiveMessage = (data: {
            room: string;
            senderID: string;
            message: string;
            sender?: User;
            username?: string;
        }) => {
            if (String(data.room) === String(joinedConversationID)) {
                setMessages((prev) => [
                    ...prev,
                    {
                        messageID: Math.random(),
                        conversationID: String(joinedConversationID),
                        senderID: data.senderID,
                        content: data.message,
                        createdAt: new Date().toISOString(),
                        sender: data.sender || { userID: data.senderID, username: data.username || "", email: "" },
                    },
                ]);
            }
        };
        socketRef.current.on("send_message", handleReceiveMessage);
        return () => {
            socketRef.current?.off("send_message", handleReceiveMessage);
        };
    }, [joinedConversationID]);

    // Load messages when joining a conversation
    useEffect(() => {
        if (joinedConversationID) {
            fetch(`${baseUrl}/api/chat/${joinedConversationID}`)
                .then((res) => res.json())
                .then((data) => {
                    setMessages(data);
                })
                .catch(() => setMessages([]));
        }
    }, [joinedConversationID]);

    // Generate conversation ID for user-admin chat
    const generateConversationID = (userID: string, targetUserID: string, isGroup: boolean) => {
        const day = new Date().getDay();
        const month = new Date().getMonth() + 1;
        const year = new Date().getFullYear();
        // Generate 3 random digits 
        const randomDigits = Math.floor(Math.random() * 900) + 100;
        if (isGroup) {
            return `GRP${userID}${day}${month}${year}${randomDigits}`;
        }
        return `CON${userID}${targetUserID}`;
    };

    // On Bot icon click: fetch or create conversation, join room, load messages
    const handleOpenChat = async () => {
        if (!user) {
            return;
        }
        let admins: User[] = [];
        
        try {
            // Get all admins from the backend to create group chat
            const res = await fetch(`${baseUrl}/api/users/role/adm`);
            if (!res.ok) {
                throw new Error("Không thể lấy danh sách admin.");
            }
            admins = await res.json();
         } catch (error) {
            console.error("Error initializing chat:", error);
        }
        // setIsOpen(true);
        setIsLoading(true);
        const conversationID = generateConversationID(user.userID, admins[0].userID, true);
        const participants = admins.map(admin => admin.userID);
            const res = await fetch(`${baseUrl}/api/chat/create-conversation`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                conversationID,
                conversationName: user.username,
                conversationAvatar: user.avatar,
                participants: [user.userID, ...participants],
                isGroup: false,
            }),
        });
        if (res.ok) {
            const data = await res.json();
            setConversation(data.conversation);
            setJoinedConversationID(data.conversation?.conversationID);
            // Join socket room
            if (socketRef.current && data.conversation?.conversationID) {
                socketRef.current.emit("join_room", data.conversation.conversationID);
            }
        } else {
            console.log("Không thể tạo cuộc trò chuyện mới.");
        }
        setIsLoading(false);
    };

    // Send message
    const handleSendMessage = async () => {
        if (!input.trim() || !joinedConversationID || !user) return;
        setIsLoading(true);
        await fetch(`${baseUrl}/api/chat/add-new-message`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                conversationID: joinedConversationID,
                senderID: user.userID,
                content: input,
            }),
        });
        // Emit via socket
        socketRef.current?.emit("send_message", {
            userAvatar: user.avatar,
            room: joinedConversationID,
            username: user.username,
            message: input,
            senderID: user.userID,
            createdAt: new Date().toISOString(),
        });
        setMessages((prev) => [
            ...prev,
            {
                messageID: Math.random(),
                conversationID: String(joinedConversationID),
                senderID: user.userID,
                content: input,
                createdAt: new Date().toISOString(),
                sender: { userID: user.userID, username: user.username, email: user.email },
            },
        ]);
        setInput("");
        setIsLoading(false);
    };

    useEffect(() => { 
        // Automatically open chat when component mounts
        handleOpenChat();
    }, [user]);
    return (
        <div className="h-auto relative z-80">
            <ExpandableChat
                // onClick={handleOpenChat}
                size="lg"
                position="bottom-right"
                // icon={<Bot className="h-6 w-6" />}
            // open={isOpen}
            // onOpenChange={setIsOpen}
            >
                <ExpandableChatHeader className="flex-col text-center justify-center">
                    <h1 className="text-xl font-semibold">Chat với Admin</h1>
                    <p className="text-sm text-muted-foreground">
                        Nhắn tin trực tiếp với admin để được hỗ trợ.
                    </p>
                </ExpandableChatHeader>
                <ExpandableChatBody className="px-6 py-6">
                    {joinedConversationID ? (
                        <div className="flex flex-col h-80">
                            <div className="flex-1 overflow-y-auto pr-2">
                                {messages.length === 0 && <div className="text-gray-400">Chưa có tin nhắn nào.</div>}
                                {messages.length > 0 && messages.map((msg) => (
                                    <div
                                        key={msg.messageID || Math.random()}
                                        className={`mb-2 flex ${msg.senderID === user?.userID ? "justify-end" : "justify-start"}`}
                                    >
                                        <div
                                            className={`rounded px-3 py-1 max-w-xs break-words ${msg.senderID === user?.userID ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                                        >
                                            <span className="block">{msg.content}</span>
                                            <span className="block text-xs text-right">
                                                {msg.sender?.username || msg.senderID} | {new Date(msg.createdAt).toLocaleTimeString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-gray-500">Nhấn vào icon để bắt đầu trò chuyện với admin.</div>
                    )}
                    {isLoading && (
                        <div className="text-center text-gray-400 mt-2">Đang tải...</div>
                    )}
                </ExpandableChatBody>
                <ExpandableChatFooter>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSendMessage();
                        }}
                        className="relative rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring p-1"
                    >
                        <ChatInput
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Nhập tin nhắn..."
                            className="min-h-12 resize-none rounded-lg bg-background border-0 p-3 shadow-none focus-visible:ring-0"
                            disabled={!joinedConversationID || isLoading}
                        />
                        <div className="flex items-center p-3 pt-0 justify-between">
                            <div className="flex">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    type="button"
                                    disabled
                                >
                                    <Paperclip className="size-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    type="button"
                                    disabled
                                >
                                    <Mic className="size-4" />
                                </Button>
                            </div>
                            <Button type="submit" size="sm" className="ml-auto gap-1.5" disabled={!joinedConversationID || isLoading || !input.trim()}>
                                Gửi
                                <CornerDownLeft className="size-3.5" />
                            </Button>
                        </div>
                    </form>
                </ExpandableChatFooter>
            </ExpandableChat>
        </div>
    );
}