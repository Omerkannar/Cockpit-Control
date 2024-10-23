using System;
using System.IO;

public static class Logger
{
    private static readonly string logFilePath = "log.txt";  // Define the log file path

    public static void LogInfo(string message)
    {
        LogMessage("INF", message, ConsoleColor.Green);
    }

    public static void LogError(string message)
    {
        LogMessage("ERR", message, ConsoleColor.Red);
    }

    public static void LogWarning(string message)
    {
        LogMessage("WRN", message, ConsoleColor.Yellow);
    }

    public static void LogDebug(string message)
    {
        LogMessage("DBG", message, ConsoleColor.Gray);
    }

    public static void ClearLog()
    {
        File.Delete("C:\\Temp\\CC_Log.txt");
    }

    private static void LogMessage(string logLevel, string message, ConsoleColor color)
    {
        string timeStamp = DateTime.Now.ToString("yy-MM-dd HH:mm:ss.ffff");  // Add timestamp
        int maxLogLevelLength = 3; // Length of longest log level (e.g., "[WRN]")

        // Format the log level inside brackets without adding spaces inside the brackets
        string formattedLogLevel = $"[{logLevel}]".PadRight(maxLogLevelLength + 2); // +2 for the brackets

        // Construct the log entry with consistent spacing
        string log = $"[{timeStamp}] {formattedLogLevel} {message}";

        // Output to console
        Console.ForegroundColor = color;
        Console.WriteLine(log);
        Console.ResetColor();

        // Write log to file
        //AppendLogToFile(log);
    }

    private static void AppendLogToFile(string log)
    {
        try
        {
            File.AppendAllText("C:\\Temp\\CC_Log.txt", log + Environment.NewLine);  // Append log with a newline
        }
        catch (Exception ex)
        {
            // Handle any errors that occur during file write
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine($"[ERROR] Failed to write log to file: {ex.Message}");
            Console.ResetColor();
        }
    }
}
