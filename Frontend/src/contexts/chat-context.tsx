"use client"; 
import React, { createContext, useContext, useState, ReactNode } from 'react';

type ChatContextType = {
    isChatOpen: boolean;
    openChat: () => void;
    closeChat: () => void;
    toggleChat: () => void;
    joinedConversationID: string | null;
    setJoinedConversationID: (id: string | null) => void;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [joinedConversationID, setJoinedConversationID] = useState<string | null>(null);

    const openChat = () => setIsChatOpen(true);
    const closeChat = () => setIsChatOpen(false);
    const toggleChat = () => setIsChatOpen((prev) => !prev);

    return (
        <ChatContext.Provider value={{ isChatOpen, openChat, closeChat, toggleChat, joinedConversationID, setJoinedConversationID }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};