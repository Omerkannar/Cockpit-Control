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

}
