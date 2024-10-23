using Microsoft.Extensions.Logging;
using OneSimLinkInterop;
using System.Runtime.InteropServices;
using System;

namespace ATH_BackEndServices.Utilities
{
    public class DbSimElementUtils
    {
        //private readonly ILogger<DbSimElementUtils> //_logger;

        public DbSimElementUtils()
        {
            
        }

        public bool GetBooleanValue(uint elementID)
        {
            var valueBytes = new byte[1];
            var succeeded = true;
            OneSimLink.ErrorType et = OneSimLink.ErrorType.ERROR_NONE;
            succeeded &= OneSimLink.GetElementEngValue(ref et, elementID, valueBytes, (uint)valueBytes.Length);
            if (succeeded)
            {
                var elementValue = BitConverter.ToBoolean(valueBytes);
                return elementValue;
            }
            else
            {
                //_logger.Log(LogLevel.Error, $"Error reading value of element {elementID}");
                return false;
            }
        }

        public int GetIntValue(uint elementID)
        {
            var valueBytes = new byte[4];
            var succeeded = true;
            OneSimLink.ErrorType et = OneSimLink.ErrorType.ERROR_NONE;
            succeeded &= OneSimLink.GetElementEngValue(ref et, elementID, valueBytes, (uint)valueBytes.Length);
            if (succeeded)
            {
                var elementValue = BitConverter.ToInt32(valueBytes);
                return elementValue;
            }
            else
            {
               // //_logger.Log(LogLevel.Error, $"Error reading value of element {elementID}");
                return 0;
            }
        }

        public double GetDoubleValue(uint elementID)
        {
            var valueBytes = new byte[8];
            var succeeded = true;
            OneSimLink.ErrorType et = OneSimLink.ErrorType.ERROR_NONE;
            succeeded &= OneSimLink.GetElementEngValue(ref et, elementID, valueBytes, (uint)valueBytes.Length);
            if (succeeded)
            {
                var elementValue = BitConverter.ToDouble(valueBytes);
                return elementValue;
            }
            else
            {
               // //_logger.Log(LogLevel.Error, $"Error reading value of element {elementID}");
                return 0;
            }
        }

        public float GetFloatValue(uint elementID)
        {
            var valueBytes = new byte[4];
            var succeeded = true;
            OneSimLink.ErrorType et = OneSimLink.ErrorType.ERROR_NONE;
            succeeded &= OneSimLink.GetElementEngValue(ref et, elementID, valueBytes, (uint)valueBytes.Length);
            if (succeeded)
            {
                var elementValue = BitConverter.ToSingle(valueBytes);
                return elementValue;
            }
            else
            {
               // //_logger.Log(LogLevel.Error, $"Error reading value of element {elementID}");
                return 0;
            }
        }

        public string GetStringValue(uint elementID, uint maxLength)
        {
            var valueBytes = new byte[maxLength];
            var succeeded = true;
            OneSimLink.ErrorType et = OneSimLink.ErrorType.ERROR_NONE;
            succeeded &= OneSimLink.GetElementEngValue(ref et, elementID, valueBytes, (uint)valueBytes.Length);
            if (succeeded)
            {
                return System.Text.ASCIIEncoding.ASCII.GetString(valueBytes);
            }
            else
            {
                //_logger.Log(LogLevel.Error, $"Error reading value of element {elementID}");
                return string.Empty;
            }
        }

        public void SetFloatValue(uint elementID, float value)
        {
            var valueBytes = BitConverter.GetBytes(value);
            var succeeded = true;
            OneSimLink.ErrorType et = OneSimLink.ErrorType.ERROR_NONE;
            succeeded &= OneSimLink.SetElementEngValueRequest(ref et, elementID, valueBytes, (uint)valueBytes.Length);
            if (!succeeded)
            {
                //_logger.Log(LogLevel.Error, $"Error reading value of element {elementID}");
            }
        }

        public void SetIntValue(uint elementID, int value)
        {
            var valueBytes = BitConverter.GetBytes(value);
            var succeeded = true;
            OneSimLink.ErrorType et = OneSimLink.ErrorType.ERROR_NONE;
            succeeded &= OneSimLink.SetElementEngValueRequest(ref et, elementID, valueBytes, (uint)valueBytes.Length);
            if (!succeeded)
            {
                //_logger.Log(LogLevel.Error, $"Error reading value of element {elementID}");
            }
        }

        public void SetBoolValue(uint elementID, bool value)
        {
            var valueBytes = BitConverter.GetBytes(value);
            var succeeded = true;
            OneSimLink.ErrorType et = OneSimLink.ErrorType.ERROR_NONE;
            succeeded &= OneSimLink.SetElementEngValueRequest(ref et, elementID, valueBytes, (uint)valueBytes.Length);
            if (!succeeded)
            {
                //_logger.Log(LogLevel.Error, $"Error reading value of element {elementID}");
            }
        }

        public void SetDoubleValue(uint elementID, double value)
        {
            var valueBytes = BitConverter.GetBytes(value);
            var succeeded = true;
            OneSimLink.ErrorType et = OneSimLink.ErrorType.ERROR_NONE;
            succeeded &= OneSimLink.SetElementEngValueRequest(ref et, elementID, valueBytes, (uint)valueBytes.Length);
            if (!succeeded)
            {
                //_logger.Log(LogLevel.Error, $"Error reading value of element {elementID}");
            }
        }

        public void SetStringValue(uint elementID, string value)
        {
            var succeeded = true;
            OneSimLink.ErrorType et = OneSimLink.ErrorType.ERROR_NONE;
            var valueBytes = System.Text.ASCIIEncoding.ASCII.GetBytes(value);
            succeeded &= OneSimLink.SetElementEngValueRequest(ref et, elementID, valueBytes, (uint)valueBytes.Length);
            if (!succeeded)
            {
                //_logger.Log(LogLevel.Error, $"Error reading value of element {elementID}");
            }
        }

        public void FireEventOwnshipReposition(double nLon, double nLat)
        {
            // ToDo
            //_logger.Log(LogLevel.Debug, $"Fire Event Ownship Reposition Lon = {nLon}, Lat {nLat}\n");
        }

        public void FireEventOwnshipMalfunction(string sMalfunctionName, bool bActive)
        {
            // ToDo 
            //_logger.Log(LogLevel.Debug, $"Fire Event Ownship Malfunction Name = {sMalfunctionName}, Active {bActive}\n");
        }

        public void FireEvent(string sEventName, string sEventId, string sEventClass, int nEventEntityId, List<string> lstEventParams)
        {
            if (OneSimLink.IsEventsMetaDataInitialized() != true)
            {
                //_logger.Log(LogLevel.Error, $"Error - Try Fire {0} Event, Simulation System Is Down... \n", sEventName);
                return;
            }

            //_logger.Log(LogLevel.Debug, $"Try Fire {0} Event ... \n", sEventName);

            var nStationId      = OneSimLink.GetOwnStationId();
            var sStationNamePtr = OneSimLink.GetStationNameById(nStationId);
            var sStationName    = Marshal.PtrToStringAnsi(sStationNamePtr);

            uint nEventId = (uint)OneSimLink.GetEventId(sEventId);
            uint nEventClassId = (uint)OneSimLink.GetEventClassId(sEventClass);
            int nStationNumber = -1; 
            OneSimLink.EventType eEventType = OneSimLink.EventType.EVENT_GROUP;
            string[] pElementValues = new string[lstEventParams.Count];
            for (int i = 0; i < lstEventParams.Count; i++)
            {
                pElementValues[i] = lstEventParams[i];
            }            

            if (OneSimLink.InjectEventEngRequest(nStationNumber, nEventId, nEventClassId, nEventEntityId, eEventType, pElementValues, (uint)pElementValues.Length) == true)
            {
                //_logger.Log(LogLevel.Debug, $"Fire {0} Event Success ... \n", sEventName);
                //System.Console.WriteLine("Fire {0} Event Success \n", sEventName);
            }
            else
            {
                //_logger.Log(LogLevel.Error, $"Fire {0} Event Error ... \n", sEventName);
                //System.Console.WriteLine("Fire {0} Event Error \n", sEventName);
            }
        }

        public void FireEventOwnshipConfiguration(int nEntityID = 0,
                                                  bool bFuelEnable = false,
                                                  int nFuelQuantity = 0,
                                                  bool bPayloadEnable = false,
                                                  int nPayload = 0,
                                                  bool bCG_enable = false,
                                                  double nCG_X = 0,
                                                  double nCG_Y = 0,
                                                  bool bWeightEnable = false,
                                                  int nWeightGross = 0)
        {
            //_logger.Log(LogLevel.Debug, $"Fire Event Ownship Configuration ... \n");

            if (OneSimLink.IsEventsMetaDataInitialized() == true)
            {
                var nStationId = OneSimLink.GetOwnStationId();
                var sStationNamePtr = OneSimLink.GetStationNameById(nStationId);
                var sStationName = Marshal.PtrToStringAnsi(sStationNamePtr);

                uint nEventId = (uint)OneSimLink.GetEventId("ATH_WEB_SET_OWNSHIP_CONFIGURATION");
                uint nEventClassId = (uint)OneSimLink.GetEventClassId("CEventATH_WEB_SetOwnshipConfiguration");
                int nStationNumber = -1; // OneSimLink.GetStationIdByName(sStationName);
                int nEventEntityId = -1;
                OneSimLink.EventType eEventType = OneSimLink.EventType.EVENT_GROUP;
                string[] pElementValues = new string[10];
                pElementValues[0] = nEntityID.ToString();                   // m_nEntityID
                pElementValues[1] = nFuelQuantity.ToString();               // m_nOwnship_FuelQuantity
                pElementValues[2] = bFuelEnable.ToString().ToLower();       // m_bOwnship_FuelQuantityEnable
                pElementValues[3] = nPayload.ToString();                    // m_nOwnship_Payload
                pElementValues[4] = bPayloadEnable.ToString().ToLower();    // m_bOwnship_PayloadEnable
                pElementValues[5] = nCG_X.ToString();                       // m_nOwnshipCG_X
                pElementValues[6] = nCG_Y.ToString();                       // m_nOwnshipCG_Y
                pElementValues[7] = bCG_enable.ToString().ToLower();        // m_bOwnshipCG_enable
                pElementValues[8] = nWeightGross.ToString();                // m_nOwnshipGross_Weight
                pElementValues[9] = bWeightEnable.ToString().ToLower();     // m_bOwnshipGross_WeightEnable

                if (OneSimLink.InjectEventEngRequest(nStationNumber, nEventId, nEventClassId, nEventEntityId, eEventType, pElementValues, (uint)pElementValues.Length) == true)
                {
                    //_logger.Log(LogLevel.Debug, $"Fire Event Ownship Configuration Success ... \n");
                }
                else
                {
                    //_logger.Log(LogLevel.Error, $"Fire Event Ownship Configuration Error ... \n");
                }
            }
        }

        public void FireEventOwnshipMalfunction(int nEntityID = 0,
                                                int nMalfunctionID = 0,
                                                string sMalfunctionCategory = "",
                                                string sMalfunctionName = "",
                                                string sMalfunctionParamAsString = "",
                                                int nMalfunctionParamAsNumber = 0,
                                                bool bMalfanctionActive = false)
        {
            //_logger.Log(LogLevel.Debug, $"Fire Event Ownship Malfunction ... \n");

            if (OneSimLink.IsEventsMetaDataInitialized() == true)
            {
                var nStationId = OneSimLink.GetOwnStationId();
                var sStationNamePtr = OneSimLink.GetStationNameById(nStationId);
                var sStationName = Marshal.PtrToStringAnsi(sStationNamePtr);

                uint nEventId = (uint)OneSimLink.GetEventId("ATH_WEB_SET_OWNSHIP_MALFUNCTION");
                uint nEventClassId = (uint)OneSimLink.GetEventClassId("CEventATH_WEB_SetOwnshipMalfunction");
                int nStationNumber = -1; // OneSimLink.GetStationIdByName(sStationName);
                int nEventEntityId = -1;
                OneSimLink.EventType eEventType = OneSimLink.EventType.EVENT_GROUP;
                string[] pElementValues = new string[7];
                pElementValues[0] = nEntityID.ToString();                       // m_nEntityID
                pElementValues[1] = nMalfunctionID.ToString();                  // m_nMalfunctonID
                pElementValues[2] = sMalfunctionCategory.ToString();            // m_sMalfunctonCategory
                pElementValues[3] = sMalfunctionName.ToString();                // m_sMalfunctonName
                pElementValues[4] = sMalfunctionParamAsString.ToString();       // m_sMalfunctonParamAsString
                pElementValues[5] = nMalfunctionParamAsNumber.ToString();       // m_sMalfunctonParamAsNumber
                pElementValues[6] = bMalfanctionActive.ToString().ToLower();    // m_bMalfanctonActive

                if (OneSimLink.InjectEventEngRequest(nStationNumber, nEventId, nEventClassId, nEventEntityId, eEventType, pElementValues, (uint)pElementValues.Length) == true)
                {
                    //_logger.Log(LogLevel.Debug, $"Fire Event Ownship Malfunction Success ... \n");
                }
                else
                {
                    //_logger.Log(LogLevel.Error, $"Fire Event Ownship Malfunction Error ... \n");
                }
            }
        }

        public void FireEventOwnshipRepositionByPreset(bool RepositionByPreset,
                                                 bool RepositionBySelectedPointOnMap,
                                                 bool RepositionByHeliPad,
                                                 string PresetName,
                                                 bool EngineOn,
                                                 bool OnAir,
                                                 bool OnGround,
                                                 int EntityID,
                                                 double Latitude,
                                                 double Longitude,
                                                 double AltitudeAboveTerrain,
                                                 double Heading,
                                                 double Velocity)
        {
            //_logger.Log(LogLevel.Debug, $"Fire Event Ownship Reposition By Preset ... \n");

            if (OneSimLink.IsEventsMetaDataInitialized() == true)
            {
                var nStationId      = OneSimLink.GetOwnStationId();
                var sStationNamePtr = OneSimLink.GetStationNameById(nStationId);
                var sStationName    = Marshal.PtrToStringAnsi(sStationNamePtr);

                uint nEventId      = (uint)OneSimLink.GetEventId("ATH_WEB_SET_OWNSHIP_POSITION");
                uint nEventClassId = (uint)OneSimLink.GetEventClassId("CEventATH_WEB_SetOwnshipPosition");
                int nStationNumber = -1; // OneSimLink.GetStationIdByName(sStationName);
                int nEventEntityId = -1;
                OneSimLink.EventType eEventType = OneSimLink.EventType.EVENT_GROUP;
                string[] pElementValues = new string[13];                
                pElementValues[0]  = (RepositionByPreset.ToString()).ToLower();                 // m_bRepositionByPreset
                pElementValues[1]  = (RepositionBySelectedPointOnMap.ToString()).ToLower();     // m_bRepositionBySelectedPointOnMap
                pElementValues[2]  = (RepositionByHeliPad.ToString()).ToLower();                // m_bRepositionByHeliPad
                pElementValues[3]  = PresetName;                                                // m_sPresetName
                pElementValues[4]  = (EngineOn.ToString()).ToLower();                           // m_bEngineOn
                pElementValues[5]  = (OnAir.ToString()).ToLower();                              // m_bOnAir
                pElementValues[6]  = (OnGround.ToString()).ToLower();                           // m_bOnGround
                pElementValues[7]  = (EntityID.ToString()).ToLower();                           // m_nEntityID
                pElementValues[8]  = (Latitude.ToString()).ToLower();                           // m_dLatitude
                pElementValues[9]  = (Longitude.ToString()).ToLower();                          // m_dLongitude
                pElementValues[10] = (AltitudeAboveTerrain.ToString()).ToLower();               // m_dAltitudeAboveTerrain
                pElementValues[11] = (Heading.ToString()).ToLower();                            // m_dHeading
                pElementValues[12] = (Velocity.ToString()).ToLower();                           // m_dVelocity

                if (OneSimLink.InjectEventEngRequest(nStationNumber, nEventId, nEventClassId, nEventEntityId, eEventType, pElementValues, (uint)pElementValues.Length) == true)
                {
                    //_logger.Log(LogLevel.Debug, $"Fire Event Ownship Reposition By Preset Success ... \n");
                }
                else
                {
                    //_logger.Log(LogLevel.Error, $"Fire Event Ownship Reposition By Preset Error ... \n");
                }
            }
        }

        public void FireEventByName(string sFileName)
        {
            //_logger.Log(LogLevel.Debug, $"Fire Event Ownship Reposition By Preset ... \n");

            if (OneSimLink.IsEventsMetaDataInitialized() == true)
            {
                var nStationId = OneSimLink.GetOwnStationId();
                var sStationNamePtr = OneSimLink.GetStationNameById(nStationId);
                var sStationName = Marshal.PtrToStringAnsi(sStationNamePtr);

                uint nEventId = (uint)OneSimLink.GetEventId("ATH_WEB_SET_OWNSHIP_POSITION");
                uint nEventClassId = (uint)OneSimLink.GetEventClassId("CEventATH_WEB_SetOwnshipPosition");
                int nStationNumber = -1; // OneSimLink.GetStationIdByName(sStationName);
                int nEventEntityId = -1;
                OneSimLink.EventType eEventType = OneSimLink.EventType.EVENT_GROUP;
                string[] pElementValues = new string[12];
                pElementValues[0] = "true";    // m_bRepositionByPreset
                pElementValues[1] = "false";   // m_bRepositionBySelectedPointOnMap
                pElementValues[2] = "false";   // m_bRepositionByHeliPad
                pElementValues[3] = sFileName; // m_sPresetName
                pElementValues[4] = "";        // m_bEngineOn
                pElementValues[5] = "";        // m_bOnAir
                pElementValues[6] = "";        // m_bOnGround
                pElementValues[7] = "";        // m_nEntityID
                pElementValues[8] = "";        // m_dLatitude
                pElementValues[9] = "";        // m_dLongitude
                pElementValues[10] = "";        // m_dAltitudeAboveTerrain
                pElementValues[11] = "";        // m_dHeading

                if (OneSimLink.InjectEventEngRequest(nStationNumber, nEventId, nEventClassId, nEventEntityId, eEventType, pElementValues, (uint)pElementValues.Length) == true)
                {
                    //_logger.Log(LogLevel.Debug, $"Fire Event Ownship Reposition By Preset Success ... \n");
                }
                else
                {
                    //_logger.Log(LogLevel.Error, $"Fire Event Ownship Reposition By Preset Error ... \n");
                }
            }
        }

        public void StartSimulation()
        {
            OneSimLink.ErrorType rErrorType = OneSimLink.ErrorType.ERROR_NONE;
            var nStationId = OneSimLink.RunSimulation(ref rErrorType);            
        }

        public void InitSimulation()
        {
            OneSimLink.ErrorType rErrorType = OneSimLink.ErrorType.ERROR_NONE;
            var nStationId = OneSimLink.SiteInitializationRequest(ref rErrorType);
        }
        
        public void StopSimulation()
        {
            OneSimLink.ErrorType rErrorType = OneSimLink.ErrorType.ERROR_NONE;
            var nStationId = OneSimLink.StopSimulation(ref rErrorType);
        }

        public string GetSimulationTime()
        {            
            uint nTime = OneSimLink.GetSimTime();
            string sTime = ReadableTime((int)nTime);                   
            return sTime;
        }

        public string GetSimulationState()
        {
            string sSimState = "";
            OneSimLink.SimStateType eSimState = OneSimLink.GetSimState();
            switch (eSimState)
            {
                case OneSimLink.SimStateType.STATE_OFFLINE:
                {
                    sSimState = "OFFLINE";
                    break;
                }
                case OneSimLink.SimStateType.STATE_RESET:
                {
                    sSimState = "RESET";
                    break;
                }
                case OneSimLink.SimStateType.STATE_STOP:
                {
                    sSimState = "STOP";
                    break;
                }
                case OneSimLink.SimStateType.STATE_FREEZE:
                {
                    sSimState = "FREEZE";
                    break;
                }
                case OneSimLink.SimStateType.STATE_RUN:
                {
                    sSimState = "RUN";
                    break;
                }
                case OneSimLink.SimStateType.STATE_INIT:
                {
                    sSimState = "INIT";
                    break;
                }
                case OneSimLink.SimStateType.STATE_FIRST_INIT:
                {
                    sSimState = "FIRST_INIT";
                    break;
                }                
            }
            return sSimState;
        }

        public static string GetReadableTimeByMs(long ms)
        {
            TimeSpan t = TimeSpan.FromMilliseconds(ms);
            if (t.Hours > 0) return $"{t.Hours}h:{t.Minutes}m:{t.Seconds}s";
            else if (t.Minutes > 0) return $"{t.Minutes}m:{t.Seconds}s";
            else if (t.Seconds > 0) return $"{t.Seconds}s:{t.Milliseconds}ms";
            else return $"{t.Milliseconds}ms";
        }

        public static string ReadableTime(int milliseconds)
        {
            {
                TimeSpan t = TimeSpan.FromMilliseconds(milliseconds);
                string answer1 = string.Format("{0:D2}h:{1:D2}m:{2:D2}s:{3:D3}ms",
                                        t.Hours,
                                        t.Minutes,
                                        t.Seconds,
                                        t.Milliseconds);

                string answer2 = string.Format("{0:D2}:{1:D2}:{2:D2}", 0/*t.Hours*/, t.Minutes, t.Seconds);
                return answer2;
            }

            {
                var parts = new List<string>();
                Action<int, string> add = (val, unit) => { if (val > 0) parts.Add(val + unit); };
                var t = TimeSpan.FromMilliseconds(milliseconds);

                add(t.Days, "d");
                add(t.Hours, "h");
                add(t.Minutes, "m");
                add(t.Seconds, "s");
                add(t.Milliseconds, "ms");

                return string.Join(" ", parts);
            }
        }
    }
}
