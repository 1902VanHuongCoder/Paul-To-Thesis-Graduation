"use client";
import React, { useCallback, useEffect, useState } from 'react';
import { ChatList } from './chat-list';
import ScrollToBottom from 'react-scroll-to-bottom';
import { Socket } from 'socket.io-client';

interface Message {
  room: string;
  username: string;
  message: string;
  time: string;
}

interface ChatProps {
  socket: Socket;
  username: string;
  room: string;
}

export const Chat: React.FC<ChatProps> = ({ socket, username, room }) => {
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [messageList, setMessageList] = useState<Message[]>([]);

  const sendMessage = useCallback(async () => {
    if (currentMessage.trim() !== '') {
      const message: Message = {
        room,
        username,
        message: currentMessage,
        time:
          new Date(Date.now()).getHours().toString().padStart(2, '0') +
          ':' +
          new Date(Date.now()).getMinutes().toString().padStart(2, '0'),
      };
      setMessageList((list) => [...list, message]);
      await socket.emit('send_message', message);
      setCurrentMessage('');
    }
  }, [currentMessage, room, username, socket]);

  useEffect(() => {
    const handleReceiveMessage = (data: Message) => {
      setMessageList((list) => [...list, data]);
    };
    socket.on('send_message', handleReceiveMessage);

    return () => {
      socket.off('send_message', handleReceiveMessage);
    };
  }, [socket]);

  return (
    <div className="chat-window">
      <div className="chat-header">
        <p>Live Chat</p>
      </div>
      <div className="chat-body">
        <ScrollToBottom className="message-container">
          {messageList.map((message, id) => (
            <ChatList
              key={id}
              usuario={username}
              mensaje={message.message}
              tiempo={message.time}
              autor={message.username}
            />
          ))}
        </ScrollToBottom>
      </div>
      <div className="chat-footer">
        <input
          type="text"
          placeholder="Hey..."
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') sendMessage();
          }}
        />
        <button onClick={sendMessage}>&#9658;</button>
      </div>
    </div>
  );
};