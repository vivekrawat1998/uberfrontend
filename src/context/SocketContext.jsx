import React, { createContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export const SocketContext = createContext();

const socket = io(import.meta.env.VITE_BASE_URL, {
    transports: ['polling'],  // Start with polling only
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    autoConnect: false,
    path: '/socket.io/',
    withCredentials: true,
    extraHeaders: {
        'Access-Control-Allow-Origin': 'https://uberclonefrontend.vercel.app'
    }
});

const SocketProvider = ({ children }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        function onConnect() {
            console.log('Connected to server');
            setIsConnected(true);
            setRetryCount(0);
            
            // Try upgrading to WebSocket after successful polling connection
            socket.io.opts.transports = ['polling', 'websocket'];
        }

        function onDisconnect(reason) {
            console.log('Disconnected from server:', reason);
            setIsConnected(false);
            
            // Fall back to polling on disconnection
            socket.io.opts.transports = ['polling'];
        }

        function onError(error) {
            console.error('Socket error:', error);
            setRetryCount(prev => prev + 1);
            
            if (retryCount > 3) {
                socket.io.opts.transports = ['polling'];
            }
            
            setTimeout(() => {
                socket.connect();
            }, 1000 * Math.min(retryCount, 5));
        }

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('error', onError);
        socket.on('connect_error', onError);

        socket.connect();

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('error', onError);
            socket.off('connect_error', onError);
            socket.disconnect();
        };
    }, [retryCount]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketProvider;