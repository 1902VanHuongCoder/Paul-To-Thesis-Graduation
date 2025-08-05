"use client";
import { Mic, CornerDownLeft } from "lucide-react";
import {
    ExpandableChat,
    ExpandableChatHeader,
    ExpandableChatBody,
    ExpandableChatFooter,
} from "@/components/section/chatbot/chatbot-items";
import { useState, useRef, useEffect, useCallback } from "react";
import { ChatInput } from "@/components/ui/input/chat-input";
import { Button } from "../../ui/button/button";
import { useUser } from "@/contexts/user-context";
import RiceIcon from "@public/vectors/Rice+Flower+Icon.png"; // If you have a rice SVG icon
import Image from "next/image";
import { addNewMessage, createConversation, loadChatMessages } from "@/lib/chat-apis";
import { getAllAdmins } from "@/lib/user-apis";
import { User as UserIcon } from "lucide-react";
import toast from "react-hot-toast";
import { useChat } from "@/contexts/chat-context";
import socket from "@/lib/others/socket-client";
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

const ChatBot = () => {
    const { user } = useUser();
    const { isChatOpen, setJoinedConversationID, joinedConversationID } = useChat();
    const [, setConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = useRef<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);


    // Listen for incoming messages
    useEffect(() => {
        if (!socket) return;
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
        socket.on("send_message", handleReceiveMessage);
        return () => {
            socket.off("send_message", handleReceiveMessage);
        };
    }, [joinedConversationID]);

    // Load messages when joining a conversation
    useEffect(() => {
        const fetchMessages = async (joinedConversationID: string) => {
            const data = await loadChatMessages(joinedConversationID);
            setMessages(data);
        }
        if (joinedConversationID) {
            fetchMessages(joinedConversationID);
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

    // Send message
    const handleSendMessage = async () => {
        if (!input.trim() || !joinedConversationID || !user) return;
        setIsLoading(true);
        await addNewMessage(
            joinedConversationID,
            user.userID,
            input
        );
        // Emit via socket
        if (socket) {
            socket.emit("send_message", {
                userAvatar: user.avatar,
                room: joinedConversationID,
                username: user.username,
                message: input,
                senderID: user.userID,
                createdAt: new Date().toISOString(),
            });
        } else {
            toast.error("Không thể gửi tin nhắn, kết nối socket không thành công.");
        }
        // Reload messages from backend to avoid duplicates and ensure sync
        const data = await loadChatMessages(joinedConversationID);
        setMessages(data);
        setInput("");
        setIsLoading(false);
    };

    // Voice-to-text handler
    const handleVoiceInput = useCallback(() => {
        if (!('webkitSpeechRecognition' in window)) {
            alert('Trình duyệt của bạn không hỗ trợ nhận diện giọng nói.');
            return;
        }
        if (!recognitionRef.current) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const SpeechRecognition = (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'vi-VN';
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setInput((prev) => prev + transcript);
            };
            recognitionRef.current.onerror = () => {
                setIsListening(false);
            };
            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
        if (!isListening) {
            setIsListening(true);
            recognitionRef.current.start();
        } else {
            setIsListening(false);
            recognitionRef.current.stop();
        }
    }, [isListening]);

    useEffect(() => {
        
        // On Bot icon click: fetch or create conversation, join room, load messages
        const handleOpenChat = async () => {
            if (!user) {
                return;
            }
            if(joinedConversationID) { 
                return;
            }
            let admins: User[] = [];

            try {
                // Get all admins from the backend to create group chat
                admins = await getAllAdmins();
            } catch (error) {
                console.error("Error initializing chat:", error);
            }
            // setIsOpen(true);
       

            setIsLoading(true);
            const conversationID = generateConversationID(user.userID, admins[0].userID, true);
            const participants = [user.userID, ...admins.map(admin => admin.userID)];
            const data = await createConversation({
                conversationID,
                conversationName: user.username,
                participants,
                isGroup: true,
                conversationAvatar: user.avatar,
            });
            console.log("Created or fetched conversation:", data);
            setConversation(data);
            setJoinedConversationID(data.conversationID);
            // Ensure socket is connected before joining room
            if (socket && data.conversationID) {
                if (socket.connected) {
                    socket.emit("join_room", data.conversationID);
                } else {
                    socket.on("connect", () => {
                        socket.emit("join_room", data.conversationID);
                    });
                }
            } else {
                console.error("Socket connection not established or conversationID missing.");
            }
            setIsLoading(false);
        };
        if (isChatOpen && !joinedConversationID) {
            handleOpenChat();
        }
    }, [user, isChatOpen, joinedConversationID, setJoinedConversationID]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    useEffect(() => {
        if (joinedConversationID && isChatOpen) {
            socket.emit("join_room", joinedConversationID);
        }
        // Cleanup on unmount
        return () => {
            if (joinedConversationID) {
                socket.emit("leave_room", joinedConversationID);
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isChatOpen]);

    return (
        <div className={`h-auto relative z-80 `}>
            <ExpandableChat
                size="lg"
                position="bottom-right"
            >
                <ExpandableChatHeader className="flex-col text-center justify-center">
                    <h1 className="text-xl font-semibold uppercase flex items-center justify-center gap-2">
                        {/* Rice icon (SVG or Lucide) */}
                        <span>
                            {/* If you have a custom rice SVG icon, use next/image or inline SVG */}
                            <Image src={RiceIcon} alt="Rice Icon" width={24} height={24} className="inline-block" />
                        </span>
                        Kênh tư vấn trực tiếp
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Nhắn tin trực tiếp với admin để được hỗ trợ.
                    </p>
                </ExpandableChatHeader>
                <ExpandableChatBody className="px-6 py-6">
                    {joinedConversationID ? (
                        <div className="flex flex-col h-80">
                            <div className="flex-1 pr-2">
                                {messages.length === 0 && <div className="text-gray-400">Chưa có tin nhắn nào.</div>}
                                {messages.length > 0 && messages.map((msg, idx) => {
                                    const isMine = msg.senderID === user?.userID;
                                    return (
                                        <div
                                            key={msg.messageID || Math.random()}
                                            className={`mb-3 flex ${isMine ? "justify-end" : "justify-start"}`}
                                        >
                                            <div className={`flex items-end gap-2 max-w-[70%] ${isMine ? "flex-row-reverse" : ""}`}>
                                                {/* Avatar */}
                                                <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-white">
                                                    {isMine ? (
                                                        user?.avatar ? (
                                                            <Image
                                                                src={user.avatar}
                                                                alt={user.username || "User"}
                                                                width={32}
                                                                height={32}
                                                                className="rounded-full object-cover w-8 h-8 border border-gray-300"
                                                            />
                                                        ) : (
                                                            <UserIcon className="w-7 h-7 text-primary bg-gray-200 rounded-full p-1 border border-gray-300" />
                                                        )
                                                    ) : (
                                                        <UserIcon className="w-7 h-7 text-primary bg-gray-200 rounded-full p-1 border border-gray-300" />
                                                    )}
                                                </div>
                                                {/* Bubble */}
                                                <div className={`rounded-2xl px-4 py-2 shadow-md break-words relative ${isMine ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"}`}>
                                                    <span className="block font-medium text-sm mb-1">{msg.sender?.username || (isMine ? user?.username : "Admin")}</span>
                                                    <span className="block text-base">{msg.content}</span>
                                                    <span className={`block text-xs mt-1 text-right ${isMine ? "text-white/70" : "text-gray-500"}`}>
                                                        {new Date(msg.createdAt).toLocaleTimeString()}
                                                    </span>
                                                </div>
                                            </div>
                                            {idx === messages.length - 1 && <div ref={messagesEndRef} />}
                                        </div>
                                    );
                                })}
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
                                {/* <Button
                                    variant="ghost"
                                    size="icon"
                                    type="button"
                                    disabled
                                >
                                    <Paperclip className="size-4" />
                                </Button> */}
                                <Button
                                    variant={isListening ? "default" : "ghost"}
                                    size="icon"
                                    type="button"
                                    onClick={handleVoiceInput}
                                    aria-label="Nhập bằng giọng nói"
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

export default ChatBot;