import { useEffect, useState } from 'react';
import { IncomingMessage } from './Common/Common.interface';


export const useWebSocket = (url: string) => {
    const [message, setMessage] = useState<IncomingMessage | null>(null);
    const [ws, setWs] = useState<WebSocket | null>(null);

    useEffect(() => {
        const socket = new WebSocket(url);
        
        socket.onmessage = (event) => {
            console.log(event.data)
            try {
                const data = JSON.parse(event.data)
                console.log(data['Details'])
                setMessage({panel: data['Details'].Panel, element: data['Details'].Element, value: data['Details'].Value});
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
