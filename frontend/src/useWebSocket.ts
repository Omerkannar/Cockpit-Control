import { useEffect, useRef, useState } from 'react';
import { IncomingMessage } from './Common/Common.interface';

export const useWebSocket = (url: string) => {
    const [message, setMessage] = useState<IncomingMessage[] | null>(null);
    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        ws.current = new WebSocket(url);

        ws.current.onmessage = (event) => {
            console.log(event)
            try {
                const data = JSON.parse(event.data);
                const incomingMessages = data['Details'].map((detail: any) => ({
                    panel: detail.Panel,
                    element: detail.Element,
                    value: detail.Value,
                    blinking: data['Type'] === "UPDATE_CLIENT_ON_STARTUP" ? false : true,
                }));
                console.log(incomingMessages)
                setMessage(incomingMessages);
            } catch (error) {
                console.error('Error parsing JSON:', error);
            }
        };

        ws.current.onopen = () => {
            console.info('WebSocket connection established');
        };

        ws.current.onclose = () => {
            console.info('WebSocket connection closed');
        };

        return () => {
            ws.current?.close();
        };
    }, [url]);

    const sendMessage = (panel: string, element: string, value: string) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({
                Type: "SET_NEW_VALUE",
                Details: {
                    Panel: panel,
                    Element: element,
                    Value: value.toString(),
                },
            }));
        } else {
            console.warn('WebSocket is not open.');
        }
    };

    return {
        message,
        sendMessage,
    };
};
