"use client";
import { useUser } from "@/contexts/user-context";
import { baseUrl } from "@/lib/base-url";
import { useState, useEffect, useRef } from "react";
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

interface ConversationList {
  conversationID: string;
  userID: string;
  conversation: Conversation;
}

export default function ChatPage() {
  const socketRef = useRef<Socket | null>(null);
  const [userID, setUserID] = useState<string | null>(null);
  const [groupMemberID, setGroupMemberID] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [conversationUserBelongs, setConversationUserBelongs] = useState<ConversationList[]>([]);
  const [groupName, setGroupName] = useState<string>("");
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

  const handleFindUserToChat = async () => {
    if (userID) {
      const res = await fetch(`${baseUrl}/api/users/${userID}`);
      const data = await res.json();
      if (res.ok) {
        setUserInfo(data);
      } else {
        alert("User not found. Please type a valid user ID.");
      }
    }
  };

  const handleCreateNewConversation = async (targetUserID: string, isGroup: boolean) => {
    if (!user) {
      alert("User is not logged in.");
      return;
    }

    const res = await fetch(`${baseUrl}/api/chat/create-conversation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationID: generateConversationID(user.userID, targetUserID, isGroup),
        conversationName: groupName || `Conversation with ${userInfo?.username}`,
        participants: isGroup ? [user.userID] : [user.userID, targetUserID],
        isGroup: isGroup,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setConversation(data.conversation);
      const conversationID = data.conversation?.conversationID;
      if (socketRef.current && conversationID) {
        socketRef.current.emit("join_room", conversationID);
        setJoinedConversationID(conversationID);
      }
      setUserInfo(null);
      alert("Conversation created successfully!");
      console.log("Conversation created:", data);

    } else {
      alert("Failed to create conversation. Please try again.");
    }
  };

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
  const handleAddMemberIntoGroup = async (memberID: string | null, conversationID: string) => {
    if (!memberID || !conversationID) {
      alert("Please enter a valid user ID to add.");
      return;
    }
    // Call API to add member
    const res = await fetch(`${baseUrl}/api/chat/add-member`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberID, conversationID }),
    });

    if (res.ok) {
      alert("Member added successfully!");
      setGroupMemberID(null); // Clear input
    } else {
      alert("Failed to add member. Please try again.");
    }
  };

  // fetch conversations that user is a part of 
  useEffect(() => {
   
    if (user) { 
      alert("Fetching conversations...");
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
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">Chat Page</h1>
      <p className="text-lg">This is the chat page for staff members.</p>
      <div className="mt-4">
        <label className="block mb-2">User ID:</label>
        <input
          type="text"
          value={userID ?? ""}
          onChange={(e) => setUserID(e.target.value)}
          className="border p-2 rounded w-64"
        />
        <button onClick={handleFindUserToChat}>Find user</button>
        {userInfo && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold">User Info:</h2>
            <p>User ID: {userInfo.userID}</p>
            <p>Username: {userInfo.username}</p>
            <p>Email: {userInfo.email}</p>
            <button onClick={() => handleCreateNewConversation(userInfo.userID, false)}>Nhan tin</button>
          </div>
        )}
        {/* Show conversation list that user belongs to */}
        <div className="mt-4">
          <h2 className="text-lg font-semibold">Your Conversations:</h2>
          {conversationUserBelongs.length > 0 ? (
            <ul className="list-disc pl-5">
              {conversationUserBelongs.map((conv) => (
                <li key={conv.conversationID}>
                  <button
                    className="text-blue-500 hover:underline"
                    onClick={() => {
                      setJoinedConversationID(conv.conversationID);
                      setConversation(conv.conversation);
                    }}
                  >
                    {conv.conversation.conversationName }
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No conversations found.</p>
          )}
        </div>
      </div>
      <div>
        <p>Create new group chat</p>
        <label>
          <input type="text" onChange={(e) => setGroupName(e.target.value)} />
          {user && <button onClick={() => handleCreateNewConversation(user.userID, true)}>Create Group</button>}
        </label>
      </div>
      {/* Chat Window */}
      {joinedConversationID && (
        <div className="w-full max-w-lg mt-8 border rounded shadow bg-white flex flex-col h-96">
          <div className="p-2 border-b font-semibold">Conversation #{joinedConversationID}</div>
          {
            // If conversation is a group, show button to add new participants
            conversation?.isGroup && user && (
              <div className="p-2 border-b">
                <button
                  className="bg-blue-500 text-white px-4 py-1 rounded"
                  onClick={() => handleAddMemberIntoGroup(groupMemberID, conversation.conversationID)}
                >
                  Add Participants
                </button>
                  {/* If you want to implement adding participants, you can create a modal or another input field here */}
                <input
                  type="text"
                  placeholder="Enter user ID to add"
                  value={groupMemberID ?? ""}
                  onChange={(e) => setGroupMemberID(e.target.value)}
                  className="border rounded px-2 py-1"
              />
              </div>
            )

          }
          <div className="flex-1 overflow-y-auto p-2">
            {messages.length === 0 && <div className="text-gray-400">No messages yet.</div>}
            {messages.map((msg) => (
              <div
                key={msg.messageID || Math.random()}
                className={`mb-2 flex ${msg.senderID === user?.userID ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`rounded px-3 py-1 ${msg.senderID === user?.userID ? "bg-blue-500 text-white" : "bg-gray-200"
                    }`}
                >
                  <span className="block">{msg.content}</span>
                  <span className="block text-xs text-right">
                    {msg.sender?.username || msg.senderID} | {new Date(msg.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="p-2 border-t flex gap-2">
            <input
              className="flex-1 border rounded px-2 py-1"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <button className="bg-green-500 text-white px-4 py-1 rounded" onClick={handleSendMessage}>
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}