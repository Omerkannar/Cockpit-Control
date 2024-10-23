export interface LGControlInterface {
  input: {
     "LANDING_GEAR_HANDLE_IN":	string,
     "LANDING_GEAR_HANDLE_CLICK_IN":	string,
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

export interface IFFInterface {
  input: {
     "IFF_MASTER_KNOB_IN":	string,
     "M4_CODE_IN":	string,
     "MODE4_REPLY_IN":	string,
     "MODE3_TACAN_BAND_IN":	string,
     "MODE3_TACAN_BAND_SELECTOR_IN":	string,
     "MODE3_TACAN_FREQUENCY___X_SELECTOR_IN":	string,
     "MODE1_TACAN_FREQUENCY__X__SELECTOR_IN":	string,
     "MODE1_TACAN_FREQUENCY_X___SELECTOR_IN":	string,
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
     "IFF":	IFFInterface;
     "InteriorLighting":	InteriorLightingInterface;
}

export type InterfaceKey = keyof InterfaceMap;