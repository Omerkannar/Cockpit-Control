using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Threading;
using System.Threading.Tasks;
using ATH_BackEndServices.Utilities;
using Microsoft.Extensions.Logging;
using ATH_BackEndServices.Interfaces;
using ATH_BackEndServices.Types;
using OneSimLinkInterop;
using System.IO;
using System.Text.Json;
using Newtonsoft.Json;
using ATH_BackEndServices.Configuration;

namespace ATH_BackEndServices.Services
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

        public BackEndSimEngineService(ILogger<BackEndSimEngineService> logger, DbSimElementUtils dbSimElementUtils)
        {
            int x = 100;            
        }

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

        public void SetMotionState(MotionState motionState)
        {

            if (false)
            {
                var blockData = motionState == MotionState.Off ? 22 : 33;
                var blockDataBytes = BitConverter.GetBytes(blockData);
                var elementValueBytes = new byte[4];
                var succeeded = true;
                OneSimLink.ErrorType et = OneSimLink.ErrorType.ERROR_NONE;
                succeeded &= OneSimLink.SetElementEngValueRequest(ref et, _elementId, blockDataBytes, (uint)blockDataBytes.Length);
                succeeded &= OneSimLink.GetElementEngValue(ref et, _elementToRead, elementValueBytes, (uint)elementValueBytes.Length);
                var elementValue = BitConverter.ToInt32(elementValueBytes);
                _logger.Log(LogLevel.Information, $"SetMotionState::Element Value {elementValue}");
                if (!succeeded)
                {
                    _logger.Log(LogLevel.Error, "Error updating block data");
                }
            }

            if (true)
            {
                _DbSimElementUtils.SetIntValue(_elementId, ++_nTestWriteCounter);
            }

            if (false)
            {
                var blockData = motionState == MotionState.Off ? 2 : 3;
                var blockDataBytes = BitConverter.GetBytes(blockData);
                var succeeded = true;
                OneSimLink.ErrorType et = OneSimLink.ErrorType.ERROR_NONE;
                if (motionState == MotionState.Off)
                {
                    succeeded = OneSimLink.SetBlockRawDataRequest(_blockId, blockDataBytes, (uint)blockDataBytes.Length);
                }
                else
                {
                    succeeded &= OneSimLink.SetElementEngValueRequest(ref et, _elementId, blockDataBytes, (uint)blockDataBytes.Length);
                }

                if (!succeeded)
                {
                    _logger.Log(LogLevel.Error, "Error updating block data");
                }
            }
        }

        public MotionPlatformStatus GetMotionPlatformStatus()
        {
            OneSimLink.ErrorType et = OneSimLink.ErrorType.ERROR_NONE;
            var status = new MotionPlatformStatus();
            var buffer = new byte[4];
            var succeeded = OneSimLink.GetElementEngValue(ref et, _elementToRead, buffer, (uint)buffer.Length);
            status.Counter = BitConverter.ToInt32(buffer);
            return status;
        }

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
            //if (blockId >= 0)
            //{
            //    _blockId = (uint)blockId;

                // oded
                //_elementId = (uint) OneSimLink.RegisterElement(blockFullName, "InternalState");
                //_elementToRead = (uint) OneSimLink.RegisterElement("DevStation.RiaceSystem.RiaceStateMessage", "Header.Counter");

                //if (blockName == "ATH_Flight.InputEx")
                //{
                //    _elementId = (uint)OneSimLink.RegisterElement(blockFullName, "cSessionControl.nNumber_Param_1");
                //    _elementToRead = (uint)OneSimLink.RegisterElement(blockFullName, "cSessionControl.nNumber_Param_2");

                //    _elementMotion_Engage = (uint)OneSimLink.RegisterElement(blockFullName, "cSessionControl.bClear");
                //    _elementMotion_PayloadReady = (uint)OneSimLink.RegisterElement(blockFullName, "cSessionControl.bStartPlayback");


                //    //LHD Simulation
                //    _elementLoadLHDSimulation = (uint)OneSimLink.RegisterElement(blockFullName, "cSessionControl.bLoad");
                //    _elementRunLHDSimulation = (uint)OneSimLink.RegisterElement(blockFullName, "cSessionControl.bRun");
                //    _elementStopLHDSimulation = (uint)OneSimLink.RegisterElement(blockFullName, "cSessionControl.bStop");
                //    _elementTotalFreezeLHDSimulation = (uint)OneSimLink.RegisterElement(blockFullName, "cSessionControl.bTotalFreeze");
                //    _elementFlightFreezeLHDSimulation = (uint)OneSimLink.RegisterElement(blockFullName, "cSessionControl.bFlightFreeze");

                //}

                //if (blockName == "ESL_E2M_CLS_Message.ESL_E2M_CLS_Message")
                //{
                //    _elementCLSCommand = (uint)OneSimLink.RegisterElement(blockFullName, "CLxx_HostStateCmd");
                //}

                //if (blockName == "ESL_E2M_Vibration_Message.ESL_E2M_Vibration_Message")
                //{
                //    _elementVibrationCommand = (uint)OneSimLink.RegisterElement(blockFullName, "MotionStateCommand");
                //}

                //if (blockName == "ESL_E2M_Motion_Message.ESL_E2M_Motion_Message")
                //{
                //    _elementMotionCommand = (uint)OneSimLink.RegisterElement(blockFullName, "MotionStateCommand");
                //}

                //if (blockName == "LHD_Simulation_States.LHD_Simulation_States")
                //{
                //    _elementLHDBootState = (uint)OneSimLink.RegisterElement(blockFullName, "LHD_Boot_State");
                //    _elementLHDInitState = (uint)OneSimLink.RegisterElement(blockFullName, "LHD_Init_State");
                //    _elementLHDActiveFlightState = (uint)OneSimLink.RegisterElement(blockFullName, "LHD_Active_Flight_State");
                //    _elementLHDFreezeState = (uint)OneSimLink.RegisterElement(blockFullName, "LHD_Flight_Freeze_State");
                //    _elementLHDTotalFreezeState = (uint)OneSimLink.RegisterElement(blockFullName, "LHD_Total_Freeze_State");
                //    _elementLHDPlaybackState = (uint)OneSimLink.RegisterElement(blockFullName, "LHD_Playback_State");
                //    _elementLHDRepositionState = (uint)OneSimLink.RegisterElement(blockFullName, "LHD_Reposition_State");
                //    _elementLHDCrashState = (uint)OneSimLink.RegisterElement(blockFullName, "LHD_Crash_State");
                //    _elementLHDFailState = (uint)OneSimLink.RegisterElement(blockFullName, "LHD_Fail_State");
                //}



                //// template 
                //if (blockName == "ATH_Web_Configuration.ATH_Web_Configuration")
                //{
                //    _elementIdFuelWrite       = (uint)OneSimLink.RegisterElement(blockFullName, "ConfigurationReqFuelQuantity");
                //    _elementToTotalWeightRead = (uint)OneSimLink.RegisterElement(blockFullName, "ConfigurationResponseHeliToTWeight");
                //    if (OneSimLink.IsElementRegistered(_elementToTotalWeightRead) == true)
                //    {
                //        //System.Console.WriteLine("_elementToTotalWeightRead Ok\n");
                //    }
                //}

                //if (blockName == "ATH_Cockpit_IO.ATH_Cockpit_IO")
                //{
                //    // Fuel Panel
                //    _elementFuelPanelPump1Read = (uint)OneSimLink.RegisterElement(blockFullName, "Card1_D_IN.bPUMP_1");
                //    _elementFuelPanelPump2Read = (uint)OneSimLink.RegisterElement(blockFullName, "Card1_D_IN.bPUMP_2");
                //    _elementFuelPanelPumpXFERRead = (uint)OneSimLink.RegisterElement(blockFullName, "Card1_D_IN.bPUMP_XFER");
                //    _elementFuelPanelVlaveRead = (uint)OneSimLink.RegisterElement(blockFullName, "Card1_D_IN.bVALVE");
                //    _elementFuelPanelVlaveLightRead = (uint)OneSimLink.RegisterElement(blockFullName, "Card1_D_OUT.bVALVE_OPEN_LED_ON");

                //    // ICS Panel
                //    _elementRightICSPanelSelectorRead = (uint)OneSimLink.RegisterElement(blockFullName, "Card1_D_IN.ePILOT_ICS");
                //    _elementRightICSPanelVHF1VolumeRead = (uint)OneSimLink.RegisterElement(blockFullName, "Card2_A_IN.dPILOT_VOL_1");

                //    // Autopilot panel
                //    // Fuel Panel
                //    _elementAPPanelSAS1Read = (uint)OneSimLink.RegisterElement(blockFullName, "Card_5_D_IN.bSAS_1_IN");
                //    _elementAPPanelSAS1Read = (uint)OneSimLink.RegisterElement(blockFullName, "Card_5_D_IN.bSAS_1_OUT");
                //    _elementAPPanelSAS2Read = (uint)OneSimLink.RegisterElement(blockFullName, "Card1_D_IN.bSAS_2");
                //    _elementAPPanelATTDHOLDRead = (uint)OneSimLink.RegisterElement(blockFullName, "Card1_D_IN.bATTD_HOLD");
                //    _elementAPPanelSAS2PBRead = (uint)OneSimLink.RegisterElement(blockFullName, "Card1_D_IN.bSAS_2_PB");
                //    // Need to complete
                //    _elementAPPanelAUTOTRIMRead = (uint)OneSimLink.RegisterElement(blockFullName, "Card1_D_IN.bSAS_1");
                //    _elementAPPanelCOUPLRead = (uint)OneSimLink.RegisterElement(blockFullName, "Card1_D_IN.bSAS_1");





             //}

                // todo 
            //    {
            //        //ReaderWriterLock xml
            //        //key -> station + block + _element => elementid
            //    }
            //}
            //else
            //{
            //    _logger.Log(LogLevel.Error, "Error get block id for block {A0}, verify block name is correct.", blockFullName);
            //}
        }

        public void SetDemoValue(int value)
        {
            _DbSimElementUtils.SetIntValue(_elementId, value);
        }

        public void IncrementDemoValue()
        {
            _DbSimElementUtils.SetIntValue(_elementId, ++_nTestWriteCounter);
        }

       


        public int GetDemoValue()
        {
            return _DbSimElementUtils.GetIntValue(_elementToRead);
        }

        void IBackEndSimEngineService.SetMotionState(MotionState motionState)
        {
            throw new NotImplementedException();
        }

        MotionPlatformStatus IBackEndSimEngineService.GetMotionPlatformStatus()
        {
            throw new NotImplementedException();
        }

        void IBackEndSimEngineService.SetDemoValue(int value)
        {
            throw new NotImplementedException();
        }

        void IBackEndSimEngineService.IncrementDemoValue()
        {
            throw new NotImplementedException();
        }

        int IBackEndSimEngineService.GetDemoValue()
        {
            throw new NotImplementedException();
        }

        //void IBackEndSimEngineService.SetMotion_Engage(bool bValue)
        //{
        //    if (bValue == true)
        //        _DbSimElementUtils.SetIntValue(_elementMotion_Engage, 1);
        //    else
        //        _DbSimElementUtils.SetIntValue(_elementMotion_Engage, 0);
        //}

        //bool IBackEndSimEngineService.IsMotion_PilotReady()
        //{
        //    bool bResult = _DbSimElementUtils.GetBooleanValue(_elementMotion_PayloadReady);
        //    return bResult;
        //}

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

        // template 
        //double IBackEndSimEngineService.GetOwnshipConfiguration_TotalWeight()
        //{            
        //    double dResult = _DbSimElementUtils.GetDoubleValue(_elementToTotalWeightRead);
        //    return dResult;
        //}

        //void IBackEndSimEngineService.SetOwnshipConfiguration_FuelQuantity(int dValue)
        //{
        //    _DbSimElementUtils.SetIntValue(_elementIdFuelWrite, dValue);            
        //}

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

        void IBackEndSimEngineService.FireEventOwnshipConfiguration(int nEntityID,
                                                                    bool bFuelEnable, int nFuelQuantity,
                                                                    bool bPayloadEnable, int nPayload,
                                                                    bool bCG_enable, double nCG_X, double nCG_Y,
                                                                    bool bWeightEnable, int nWeightGross)
        {
            _DbSimElementUtils.FireEventOwnshipConfiguration(nEntityID, 
                                                             bFuelEnable, nFuelQuantity,
                                                             bPayloadEnable,nPayload,
                                                             bCG_enable, nCG_X,nCG_Y,
                                                             bWeightEnable, nWeightGross);
        }

        void IBackEndSimEngineService.FireEventOwnshipMalfunction(int nEntityID,
                                                                  int nMalfunctionID,
                                                                  string sMalfunctionCategory,
                                                                  string sMalfunctionName,
                                                                  string sMalfunctionParamAsString,
                                                                  int    nMalfunctionParamAsNumber,
                                                                  bool   bMalfanctionActive)
        {
            _DbSimElementUtils.FireEventOwnshipMalfunction(nEntityID,
                                                           nMalfunctionID,
                                                           sMalfunctionCategory,
                                                           sMalfunctionName,
                                                           sMalfunctionParamAsString,
                                                           nMalfunctionParamAsNumber,
                                                           bMalfanctionActive);
        }

        void IBackEndSimEngineService.FireEventOwnshipRepositionByPreset(bool   RepositionByPreset,
                                                                        bool    RepositionBySelectedPointOnMap,
                                                                        bool    RepositionByHeliPad,
                                                                        string  PresetName,
                                                                        bool    EngineOn,
                                                                        bool    OnAir,
                                                                        bool    OnGround,
                                                                        int     EntityID,
                                                                        double  Latitude,
                                                                        double  Longitude,
                                                                        double  AltitudeAboveTerrain,
                                                                        double  Heading,
                                                                        double  Velocity)
        {
            _DbSimElementUtils.FireEventOwnshipRepositionByPreset(RepositionByPreset,
                                                                  RepositionBySelectedPointOnMap,
                                                                  RepositionByHeliPad,
                                                                  PresetName,
                                                                  EngineOn,
                                                                  OnAir,
                                                                  OnGround,
                                                                  EntityID,
                                                                  Latitude,
                                                                  Longitude,
                                                                  AltitudeAboveTerrain,
                                                                  Heading,
                                                                  Velocity);
        }


        //void IBackEndSimEngineService.StartSimulation()
        //{
        //    _DbSimElementUtils.StartSimulation();
        //}

        //void IBackEndSimEngineService.StopSimulation()
        //{
        //    _DbSimElementUtils.StopSimulation();
        //}

        //void IBackEndSimEngineService.InitSimulation()
        //{
        //    _DbSimElementUtils.InitSimulation();
        //}

        string IBackEndSimEngineService.GetSimulationTime()
        {
            return (_DbSimElementUtils.GetSimulationTime());
        }

        string IBackEndSimEngineService.GetSimulationState()
        {
            return (_DbSimElementUtils.GetSimulationState());
        }

        //void IBackEndSimEngineService.SetCLSCommand(string sValue)
        //{
        //    int nValue = -1;
        //    if (string.Compare(sValue.ToUpper(), "STOP") == 0)
        //        nValue = 0;
        //    else if (string.Compare(sValue.ToUpper(), "OFF") == 0)
        //        nValue = 1;
        //    else if (string.Compare(sValue.ToUpper(), "RUN") == 0)
        //        nValue = 2;
        //    else if (string.Compare(sValue.ToUpper(), "RESET") == 0)
        //        nValue = 3;

        //    if (nValue > -1)
        //        _DbSimElementUtils.SetIntValue(_elementCLSCommand, nValue);
        //}

        //void IBackEndSimEngineService.SetVibrationCommand(string sValue)
        //{
        //    int nValue = -1;
        //    if (string.Compare(sValue.ToUpper(), "STOP") == 0)
        //        nValue = 0;
        //    else if (string.Compare(sValue.ToUpper(), "OFF") == 0)
        //        nValue = 1;
        //    else if (string.Compare(sValue.ToUpper(), "READY") == 0)
        //        nValue = 2;
        //    else if (string.Compare(sValue.ToUpper(), "RUN") == 0)
        //        nValue = 3;
        //    else if (string.Compare(sValue.ToUpper(), "RESET") == 0)
        //        nValue = 4;
        //    else if (string.Compare(sValue.ToUpper(), "PARK") == 0)
        //        nValue = 5;
        //    else if (string.Compare(sValue.ToUpper(), "SETTLE") == 0)
        //        nValue = 6;
        //    else if (string.Compare(sValue.ToUpper(), "SWEEP") == 0)
        //        nValue = 7;
        //    else if (string.Compare(sValue.ToUpper(), "TESTMODPOS") == 0)
        //        nValue = 8;

        //    if (nValue > -1)
        //        _DbSimElementUtils.SetIntValue(_elementVibrationCommand, nValue);
        //}

        //void IBackEndSimEngineService.SetMotionCommand(string sValue)
        //{
        //    int nValue = -1;
        //    if (string.Compare(sValue.ToUpper(), "STOP") == 0)
        //        nValue = 0;
        //    else if (string.Compare(sValue.ToUpper(), "OFF") == 0)
        //        nValue = 1;
        //    else if (string.Compare(sValue.ToUpper(), "READY") == 0)
        //        nValue = 2;
        //    else if (string.Compare(sValue.ToUpper(), "RUN") == 0)
        //        nValue = 3;
        //    else if (string.Compare(sValue.ToUpper(), "RESET") == 0)
        //        nValue = 4;
        //    else if (string.Compare(sValue.ToUpper(), "SETTLE") == 0)
        //        nValue = 5;
        //    else if (string.Compare(sValue.ToUpper(), "BRIDGEUP") == 0)
        //        nValue = 6;
        //    else if (string.Compare(sValue.ToUpper(), "BRIDGEDOWN") == 0)
        //        nValue = 7;
        //    else if (string.Compare(sValue.ToUpper(), "BRIDGESTOP") == 0)
        //        nValue = 8;

        //    if (nValue > -1)
        //        _DbSimElementUtils.SetIntValue(_elementMotionCommand, nValue);
        //}

        //LHD Simulation
        //void IBackEndSimEngineService.LoadLHDSimulation(bool bValue)
        //{
        //    _DbSimElementUtils.SetBoolValue(_elementLoadLHDSimulation, bValue);
        //}
        //void IBackEndSimEngineService.RunLHDSimulation(bool bValue)
        //{
        //    _DbSimElementUtils.SetBoolValue(_elementRunLHDSimulation, bValue);
        //}
        //void IBackEndSimEngineService.StopLHDSimulation(bool bValue)
        //{
        //    _DbSimElementUtils.SetBoolValue(_elementStopLHDSimulation, bValue);
        //}
        //void IBackEndSimEngineService.TotalFreezeLHDSimulation(bool bValue)
        //{
        //    _DbSimElementUtils.SetBoolValue(_elementTotalFreezeLHDSimulation, bValue);
        //}
        //void IBackEndSimEngineService.FlightFreezeLHDSimulation(bool bValue)
        //{
        //    _DbSimElementUtils.SetBoolValue(_elementFlightFreezeLHDSimulation, bValue);
        //}

        //string IBackEndSimEngineService.GetLHDSimulationState()
        //{
        //    if (_DbSimElementUtils.GetBooleanValue(_elementLHDBootState) == true)
        //        return "BOOT";
        //    else if (_DbSimElementUtils.GetBooleanValue(_elementLHDInitState) == true)
        //        return "INIT";
        //    else if (_DbSimElementUtils.GetBooleanValue(_elementLHDActiveFlightState) == true)
        //        return "ACTIVE FLIGHT";
        //    else if (_DbSimElementUtils.GetBooleanValue(_elementLHDFreezeState) == true)
        //        return "FLIGHT FREEZE";
        //    else if (_DbSimElementUtils.GetBooleanValue(_elementLHDTotalFreezeState) == true)
        //        return "TOTAL FREEZE";
        //    else if (_DbSimElementUtils.GetBooleanValue(_elementLHDPlaybackState) == true)
        //        return "PLAYBACK";
        //    else if (_DbSimElementUtils.GetBooleanValue(_elementLHDRepositionState) == true)
        //        return "REPOSITION";
        //    else if (_DbSimElementUtils.GetBooleanValue(_elementLHDCrashState) == true)
        //        return "CRASH";
        //    else if (_DbSimElementUtils.GetBooleanValue(_elementLHDFailState) == true)
        //        return "FAIL";
        //    else
        //        return "UNKNOWN";
        //}


        //bool IBackEndSimEngineService.GetLHDBootState()
        //{
        //    if(_DbSimElementUtils.GetSimulationState() == "OFFLINE")
        //    {
        //        return false;
        //    }
        //    else
        //    {
        //        return _DbSimElementUtils.GetBooleanValue(_elementLHDBootState);
        //    }  
        //}
        //bool IBackEndSimEngineService.GetLHDInitState()
        //{
        //    if (_DbSimElementUtils.GetSimulationState() == "OFFLINE")
        //    {
        //        return false;
        //    }
        //    else
        //    {
        //        return _DbSimElementUtils.GetBooleanValue(_elementLHDInitState);
        //    }
        //}
        //bool IBackEndSimEngineService.GetLHDActiveFlightState()
        //{
        //    if (_DbSimElementUtils.GetSimulationState() == "OFFLINE")
        //    {
        //        return false;
        //    }
        //    else
        //    {
        //        return _DbSimElementUtils.GetBooleanValue(_elementLHDActiveFlightState);
        //    }
        //}
        //bool IBackEndSimEngineService.GetLHDFlightFreezeState()
        //{
        //    if (_DbSimElementUtils.GetSimulationState() == "OFFLINE")
        //    {
        //        return false;
        //    }
        //    else
        //    {
        //        return _DbSimElementUtils.GetBooleanValue(_elementLHDFreezeState);
        //    }
        //}
        //bool IBackEndSimEngineService.GetLHDTotalFreezeState()
        //{
        //    if (_DbSimElementUtils.GetSimulationState() == "OFFLINE")
        //    {
        //        return false;
        //    }
        //    else
        //    {
        //        return _DbSimElementUtils.GetBooleanValue(_elementLHDTotalFreezeState);
        //    }
        //}
        //bool IBackEndSimEngineService.GetLHDPlaybackState()
        //{
        //    if (_DbSimElementUtils.GetSimulationState() == "OFFLINE")
        //    {
        //        return false;
        //    }
        //    else
        //    {
        //        return _DbSimElementUtils.GetBooleanValue(_elementLHDPlaybackState);
        //    }
        //}
        //bool IBackEndSimEngineService.GetLHDRepositionState()
        //{
        //    if (_DbSimElementUtils.GetSimulationState() == "OFFLINE")
        //    {
        //        return false;
        //    }
        //    else
        //    {
        //        return _DbSimElementUtils.GetBooleanValue(_elementLHDRepositionState);
        //    }
        //}
        //bool IBackEndSimEngineService.GetLHDCrashState()
        //{
        //    if (_DbSimElementUtils.GetSimulationState() == "OFFLINE")
        //    {
        //        return false;
        //    }
        //    else
        //    {
        //        return _DbSimElementUtils.GetBooleanValue(_elementLHDCrashState);
        //    }
        //}
        //bool IBackEndSimEngineService.GetLHDFailState()
        //{
        //    if (_DbSimElementUtils.GetSimulationState() == "OFFLINE")
        //    {
        //        return false;
        //    }
        //    else
        //    {
        //        return _DbSimElementUtils.GetBooleanValue(_elementLHDFailState);
        //    }
        //}



        #endregion
    }
}
