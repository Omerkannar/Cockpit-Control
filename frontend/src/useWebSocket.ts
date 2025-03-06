import { useEffect, useState } from 'react';
import { IncomingMessage, MessageType } from './Common/Common.interface'; // Adjust this type according to server response


export const useWebSocket = (url: string) => {
    const [message, setMessage] = useState<IncomingMessage[] | null>(null);
    const [ws, setWs] = useState<WebSocket | null>(null);

    useEffect(() => {
        const socket = new WebSocket(url);
        
        socket.onopen = () => {
            console.info('WebSocket connection established');
        };
        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                // Process other messages (e.g., updates)
                if (data['Details']) {
                    //console.log(data['Details'], data['Details'].length);
                const incomingMessages = data['Details'].map((detail: any) => ({
                    panel: detail.Panel,
                    element: detail.Element,
                    value: detail.Value,
                    // `blinking` is set to false on startup, true otherwise
                    blinking: data['Type']  === "UPDATE_CLIENT_ON_STARTUP" ? false : true,
                    type: data['Type']      === "UPDATE_CLIENT_ON_STARTUP" ? "UPDATE_ALL" : "UPDATE_UPON_CHANGE"
                }));
                setMessage(incomingMessages);
                }
            } catch (error) {
                console.error('Error parsing JSON:', error);
            }        
        };

        socket.onclose = (event) => {
            console.info('WebSocket connection closed');
            console.warn("WebSocket closed:", event.reason);
        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        setWs(socket);

        // Cleanup on unmount
        return () => {
            socket.close();
        };
    }, [url]);

    const sendMessage = (panel: string, element: string, value: string) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                Type: "SET_NEW_VALUE",
                Details: {
                Panel: panel,
                Element: element,
                Value: value.toString(), // Ensure it's a string, even for numbers
                }
            }));
        } else {
            console.warn('WebSocket is not open. Message not sent.');
        }
    };

    return {
        message,
        sendMessage
    };
};