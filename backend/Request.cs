using System;

public class Request : IWebSocketMessage
{
    public string Type { get; set; }
    //public string RequestedClient { get; set; }
    public MessageDetails Details { get; set; }
}