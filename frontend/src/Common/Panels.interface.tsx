export interface LGControlInterface {
  input: {
  }
  handleSendRequest?: (switchName: string, switchValue: string) => void;
}

export interface CMDSInterface {
  input: {
     "RWR_SWITCH_IN":	string,
     "JMR_SWITCH_IN":	string,
     "MWS_SWITCH_IN":	string,
     "SWITCH_01_IN":	string,
     "SWITCH_02_IN":	string,
     "SWITCH_CH_IN":	string,
     "SWITCH_FL_IN":	string,
     "SWITCH_JETT_IN":	string,
     "KNOB_PRGM_IN":	string,
     "KNOB_MODE_IN":	string,
     "DISPENSE_IN":	string,
     "RDY_IN":	string,
     "FLR_QTY_IN":	string,
     "CH_QTY_IN":	string,
  }
  handleSendRequest?: (switchName: string, switchValue: string) => void;
}

export interface InteriorLightingInterface {
  input: {
     "PRIMARY_CONSOLES_BRT_IN":	string,
  }
  handleSendRequest?: (switchName: string, switchValue: string) => void;
}

export type InterfaceMap = {
     "LGControl":	LGControlInterface;
     "CMDS":	CMDSInterface;
     "InteriorLighting":	InteriorLightingInterface;
}

export type InterfaceKey = keyof InterfaceMap;