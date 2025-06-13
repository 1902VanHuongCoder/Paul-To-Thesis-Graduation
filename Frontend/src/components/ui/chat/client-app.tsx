"use client";
import React, { useState } from 'react'
import io from 'socket.io-client'
import { Chat } from './chat';

const socket = io("http://localhost:3001")



export const ClientApp = () => {
    const [username, setUsername] = useState("");
    const [room, setRoom] = useState("");
    const [showChat, setShowChat] = useState(false);


    const joinRoom = () => {
        if (username !== "" && room !== "") {
            socket.emit("join_room", room)
            setShowChat(true)
        }

    }

    return (
        <div className='App'>
            {!showChat ? (
                <div className='joinChatContainer'>

                    <h3>Chat Room</h3>
                    <input type="text"
                        placeholder='Jhon ...'
                        value={username}
                        onChange={(e) => { setUsername(e.target.value) }} />

                    <input
                        type="text"
                        placeholder='Room ID ...'
                        value={room}
                        onChange={(e) => { setRoom(e.target.value) }}
                    />
                    <button onClick={joinRoom}>Join a Room</button>
                </div>
            ) : (
                <Chat socket={socket} username={username} room={room} />
            )}
        </div>
    )
}

export default ClientApp;