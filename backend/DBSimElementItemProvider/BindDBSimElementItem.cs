namespace BackEndServices.Configuration
{
    public class CBindDBSimElementItem
    {
        public CConfigDBSimElementItem cConfig { get; set; } = new CConfigDBSimElementItem(); // Initialized with a new instance

        // Value
        public string? m_sValue;

        // help data
        public int m_nStationBlockID;
        public int m_nElementID;

        // Constructor (Optional) for further initialization
        public CBindDBSimElementItem(string? value = null, int stationBlockID = 0, int elementID = 0)
        {
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
                m_sValue = m_sValue,
                m_nStationBlockID = m_nStationBlockID,
                m_nElementID = m_nElementID
            };
            return copy;
        }
    }
}
