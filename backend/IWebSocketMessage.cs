using System;

public struct MessageDetails
{
    public string Panel { get; set; }
    public string Element { get; set; }
    public string Value { get; set; }
}

public interface IWebSocketMessage
{
    string Type { get; set; }
    MessageDetails Details { get; set; }
}