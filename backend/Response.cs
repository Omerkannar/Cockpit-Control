using System;


public class Response : IWebSocketMessage
{
    public string Type { get; set; }
    public MessageDetails Details { get; set; }
}