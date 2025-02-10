import React, { createContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export const SocketContext = createContext();

const socket = io(import.meta.env.VITE_BASE_URL, {
    transports: ['polling', 'websocket'],
    path: '/socket.io/',
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 20000,
    autoConnect: true,
    withCredentials: true,
    closeOnBeforeunload: false
});

const SocketProvider = ({ children }) => {
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        function onConnect() {
            console.log('Connected to server');
            setIsConnected(true);
        }

        function onDisconnect() {
            console.log('Disconnected from server');
            setIsConnected(false);
            // Attempt to reconnect
            setTimeout(() => {
                socket.connect();
            }, 1000);
        }

        function onError(error) {
            console.error('Socket error:', error);
            socket.connect();
        }

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('error', onError);
        socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            socket.connect();
        });

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('error', onError);
            socket.off('connect_error');
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketProvider;