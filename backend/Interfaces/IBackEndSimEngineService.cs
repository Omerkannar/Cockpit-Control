using BackEndServices.Utils;
using BackEndServices.Configuration;
using BackEndServices.Utilities;
using System.ComponentModel;
using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace BackEndServices.Interfaces
{

    // Define the BasicDataBackend class to only include the backend object
    public class BasicDataBackend
    {
        public string type { get; set; } 
        public Backend backend { get; set; }
        public object component { get; set; } 
    }

    public class Backend
    {
        public string key { get; set; }

        [JsonConverter(typeof(SingleOrArrayConverter<DbsimProps>))]
        public List<DbsimProps> dbsimProps { get; set; }
    }

    public class DbsimProps
    {
        public string operationType { get; set; }
        public string stationName { get; set; }
        public string blockName { get; set; }
        public string elementName { get; set; }
        public string elementType { get; set; }
        public object? enumMapping { get; set; }
    }
}
