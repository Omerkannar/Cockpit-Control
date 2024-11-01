using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackEndServices.Configuration;
//using BackEndServices.Types;
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


        // Get Data By Key General Function
        string GetValueByKey(string sKey);
        bool GetValueByKeyAsBoolean(string sKey);
        int GetValueByKeyAsNumber(string sKey);
        double GetValueByKeyAsDouble(string sKey);

        DataItem GetDataByKey(string sKey);

        // Add DBSim Link with Key
        public void AddKeyLink(CConfigDBSimElementItem cConfigItem, string sBlockName, string sElementName, string sElementType, string sElementFilter, string sElementEnable, string sItemGroup, double nExtraHeightASL, double nExtraHeightMSL, int nExtraHeightVelocity, int nExtraHeightFuel, double nExtraHeightRateOfClimb);

        public bool ContainsKey(string sKey);


        // General Set Values template 
        void SetValue(string key, int value);
        void SetValue(string key, double value);
        void SetValue(string key, float value);
        void SetValue(string key, bool value);

        // General Get Values template 

        // Fire General Events
        void FireEvent(string EventName, string EventId, string EventClass, int EntityId, List<string> EventParams);

        string GetSimulationTime();




    }
}
