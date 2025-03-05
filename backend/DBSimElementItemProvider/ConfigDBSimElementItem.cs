//using OneSimLinkInterop;
using OneSimLinkManaged;



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
        //public int m_nStationBlockID;
        //public int m_nElementID;

        public OneSimLinkManaged.IBlock m_cBlockData;
        public OneSimLinkManaged.IElement m_cElementData;

        // Constructor (Optional) for further initialization
        public CBindDBSimElementItem(string? panel = null, 
            string? value = null, 
            OneSimLinkManaged.IBlock? blockData = null, 
            OneSimLinkManaged.IElement? elementData = null)
        {
            m_sPanelName = panel;
            m_sValue = value;
            m_cBlockData = blockData;
            m_cElementData = elementData;
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
                m_cBlockData = m_cBlockData,
                m_cElementData = m_cElementData
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