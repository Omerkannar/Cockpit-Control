using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
//using Swashbuckle.AspNetCore.Annotations;

namespace BackEndServices.Types
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum MotionState
    {
        Off = 0,
        On
    }

    public class MotionPlatformStatus
    {
        //[SwaggerSchema("The counter")]
        public int Counter { get; set; }
    }
}
