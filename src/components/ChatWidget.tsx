import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, User as UserIcon, ArrowLeft } from "lucide-react";
import { User } from "../types";
import { apiFetch } from "../lib/api";

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  content: string;
  timestamp: string;
}

interface Contact {
  id: string;
  name: string;
  role: string;
  department: string;
}

interface ChatWidgetProps {
  currentUser: User;
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatWidget({ currentUser, isOpen, onClose }: ChatWidgetProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchContacts();
    }
  }, [isOpen]);

  useEffect(() => {
    let interval: any;
    if (isOpen && selectedContact) {
      fetchMessages(selectedContact.id);
      interval = setInterval(() => {
        fetchMessages(selectedContact.id);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isOpen, selectedContact]);

  const fetchContacts = async () => {
    try {
      const res = await apiFetch("/api/chat/contacts");
      if (res.ok) {
        const data = await res.json();
        setContacts(Array.isArray(data) ? data : []);
      } else {
        setContacts([]);
      }
    } catch (e) {
      console.error(e);
      setContacts([]);
    }
  };

  const fetchMessages = async (contactId: string) => {
    try {
      const res = await apiFetch(`/api/chat/messages/${contactId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(Array.isArray(data) ? data : []);
      } else {
        setMessages([]);
      }
    } catch (e) {
      console.error(e);
      setMessages([]);
    }
  };

  useEffect(() => {
    if (isOpen && selectedContact) {
      endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, selectedContact]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedContact) return;

    try {
      const res = await apiFetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: selectedContact.id,
          content: inputMessage
        })
      });
      
      if (res.ok) {
        const newMsg = await res.json();
        setMessages(prev => [...prev, newMsg]);
        setInputMessage("");
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-[350px] sm:w-[400px] bg-[#090d1a]/95 backdrop-blur-xl border-l border-white/10 shadow-2xl z-50 flex flex-col transform transition-transform duration-300">
      {/* Header */}
      <div className="h-16 border-b border-white/10 flex items-center justify-between px-4 shrink-0 bg-black/20">
        <div className="flex items-center gap-2.5">
          {selectedContact ? (
            <button 
              onClick={() => setSelectedContact(null)}
              className="h-8 w-8 hover:bg-white/10 rounded-lg flex items-center justify-center text-slate-400 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          ) : (
            <div className="h-8 w-8 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400">
              <MessageSquare className="h-4 w-4" />
            </div>
          )}
          
          <div>
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-widest">
              {selectedContact ? selectedContact.name : "Internal Comms"}
            </h3>
            <p className="text-[10px] text-emerald-400 flex items-center gap-1">
              {selectedContact ? selectedContact.role : "Select a contact"}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {!selectedContact ? (
        /* Contacts List Area */
        <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-white/10">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Available Contacts</div>
          {contacts.map((contact) => (
            <button
              key={contact.id}
              onClick={() => setSelectedContact(contact)}
              className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl transition-all text-left cursor-pointer"
            >
              <div className="h-10 w-10 bg-indigo-500/20 rounded-lg flex items-center justify-center shrink-0">
                <UserIcon className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200">{contact.name}</p>
                <p className="text-[10px] text-slate-400">{contact.role} • {contact.department}</p>
              </div>
            </button>
          ))}
          {contacts.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-xs">No contacts available to message.</div>
          )}
        </div>
      ) : (
        <>
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
            {messages.map((msg) => {
              const isMe = msg.senderId === currentUser.id;
              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-1.5 mb-1 opacity-70">
                    {!isMe && <UserIcon className="h-3 w-3 text-slate-400" />}
                    <span className="text-[9px] font-bold text-slate-400">{isMe ? 'You' : msg.senderName}</span>
                  </div>
                  <div 
                    className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                      isMe 
                        ? 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-100 rounded-tr-none' 
                        : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-none'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[8px] text-slate-500 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}
            <div ref={endOfMessagesRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-white/10 bg-black/20 shrink-0">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-black/40 border border-white/10 rounded-lg h-9 px-3 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-colors"
              />
              <button 
                type="submit"
                disabled={!inputMessage.trim()}
                className="h-9 w-9 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
