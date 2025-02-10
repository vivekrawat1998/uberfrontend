import React, { createContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export const SocketContext = createContext();

const socket = io(import.meta.env.VITE_BASE_URL, {
    transports: ['polling', 'websocket'],
    upgrade: true,
    rememberUpgrade: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 20000,
    autoConnect: true,
    forceNew: true,
    path: '/socket.io/',
    withCredentials: true
});

const SocketProvider = ({ children }) => {
    const [isConnected, setIsConnected] = useState(socket.connected);

    useEffect(() => {
        function onConnect() {
            console.log('Connected to server');
            setIsConnected(true);
        }

        function onDisconnect() {
            console.log('Disconnected from server');
            setIsConnected(false);
        }

        function onError(error) {
            console.error('Socket error:', error);
            // Attempt to reconnect on error
            socket.connect();
        }

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('error', onError);
        socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            // Try to reconnect with polling if WebSocket fails
            if (socket.io.opts.transports.includes('websocket')) {
                console.log('Falling back to polling transport');
                socket.io.opts.transports = ['polling'];
                socket.connect();
            }
        });

        if (!socket.connected) {
            socket.connect();
        }

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