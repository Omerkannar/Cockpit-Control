using System;
using System.Collections.Concurrent;
using System.Net;
using System.Net.WebSockets;
using System.Runtime.InteropServices;
using System.Text;
using System.IO;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using BackEndServices.Configuration;

//using BackEndServices.Models;
using BackEndServices.Interfaces;
using BackEndServices.Services;
using Newtonsoft.Json.Serialization;
using BackEndServices.Utilities;
using Newtonsoft.Json;
using OneSimLinkInterop;


class Program
{
    private static ConcurrentDictionary<string, WebSocket> _clients = new ConcurrentDictionary<string, WebSocket>();
    private static ConcurrentDictionary<string, int> _hostnameCounts = new ConcurrentDictionary<string, int>();
    private static CMapKeyToBindDBSimElementItem _mapKeyToBindDBSimElementItemCurrent = new CMapKeyToBindDBSimElementItem();
    private static CMapKeyToBindDBSimElementItem _mapKeyToBindDBSimElementItemPrevious = new CMapKeyToBindDBSimElementItem();
    private static List<string> _listOfKeys = new List<string>();
    private static DbSimElementUtils _DbSimElementUtils = new DbSimElementUtils();
    private static bool _oneSimLinkInitSucceeded;



    static async Task Main(string[] args)
    {

        //await Task.Delay(10000);
        var oneSimLinkInitSucceed = StartOneSimLink();

        if (oneSimLinkInitSucceed)
        {
            var webSocketServerTask = StartWebSocketServer();
            var checkDbChangesTask = PeriodicallyCheckDBSIMChanges();

            await Task.WhenAll(webSocketServerTask, checkDbChangesTask); // Run both tasks concurrently
        }
        else
        {
            return;
        }
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
                    //Logger.LogDebug($"Received new message from {clientId}: \n {message}");

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
            var request = System.Text.Json.JsonSerializer.Deserialize<Request>(message);
            Response response;

            switch (request?.Type)
            {
                //case "ECHO":
                //    response = new Response 
                //    { 
                //        Type = "ECHO_RESPONSE", 
                //        Details = new MessageDetails 
                //        { 
                //            Panel = request.Details.Panel, 
                //            Element = request.Details.Element, 
                //            Value = request.Details.Value
                //        } 
                //    };
                //    break;
                case "SET_NEW_VALUE":
                    Logger.LogDebug($"Received new message {request.Details.Element}, {request.Details.Value}");
                    SetValue(request.Details.Element, int.Parse(request.Details.Value));
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
        catch (System.Text.Json.JsonException)
        {
            await SendToClient(clientId, System.Text.Json.JsonSerializer.Serialize(new Response {Type = "ECHO_RESPONSE", Details = new MessageDetails { Panel = "Fuel", Element = "PUMP_1_IN", Value = "True" } }));
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
        var messageJson = System.Text.Json.JsonSerializer.Serialize(broadcastMessage);
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

    private static bool StartOneSimLink()
    {
        _oneSimLinkInitSucceeded = OneSimLink.OneSimLinkStartup();

        if (!_oneSimLinkInitSucceeded)
        {
            Logger.LogError("OneSimLink Init Failed, Exit...");
            return false;
        } else
        {
            Logger.LogInfo("OneSimLink Init Succeeded!");
        }

        // =========================
        // General Global Registration
        // =========================
        {
            var stationId = OneSimLink.GetOwnStationId();
            var stationNamePtr = OneSimLink.GetStationNameById(stationId);
            var stationName = Marshal.PtrToStringAnsi(stationNamePtr);

            if (stationName != null)
            {
                Logger.LogDebug("Start Reading map files...");
                string configFilePath = "C:\\Users\\ATH_O\\Documents\\OmerK\\WebSocket\\Cockpit-Control\\config\\backend.config";
                string[] arrFileNames = File.ReadAllLines(configFilePath);

                foreach (string sConfigFile in arrFileNames)
                {
                    // ===========================
                    // Read Json Config File
                    // ===========================
                    string jsonString = File.ReadAllText(sConfigFile);
                    Logger.LogDebug($"Read map file: {Path.GetFileName(sConfigFile)}");

                    // =============================
                    // Deserialize Object
                    // =============================
                    // Deserialize JSON to a list of BasicDataBackend
                    var dataList = System.Text.Json.JsonSerializer.Deserialize<List<BasicDataBackend>>(jsonString);

                    if (dataList != null)
                    {
                        foreach (var data in dataList)
                        {
                            //Console.WriteLine($"Key: {data.backend.key}");
                            // Access other properties within backend as needed
                            string sKey = data.backend.key;
                            CBindDBSimElementItem cBindDBSimElementItem = new CBindDBSimElementItem();
                            cBindDBSimElementItem.cConfig.StationName = stationName;
                            cBindDBSimElementItem.cConfig.BlockName = data.backend.dbsimProps.blockName;
                            cBindDBSimElementItem.cConfig.ElementName = data.backend.dbsimProps.elementName;
                            cBindDBSimElementItem.cConfig.ElementType = data.backend.dbsimProps.elementType;

                            string sBlockFullName = $"{stationName}.{data.backend.dbsimProps.blockName}";

                            cBindDBSimElementItem.m_nStationBlockID = OneSimLink.GetBlockIdByName(sBlockFullName);
                            cBindDBSimElementItem.m_nElementID = OneSimLink.RegisterElement(sBlockFullName, cBindDBSimElementItem.cConfig.ElementName);
                            cBindDBSimElementItem.m_sValue = _DbSimElementUtils.GetStringValue((uint)cBindDBSimElementItem.m_nElementID, 1024);

                            if ((cBindDBSimElementItem.m_nStationBlockID != -1) && (cBindDBSimElementItem.m_nElementID != -1))
                            {
                                Logger.LogDebug($"Key: {sKey} -> Block: {data.backend.dbsimProps.blockName}, Element: {data.backend.dbsimProps.elementName}, Type: {data.backend.dbsimProps.elementType}");
                                _listOfKeys.Add(sKey);
                                _mapKeyToBindDBSimElementItemCurrent.Add(sKey, cBindDBSimElementItem);
                                _mapKeyToBindDBSimElementItemPrevious.Add(sKey, cBindDBSimElementItem);
                            }

                        }
                    }
                }
            }
        }

        // =========================
        // Start Local Service Thread
        // =========================
        Thread cLocalServiceThread = new Thread(new ParameterizedThreadStart(OneSimLinkWork));
        cLocalServiceThread.Start();
        return true;
    }

    public static void OneSimLinkWork(object obj)
    {

        while (true)
        {
            OneSimLink.ServerUpdate();
            //OneSimLink.IsTriggeredForElementChanges(GetValueByKey("fgdh"));
            Thread.Sleep(100);
        }
    }

    public static string GetValueByKey(string sKey)
    {
        string sResult = "";
        CBindDBSimElementItem cBindDBSimElementItem = _mapKeyToBindDBSimElementItemCurrent.Search(sKey);

        if (cBindDBSimElementItem == null)
        {
            //System.Console.WriteLine("Error : Can't find {0} in configuration file\n", sKey);
            return sResult;
        }
        else
        {
            if (cBindDBSimElementItem.cConfig.ElementType.Equals("Double"))
            {
                double dResult = _DbSimElementUtils.GetDoubleValue((uint)cBindDBSimElementItem.m_nElementID);
                sResult = dResult.ToString();
            }
            else if (cBindDBSimElementItem.cConfig.ElementType.Equals("Float"))
            {
                float fResult = _DbSimElementUtils.GetFloatValue((uint)cBindDBSimElementItem.m_nElementID);
                sResult = fResult.ToString();
            }
            else if (cBindDBSimElementItem.cConfig.ElementType.Equals("Integer"))
            {
                int nResult = _DbSimElementUtils.GetIntValue((uint)cBindDBSimElementItem.m_nElementID);
                sResult = nResult.ToString();
            }
            else if (cBindDBSimElementItem.cConfig.ElementType.Equals("Boolean"))
            {
                bool bResult = _DbSimElementUtils.GetBooleanValue((uint)cBindDBSimElementItem.m_nElementID);
                sResult = bResult.ToString();
            }
            else if (cBindDBSimElementItem.cConfig.ElementType.Equals("String"))
            {
                sResult = _DbSimElementUtils.GetStringValue((uint)cBindDBSimElementItem.m_nElementID, 1024);
            }

            return sResult;
        }
    }

    static async Task PeriodicallyCheckDBSIMChanges()
    {
        Logger.LogDebug("Started checking DBSIM changes periodically.");
        while (true)
        {
            await CheckDBSIMChanges();

            // Wait for a period (e.g., 10 seconds) before checking again
            await Task.Delay(TimeSpan.FromSeconds(0.1));
        }
    }

    static async Task CheckDBSIMChanges()
    {
        try
        {
            foreach (string key in _listOfKeys)
            {
                var val = GetValueByKey(key);
                var bindElement = _mapKeyToBindDBSimElementItemCurrent.Search(key);
                if (val == null || val == bindElement.m_sValue) continue;
                Logger.LogDebug($"Panel: {bindElement.cConfig.BlockName.Split(".")[1]}, Element: {key}, Value: {val}");
                bindElement.m_sValue = val;
                var Details = new MessageDetails
                {
                    Panel = bindElement.cConfig.BlockName.Split(".")[1],
                    Element = key,
                    Value = val.Trim('\u0000')
                };
                await BroadcastMessage("clientId", Details);
            }
        }
        catch (Exception ex)
        {
            Logger.LogError($"An error occurred: {ex.Message}");
        }
    }


    public static void SetValue(string key, int value)
    {
        CBindDBSimElementItem cBindDBSimElementItem = _mapKeyToBindDBSimElementItemCurrent.Search(key);

        if (cBindDBSimElementItem != null)
            _DbSimElementUtils.SetIntValue((uint)cBindDBSimElementItem.m_nElementID, value); 
    }

}