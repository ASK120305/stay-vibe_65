import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, X } from "lucide-react";

interface ChatMessage {
  id: string;
  bookingId: string;
  sender: "me" | "them";
  content: string;
  timestamp: number;
}

const ChatWidget = () => {
  const { isAuthenticated, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const listRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();

  // Try to infer bookingId from URL params (?bookingId=...)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const idFromQuery = params.get("bookingId");
    if (idFromQuery) setBookingId(idFromQuery);
  }, [location.search]);

  const { sendSupportMessage, joinBooking, leaveBooking, isConnected } = useWebSocket({
    onMessage: (msg) => {
      console.log('Chat received message:', msg);
      if (msg.type === "SUPPORT_MESSAGE") {
        if (!bookingId || msg.bookingId !== bookingId) return;
        setMessages((prev) => [
          ...prev,
          {
            id: `${msg.timestamp}-${Math.random().toString(36).slice(2)}`,
            bookingId: msg.bookingId,
            sender: "them",
            content: msg.content,
            timestamp: msg.timestamp,
          },
        ]);
      }
    },
  });

  // Join booking room on change (for dev fallback and reduced traffic)
  useEffect(() => {
    if (!bookingId || !isConnected) return;
    joinBooking(bookingId);
    return () => {
      leaveBooking(bookingId);
    };
  }, [bookingId, isConnected, joinBooking, leaveBooking]);

  useEffect(() => {
    // Auto-scroll to bottom on new message
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  const canSend = useMemo(() => isAuthenticated && !!user && !!bookingId && input.trim().length > 0, [isAuthenticated, user, bookingId, input]);

  const handleSend = () => {
    if (!canSend) {
      console.log('Cannot send:', { isAuthenticated, user: !!user, bookingId, inputLength: input.trim().length });
      return;
    }
    console.log('Sending message:', { bookingId, content: input.trim(), isConnected });
    const ok = sendSupportMessage(bookingId, input.trim());
    console.log('Send result:', ok);
    if (ok) {
      const now = Date.now();
      setMessages((prev) => [
        ...prev,
        {
          id: `${now}-me`,
          bookingId,
          sender: "me",
          content: input.trim(),
          timestamp: now,
        },
      ]);
      setInput("");
    } else {
      console.error('Failed to send message - WebSocket not ready');
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && (
        <Button onClick={() => setIsOpen(true)} className="shadow-lg" size="lg">
          <MessageCircle className="mr-2 h-5 w-5" /> 
          {user?.role === "owner" ? "Chat with guest" : "Chat with owner"}
        </Button>
      )}

      {isOpen && (
        <Card className="w-80 sm:w-96 shadow-xl">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="flex items-center gap-2">
              <Badge>Support</Badge>
              <span className="font-semibold">
                {user?.role === "owner" ? "Guest" : "Hotel Owner"}
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} aria-label="Close chat">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="px-4 py-3 border-b flex gap-2 items-center">
            <Input
              placeholder="Enter bookingId"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
            />
          </div>

          <div ref={listRef} className="px-3 py-2 h-64 overflow-y-auto space-y-2 bg-muted/30">
            {!isConnected && (
              <p className="text-xs text-red-500 px-2 py-1 text-center">⚠️ Not connected to server</p>
            )}
            {messages.length === 0 ? (
              <p className="text-sm text-muted-foreground px-2 py-8 text-center">
                Start a conversation {user?.role === "owner" ? "with the guest" : "with the hotel owner"} about your stay.
              </p>
            ) : (
              messages.map((m) => (
                <div key={m.id} className={`flex ${m.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${m.sender === 'me' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                    <div>{m.content}</div>
                    <div className="mt-1 text-[10px] opacity-70">
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-3 flex gap-2">
            <Textarea
              placeholder={bookingId ? "Type your message..." : "Enter bookingId to start chatting"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={2}
            />
            <Button onClick={handleSend} disabled={!canSend} className="self-end">Send</Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ChatWidget;


