using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackEndServices.Configuration;
using BackEndServices.Types;
using BackEndServices.Utilities;

namespace BackEndServices.Interfaces
{

    // Define the BasicDataBackend class to only include the backend object
    public class BasicDataBackend
    {
        public Backend backend { get; set; }
    }

    public class Backend
    {
        public string key { get; set; }
        public DbsimProps dbsimProps { get; set; }
    }

    public class DbsimProps
    {
        public string stationName { get; set; }
        public string blockName { get; set; }
        public string elementName { get; set; }
        public string elementType { get; set; }
        public object enumMapping { get; set; }
    }

    public interface IBackEndSimEngineService
    {
        void SetMotionState(MotionState motionState);
        MotionPlatformStatus GetMotionPlatformStatus();

        // demo
        void Clear();
        void SetDemoValue(int value);
        void IncrementDemoValue();
        int  GetDemoValue();

        //void SetMotion_Engage(bool bValue);
        //bool IsMotion_PilotReady();

        // Get Data By Key General Function
        string GetValueByKey(string sKey);
        bool GetValueByKeyAsBoolean(string sKey);
        int GetValueByKeyAsNumber(string sKey);
        double GetValueByKeyAsDouble(string sKey);

        DataItem GetDataByKey(string sKey);

        // Add DBSim Link with Key
        public void AddKeyLink(CConfigDBSimElementItem cConfigItem, string sBlockName, string sElementName, string sElementType, string sElementFilter, string sElementEnable, string sItemGroup, double nExtraHeightASL, double nExtraHeightMSL, int nExtraHeightVelocity, int nExtraHeightFuel, double nExtraHeightRateOfClimb);

        public bool ContainsKey(string sKey);

        // Ownship Configuration template 
        //double GetOwnshipConfiguration_TotalWeight();
        //void SetOwnshipConfiguration_FuelQuantity(int dvalue);

        // General Set Values template 
        void SetValue(string key, int value);
        void SetValue(string key, double value);
        void SetValue(string key, float value);
        void SetValue(string key, bool value);

        // General Get Values template 

        // Fire General Events
        void FireEvent(string EventName, string EventId, string EventClass, int EntityId, List<string> EventParams);


        // Send Event
        void FireEventOwnshipConfiguration(int      nEntityID = 0,
                                            bool    bFuelEnable = false,
                                            int     nFuelQuantity = 0,
                                            bool    bPayloadEnable = false,
                                            int     nPayload = 0,
                                            bool    bCG_enable = false,
                                            double  nCG_X = 0,
                                            double  nCG_Y = 0,
                                            bool    bWeightEnable = false,
                                            int     nWeightGross = 0);

        void FireEventOwnshipMalfunction(int    nEntityID = 0,
                                         int    nMalfunctionID = 0,
                                         string sMalfunctionCategory = "",
                                         string sMalfunctionName= "",
                                         string sMalfunctionParamAsString = "",
                                         int    nMalfunctionParamAsNumber = 0,
                                         bool   bMalfanctonActive = false);

        void FireEventOwnshipRepositionByPreset (bool   RepositionByPreset,
                                                 bool   RepositionBySelectedPointOnMap,
                                                 bool   RepositionByHeliPad,
                                                 string PresetName,
                                                 bool   EngineOn,
                                                 bool   OnAir,
                                                 bool   OnGround,
                                                 int    EntityID,
                                                 double Latitude,
                                                 double Longitude,
                                                 double AltitudeAboveTerrain,
                                                 double Heading,
                                                 double Velocity);
        //void StartSimulation();
        //void StopSimulation();
        //void InitSimulation();

        // CLS
        //void SetCLSCommand(string sValue);
        //void SetVibrationCommand(string sValue);
        //void SetMotionCommand(string sValue);

        ////LHD
        //void LoadLHDSimulation(bool bValue);
        //void RunLHDSimulation(bool bValue);
        //void StopLHDSimulation(bool bValue);
        //void TotalFreezeLHDSimulation(bool bValue);
        //void FlightFreezeLHDSimulation(bool bValue);

        //string GetLHDSimulationState();

        //bool GetLHDBootState();
        //bool GetLHDInitState();
        //bool GetLHDActiveFlightState();
        //bool GetLHDFlightFreezeState();
        //bool GetLHDTotalFreezeState();
        //bool GetLHDPlaybackState();
        //bool GetLHDRepositionState();
        //bool GetLHDCrashState();
        //bool GetLHDFailState();


        string GetSimulationTime();
        string GetSimulationState();



    }
}
