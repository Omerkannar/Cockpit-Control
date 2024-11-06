import { useEffect, useState } from 'react';
import { IncomingMessage } from './Common/Common.interface';
//import BlinkingQueue from './Common/BlinkingQueue';


export const useWebSocket = (url: string) => {
    const [message, setMessage] = useState<IncomingMessage[] | null>(null);
    const [ws, setWs] = useState<WebSocket | null>(null);

    useEffect(() => {
        const socket = new WebSocket(url);
        
        socket.onmessage = (event) => {
            // // console.log(event.data)
            try {
                const data = JSON.parse(event.data)
                // // console.log(data['Details'], data['Details'].length)
                const incomingMessages = data['Details'].map((detail: any) => ({
                    panel: detail.Panel,
                    element: detail.Element,
                    value: detail.Value,
                    blinking: data['Type'] === "UPDATE_CLIENT_ON_STARTUP" ? false : true
                }));
                setMessage(incomingMessages);
            } catch (error) {
                console.error('Error parsing JSON:', error);
            }        
        };

        socket.onopen = () => {
            console.info('WebSocket connection established');
        };

        socket.onclose = () => {
            console.info('WebSocket connection closed');
        };

        setWs(socket);

        return () => {
            socket.close();
        };
    }, [url]);

    const sendMessage = (panel: string, element: string, value: string) => {
        if (ws) {
            ws.send(JSON.stringify({
                Type: "SET_NEW_VALUE",
                Details: {
                Panel: panel,
                Element: element,
                Value: value.toString()
                }
            }));
        }
    };

    return {
        message,
        sendMessage
    };
};