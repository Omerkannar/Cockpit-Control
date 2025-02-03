export interface LandingGear_WheelsInterface {
  input: {
     "LEFT_WHEEL_IN":	string,
  }
  handleSendRequest?: (switchName: string, switchValue: string) => void;
}

export interface Cmds_ProgramInterface {
  input: {
     "KNOB_PRGM":	string,
  }
  handleSendRequest?: (switchName: string, switchValue: string) => void;
}

export interface AdiInterface {
  input: {
     "ADI_LADDER_PITCH":	string,
     "ADI_Cover":	string,
     "AUX":	string,
     "LOC":	string,
     "GS":	string,
     "OFF":	string,
  }
  handleSendRequest?: (switchName: string, switchValue: string) => void;
}

export type InterfaceMap = {
     "LandingGear_Wheels":	LandingGear_WheelsInterface;
     "Cmds_Program":	Cmds_ProgramInterface;
     "Adi":	AdiInterface;
}

export type InterfaceKey = keyof InterfaceMap;