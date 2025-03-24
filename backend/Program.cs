using System.Collections.Concurrent;
using System.Net;
using System.Net.WebSockets;
using System.Runtime.InteropServices;
using System.Text;
using OneSimLinkInterop;
using OneSimLinkManaged;
using BackEndServices.Configuration;
using BackEndServices.Interfaces;
using Microsoft.Extensions.Options;
using System.Text.Json;

using static System.Runtime.InteropServices.JavaScript.JSType;

class Program
{
    private static readonly ConcurrentDictionary<string, WebSocket> _clients = new ConcurrentDictionary<string, WebSocket>();
    private static          ConcurrentDictionary<string, int> _hostnameCounts = new ConcurrentDictionary<string, int>();
    private static          CMapKeyToBindDBSimElementItem _mapKeyToBindDBSimElementItemCurrent = new CMapKeyToBindDBSimElementItem();
    private static          CMapKeyToBindDBSimElementItem _mapKeyToBindDBSimElementItemPrevious = new CMapKeyToBindDBSimElementItem();
    private static          List<string> _listOfKeys = new List<string>();
    private static bool     _oneSimLinkInitSucceeded;
    private const  int      MaxClients = 10;



    static async Task Main(string[] args)
    {

        //await Task.Delay(10000);
        var oneSimLinkInitSucceed = await StartOneSimLink();

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

    public static async Task StartWebSocketServer()
    {
        var listener = new HttpListener();
        listener.Prefixes.Add("http://localhost:8765/");
        listener.Start();
        Logger.ClearLog();
        Logger.LogInfoGreen("WebSocket server is listening on ws://localhost:8765");

        while (true)
        {
            var context = await listener.GetContextAsync();
            if (context.Request.IsWebSocketRequest)
            {
                if (_clients.Count >= MaxClients)
                {
                    context.Response.StatusCode = 503; // Service Unavailable
                    context.Response.Close();
                    Logger.LogError("Maximum client limit reached. Connection rejected.");
                    continue;
                }

                var webSocketContext = await context.AcceptWebSocketAsync(null);
                var clientId = Guid.NewGuid().ToString().Split("-")[4]; // Unique client ID
                _clients.TryAdd(clientId, webSocketContext.WebSocket);
                Logger.LogInfoGreen($"Client connected: {clientId}");

                await SendMessagesWithDelay(clientId);

                _ = HandleWebSocketConnection(clientId, webSocketContext.WebSocket);
            }
            else
            {
                context.Response.StatusCode = 400; // Bad Request
                context.Response.Close();
            }
        }
    }

    private static async Task SendMessagesWithDelay(string clientId)
    {
        var numOfKeys = _listOfKeys.Count;
        List<MessageDetails> details = new List<MessageDetails>();

        foreach (var (key, index) in _listOfKeys.Select((value, i) => (value, i)))
        {
            var val = GetValueByKey(key);
            var bindElement = _mapKeyToBindDBSimElementItemCurrent.Search(key);
            bindElement.m_sValue = val;

            var Details = new MessageDetails
            {
                Panel = bindElement.m_sPanelName,
                Element = key,
                Value = val.Trim('\u0000')
            };

            details.Add(Details);
        }

        await UpdateClientOnStartup(clientId, details);

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

                    ProcessMessage(clientId, message);
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
            Logger.LogInfoYellow($"Client disconnected: {clientId}");
        }
    }

    static public void ProcessMessage(string clientId, string message)
    {
        try
        {
            var request = System.Text.Json.JsonSerializer.Deserialize<Request>(message);

            switch (request?.Type)
            {
                case "SET_NEW_VALUE":
                    Logger.LogDebug($"Received new message from App - Panel: {request.Details.Panel}, Element: {request.Details.Element}, Value: {request.Details.Value}");
                    SetValue(request.Details.Element, request.Details.Value);
                    //await Task.Delay(1);
                    break;

                default:
                    Logger.LogError($"Unknown request type received from {clientId}");
                    break;
            }
            return;
        }
        catch (System.Text.Json.JsonException)
        {
            return;
        }
    }

    static async Task BroadcastMessage(string senderId, List<MessageDetails> message)
    {
        var broadcastMessage = new Response
        {
            Type = "BROADCAST_RESPONSE",
            Details = message
        };
        var messageJson = System.Text.Json.JsonSerializer.Serialize(broadcastMessage);
        var messageJsonDetails = System.Text.Json.JsonSerializer.Serialize(broadcastMessage.Details);
        // Logger.LogDebug($"New Data received, Updating all clients. Data: {messageJsonDetails}");        
        var tasks = new List<Task>();

        foreach (var client in _clients)
        {
            // Send to all clients except the sender
            if (client.Value.State == WebSocketState.Open)
            {
                tasks.Add(SendToClient(client.Key, messageJson));
            }
        }

        await Task.WhenAll(tasks);
    }

    static async Task UpdateClientOnStartup(string senderId, List<MessageDetails> message)
    {
        var broadcastMessage = new Response
        {
            Type = "UPDATE_CLIENT_ON_STARTUP",
            Details = message
        };
        var messageJson = System.Text.Json.JsonSerializer.Serialize(broadcastMessage);
        var messageJsonDetails = System.Text.Json.JsonSerializer.Serialize(broadcastMessage.Details);
        Logger.LogInfoGreen($"Update client {senderId} on startup. Data: {messageJsonDetails}");
        //var tasks = new List<Task>();

        //tasks.Add(SendToClient(senderId, messageJson));

        //await Task.WhenAll(tasks);
        await SendToClient(senderId, messageJson);
    }



    static async Task SendToClient(string clientId, string message)
    {
        //Logger.LogDebug("Send to client start");

        if (_clients.TryGetValue(clientId, out WebSocket client) && client.State == WebSocketState.Open)
        {
            //Logger.LogDebug("Send to client start - ws open");

            byte[] messageBytes = Encoding.UTF8.GetBytes(message);

            // Define a timeout for the operation
            using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(5)); // 5-second timeout

            try
            {
                await Task.Delay(100, cts.Token); // Optional delay with cancellation support
                await client.SendAsync(new ArraySegment<byte>(messageBytes), WebSocketMessageType.Text, true, cts.Token);
            }
            catch (OperationCanceledException)
            {
                Logger.LogWarning($"Send operation canceled for client {clientId}. Possible timeout.");
            }
            catch (WebSocketException ex)
            {
                if (ex.InnerException != null)
                {
                    Logger.LogError($"WebSocketException for client {clientId}: {ex.Message}");
                    Logger.LogError($"WebSocketException for client {clientId}: Inner exception: {ex.InnerException.Message}");
                }
                else
                {
                    Logger.LogError($"WebSocketException for client {clientId}: {ex.Message}");
                }
            }
            catch (Exception ex)
            {
                Logger.LogError($"Unexpected exception for client {clientId}: {ex.Message}");
            }
        }
        else
        {
            //Logger.LogDebug("Send to client start - ws close");
        }

        //Logger.LogDebug("Send to client end");
    }


    private static async Task<bool> StartOneSimLink()
    {
        //_oneSimLinkInitSucceeded = OneSimLink.OneSimLinkStartup();
        _oneSimLinkInitSucceeded = OneSimLinkManaged.Simulation.Instance.OneSimLinkStartup(true);

        if (!_oneSimLinkInitSucceeded)
        {
            Logger.LogError("OneSimLink Init Failed, Exit...");
            return false;
        }
        else
        {
            Logger.LogInfoGreen("OneSimLinkManaged Stratup Succeeded!");
            OneSimLinkManaged.Simulation.Instance.WaitForSystemReadyAsync().Wait();
            OneSimLinkManaged.SimStateType simState = OneSimLinkManaged.Simulation.Instance.GetSimState();
            while (simState != SimStateType.STATE_STOP && simState != SimStateType.STATE_RUN)
            {
                simState = OneSimLinkManaged.Simulation.Instance.GetSimState();
                await Task.Delay(100);
            }
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
                string configFilePath = @"..\\..\\..\\..\\..\\config\\backendConfig.txt";
                string[] arrFileNames;

                try
                {
                    // Attempt to read all lines from the file
                    arrFileNames = File.ReadAllLines(configFilePath);
                    Logger.LogInfoGreen("File read successfully.");
                }
                catch (FileNotFoundException ex)
                {
                    // Handle file not found error
                    Logger.LogError($"Error: The file was not found. Details: {ex.Message}");
                    arrFileNames = Array.Empty<string>(); // Initialize with an empty array to avoid null
                }
                catch (UnauthorizedAccessException ex)
                {
                    // Handle lack of access permissions
                    Logger.LogError($"Error: Access to the file is denied. Details: {ex.Message}");
                    arrFileNames = Array.Empty<string>();
                }
                catch (Exception ex)
                {
                    // Handle any other exceptions
                    Logger.LogError($"An unexpected error occurred: {ex.Message}");
                    arrFileNames = Array.Empty<string>();
                }

                foreach (string sConfigFile in arrFileNames)
                {
                    // ===========================
                    // Read Json Config File
                    // ===========================
                    string jsonString = File.ReadAllText(sConfigFile);
                    Logger.LogDebug($"Read map file: {Path.GetFileName(sConfigFile)}");

                    // ==============================
                    // Deserialize Object
                    // ==============================
                    
                    try
                    {
                        // Deserialize JSON to a list of BasicDataBackend

                        using JsonDocument document = JsonDocument.Parse(jsonString);
                        // Extract the "backend" property from each top-level object
                        var dataList = new List<Backend>();

                        foreach (var element in document.RootElement.EnumerateArray())
                        {
                            if (element.TryGetProperty("backend", out var backendElement))
                            {
                                var backend = JsonSerializer.Deserialize<Backend>(backendElement.GetRawText(), new JsonSerializerOptions
                                {
                                    PropertyNameCaseInsensitive = true
                                });

                                if (backend != null)
                                {
                                    dataList.Add(backend);
                                }
                            }
                        }

                        if (dataList != null)
                        {
                            foreach (var data in dataList)
                            {
                                //Console.WriteLine($"Key: {data.backend.key}");
                                // Access other properties within backend as needed
                                string sKey = data.key;

                                if (data.dbsimProps != null)
                                {
                                    foreach (var operation in data.dbsimProps)
                                    {
                                        if (operation.blockName == null ||
                                            operation.elementName == null ||
                                            operation.elementType == null)
                                        {
                                            Logger.LogError("Check DBSIM props. blockName, elementname or elementType is missing");
                                            continue;
                                        }

                                        CBindDBSimElementItem cBindDBSimElementItem = new CBindDBSimElementItem();
                                        cBindDBSimElementItem.cConfig.StationName = stationName;
                                        cBindDBSimElementItem.cConfig.BlockName = operation.blockName;
                                        cBindDBSimElementItem.cConfig.ElementName = operation.elementName;
                                        cBindDBSimElementItem.cConfig.ElementType = operation.elementType;

                                        string sBlockFullName = $"{stationName}.{operation.blockName}";
                                        string sElementFullName = $"{sBlockFullName}.{operation.elementName}";

                                        // Try to get block and element - if one of them does not exist, report and continue to the next one
                                        try
                                        {
                                            OneSimLinkManaged.IBlock tempBlock = OneSimLinkManaged.Simulation.Instance.BlockManager.GetBlock(sBlockFullName);
                                        }
                                        catch (Exception exc)
                                        {
                                            Logger.LogError($"{exc.Message}, Can't GetBlock of key: {sKey}");
                                            continue;
                                        }

                                        try
                                        {
                                            OneSimLinkManaged.IElement tempElement = OneSimLinkManaged.Simulation.Instance.ElementManager.GetElement(sElementFullName);
                                        }
                                        catch (Exception exc)
                                        {
                                            Logger.LogError($"{exc.Message}, Can't GetElement of key: {sKey}");
                                            continue;
                                        }

                                        OneSimLinkManaged.IBlock block = OneSimLinkManaged.Simulation.Instance.BlockManager.GetBlock(sBlockFullName);
                                        OneSimLinkManaged.IElement element = OneSimLinkManaged.Simulation.Instance.ElementManager.GetElement(sElementFullName);

                                        cBindDBSimElementItem.m_cBlockData = block;
                                        cBindDBSimElementItem.m_cElementData = element;
                                        cBindDBSimElementItem.m_sPanelName = Path.GetFileNameWithoutExtension(sConfigFile);
                                        cBindDBSimElementItem.m_sValue = await element.GetValueAsync() ; 

                                        if ((block != null) && (element != null))
                                        {
                                            if (operation.operationType == "Injection")
                                            {
                                                Logger.LogDebugModified($"{sKey + "_Injection"} mapped to: {operation.blockName}.{operation.elementName}, Type: {operation.elementType}", "Injection");
                                                _mapKeyToBindDBSimElementItemCurrent.Add(sKey + "_Injection", cBindDBSimElementItem);
                                                _mapKeyToBindDBSimElementItemPrevious.Add(sKey + "_Injection", cBindDBSimElementItem);
                                            }
                                            else if (operation.operationType == "Monitor")// operation.operationType == "Monitor" 
                                            {
                                                Logger.LogDebugModified($"{sKey + "_Monitor"} mapped to: {operation.blockName}.{operation.elementName}, Type: {operation.elementType}", "Monitor");
                                                // Add only monitor list of keys that are scanned for a change
                                                _listOfKeys.Add(sKey + "_Monitor");
                                                _mapKeyToBindDBSimElementItemCurrent.Add(sKey + "_Monitor", cBindDBSimElementItem);
                                                _mapKeyToBindDBSimElementItemPrevious.Add(sKey + "_Monitor", cBindDBSimElementItem);
                                            }
                                            else  // operation.operationType is empty is both "Monitor" and "Injection
                                            {
                                                // First map "Injection"
                                                Logger.LogDebugModified($"{sKey + "_Injection"} mapped to: {operation.blockName}.{operation.elementName}, Type: {operation.elementType}", "Injection");
                                                _mapKeyToBindDBSimElementItemCurrent.Add(sKey + "_Injection", cBindDBSimElementItem);
                                                _mapKeyToBindDBSimElementItemPrevious.Add(sKey + "_Injection", cBindDBSimElementItem);
                                                // Then, map "Monitor"
                                                Logger.LogDebugModified($"{sKey + "_Monitor"} mapped to: {operation.blockName}.{operation.elementName}, Type: {operation.elementType}", "Monitor");
                                                // Add only monitor list of keys that are scanned for a change
                                                _listOfKeys.Add(sKey + "_Monitor");
                                                _mapKeyToBindDBSimElementItemCurrent.Add(sKey + "_Monitor", cBindDBSimElementItem);
                                                _mapKeyToBindDBSimElementItemPrevious.Add(sKey + "_Monitor", cBindDBSimElementItem);
                                            }
                                        }
                                        else
                                        {
                                            if (operation.operationType == "Monitor")
                                            {
                                                Logger.LogError($"{sKey + "_Monitor"} unable to map to: {operation.blockName}.{operation.elementName}, Type: {operation.elementType}");
                                            }
                                            else if (operation.operationType == "Injection")
                                            {
                                                Logger.LogError($"{sKey + "_Injection"} unable to map to: {operation.blockName}.{operation.elementName}, Type: {operation.elementType}");
                                            }
                                            else
                                            {
                                                Logger.LogError($"{sKey} Does't contain 'Monitor' or 'Injection', unable to map: {operation.blockName}.{operation.elementName}, Type: {operation.elementType}. Check configuration...");
                                            }
                                        }
                                    }
                                }              
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        Logger.LogError($"Error deserializing JSON: {ex.Message}");
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
            Thread.Sleep(100);
        }
    }

    public static string GetValueByKey(string sKey)
    {
        string sResult = "";
        CBindDBSimElementItem cBindDBSimElementItem = _mapKeyToBindDBSimElementItemCurrent.Search(sKey);

        if (cBindDBSimElementItem == null)
        {
            return sResult;
        }
        else
        {
            if(cBindDBSimElementItem.cConfig.ElementType != null)
            {
                sResult = cBindDBSimElementItem.m_cElementData.GetValue();
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

            // Wait for a period (10msec) before checking again
            await Task.Delay(TimeSpan.FromSeconds(0.1));

        }
    }

    static async Task CheckDBSIMChanges()
    {
        try
        {
            //var details = new MessageDetails [];
            List<MessageDetails> details = new List<MessageDetails>();
            var count = 0;
            foreach (var (key, index) in _listOfKeys.Select((value, i) => (value, i)))
            {
                var val = GetValueByKey(key);
                var bindElement = _mapKeyToBindDBSimElementItemCurrent.Search(key);
                if (bindElement== null || val == bindElement.m_sValue || val == null) continue;
                count++;
                Logger.LogDebug($"Panel: {bindElement.m_sPanelName}, Element: {key}, Value: {val}");
                bindElement.m_sValue = val;
                var Details = new MessageDetails
                {
                    Panel = bindElement.m_sPanelName,
                    Element = key,
                    Value = val.Trim('\u0000')
                };
                details.Add(Details);
            }
            if (count > 0)
            {
                await BroadcastMessage("clientId", details);
            }
        }
        catch (Exception ex)
        {
            Logger.LogError($"An error occurred: {ex.Message}");
        }
    }


    public static async void SetValue(string key, string value)
    {
        if (_mapKeyToBindDBSimElementItemCurrent == null) return;

        CBindDBSimElementItem cBindDBSimElementItem = _mapKeyToBindDBSimElementItemCurrent.Search(key);

        if (cBindDBSimElementItem != null)
        {
            cBindDBSimElementItem.m_cElementData.SetValue(value);
            await Task.Delay(100);
        }
    }

}
