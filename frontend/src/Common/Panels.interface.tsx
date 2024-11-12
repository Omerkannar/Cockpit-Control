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
     "MODE3_TACAN_BAND_IN":	string,
     "MODE3_TACAN_FREQ_ONES_IN":	string,
     "MODE1_TACAN_FREQ_TENS_IN":	string,
     "MODE1_TACAN_FREQ_HUNDREDS_IN":	string,
  }
  handleSendRequest?: (switchName: string, switchValue: string) => void;
}

export interface LGControlInterface {
  input: {
     "LANDING_GEAR_HANDLE_IN":	string,
     "LANDING_GEAR_HANDLE_CLICK_IN":	string,
     "FRONT_WHEEL_IN":	string,
     "RIGHT_WHEEL_IN":	string,
     "LEFT_WHEEL_IN":	string,
  }
  handleSendRequest?: (switchName: string, switchValue: string) => void;
}

export type InterfaceMap = {
     "CMDS":	CMDSInterface;
     "IFF":	IFFInterface;
     "LGControl":	LGControlInterface;
}

export type InterfaceKey = keyof InterfaceMap;