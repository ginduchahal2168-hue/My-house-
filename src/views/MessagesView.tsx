import React, { useState } from 'react';
import { 
  Send, 
  MessageSquare, 
  Phone, 
  MessageCircle, 
  ExternalLink, 
  ShieldCheck, 
  CheckCheck, 
  Database,
  AlertCircle
} from 'lucide-react';
import { useRental } from '../context/RentalContext';

export const MessagesView: React.FC = () => {
  const { 
    conversations, 
    activeConversationId, 
    activeConversation, 
    sendMessage, 
    navigateTo,
    guestSessionId,
    isBackendConnected
  } = useRental();

  const [inputMessage, setInputMessage] = useState('');
  const [selectedConvId, setSelectedConvId] = useState<string | null>(
    activeConversationId || (conversations.length > 0 ? conversations[0].id : null)
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const currentConversation = conversations.find(c => c.id === selectedConvId) || activeConversation || conversations[0];

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!inputMessage.trim() || !currentConversation) return;

    try {
      await sendMessage(currentConversation.id, inputMessage.trim());
      setInputMessage('');
    } catch (err: any) {
      setErrorMsg('Failed to deliver message. Please check your internet or Supabase connection.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 pb-24 md:pb-16">
      <div className="max-w-6xl mx-auto">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Guest Messages
              </h1>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                Real Guest Session
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Direct two-way messaging with property landlords. Realtime synchronization enabled.
            </p>
          </div>

          {/* Connection status banner */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs">
            <Database className={`w-3.5 h-3.5 ${isBackendConnected ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span className="text-[11px] font-medium text-slate-300">
              {isBackendConnected ? 'Supabase Realtime Connected' : 'Local Persistence Mode'}
            </span>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Chat Layout Container */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md overflow-hidden grid grid-cols-1 md:grid-cols-3 h-[680px]">
          {/* ======================================================== */}
          {/* LEFT: CONVERSATIONS LIST                                 */}
          {/* ======================================================== */}
          <div className="border-r border-slate-200/80 flex flex-col h-full bg-slate-50/50">
            <div className="p-4 border-b border-slate-200 bg-white">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Conversations ({conversations.length})
              </h3>
            </div>

            <div className="overflow-y-auto flex-1 divide-y divide-slate-100 no-scrollbar">
              {conversations.length > 0 ? (
                conversations.map((conv) => {
                  const isSelected = conv.id === (selectedConvId || currentConversation?.id);
                  return (
                    <div
                      key={conv.id}
                      onClick={() => setSelectedConvId(conv.id)}
                      className={`p-3.5 flex gap-3 cursor-pointer transition-colors ${
                        isSelected ? 'bg-emerald-50/60 border-l-4 border-l-[#167B62]' : 'hover:bg-slate-100/70 bg-white'
                      }`}
                    >
                      {conv.propertyImage ? (
                        <img
                          src={conv.propertyImage}
                          alt=""
                          className="w-12 h-12 rounded-xl object-cover shrink-0 bg-slate-100 border border-slate-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold shrink-0">
                          Home
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {conv.ownerName}
                          </h4>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {conv.lastMessageTimestamp}
                          </span>
                        </div>

                        <p className="text-[11px] text-[#167B62] font-semibold truncate mt-0.5">
                          {conv.propertyTitle}
                        </p>

                        <p className="text-[11px] text-slate-500 truncate mt-1">
                          {conv.lastMessage}
                        </p>
                      </div>

                      {conv.unreadCount > 0 && (
                        <div className="self-center">
                          <span className="w-5 h-5 rounded-full bg-[#167B62] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                            {conv.unreadCount}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-xs text-slate-400">
                  <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p>No messages yet.</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    When you inquire about a rental, your conversation with the real landlord will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT: CHAT TIMELINE & INPUT                             */}
          {/* ======================================================== */}
          {currentConversation ? (
            <div className="md:col-span-2 flex flex-col h-full bg-white">
              {/* Header */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-4 bg-white">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-[#167B62] font-bold text-sm flex items-center justify-center shrink-0">
                    {currentConversation.ownerName ? currentConversation.ownerName.charAt(0) : 'L'}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 truncate">
                      {currentConversation.ownerName}
                    </h3>
                    <p className="text-xs text-slate-500 truncate">
                      {currentConversation.propertyCity}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {currentConversation.ownerPhone && (
                    <a
                      href={`tel:${currentConversation.ownerPhone}`}
                      className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                      title="Direct Call"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  )}
                  {currentConversation.ownerWhatsApp && (
                    <button
                      onClick={() => {
                        const cleanNumber = currentConversation.ownerWhatsApp.replace(/[^0-9]/g, '');
                        window.open(`https://api.whatsapp.com/send?phone=${cleanNumber}`, '_blank');
                      }}
                      className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                      title="WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => navigateTo('details', currentConversation.propertyId)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1 transition-colors"
                  >
                    <span>Listing</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Property Snapshot */}
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-200/80 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 truncate">
                  {currentConversation.propertyTitle}
                </span>
                <span className="font-bold text-[#167B62] shrink-0">
                  {currentConversation.propertyCurrency} {currentConversation.propertyRent.toLocaleString()}
                </span>
              </div>

              {/* Message History */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 bg-slate-50/30">
                {currentConversation.messages.length === 0 ? (
                  <div className="text-center text-xs text-slate-400 py-10">
                    No messages yet in this conversation. Send a message below.
                  </div>
                ) : (
                  currentConversation.messages.map((msg) => {
                    const isSelf = msg.senderSessionId === guestSessionId || msg.sender === 'guest';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-md px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                            isSelf
                              ? 'bg-[#167B62] text-white rounded-br-xs shadow-xs'
                              : 'bg-white text-slate-900 border border-slate-200 rounded-bl-xs shadow-xs'
                          }`}
                        >
                          {msg.text}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1 px-1">
                          <span>{msg.timestamp}</span>
                          {isSelf && <CheckCheck className="w-3 h-3 text-emerald-600" />}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Input */}
              <form onSubmit={handleSend} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={`Send message to ${currentConversation.ownerName}...`}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-[#167B62] focus:bg-white transition-colors"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="w-10 h-10 rounded-xl bg-[#167B62] hover:bg-[#126550] disabled:bg-slate-200 text-white flex items-center justify-center transition-all shrink-0 active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          ) : (
            <div className="md:col-span-2 flex flex-col items-center justify-center p-8 text-center text-slate-400 bg-white">
              <MessageSquare className="w-12 h-12 text-slate-300 mb-2" />
              <h4 className="text-sm font-bold text-slate-700">No conversation selected</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Inquire about an accommodation listing to start a real chat with the landlord.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
