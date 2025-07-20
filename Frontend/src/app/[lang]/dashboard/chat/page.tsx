"use client";
import { useUser } from "@/contexts/user-context";
import { baseUrl } from "@/lib/others/base-url";
import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { MessageCircle } from "lucide-react";
import Image from "next/image";

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

export default function ChatPage() {
  const socketRef = useRef<Socket | null>(null);
  // const [userID] = useState<string | null>(null);
  // const [ setGroupMemberID] = useState<string | null>(null);
  // const [userInfo, setUserInfo] = useState<User | null>(null);
  const [conversation, setConversation] = useState<ConversationList | null>(null);
  const [conversationUserBelongs, setConversationUserBelongs] = useState<ConversationList[]>([]);
  // const [groupName] = useState<string>("");
  const { user } = useUser();

  const [joinedConversationID, setJoinedConversationID] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");

  console.log("Messages:", messages);

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
    // Only add messages that belong to the current conversation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleReceiveMessage = (data: any) => {
      // If the message is for the current conversation, add it
      alert("Get new message: " + data.message);
      alert(data.room + " - " + joinedConversationID);
      if (String(data.room) === String(joinedConversationID)) {
        setMessages((prev) => [...prev, {
          messageID: Math.random(), // Temporary ID if not provided
          conversationID: String(joinedConversationID),
          senderID: data.senderID,
          content: data.message,
          createdAt: new Date().toISOString(),
          sender: data.sender || { userID: data.senderID, username: data.username, email: "" },
        }]);
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
          setMessages(data)
          console.log("Loaded messages:", data);
        })
        .catch(() => setMessages([]));
    }
  }, [joinedConversationID]);

  // const generateConversationID = (userID: string, targetUserID: string, isGroup: boolean) => {
  //   const day = new Date().getDay();
  //   const month = new Date().getMonth() + 1;
  //   const year = new Date().getFullYear();
  //   // Generate 3 random digits 
  //   const randomDigits = Math.floor(Math.random() * 900) + 100;
  //   if (isGroup) {
  //     return `GRP${userID}${day}${month}${year}${randomDigits}`;
  //   }
  //   return `CON${userID}${targetUserID}`;
  // };

  // const handleFindUserToChat = async () => {
  //   if (userID) {
  //     const res = await fetch(`${baseUrl}/api/users/${userID}`);
  //     const data = await res.json();
  //     if (res.ok) {
  //       setUserInfo(data);
  //     } else {
  //       alert("User not found. Please type a valid user ID.");
  //     }
  //   }
  // };

  // const handleCreateNewConversation = async (targetUserID: string, isGroup: boolean) => {
  //   if (!user) {
  //     alert("User is not logged in.");
  //     return;
  //   }

  //   const res = await fetch(`${baseUrl}/api/chat/create-conversation`, {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({
  //       conversationID: generateConversationID(user.userID, targetUserID, isGroup),
  //       conversationName: groupName || `Conversation with ${userInfo?.username}`,
  //       participants: isGroup ? [user.userID] : [user.userID, targetUserID],
  //       isGroup: isGroup,
  //     }),
  //   });

  //   if (res.ok) {
  //     const data = await res.json();
  //     setConversation(data.conversation);
  //     const conversationID = data.conversation?.conversationID;
  //     if (socketRef.current && conversationID) {
  //       socketRef.current.emit("join_room", conversationID);
  //       setJoinedConversationID(conversationID);
  //     }
  //     setUserInfo(null);
  //     alert("Conversation created successfully!");
  //     console.log("Conversation created:", data);

  //   } else {
  //     alert("Failed to create conversation. Please try again.");
  //   }
  // };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !joinedConversationID || !user) return;
    // Save to DB

    await fetch(`${baseUrl}/api/chat/add-new-message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationID: joinedConversationID,
        senderID: user.userID,
        content: newMessage,
      }),
    });
    // Emit via socket
    socketRef.current?.emit("send_message", {
      room: joinedConversationID,
      username: user.username,
      message: newMessage,
      time:
        new Date(Date.now()).getHours().toString().padStart(2, "0") +
        ":" +
        new Date(Date.now()).getMinutes().toString().padStart(2, "0"),
      senderID: user.userID,
    });
    setNewMessage("");
    // Update local messages
    setMessages((prev) => [
      ...prev,
      {
        messageID: Math.random(), // Temporary ID, will be replaced by DB ID
        conversationID: String(joinedConversationID),
        senderID: user.userID,
        content: newMessage,
        createdAt: new Date().toISOString(),
        sender: { userID: user.userID, username: user.username, email: user.email },
      },
    ]);
    console.log("Message sent:", newMessage);
  };

  // Handle adding members to group chat
  // const handleAddMemberIntoGroup = async (memberID: string | null, conversationID: string) => {
  //   if (!memberID || !conversationID) {
  //     alert("Please enter a valid user ID to add.");
  //     return;
  //   }
  //   // Call API to add member
  //   const res = await fetch(`${baseUrl}/api/chat/add-member`, {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ memberID, conversationID }),
  //   });

  //   if (res.ok) {
  //     alert("Member added successfully!");
  //     setGroupMemberID(null); // Clear input
  //   } else {
  //     alert("Failed to add member. Please try again.");
  //   }
  // };

  // Handle opening chat panel
  const handleOpenChatPanel = (conversationID: string, conversationData: ConversationList) => {
    setJoinedConversationID(conversationID);
    setConversation(conversationData);

    // Join the room
    socketRef.current?.emit("join_room", conversationID);

    // Fetch messages for this conversation
    fetch(`${baseUrl}/api/chat/${conversationID}`)
      .then((res) => res.json())
      .then((data) => {
        setMessages(data);
      })
      .catch(() => setMessages([]));
    // =>> Mark messages as read 
    // Update UI before 
    const conversationChanged = conversationUserBelongs.map((conv) => {
      if (conv.conversationID === conversationID) {
        return { ...conv, conversation: { ...conv.conversation, messages: [] } };
      }
      return conv;
    });

    setConversationUserBelongs(conversationChanged);
    console.log("Conversation changed:", conversationChanged);
    // Update database to mark messages as read
    fetch(`${baseUrl}/api/chat/mark-messages-read`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationID, userID: user?.userID }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Messages marked as read:", data);
      })
      .catch((err) => console.error("Failed to mark messages as read:", err));
  }

  // fetch conversations that user is a part of 
  useEffect(() => {
    if (user) {
      fetch(`${baseUrl}/api/chat/conversations/${user.userID}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.length > 0) {
            console.log("Conversations fetched:", data);
            setConversationUserBelongs(data);
          }
        })
        .catch((err) => console.error("Failed to fetch conversations:", err));
    }
  }, [user]);

  return (
    <div className="bg-[#f5f7fa] min-h-screen flex flex-col items-center py-6">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-lg flex overflow-hidden min-h-[600px]">
        {/* Sidebar: Danh sách cuộc trò chuyện */}
        <aside className="w-80 border-r bg-gradient-to-b from-blue-100 to-blue-50 flex flex-col">
          <div className="p-5 border-b flex items-center gap-2 text-blue-700 font-bold text-xl bg-white">
            <MessageCircle className="w-7 h-7" /> Trò chuyện
          </div>
          <div className="flex-1 overflow-y-auto">
            <h2 className="px-5 pt-4 pb-2 text-base font-semibold text-blue-700">Danh sách cuộc trò chuyện</h2>
            {conversationUserBelongs.length > 0 ? (
              <ul className="pl-0">
                {conversationUserBelongs.map((conv) => (
                  <li key={conv.conversationID}>
                    <button
                      className={`w-full flex items-center gap-3 px-5 py-3 rounded-lg mb-1 hover:bg-blue-200/60 transition text-left ${joinedConversationID === conv.conversationID ? "bg-blue-100" : ""}`}
                      onClick={() => handleOpenChatPanel(conv.conversationID, conv)}
                    >
                      <span className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-300 text-white font-bold text-lg">
                        {conv.conversation.conversationAvatar ? (
                          <div className="rounded-full h-10 w-10">
                            <Image src={conv.conversation.conversationAvatar} alt="Avatar" width={400} height={60} className="rounded-full h-full w-full object-cover" />
                          </div>
                        ) : (
                          <MessageCircle className="w-6 h-6" />
                        )}
                      </span>
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="font-semibold truncate text-blue-900">{conv.conversation.conversationName}</div>
                        <p className="text-xs">
                          {conv.conversation.hostID}
                        </p>
                        <div className="text-xs text-gray-600 truncate max-w-[180px]">
                          {conv.conversation.newestMessage || "Chưa có tin nhắn."}
                        </div>
                      </div>
                      <span className="">{conv.conversation.messages?.length || ''}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-5 text-gray-400">Không có cuộc trò chuyện nào.</div>
            )}
          </div>
        </aside>
        {/* Main Chat Panel */}
        <main className="flex-1 flex flex-col h-full bg-white">
          {/* Header */}
          <div className="p-5 border-b font-semibold text-lg bg-gradient-to-r from-blue-100 to-blue-50 shadow-sm min-h-[56px] flex items-center text-blue-800">
            {conversation?.conversation.conversationName || "Chọn một cuộc trò chuyện để bắt đầu"}
          </div>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 bg-[#f5f7fa]">
            {messages.length === 0 && <div className="text-gray-400">Chưa có tin nhắn nào.</div>}
            {messages.length > 0 && messages.map((msg) => (
              <div
                key={msg.messageID || Math.random()}
                className={`mb-3 flex ${msg.senderID === user?.userID ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`rounded-2xl px-4 py-2 max-w-[70%] break-words shadow ${msg.senderID === user?.userID ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-900"}`}
                >
                  <span className="block mb-1">{msg.content}</span>
                  <span className="block text-xs text-right opacity-70">
                    {msg.sender?.username || msg.senderID} | {new Date(msg.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {/* Input */}
          {joinedConversationID && (
            <div className="p-4 border-t flex gap-2 bg-white">
              <input
                className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Nhập tin nhắn..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <button className="bg-blue-500 text-white px-6 py-2 rounded-full font-semibold shadow hover:bg-blue-600 transition" onClick={handleSendMessage}>
                Gửi
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}