using System;
using System.IO;

public static class Logger
{
    private static readonly string logFilePath = "log.txt";  // Define the log file path

    public static void LogInfo(string message)
    {
        LogMessage("INFO", message, ConsoleColor.Green);
    }

    public static void LogError(string message)
    {
        LogMessage("ERROR", message, ConsoleColor.Red);
    }

    public static void LogWarning(string message)
    {
        LogMessage("WARNING", message, ConsoleColor.Yellow);
    }

    public static void LogDebug(string message)
    {
        LogMessage("DEBUG", message, ConsoleColor.Gray);
    }

    public static void ClearLog()
    {
        File.Delete("C:\\Temp\\CC_Log.txt");
    }

    private static void LogMessage(string logLevel, string message, ConsoleColor color)
    {
        string timeStamp = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");  // Add timestamp
        string log = $"[{timeStamp}] [{logLevel}]\t {message}";

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
