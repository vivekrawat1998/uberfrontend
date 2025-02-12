import React, { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

export const SocketContext = createContext();

const socket = io(import.meta.env.VITE_BASE_URL, {});

const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    function onConnect() {
      console.log("Connected to server");
      setIsConnected(true);
    }

    function onDisconnect() {
      console.log("Disconnected from server");
      setIsConnected(false);
      setTimeout(() => {
        socket.connect();
      }, 1000);
    }

    function onError(error) {
      console.error("Socket error:", error);
      socket.connect();
    }

    socket.on("connect", onConnect);

    socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      socket.connect();
    });

    return () => {
      socket.off("connect", onConnect);
      socket.off("error", onError);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
