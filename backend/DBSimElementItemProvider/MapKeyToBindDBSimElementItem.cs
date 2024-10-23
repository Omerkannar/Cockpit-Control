namespace ATH_BackEndServices.Configuration
{
    public class CMapKeyToBindDBSimElementItem
    {
        public Dictionary<string, CBindDBSimElementItem> mapKeyToBindDBSimElementItem = new Dictionary<string, CBindDBSimElementItem>();

        public void Add(string sKey, CBindDBSimElementItem cBindDBSimElementItem)
        {
            mapKeyToBindDBSimElementItem.Add(sKey, cBindDBSimElementItem);
        }

        public CBindDBSimElementItem Search(string sKey)
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
