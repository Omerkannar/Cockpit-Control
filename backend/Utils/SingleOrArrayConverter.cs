using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Text.Json.Serialization;


namespace BackEndServices.Utils
{
    public class SingleOrArrayConverter<T>: JsonConverter<List<T>>
    {
        public override List<T> Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            var result = new List<T>();

            if (reader.TokenType == JsonTokenType.StartArray)
            {
                // If it's an array, deserialize normally
                while (reader.Read() && reader.TokenType != JsonTokenType.EndArray)
                {
                    var item = JsonSerializer.Deserialize<T>(ref reader, options);
                    if (item != null)
                    {
                        result.Add(item);
                    }
                }
            }
            else
            {
                // If it's a single object, deserialize it and add to the list
                var singleItem = JsonSerializer.Deserialize<T>(ref reader, options);
                if (singleItem != null)
                {
                    result.Add(singleItem);
                }
            }

            return result;
        }

        public override void Write(Utf8JsonWriter writer, List<T> value, JsonSerializerOptions options)
        {
            throw new NotImplementedException("Serialization is not implemented.");
        }

    }
}
