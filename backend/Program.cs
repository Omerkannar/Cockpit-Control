using System;
using System.Collections.Concurrent;
using System.Net;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

class Program
{
    private static ConcurrentDictionary<string, WebSocket> _clients = new ConcurrentDictionary<string, WebSocket>();
    private static ConcurrentDictionary<string, int> _hostnameCounts = new ConcurrentDictionary<string, int>();

    static async Task Main(string[] args)
    {
        await StartWebSocketServer();
    }

    static async Task StartWebSocketServer()
    {
        var listener = new HttpListener();
        listener.Prefixes.Add("http://localhost:8765/");
        listener.Start();
        Logger.ClearLog();
        Logger.LogInfo("WebSocket server is listening on ws://localhost:8765");

        while (true)
        {
            HttpListenerContext context = await listener.GetContextAsync();
            if (context.Request.IsWebSocketRequest)
            {
                HttpListenerWebSocketContext webSocketContext = await context.AcceptWebSocketAsync(null);
                WebSocket webSocket = webSocketContext.WebSocket;

                string clientId = GenerateClientId(Dns.GetHostName());
                _clients.TryAdd(clientId, webSocket);

                Logger.LogInfo($"Client connected: {clientId}");

                _ = HandleWebSocketConnection(clientId, webSocket);
            }
            else
            {
                context.Response.StatusCode = 400;
                context.Response.Close();
            }
        }
    }

    static string GenerateClientId(string hostname)
    {
        _hostnameCounts.TryGetValue(hostname, out int count);
        count++;
        _hostnameCounts[hostname] = count;

        return count > 1 ? $"{hostname}-{count}" : hostname;
    }

    static async Task HandleWebSocketConnection(string clientId, WebSocket webSocket)
    {
        var buffer = new byte[1024 * 4];

        try
        {
            while (webSocket.State == WebSocketState.Open)
            {
                WebSocketReceiveResult result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);

                if (result.MessageType == WebSocketMessageType.Text)
                {
                    string message = Encoding.UTF8.GetString(buffer, 0, result.Count);
                    Logger.LogDebug($"Received new message from {clientId}: \n {message}");

                    await ProcessMessage(clientId, message);
                }
                else if (result.MessageType == WebSocketMessageType.Close)
                {
                    await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closing", CancellationToken.None);
                    break;
                }
            }
        }
        catch (WebSocketException)
        {
            // Handle disconnection
        }
        finally
        {
            _clients.TryRemove(clientId, out _);
            Logger.LogInfo($"Client disconnected: {clientId}");
        }
    }

    static void UpdateHostnameCount(string clientId)
    {
        string hostname = clientId.Split('*')[0];
        if (_hostnameCounts.TryGetValue(hostname, out int count) && count > 0)
        {
            _hostnameCounts[hostname] = count - 1;
        }
    }

    static async Task ProcessMessage(string clientId, string message)
    {
        try
        {
            var request = JsonSerializer.Deserialize<Request>(message);
            Response response;

            switch (request.Type)
            {
                case "ECHO":
                    response = new Response 
                    { 
                        Type = "ECHO_RESPONSE", 
                        Details = new MessageDetails 
                        { 
                            Panel = request.Details.Panel, 
                            Element = request.Details.Element, 
                            Value = request.Details.Value
                        } 
                    };
                    break;
                case "UPDATE_CLIENTS":
                case "BROADCAST_REQUEST":
                    await BroadcastMessage(clientId, request.Details);
                    response = new Response
                    {
                        Type = "BROADCAST_RESPONSE",
                        Details = new MessageDetails
                        {
                            Panel = request.Details.Panel,
                            Element = request.Details.Element,
                            Value = request.Details.Value
                        }
                    };
                    break;
                default:
                    Logger.LogError($"Unknown request type received from {clientId}");
                    response = new Response 
                    { 
                        Type = "Default", 
                        Details = new MessageDetails 
                        { 
                            Panel = request.Details.Panel, 
                            Element = request.Details.Element, 
                            Value = request.Details.Value
                        } 
                    };
                    break;
            }

            //await SendToClient(clientId, JsonSerializer.Serialize(response));
        }
        catch (JsonException)
        {
            await SendToClient(clientId, JsonSerializer.Serialize(new Response {Type = "ECHO_RESPONSE", Details = new MessageDetails { Panel = "Fuel", Element = "PUMP_1_IN", Value = "True" } }));
        }
    }

    static async Task BroadcastMessage(string senderId, MessageDetails message)
    {
        //var broadcastMessage = new Response { Type = "BROADCAST", Data = $"From {senderId}: {message}" };
        var broadcastMessage = new Response 
            { 
            Type = "BROADCAST_RESPONSE", 
            Details = new MessageDetails 
            { 
                Panel = message.Panel, 
                Element = message.Element, 
                Value = message.Value 
            } 
        };
        var messageJson = JsonSerializer.Serialize(broadcastMessage);
        var tasks = new List<Task>();

        foreach (var client in _clients)
        {
            // Send to all clients exept the sender
            if (client.Key != senderId && client.Value.State == WebSocketState.Open)
            {
                tasks.Add(SendToClient(client.Key, messageJson));
            }
        }

        await Task.WhenAll(tasks);
    }

    static async Task SendToClient(string clientId, string message)
    {
        if (_clients.TryGetValue(clientId, out WebSocket client) && client.State == WebSocketState.Open)
        {
            byte[] messageBytes = Encoding.UTF8.GetBytes(message);
            await client.SendAsync(new ArraySegment<byte>(messageBytes), WebSocketMessageType.Text, true, CancellationToken.None);
        }
    }
}