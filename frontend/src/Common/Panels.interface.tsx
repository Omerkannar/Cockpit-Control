export interface LandingGear_WheelsInterface {
  input: {
     "LEFT_WHEEL_IN":	string,
  }
  handleSendRequest?: (switchName: string, switchValue: string) => void;
}

export interface Cmds_ProgramInterface {
  input: {
     "KNOB_PRGM_IN":	string,
  }
  handleSendRequest?: (switchName: string, switchValue: string) => void;
}

export type InterfaceMap = {
     "LandingGear_Wheels":	LandingGear_WheelsInterface;
     "Cmds_Program":	Cmds_ProgramInterface;
}

export type InterfaceKey = keyof InterfaceMap;