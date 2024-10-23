using System.Collections;
using System.Runtime.InteropServices;
using System.Text;

namespace ATH_BackEndServices.Utilities
{
    public class IniFile
    {
        private struct SectionPair
        {
            public String Section;
            public String Key;
        }

        private Hashtable keyPairs = new Hashtable();
        public string path;
        string Path = System.Environment.CurrentDirectory+"\\"+"ConfigFile.ini";

        [DllImport("kernel32")]
        private static extern long WritePrivateProfileString(string section, string key, string val, string filePath);
        [DllImport("kernel32")]
        private static extern int GetPrivateProfileString(string section, string key, string def, StringBuilder retVal, int size, string filePath);
        public IniFile(string Path)
        {
            path = Path;
        }

        public IniFile()
        {
        }

        public void IniWriteValue(string Section, string Key, string Value)
        {
            WritePrivateProfileString(Section, Key, Value, this.path);
        }

        public string IniReadValue(string Section, string Key)
        {
            StringBuilder temp = new StringBuilder(255);
            int i = GetPrivateProfileString(Section, Key, "", temp, 255, this.path);
            return temp.ToString();
        }

        public void GetSectionList(String sFile)
        {
            TextReader iniFile = null;
            String strLine = null;
            String currentRoot = null;
            String[] keyPair = null;                    

            if (File.Exists(sFile))
            {
                try
                {
                    iniFile = new StreamReader(sFile);

                    strLine = iniFile.ReadLine();

                    while (strLine != null)
                    {
                        strLine = strLine.Trim().ToUpper();

                        if (strLine != "")
                        {
                            if (strLine.StartsWith("[") && strLine.EndsWith("]"))
                            {
                                currentRoot = strLine.Substring(1, strLine.Length - 2);
                            }
                            else
                            {
                                keyPair = strLine.Split(new char[] { '=' }, 2);

                                SectionPair sectionPair;
                                String value = null;

                                if (currentRoot == null)
                                    currentRoot = "ROOT";

                                sectionPair.Section = currentRoot;
                                sectionPair.Key = keyPair[0];

                                if (keyPair.Length > 1)
                                    value = keyPair[1];

                                keyPairs.Add(sectionPair, value);
                            }
                        }

                        strLine = iniFile.ReadLine();
                    }

                }
                catch (Exception ex)
                {
                    if (iniFile != null)
                        iniFile.Close();
                }
                finally
                {
                    if (iniFile != null)
                        iniFile.Close();
                }
            }
        }
    }
}
