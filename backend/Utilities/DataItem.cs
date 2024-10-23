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
}
