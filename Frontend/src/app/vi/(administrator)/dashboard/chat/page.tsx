"use client";
import { useUser } from "@/contexts/user-context";
import React, { Suspense, useState, useEffect, useRef } from "react";
import { MessageCircle } from "lucide-react";
import Image from "next/image";
import { addNewMessage, fetchConversations, loadChatMessages, createConversation, markMessagesAsRead } from "@/lib/chat-apis";
import socket from "@/lib/others/socket-client";
import { useSearchParams } from "next/navigation";
import { getAllAdmins } from "@/lib/user-apis";
import { Input } from "@/components/ui/input/input";

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

function ChatPageInner() {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [conversationUserBelongs, setConversationUserBelongs] = useState<ConversationList[]>([]);
  const { user } = useUser();

  // Get conversationID from ULR params 
  const urlParams = useSearchParams();
  const conversationID = urlParams.get("conversationID");
  const [joinedConversationID, setJoinedConversationID] = useState<string | null>(conversationID);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userID, setUserID] = useState<string>("");

  // State for searching/creating conversation by userID
  const [searchUserID, setSearchUserID] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Handler to open or create a conversation with a customer by userID
  const handleOpenChat = async () => {
    if (!user) {
      return;
    }
    let admins: User[] = [];
    try {
      // Get all admins from the backend to create group chat
      admins = await getAllAdmins();
    } catch (error) {
      console.error("Error initializing chat:", error);
    }
    setIsLoading(true);
    const conversationID = generateConversationID(user.userID, userID, true);
    const participants = [userID, ...admins.map(admin => admin.userID)];

    try {
      const data = await createConversation({
        conversationID,
        conversationName: `Hỗ trợ user ${userID}`,
        participants,
        isGroup: true,
      });

      setConversation(data);
      setJoinedConversationID(data.conversationID);

      const convs: ConversationList[] = await fetchConversations(user.userID);
      setConversationUserBelongs(convs);

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
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
    setIsLoading(false);
  };


  // Listen for incoming messages
  useEffect(() => {
    if (!socket) return;
    // Only add messages that belong to the current conversation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleReceiveMessage = (data: any) => {
      // Server emits: { room, senderID, message, ... }
      if (String(data.room) === String(joinedConversationID)) {
        setMessages((prev) => [
          ...prev,
          {
            messageID: Math.random(), // Temporary ID if not provided
            conversationID: String(joinedConversationID),
            senderID: data.senderID,
            content: data.message,
            createdAt: new Date().toISOString(),
            sender: data.sender || { userID: data.senderID, username: data.username, email: "" },
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
    const fetchData = async () => {
      if (joinedConversationID) {
        try {
          const messages = await loadChatMessages(joinedConversationID);
          setMessages(messages);
        } catch (error) {
          setMessages([]);
          console.error("Error loading messages:", error);
        }
      }
    };
    fetchData();
  }, [joinedConversationID]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !joinedConversationID || !user) return;
    // Add message to DB
    const res = await addNewMessage(joinedConversationID, user.userID, newMessage);
    if (!res) {
      console.error("Failed to send message");
      return;
    }
    // Emit via socket (room = conversationID)
    socket.emit("send_message", {
      room: joinedConversationID,
      username: user.username,
      message: newMessage,
      senderID: user.userID,
      sender: { userID: user.userID, username: user.username, email: user.email },
    });
    setNewMessage("");
    // Update local messages
    setMessages((prev) => [
      ...prev,
      {
        messageID: Math.random(),
        conversationID: String(joinedConversationID),
        senderID: user.userID,
        content: newMessage,
        createdAt: new Date().toISOString(),
        sender: { userID: user.userID, username: user.username, email: user.email },
      },
    ]);
  };

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
    return `CON${userID}${targetUserID}${day}${month}${year}${randomDigits}`;
  };

  // Ensure user joins the room on initial load if already in a conversation
  useEffect(() => {
    if (socket && joinedConversationID) {
      socket.emit("join_room", joinedConversationID);
    }
    return () => {
      // Leave the room when component unmounts or conversation changes
      if (socket && joinedConversationID) {
        socket.emit("leave_room", joinedConversationID);
      }
    };
  }, [joinedConversationID]);

  // fetch conversations that user is a part of 
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const data: ConversationList[] = await fetchConversations(user.userID);
        setConversationUserBelongs(data);
        console.log("Fetched conversations:", data);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    };
    fetchData();
  }, [user]);

  // Scroll to end when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="min-h-screen">
      <div className="flex flex-col items-center">
        <div className="w-full  bg-white rounded-xl border">
          {/* Top bar: Create conversation */}
          <div className="flex gap-2 items-center px-6 py-4 border-b">
            <input
              className="flex-1 rounded-md px-3 py-2 text-sm border border-[#0d401c] focus:ring-2 focus:ring-[#278d45] transition"
              placeholder="Nhập userID khách hàng..."
              value={userID}
              onChange={e => setUserID(e.target.value)}
              disabled={isLoading}
            />
            <button
              className="px-4 py-2 rounded-md text-sm font-semibold shadow disabled:opacity-60 transition"
              style={{
                background: "#0d401c",
                color: "#fff",
              }}
              onClick={handleOpenChat}
              disabled={!userID || isLoading}
            >
              {isLoading ? "Đang tải..." : "Mở trò chuyện"}
            </button>
          </div>
          <div className="flex w-full min-h-[600px]">
            {/* Sidebar: Danh sách cuộc trò chuyện */}
            <aside className="w-72 border-r flex flex-col bg-[#f6f8f7]">
              <div className="p-5 border-b flex items-center gap-3 font-bold text-lg bg-white text-[#0d401c]">
                <MessageCircle className="w-6 h-6" /> Trò chuyện
              </div>
              {/* Search conversation */}
              <div className="p-4">
                <Input
                  className="border rounded-md px-3 py-2 text-sm w-full focus:ring-2 focus:ring-[#278d45] transition"
                  style={{
                    borderColor: "#0d401c",
                    color: "#0d401c",
                  }}
                  placeholder="Tìm kiếm userID khách hàng..."
                  value={searchUserID}
                  onChange={e => setSearchUserID(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="flex-1 overflow-y-auto max-h-[calc(100vh-200px)]">
                {conversationUserBelongs.length > 0 ? (
                  <ul className="pl-0">
                    {(searchUserID
                      ? conversationUserBelongs.filter(conv => conv.conversation.hostID && conv.conversation.hostID.includes(searchUserID))
                      : conversationUserBelongs
                    ).map((conv) => (
                      <li key={conv.conversationID} className="px-2">
                        <button
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-md mb-2 transition text-left ${joinedConversationID === conv.conversationID
                            ? "border border-[#278d45] bg-[#eaf7ef]"
                            : "hover:bg-[#eaf7ef]"
                            }`}
                          onClick={async () => {
                            setJoinedConversationID(conv.conversationID);
                            if (user) {
                              try {
                                await markMessagesAsRead(conv.conversationID, user.userID);
                                const updatedConvs = await fetchConversations(user.userID);
                                setConversationUserBelongs(updatedConvs);
                              } catch (err) {
                                console.error('Error marking messages as read:', err);
                              }
                            }
                          }}
                        >
                          <span className="flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg bg-[#0d401c] text-white">
                            {conv.conversation.conversationAvatar ? (
                              <div className="rounded-full h-10 w-10 overflow-hidden border-2 border-white shadow">
                                <Image src={conv.conversation.conversationAvatar} alt="Avatar" width={40} height={40} className="rounded-full h-full w-full object-cover" />
                              </div>
                            ) : (
                              <MessageCircle className="w-5 h-5" />
                            )}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold truncate text-[#0d401c]">{conv.conversation.conversationName}</div>
                            <div className="text-xs text-gray-500 truncate max-w-[150px]">
                              {conv.conversation.newestMessage || "Chưa có tin nhắn."}
                            </div>
                          </div>
                          {conv.conversation.messages?.length ? (
                            <span className="ml-2 rounded-full px-2 py-0.5 text-xs font-bold bg-[#278d45] text-white">
                              {conv.conversation.messages.length}
                            </span>
                          ) : null}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-5 text-gray-400 text-center">Không có cuộc trò chuyện nào.</div>
                )}
              </div>
            </aside>
            {/* Main Chat Panel */}
            <main className="flex-1 flex flex-col h-full bg-white">
              {/* Header */}
              <div className="p-5 border-b font-semibold text-base bg-white text-[#0d401c] min-h-[56px] flex items-center">
                {conversation?.conversationName || "Chọn một cuộc trò chuyện để bắt đầu"}
              </div>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 bg-white max-h-[calc(100vh-180px)]">
                {messages.length === 0 && (
                  <div className="text-gray-400 text-center mt-10">Chưa có tin nhắn nào.</div>
                )}
                {messages.length > 0 && messages.map((msg, idx) => (
                  <div
                    key={msg.messageID || Math.random()}
                    className={`mb-4 flex ${msg.senderID === user?.userID ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className="rounded-xl px-4 py-2 max-w-[70%] break-words shadow"
                      style={{
                        background: msg.senderID === user?.userID ? "#0d401c" : "#f6f8f7",
                        color: msg.senderID === user?.userID ? "#fff" : "#0d401c",
                      }}
                    >
                      <span className="block mb-1">{msg.content}</span>
                      <span className="block text-xs text-right opacity-70">
                        {msg.sender?.username || msg.senderID} | {new Date(msg.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    {idx === messages.length - 1 && <div ref={messagesEndRef} />}
                  </div>
                ))}
              </div>
              {/* Input */}
              {joinedConversationID && (
                <div className="p-4 border-t flex gap-3 bg-white">
                  <input
                    className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#278d45] transition text-base bg-white shadow"
                    style={{
                      borderColor: "#0d401c",
                      color: "#0d401c",
                    }}
                    placeholder="Nhập tin nhắn..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <button
                    className="px-6 py-2 rounded-full font-semibold shadow transition text-base bg-[#278d45] text-white"
                    onClick={handleSendMessage}
                  >
                    Gửi
                  </button>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div>Đang tải chat...</div>}>
      <ChatPageInner />
    </Suspense>
  );
}
