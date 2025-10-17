import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

type ServerMessage =
  | { type: "BOOKING_STATUS_UPDATE"; bookingId: string; newStatus: string; message?: string }
  | { type: "PRICE_ALERT"; hotelId: string; roomId: string; newPrice: number; oldPrice: number }
  | { type: "SUPPORT_MESSAGE"; sender: string; content: string; timestamp: number };

interface UseWebSocketOptions {
  onMessage?: (msg: ServerMessage) => void;
}

const WS_BASE = (import.meta.env.VITE_WS_URL as string) || "ws://localhost:5000/ws";

// Global WebSocket instance to prevent multiple connections
let globalWS: WebSocket | null = null;
let globalMessageHandler: ((msg: ServerMessage) => void) | null = null;

export function useWebSocket({ onMessage }: UseWebSocketOptions = {}) {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const retryRef = useRef({ attempts: 0, timer: 0 as unknown as number });
  const isConnectingRef = useRef(false);

  const connect = useCallback(() => {
    if (!user || isConnectingRef.current) return;
    
    // Use global WebSocket if already connected
    if (globalWS && globalWS.readyState === WebSocket.OPEN) {
      setIsConnected(true);
      globalMessageHandler = onMessage;
      return;
    }
    
    // Prevent multiple connection attempts
    if (globalWS && (globalWS.readyState === WebSocket.CONNECTING || globalWS.readyState === WebSocket.OPEN)) {
      return;
    }
    
    isConnectingRef.current = true;
    
    try {
      // In a real app, retrieve a JWT. Here we pass a mock token derived from localStorage user id for demo.
      const token = localStorage.getItem("auth_token") || user.id; 
      const url = new URL(WS_BASE);
      url.searchParams.set("token", token);

      const ws = new WebSocket(url.toString().replace("http", "ws"));
      globalWS = ws;
      globalMessageHandler = onMessage;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        retryRef.current.attempts = 0;
        isConnectingRef.current = false;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as ServerMessage;
          globalMessageHandler?.(data);
        } catch {
          // ignore malformed
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        isConnectingRef.current = false;
        globalWS = null;
        globalMessageHandler = null;
        
        // Only reconnect if it wasn't a manual close and we have a user
        if (user && event.code !== 1000) {
          const attempts = Math.min(retryRef.current.attempts + 1, 2); // Further reduced attempts
          retryRef.current.attempts = attempts;
          const delayMs = Math.floor(5000 * Math.pow(2, attempts)); // Much longer delays
          window.clearTimeout(retryRef.current.timer);
          retryRef.current.timer = window.setTimeout(() => connect(), delayMs);
        }
      };

      ws.onerror = (error) => {
        console.log('WebSocket error:', error);
        isConnectingRef.current = false;
        // Let onclose handle reconnect
      };
    } catch (error) {
      console.log('WebSocket connection error:', error);
      isConnectingRef.current = false;
    }
  }, [user, onMessage]);

  useEffect(() => {
    if (!user) {
      // Clean up when user logs out
      window.clearTimeout(retryRef.current.timer);
      if (globalWS) {
        globalWS.close(1000, 'User logged out');
        globalWS = null;
        globalMessageHandler = null;
      }
      setIsConnected(false);
      return;
    }
    
    connect();
    return () => {
      // Don't close on component unmount - keep global connection alive
      window.clearTimeout(retryRef.current.timer);
    };
  }, [user, connect]);

  const send = useCallback((payload: unknown) => {
    const ws = globalWS;
    console.log('Attempting to send:', payload, 'WS state:', ws?.readyState);
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.log('WebSocket not ready:', ws?.readyState);
      return false;
    }
    ws.send(JSON.stringify(payload));
    return true;
  }, []);

  const joinBooking = useCallback((bookingId: string) => {
    return send({ type: "JOIN_BOOKING", bookingId });
  }, [send]);

  const leaveBooking = useCallback((bookingId: string) => {
    return send({ type: "LEAVE_BOOKING", bookingId });
  }, [send]);

  const sendSupportMessage = useCallback((bookingId: string, content: string) => {
    return send({ type: "SUPPORT_MESSAGE", bookingId, content, timestamp: Date.now() });
  }, [send]);

  return { isConnected, send, sendSupportMessage, joinBooking, leaveBooking };
}


