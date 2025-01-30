using OneSimLinkInterop;


namespace BackEndServices.Configuration
{
    public class CConfigDBSimElementItem
    {
        public string? Key { get; set; }
        public string? StationName { get; set; }
        public string? BlockName { get; set; }
        public string? ElementName { get; set; }
        public string? ElementType { get; set; }
        public string? ElementFilter { get; set; }
        public string? ElementTitle { get; set; }
        public string? ElementEnable { get; set; }
        public string? ElementGroup { get; set; }

        // Copy method
        public CConfigDBSimElementItem Copy()
        {
            return new CConfigDBSimElementItem
            {
                Key = this.Key,
                StationName = this.StationName,
                BlockName = this.BlockName,
                ElementName = this.ElementName,
                ElementType = this.ElementType,
                ElementFilter = this.ElementFilter,
                ElementTitle = this.ElementTitle,
                ElementEnable = this.ElementEnable,
                ElementGroup = this.ElementGroup
            };
        }
    }


    public class CBindDBSimElementItem
    {
        public CConfigDBSimElementItem cConfig { get; set; } = new CConfigDBSimElementItem(); // Initialized with a new instance


        // Panel
        public string m_sPanelName;
        // Value
        public string? m_sValue;

        // help data
        public int m_nStationBlockID;
        public int m_nElementID;

        // Constructor (Optional) for further initialization
        public CBindDBSimElementItem(string? panel = null, string? value = null, int stationBlockID = 0, int elementID = 0)
        {
            m_sPanelName = panel;
            m_sValue = value;
            m_nStationBlockID = stationBlockID;
            m_nElementID = elementID;
        }

        // Copy method
        public CBindDBSimElementItem Copy()
        {
            var copy = new CBindDBSimElementItem
            {
                // Assuming CConfigDBSimElementItem has a Copy method
                cConfig = cConfig?.Copy(), // Use null-conditional operator to avoid null reference
                m_sPanelName = m_sPanelName,
                m_sValue = m_sValue,
                m_nStationBlockID = m_nStationBlockID,
                m_nElementID = m_nElementID
            };
            return copy;
        }
    }

    public class CMapKeyToBindDBSimElementItem
    {
        public Dictionary<string, CBindDBSimElementItem> mapKeyToBindDBSimElementItem = new Dictionary<string, CBindDBSimElementItem>();

        public void Add(string sKey, CBindDBSimElementItem cBindDBSimElementItem)
        {
            mapKeyToBindDBSimElementItem.Add(sKey, cBindDBSimElementItem);
        }

        public CBindDBSimElementItem? Search(string sKey)
        {
            if (mapKeyToBindDBSimElementItem.ContainsKey(sKey) == false)
                return null;
            return mapKeyToBindDBSimElementItem[sKey];
        }

        public CMapKeyToBindDBSimElementItem Copy()
        {
            var copy = new CMapKeyToBindDBSimElementItem();

            foreach (var entry in mapKeyToBindDBSimElementItem)
            {
                // Assuming CBindDBSimElementItem has a Copy method
                copy.Add(entry.Key, entry.Value.Copy());
            }

            return copy;
        }
    }
}


namespace BackEndServices.Utilities
{

    public class DataItem
    {
        public string sKey { get; set; }
        public string sData { get; set; }
        public string sType { get; set; }

        public DataItem(string sKey, string sData, string sType)
        {
            this.sKey = sKey;
            this.sData = sData;
            this.sType = sType;
        }
    }
    public class DbSimElementUtils
    {

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
                //
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
                //
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
                //
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
                //
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
                //
            }
        }
    }
}
