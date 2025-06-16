"use client";
import { Bot, Paperclip, Mic, CornerDownLeft } from "lucide-react";
import {
    ExpandableChat,
    ExpandableChatHeader,
    ExpandableChatBody,
    ExpandableChatFooter,
} from "@/components/section/chatbot/chatbot-items";
import { useState, FormEvent } from "react";
import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage } from "@/components/ui/chat-bubble/chat-bubble";
import { ChatInput } from "@/components/ui/input/chat-input";
import { Button } from "../../ui/button/button";
import { baseUrl } from "@/lib/base-url";

type Message = {
    id: number;
    content: string | string[];
    type?: string; // for AI response: title, text, list, conclusion
    sender: "user" | "ai";
};

interface BotResponseItem {
    content: string | string[];
    type: "title" | "text" | "list" | "conclusion";
}

export default function ChatBot() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            content: "Xin chào! Bạn cần hỏi gì về nông nghiệp?",
            sender: "ai",
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const question = input.trim();
        if (!question) return;

        setMessages((prev) => [
            ...prev,
            {
                id: prev.length + 1,
                content: question,
                sender: "user",
            },
        ]);
        setInput("");
        setIsLoading(true);

        try {
            const res = await fetch(`${baseUrl}/api/chatbot`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: question }),
            });
            if (!res.ok) throw new Error("Lỗi khi lấy phản hồi từ AI");
            const data = await res.json();

            // data.response có thể là string hoặc array
            let aiMessages: Message[] = [];
            if (Array.isArray(data.response)) {
                aiMessages = data.response.map((item: BotResponseItem, idx: number) => ({
                    id: messages.length + idx + 2,
                    content: item.content,
                    type: item.type,
                    sender: "ai",
                }));
            } else if (typeof data.response === "string") {
                aiMessages = [{
                    id: messages.length + 2,
                    content: data.response,
                    sender: "ai",
                }];
            }

            setMessages((prev) => [...prev, ...aiMessages]);
        } catch (error) {
            console.error("Error fetching AI response:", error);
            setMessages((prev) => [
                ...prev,
                {
                    id: prev.length + 1,
                    content: "Xin lỗi, tôi không thể trả lời câu hỏi này lúc này.",
                    sender: "ai",
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAttachFile = () => {};
    const handleMicrophoneClick = () => {};

    // Render AI message based on type
    const renderAIMessage = (content: string | string[], type?: string) => {
        switch (type) {
            case "title":
                return <div className="font-bold text-base text-primary mb-1">{content}</div>;
            case "text":
                return <div className="text-gray-700 mb-1">{content}</div>;
            case "list":
                return (
                    <ul className="list-disc pl-5 mb-1">
                        {(Array.isArray(content) ? content : [content]).map((item, idx) => (
                            <li key={idx}>{item}</li>
                        ))}
                    </ul>
                );
            case "conclusion":
                return <div className="font-semibold text-green-700 mt-2">{content}</div>;
            default:
                return <div>{content}</div>;
        }
    };

    return (
        <div className="h-auto relative z-80">
            <ExpandableChat
                size="lg"
                position="bottom-right"
                icon={<Bot className="h-6 w-6" />}
            >
                <ExpandableChatHeader className="flex-col text-center justify-center">
                    <h1 className="text-xl font-semibold">Chat với AI Nông nghiệp 🌾</h1>
                    <p className="text-sm text-muted-foreground">
                        Đặt câu hỏi về sâu bệnh, kỹ thuật, mùa vụ, v.v.
                    </p>
                </ExpandableChatHeader>

                <ExpandableChatBody className="px-6 py-6">
                    {messages.map((message, idx) => {
                        // Only show avatar for the first message in a group of the same sender
                        const showAvatar =
                            idx === 0 || messages[idx - 1].sender !== message.sender;
                        return message.sender === "ai" ? (
                            <ChatBubble key={message.id} variant="received">
                                {showAvatar && (
                                    <ChatBubbleAvatar
                                        className="h-8 w-8 shrink-0"
                                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&q=80&crop=faces&fit=crop"
                                        fallback="AI"
                                    />
                                )}
                                <ChatBubbleMessage variant="received">
                                    {renderAIMessage(message.content, message.type)}
                                </ChatBubbleMessage>
                            </ChatBubble>
                        ) : (
                            <ChatBubble key={message.id} variant="sent">
                                {showAvatar && (
                                    <ChatBubbleAvatar
                                        className="h-8 w-8 shrink-0"
                                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&q=80&crop=faces&fit=crop"
                                        fallback="US"
                                    />
                                )}
                                <ChatBubbleMessage variant="sent">
                                    {message.content}
                                </ChatBubbleMessage>
                            </ChatBubble>
                        );
                    })}

                    {isLoading && (
                        <ChatBubble variant="received">
                            <ChatBubbleAvatar
                                className="h-8 w-8 shrink-0"
                                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&q=80&crop=faces&fit=crop"
                                fallback="AI"
                            />
                            <ChatBubbleMessage isLoading />
                        </ChatBubble>
                    )}
                </ExpandableChatBody>

                <ExpandableChatFooter>
                    <form
                        onSubmit={handleSubmit}
                        className="relative rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring p-1"
                    >
                        <ChatInput
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Nhập câu hỏi của bạn..."
                            className="min-h-12 resize-none rounded-lg bg-background border-0 p-3 shadow-none focus-visible:ring-0"
                        />
                        <div className="flex items-center p-3 pt-0 justify-between">
                            <div className="flex">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    type="button"
                                    onClick={handleAttachFile}
                                >
                                    <Paperclip className="size-4" />
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    type="button"
                                    onClick={handleMicrophoneClick}
                                >
                                    <Mic className="size-4" />
                                </Button>
                            </div>
                            <Button type="submit" size="sm" className="ml-auto gap-1.5" disabled={isLoading}>
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