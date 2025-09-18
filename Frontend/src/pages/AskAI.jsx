// src/pages/AskAi.jsx
import React, { useEffect, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import ChatInput from "../components/ChatInput";
import AyurvedaButton from "../components/AyurvedaButton";
import axios from "axios";
/**
 * AskAi (center chat + right conversation list)
 * - Uses ChatInput (frontend STT) for speech-to-text
 * - onCapture handles images coming from CameraSearchButton or upload
 */

export default function AskAi() {
  // profile fallback (for TopBar)
  const stored = JSON.parse(localStorage.getItem("ayu_profile") || "{}");
  const user = {
    name: stored.name || "John Smith",
    initials:
      stored.initials ||
      (stored.name || "John Smith").split(" ").map((p) => p[0] || "").slice(0, 2).join("").toUpperCase(),
    meta: stored.meta || "Member",
  };

  // conversation list (right column)
  const [chats, setChats] = useState([
    { id: "session-1", title: "New chat", last: "Start a new conversation" },
    { id: "session-2", title: "Diet plan tips", last: "What should I eat for Vata?" },
    { id: "session-3", title: "Remedies", last: "Natural remedies for cough" },
  ]);
  const [activeChatId, setActiveChatId] = useState(chats[0].id);

  // chat messages (center)
  const [messages, setMessages] = useState([
    { id: 1, role: "ai", text: "🌿 Namaste! I'm your Ayurveda assistant. How can I help you today?" },
  ]);
  const [inputText, setInputText] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(text) {
    if (!text || !text.trim()) return;
  
    // Update messages with the user's input
    setMessages((m) => [...m, { id: Date.now(), role: "user", text }]);
    setInputText("");
  
    try {
      // Make a POST request to the backend chat endpoint
      const response = await axios.post("http://localhost:5001/api/auth/chat", { message: text });
  
      // Update messages with the AI's reply
      setMessages((m) => [...m, { id: Date.now(), role: "ai", text: response.data.reply }]);
    } catch (error) {
      console.error("Error fetching AI reply:", error);
  
      // Handle errors gracefully by showing an error message in the chat
      setMessages((m) => [...m, { id: Date.now(), role: "ai", text: "Sorry, I couldn't process your request. Please try again later." }]);
    }
  }

  function handleCapture({ dataUrl, blob }) {
    // show placeholder message for uploaded image
    setMessages((m) => [...m, { id: Date.now(), role: "user", text: "[Image uploaded]" }]);
    setTimeout(() => {
      setMessages((m) => [...m, { id: Date.now() + 1, role: "ai", text: "I received the image — image analysis will be available once backend is connected." }]);
    }, 900);
  }

  function selectChat(id) {
    setActiveChatId(id);
    // in real app load history; here reset for demo
    setMessages([{ id: 1, role: "ai", text: "This is a fresh session. How can I help?" }]);
  }

  function startNew() {
    const id = `session-${Date.now()}`;
    const newChat = { id, title: "New chat", last: "Start a new conversation" };
    setChats((c) => [newChat, ...c]);
    setActiveChatId(id);
    setMessages([{ id: 1, role: "ai", text: "🌿 New chat started. How can I help?" }]);
  }

  function handleLogout() {
    localStorage.removeItem("ayu_profile");
    localStorage.removeItem("ayu_token");
    window.location.href = "/get-in";
  }

  return (
    <div className="min-h-screen flex bg-[#f6faf5] text-gray-900">
      {/* Left: Sidebar */}
      <Sidebar />

      {/* Main column */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <TopBar title="Ask-Ai" subtitle="Chat with your Ayurveda assistant" user={user} onLogout={handleLogout} />

        {/* Content area under TopBar: center chat + right chat list */}
        <div className="flex-1 flex gap-6 p-6">
          {/* Center chat panel */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Conversation</h2>
                <p className="text-sm text-gray-500">Ask questions about diet, remedies, or wellness.</p>
              </div>
            
            </div>

            <div className="flex-1 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
              {/* messages */}
              <div className="flex-1 overflow-auto p-6 space-y-6 bg-gradient-to-b from-[#f9fef9] to-white">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${m.role === "user" ? "bg-green-600 text-white rounded-br-sm shadow" : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm shadow-sm"}`}>
                      {m.text}
                    </div>
                  </div>
                ))}
                <div ref={endRef} />
              </div>

              {/* chat input pinned */}
              <div className="border-t border-gray-100 bg-white">
                <ChatInput
                  value={inputText}
                  onChange={setInputText}
                  onSend={handleSend}
                  onCapture={handleCapture}
                  placeholder="Ask me about herbs, remedies..."
                />
              </div>
            </div>
          </div>

          {/* Right: chat list */}
          <aside className="w-80 bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-semibold">Conversations</div>
                <div className="text-xs text-gray-500">Recent sessions</div>
              </div>

              <div>
                <AyurvedaButton onClick={startNew}>New</AyurvedaButton>
              </div>
            </div>

            <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-230px)]">
              {chats.map((c) => (
                <button key={c.id} onClick={() => selectChat(c.id)} className={`w-full text-left px-3 py-2 rounded-lg flex flex-col ${c.id === activeChatId ? "bg-green-50 text-green-800" : "hover:bg-gray-50"}`}>
                  <div className="font-medium">{c.title}</div>
                  <div className="text-xs text-gray-500 mt-1 truncate">{c.last}</div>
                </button>
              ))}
            </div>

            <div className="mt-4 text-xs text-gray-500">
              <div>Saved: {chats.length}</div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
