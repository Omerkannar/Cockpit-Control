using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Threading;
using System.Threading.Tasks;
using BackEndServices.Utilities;
using BackEndServices.Interfaces;
using OneSimLinkInterop;
using System.IO;
using System.Text.Json;
using Newtonsoft.Json;
using BackEndServices.Configuration;

namespace BackEndServices.Services
{    

    public class BackEndSimEngineService : IBackEndSimEngineService
    {
        private readonly ILogger<BackEndSimEngineService> _logger;
        private readonly bool _oneSimLinkInitSucceeded;
        private uint _blockId;
        private uint _elementId;
        private uint _elementToRead;
        private readonly DbSimElementUtils _DbSimElementUtils;
        private int _nTestWriteCounter = 1;


        private CMapKeyToBindDBSimElementItem _mapKeyToBindDBSimElementItemPrimary = new CMapKeyToBindDBSimElementItem();
        private CMapKeyToBindDBSimElementItem _mapKeyToBindDBSimElementItemSlave = new CMapKeyToBindDBSimElementItem();




        private uint[] global_elements = new uint[100];


        public BackEndSimEngineService()
        {            
            //_logger = logger;
            //_DbSimElementUtils = dbSimElementUtils;
            _oneSimLinkInitSucceeded = OneSimLink.OneSimLinkStartup();

            // =========================
            // General Global Registration
            // =========================
            {
                var stationId       = OneSimLink.GetOwnStationId();
                var stationNamePtr  = OneSimLink.GetStationNameById(stationId);
                var stationName     = Marshal.PtrToStringAnsi(stationNamePtr);

                if (stationName != null)
                {
                    string[] arrFileNames =
                    {
                        @"C:\FileServer\Y\Projects\ATH\Runtime\OwnshipStation\Setups\BackEnd\Cockpit_Control_CMDS_Panel.json",
                    };
                    foreach (string sConfigFile in arrFileNames)
                    {
                        // ===========================
                        // Read Json Config File
                        // ===========================
                        StreamReader jsonStreamReaderreader = new StreamReader(sConfigFile);
                        string jsonString = jsonStreamReaderreader.ReadToEnd();
                        Console.WriteLine(jsonString);

                        // =============================
                        // Deserialize Object
                        // =============================
                        List<CConfigDBSimElementItem> ConfigDBSimElementList = JsonConvert.DeserializeObject<List<CConfigDBSimElementItem>>(jsonString);
                        foreach (CConfigDBSimElementItem cDBSimElement in ConfigDBSimElementList)
                        {
                            string sKey = cDBSimElement.Key;
                            CBindDBSimElementItem cBindDBSimElementItem = new CBindDBSimElementItem();
                            cBindDBSimElementItem.cConfig = cDBSimElement;

                            string sBlockFullName = $"{stationName}.{cDBSimElement.BlockName}";

                            cBindDBSimElementItem.m_nStationBlockID = OneSimLink.GetBlockIdByName(sBlockFullName);
                            cBindDBSimElementItem.m_nElementID = OneSimLink.RegisterElement(sBlockFullName, cBindDBSimElementItem.cConfig.ElementName);

                            if ((cBindDBSimElementItem.m_nStationBlockID != -1) && (cBindDBSimElementItem.m_nElementID != -1))
                            {
                                _mapKeyToBindDBSimElementItemPrimary.Add(sKey, cBindDBSimElementItem);
                            }
                        }
                    }
                }
            }

            // =========================
            // Specific Local Registration
            // =========================
            {
                RegisterToOneSimLinkBlocks();
            }

            // =========================
            // Start Local Service Thread
            // =========================
            var cLocalServiceThread = new Thread(OneSimLinkWork);
            cLocalServiceThread.Start();
        }

        public void Clear()
        {
            _mapKeyToBindDBSimElementItemSlave.mapKeyToBindDBSimElementItem.Clear();
        }

        public bool ContainsKey(string sKey)
        {
            return (_mapKeyToBindDBSimElementItemPrimary.mapKeyToBindDBSimElementItem.ContainsKey(sKey));
        }

        public void AddKeyLink(CConfigDBSimElementItem cConfigItem, string sBlockName, string sElementName, string sElementType, string sElementFilter, string sElementEnable, string sItemGroup, double nExtraHeightASL, double nExtraHeightMSL, int nExtraHeightVelocity, int nExtraHeightFuel, double nExtraHeightRateOfClimb)
        {            
            var stationId = OneSimLink.GetOwnStationId();
            var stationNamePtr = OneSimLink.GetStationNameById(stationId);
            var stationName = Marshal.PtrToStringAnsi(stationNamePtr);

            if (cConfigItem.StationName == null)
                cConfigItem.StationName = stationName;

            if (cConfigItem.ElementType == null)
                cConfigItem.ElementType = sElementType;

            if (cConfigItem.ElementFilter == null)
                cConfigItem.ElementFilter = sElementFilter;

            if (cConfigItem.ElementEnable == null)
                cConfigItem.ElementEnable = sElementEnable;

            if (cConfigItem.ElementGroup == null)
                cConfigItem.ElementGroup = sItemGroup;

            CBindDBSimElementItem cBindDBSimElementItem = new CBindDBSimElementItem();
            cBindDBSimElementItem.cConfig = cConfigItem;
            
            string sBlockFullName = $"{stationName}.{cConfigItem.BlockName}";
            if (sBlockFullName == null)
            {
                sBlockFullName = stationName + "." + cConfigItem.BlockName;
            }

            if (sBlockFullName == null)
                return;

            cBindDBSimElementItem.m_nStationBlockID = OneSimLink.GetBlockIdByName(sBlockFullName);
            cBindDBSimElementItem.m_nElementID = OneSimLink.RegisterElement(sBlockFullName, cBindDBSimElementItem.cConfig.ElementName);

            if ((cBindDBSimElementItem.m_nStationBlockID != -1) && (cBindDBSimElementItem.m_nElementID != -1))
            {
                if (_mapKeyToBindDBSimElementItemPrimary.mapKeyToBindDBSimElementItem.ContainsKey(cConfigItem.Key) == false)
                    _mapKeyToBindDBSimElementItemPrimary.Add(cConfigItem.Key, cBindDBSimElementItem);

                if (_mapKeyToBindDBSimElementItemSlave.mapKeyToBindDBSimElementItem.ContainsKey(cConfigItem.Key) == false)
                    _mapKeyToBindDBSimElementItemSlave.Add(cConfigItem.Key, cBindDBSimElementItem);
            }    
            else
            {
                //System.Console.WriteLine("\n!!! Error Map To DBSim {0}.{0} !!!\n", sBlockFullName, cBindDBSimElementItem.cConfig.ElementName);
            }
        }

        #region Implementation of IMotionPlatformService     

        #endregion

        #region Private Methods

        private void OneSimLinkWork()
        {

            while (true)
            {
                OneSimLink.ServerUpdate();
                Thread.Sleep(100);
            }
        }

        private void RegisterToOneSimLinkBlocks()
        {
            var stationId = OneSimLink.GetOwnStationId();
            var stationNamePtr = OneSimLink.GetStationNameById(stationId);
            var stationName = Marshal.PtrToStringAnsi(stationNamePtr);

            if (stationName != null)
            {
                // Station = CGFStation1, Block = ATH_Flight.InputEx
                UpdateBlockId(stationName, "ATH_Flight.InputEx");

                // Station = CGFStation1, Block = ATH_Web_Configuration.ATH_Web_Configuration
                UpdateBlockId(stationName, "ATH_Web_Configuration.ATH_Web_Configuration");

                // Station = Host1, Block = ATH_Cockpit_IO.ATH_Cockpit_IO
                UpdateBlockId(stationName, "ATH_Cockpit_IO.ATH_Cockpit_IO");

                UpdateBlockId(stationName, "ESL_E2M_CLS_Message.ESL_E2M_CLS_Message");
                UpdateBlockId(stationName, "ESL_E2M_Vibration_Message.ESL_E2M_Vibration_Message");
                UpdateBlockId(stationName, "ESL_E2M_Motion_Message.ESL_E2M_Motion_Message");


                UpdateBlockId(stationName, "LHD_Simulation_States.LHD_Simulation_States");

                UpdateBlockId(stationName, "ESL_LHD_HC_Param_Freeze.ESL_LHD_HC_Param_Freeze");

                UpdateBlockId(stationName, "LHD_ESL_Radios.LHD_ESL_Radios");
            }
            else
            {
                _logger.Log(LogLevel.Error, "Error converting station ID {A0} to string", stationId);
            }

        }

        private void UpdateBlockId_Device(string stationName, string blockName)
        {
            var blockFullName = blockName;
            var blockId = OneSimLink.GetBlockIdByName(blockFullName);
            if (blockId >= 0)
            {
                _blockId = (uint)blockId;
                _elementId = (uint)OneSimLink.RegisterElement(blockFullName, "1.DevDataATHMotionPlatform.Request");
                _elementToRead = (uint)OneSimLink.RegisterElement("1.DevDataATHMotionPlatform.Request", "bE2M_ActiveMotionPlatform");
            }
            else
            {
                _logger.Log(LogLevel.Error, "Error get block id for block {A0}, verify block name is correct.", blockFullName);
            }
        }

        private void UpdateBlockId(string stationName, string blockName)
        {
            // ===============
            // last code 
            // ===============
            var blockFullName = $"{stationName}.{blockName}";
            var blockId = OneSimLink.GetBlockIdByName(blockFullName);
            
        }


        string IBackEndSimEngineService.GetValueByKey(string sKey)
        {
            string sResult = "";
            CBindDBSimElementItem cBindDBSimElementItem = _mapKeyToBindDBSimElementItemPrimary.Search(sKey);
            
            if (cBindDBSimElementItem == null)
            {
                //System.Console.WriteLine("Error : Can't find {0} in configuration file\n", sKey);
                return sResult;
            }
            else
            {
                if (cBindDBSimElementItem.cConfig.ElementType.Equals("Double"))
                {
                    double dResult = _DbSimElementUtils.GetDoubleValue((uint)cBindDBSimElementItem.m_nElementID);
                    sResult = dResult.ToString();
                }
                else if (cBindDBSimElementItem.cConfig.ElementType.Equals("Float"))
                {
                    float fResult = _DbSimElementUtils.GetFloatValue((uint)cBindDBSimElementItem.m_nElementID);
                    sResult = fResult.ToString();
                }
                else if (cBindDBSimElementItem.cConfig.ElementType.Equals("Integer"))
                {
                    int nResult = _DbSimElementUtils.GetIntValue((uint)cBindDBSimElementItem.m_nElementID);
                    sResult = nResult.ToString();
                }
                else if (cBindDBSimElementItem.cConfig.ElementType.Equals("Boolean"))
                {
                    bool bResult = _DbSimElementUtils.GetBooleanValue((uint)cBindDBSimElementItem.m_nElementID);
                    sResult = bResult.ToString();
                }
                else if (cBindDBSimElementItem.cConfig.ElementType.Equals("String"))
                {
                    sResult = _DbSimElementUtils.GetStringValue((uint)cBindDBSimElementItem.m_nElementID, 1024);
                }

                return sResult;
            }
        }
        
        bool IBackEndSimEngineService.GetValueByKeyAsBoolean(string sKey)
        {
            bool bResult = false;
            CBindDBSimElementItem cBindDBSimElementItemPrimary = _mapKeyToBindDBSimElementItemPrimary.Search(sKey);
            CBindDBSimElementItem cBindDBSimElementItemSlave   = _mapKeyToBindDBSimElementItemSlave.Search(sKey);

            if ((cBindDBSimElementItemPrimary == null) && (cBindDBSimElementItemSlave == null))
                cBindDBSimElementItemPrimary = cBindDBSimElementItemSlave;


            if (cBindDBSimElementItemPrimary == null)
            {
                //System.Console.WriteLine("Error : Can't find key {0} in configuration file\n", sKey);                
            }
            else if (cBindDBSimElementItemPrimary.cConfig.ElementType.Equals("Boolean"))
            {
                bResult = _DbSimElementUtils.GetBooleanValue((uint)cBindDBSimElementItemPrimary.m_nElementID);                
            }
            // //System.Console.WriteLine("Error : Not Valid Format, key {0} in configuration file\n", sKey);
            return bResult;
        }

        int IBackEndSimEngineService.GetValueByKeyAsNumber(string sKey)
        {
            int nResult = 0;
            CBindDBSimElementItem cBindDBSimElementItem = _mapKeyToBindDBSimElementItemPrimary.Search(sKey);

            if (cBindDBSimElementItem == null)
            {
                //System.Console.WriteLine("Error : Can't find key {0} in configuration file\n", sKey);
            }
            else if (cBindDBSimElementItem.cConfig.ElementType.Equals("Integer"))
            {
                nResult = _DbSimElementUtils.GetIntValue((uint)cBindDBSimElementItem.m_nElementID);
            }
            ////System.Console.WriteLine("Error : Not Valid Format, key {0} in configuration file\n", sKey);
            return nResult;
        }

        double IBackEndSimEngineService.GetValueByKeyAsDouble(string sKey)
        {
            double nResult = 0;
            CBindDBSimElementItem cBindDBSimElementItem = _mapKeyToBindDBSimElementItemPrimary.Search(sKey);

            if (cBindDBSimElementItem == null)
            {
                //System.Console.WriteLine("Error : Can't find key {0} in configuration file\n", sKey);
            }
            else if (cBindDBSimElementItem.cConfig.ElementType.Equals("Double"))
            {
                nResult = _DbSimElementUtils.GetDoubleValue((uint)cBindDBSimElementItem.m_nElementID);
            }
            ////System.Console.WriteLine("Error : Not Valid Format, key {0} in configuration file\n", sKey);
            return nResult;
        }

        DataItem IBackEndSimEngineService.GetDataByKey(string sKey)
        {
            string sResult = "";
            string sType = "";
            CBindDBSimElementItem cBindDBSimElementItem = _mapKeyToBindDBSimElementItemPrimary.Search(sKey);

            if (cBindDBSimElementItem.cConfig.ElementType.Equals("Double"))
            {
                double dResult = _DbSimElementUtils.GetDoubleValue((uint)cBindDBSimElementItem.m_nElementID);
                sResult = dResult.ToString();
                sType = "number";
            }
            else if (cBindDBSimElementItem.cConfig.ElementType.Equals("Integer"))
            {
                int nResult = _DbSimElementUtils.GetIntValue((uint)cBindDBSimElementItem.m_nElementID);
                sResult = nResult.ToString();
                sType = "number";
            }
            else if (cBindDBSimElementItem.cConfig.ElementType.Equals("Boolean"))
            {
                bool bResult = _DbSimElementUtils.GetBooleanValue((uint)cBindDBSimElementItem.m_nElementID);
                sResult = bResult.ToString().ToLower();
                sType = "boolean";
            }
            else if (cBindDBSimElementItem.cConfig.ElementType.Equals("String"))
            {
                sResult = _DbSimElementUtils.GetStringValue((uint)cBindDBSimElementItem.m_nElementID, 1024);
                sType = "string";
            }
            else
            {
                sResult = "ERROR";
                sType = "null";
            }

            return new DataItem(sKey, sResult, sType);
        }


        void IBackEndSimEngineService.SetValue(string key, int value)
        {
            // find , todo 
            // ...

            CBindDBSimElementItem cBindDBSimElementItem = _mapKeyToBindDBSimElementItemPrimary.Search(key);

            if (cBindDBSimElementItem != null)
                _DbSimElementUtils.SetIntValue((uint)cBindDBSimElementItem.m_nElementID, value);
            

            //uint elementId = 0;
            //_DbSimElementUtils.SetIntValue(elementId, value);
        }
        void IBackEndSimEngineService.SetValue(string key, double value)
        {
            // find , todo 
            // ...
            CBindDBSimElementItem cBindDBSimElementItem = _mapKeyToBindDBSimElementItemPrimary.Search(key);

            if(cBindDBSimElementItem != null)
                _DbSimElementUtils.SetDoubleValue((uint)cBindDBSimElementItem.m_nElementID, value);
        }

        void IBackEndSimEngineService.SetValue(string key, float value)
        {
            // find , todo 
            // ...

            CBindDBSimElementItem cBindDBSimElementItem = _mapKeyToBindDBSimElementItemPrimary.Search(key);

            if (cBindDBSimElementItem != null)
                _DbSimElementUtils.SetFloatValue((uint)cBindDBSimElementItem.m_nElementID, value);

            //_DbSimElementUtils.SetFloatValue(_elementIdFuelWrite, value);            
        }
        void IBackEndSimEngineService.SetValue(string key, bool value)
        {
            // find , todo 
            // ...

            CBindDBSimElementItem cBindDBSimElementItem = _mapKeyToBindDBSimElementItemPrimary.Search(key);

            if (cBindDBSimElementItem != null)
                _DbSimElementUtils.SetBoolValue((uint)cBindDBSimElementItem.m_nElementID, value);

            //_DbSimElementUtils.SetBoolValue(_elementIdFuelWrite, value);
        }
        #endregion

        #region Private Methods Events

        void IBackEndSimEngineService.FireEvent(string EventName, string EventId, string EventClass, int EntityId, List<string> EventParams)
        {
            _DbSimElementUtils.FireEvent(EventName, EventId, EventClass, EntityId, EventParams);
        }


        string IBackEndSimEngineService.GetSimulationTime()
        {
            return (_DbSimElementUtils.GetSimulationTime());
        }

        #endregion
    }
}
