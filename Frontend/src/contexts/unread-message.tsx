import { fetchConversations } from "@/lib/chat-apis";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";


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
    isRead?: boolean;
}

interface Conversation {
    conversationID: string;
    conversationName: string;
    participants: User[];
    isGroup: boolean;
    conversationAvatar?: string;
    newestMessage?: string;
    hostID?: string;
    messages?: Message[];
}

interface ConversationList {
    conversationID: string;
    userID: string;
    conversation: Conversation;
}

type UnreadMessageContextType = {
    unreadCount: number;
    refreshUnreadCount: () => Promise<void>;
};

const UnreadMessageContext = createContext<UnreadMessageContextType | undefined>(undefined);

// Context Provider
export const UnreadMessageProvider = ({
    user,
    children,
}: {
    user: User | null;
    children: ReactNode;
}) => {
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadCount = async () => {
        if (!user) {
            setUnreadCount(0);
            return;
        }
        try {
            const data = await fetchConversations(user.userID);
            if (!data) throw new Error("Failed to fetch conversations");
            let count = 0;
            data.forEach((item: ConversationList) => {
                if (item.conversation.messages && item.conversation.messages.length > 0) {
                    count += item.conversation.messages.filter(
                        (message) => !message.isRead && message.senderID !== user.userID
                    ).length;
                }
            });
            setUnreadCount(count);
        } catch (error) {
            console.error("Error fetching conversations:", error);
            setUnreadCount(0);
        }
    };

    useEffect(() => {
        fetchUnreadCount();
        // Optionally, add polling or websocket updates here
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    return (
        <UnreadMessageContext.Provider
            value={{
                unreadCount,
                refreshUnreadCount: fetchUnreadCount,
            }}
        >
            {children}
        </UnreadMessageContext.Provider>
    );
};

// Custom hook
export const useUnreadMessages = () => {
    const context = useContext(UnreadMessageContext);
    if (!context) {
        throw new Error("useUnreadMessages must be used within an UnreadMessageProvider");
    }
    return context;
};