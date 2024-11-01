export interface CMDSInterface {
  input: {
     "RWR_SWITCH_IN":	string,
     "JMR_SWITCH_IN":	string,
     "MWS_SWITCH_IN":	string,
     "KNOB_PRGM_IN":	string,
     "JETT_SWITCH_IN":	string,
  }
  handleSendRequest?: (switchName: string, switchValue: string) => void;
}

export interface IFFInterface {
  input: {
     "IFF_MASTER_KNOB_IN":	string,
     "MODE3_XY_SELECTOR_IN":	string,
  }
  handleSendRequest?: (switchName: string, switchValue: string) => void;
}

export type InterfaceMap = {
     "CMDS":	CMDSInterface;
     "IFF":	IFFInterface;
}

export type InterfaceKey = keyof InterfaceMap;