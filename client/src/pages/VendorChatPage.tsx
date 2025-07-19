/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { io, Socket } from "socket.io-client";
import Swal from "sweetalert2";
import Header from "../components/Header";
import Footer from "../components/Footer";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
const SOCKET_URL = import.meta.env.VITE_BACKEND_URL;

interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    isRead: boolean;
    createdAt: string;
     Sender?: { id: string; name?: string; email: string; userType?: string };
    Receiver?: { id: string; name?: string; email: string; userType?: string };
}

interface Conversation {
    userId: string;
    userName: string;
    lastMessage: string;
}

const VendorChatPage = () => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const socketRef = useRef<Socket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Fetch conversations
    useEffect(() => {
        const fetchConversations = async () => {
            const token = localStorage.getItem("token");
            const userId = localStorage.getItem("userId");
            console.log("Fetching conversations for userId:", userId);
            if (!token || !userId) {
                Swal.fire({
                    title: "Error!",
                    text: "Please log in to access chats.",
                    icon: "error",
                    confirmButtonText: "OK",
                }).then(() => navigate("/auth/login"));
                return;
            }

            try {
                const response = await axios.get(`${API_BASE_URL}/messages`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const conversationsMap: { [key: string]: Conversation } = {};
                response.data.forEach((msg: Message) => {
                    const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;
                    const otherUser = msg.senderId === userId ? msg.Receiver : msg.Sender;
                    conversationsMap[otherUserId] = {
                        userId: otherUserId,
                        userName: otherUser?.name || otherUser?.email || "Unknown",
                        lastMessage: msg.content,
                    };
                });
                setConversations(Object.values(conversationsMap));
            } catch (error: any) {
                console.error("Error fetching conversations:", error.response?.data || error);
                Swal.fire({
                    title: "Error!",
                    text: error.response?.data?.message || "Failed to load conversations.",
                    icon: "error",
                    confirmButtonText: "OK",
                });
            }
        };
        fetchConversations();
    }, [navigate]);

    // Initialize Socket.IO and fetch messages for selected conversation
    useEffect(() => {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");
        if (!token || !userId || !selectedUserId) return;

        console.log("Connecting to Socket.IO at:", SOCKET_URL);
        socketRef.current = io(SOCKET_URL, {
            auth: { token },
            transports: ["websocket", "polling"],
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socketRef.current.on("connect", () => {
            console.log("Socket.IO connected successfully");
        });

        socketRef.current.on("receiveMessage", (message: Message) => {
            console.log("Received message:", message);
            if (message.senderId === selectedUserId || message.receiverId === selectedUserId) {
                setMessages((prev) => [...prev, message]);
            }
        });

        socketRef.current.on("error", ({ message }: { message: string }) => {
            console.error("Socket error:", message);
            Swal.fire({
                title: "Error!",
                text: message,
                icon: "error",
                confirmButtonText: "OK",
            });
        });

        socketRef.current.on("connect_error", (error: any) => {
            console.error("Socket connection error:", error);
            Swal.fire({
                title: "Connection Error!",
                text: "Failed to connect to chat server.",
                icon: "error",
                confirmButtonText: "OK",
            });
        });

        // Fetch chat history for selected user
        const fetchMessages = async () => {
            try {
                console.log("Fetching messages for receiverId:", selectedUserId);
                const response = await axios.get(`${API_BASE_URL}/messages?receiverId=${selectedUserId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setMessages(response.data);
            } catch (error: any) {
                console.error("Error fetching messages:", error.response?.data || error);
                Swal.fire({
                    title: "Error!",
                    text: error.response?.data?.message || "Failed to load messages.",
                    icon: "error",
                    confirmButtonText: "OK",
                });
            }
        };
        fetchMessages();

        return () => {
            console.log("Disconnecting Socket.IO");
            socketRef.current?.disconnect();
            socketRef.current = null;
        };
    }, [selectedUserId]);

    // Auto-scroll to the latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Handle sending a message
    const handleSendMessage = () => {
        const userId = localStorage.getItem("userId");
        if (!newMessage.trim() || !selectedUserId || !userId) {
            console.log("Send message failed: Missing message, userId, or recipient");
            Swal.fire({
                title: "Error!",
                text: "Message or recipient is missing.",
                icon: "error",
                confirmButtonText: "OK",
            });
            return;
        }

        socketRef.current?.emit("sendMessage", {
            receiverId: selectedUserId,
            content: newMessage,
        });
        setNewMessage("");
    };


    return (
        <>
           <Header />
        
       <div className="container mx-auto p-4 flex h-[80vh]">
            {/* Conversations List */}
            <div className="w-1/3 bg-gray-100 p-4 rounded-lg mr-4">
                <h2 className="text-xl font-semibold mb-4">Conversations</h2>
                {conversations.length === 0 ? (
                    <p className="text-gray-500">No conversations yet.</p>
                ) : (
                    <ul>
                        {conversations.map((conv) => (
                            <li
                                key={conv.userId}
                                className={`p-2 mb-2 rounded-lg cursor-pointer ${
                                    selectedUserId === conv.userId ? "bg-blue-200" : "bg-white"
                                } hover:bg-blue-100`}
                                onClick={() => setSelectedUserId(conv.userId)}
                            >
                                <p className="font-semibold">{conv.userName}</p>
                                <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Chat Window */}
            <div className="w-2/3 bg-white rounded-lg p-6 flex flex-col">
                {selectedUserId ? (
                    <>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            Chat with {conversations.find((c) => c.userId === selectedUserId)?.userName || "User"}
                        </h2>
                        <div className="flex flex-col h-[60vh] max-h-[60vh] overflow-y-auto p-4 bg-gray-50 rounded-lg space-y-2">
                            {messages.length === 0 ? (
                                <p className="text-gray-500 text-center">No messages yet.</p>
                            ) : (
                                messages.map((msg) => {
                                    const userId = localStorage.getItem("userId");
                                    const isSender = msg.senderId === userId;
                                    console.log(`Message ID: ${msg.id}, Sender: ${msg.senderId}, User: ${userId}, Is Sender: ${isSender}`);
                                    return (
                                        <div
                                            key={msg.id}
                                            className={`mb-4 flex ${isSender ? "justify-end" : "justify-start"}`}
                                        >
                                            <div
                                                className={`max-w-[70%] p-3 rounded-lg ${
                                                    isSender
                                                        ? "bg-blue-600 text-white ml-4"
                                                        : "bg-gray-200 text-gray-800 mr-4"
                                                }`}
                                            >
                                                <p>{msg.content}</p>
                                                <p className="text-xs text-gray-400 mt-1 text-right">
                                                    {new Date(msg.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="mt-4">
                            <textarea
                                className="w-full border border-gray-300 rounded-lg p-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={4}
                                placeholder="Type your message here..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <div className="flex justify-end space-x-3 mt-3">
                                <button
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                    onClick={handleSendMessage}
                                >
                                    Send
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <p className="text-gray-500 text-center">Select a conversation to start chatting.</p>
                )}
            </div>
        </div>

<Footer />
        </>
    );
};

export default VendorChatPage;