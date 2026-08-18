import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot } from "lucide-react";

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      sender: "user" | "bot",
      text: "Hi! I’m the Ceynoa Assistant. Ask me anything about file uploads, storage, sharing, subscriptions or account settings."
    }
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  

 const sendMessage = async (message) => {
  const token = localStorage.getItem("access_token");

  let response = await fetch(
    "http://localhost:8000/api/assistant/chat/",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ message })
    }
  );

  const data = await response.json();
  return data.reply;
};

const handleSend = async () => {

  if (!input.trim()) return;

  const userText = input;

  // show user message
  setMessages(prev => [
    ...prev,
    { sender: "user", text: userText }
  ]);

  setInput("");

  setLoading(true); 
  const aiReply = await sendMessage(userText);
  setLoading(false);

  // show bot message
  setMessages(prev => [
    ...prev,
    { sender: "bot", text: aiReply }
  ]);
};

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110"
        >
          <MessageSquare  size={28} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] h-[580px] bg-white rounded-3xl shadow-2xl border border-orange-100 flex flex-col overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <Bot size={20} />
              </div>
              <div>
                <h2 className="font-semibold text-lg">Ceynoa Assistant</h2>
                <p className="text-xs opacity-90">Online Support AI</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-2 rounded-full transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-orange-50 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.sender === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm shadow-sm ${
                    msg.sender === "user"
                      ? "bg-orange-500 text-white rounded-br-md"
                      : "bg-white text-gray-800 rounded-bl-md border border-orange-100"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-orange-100 px-4 py-3 rounded-2xl text-sm shadow-sm flex items-center gap-2">
                  
                  <span className="flex gap-1">
                    <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </span>

                  <span className="text-gray-500"></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef}></div>
          </div>

          {/* Input */}
          <div className="border-t border-orange-100 bg-white p-4">
            <div className="flex gap-3 items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (loading) return;
                    handleSend();
                  }
                }}
                placeholder="Ask about Ceynoa..."
                className="flex-1 border border-orange-200 rounded-full px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
              />

              <button
                onClick={handleSend}
                disabled={loading}
                className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white p-3 rounded-full shadow-lg transition"
              >
                <Send size={18} />
              </button>
            </div>
          </div>

        </div>
      )}
    </>
  );
}