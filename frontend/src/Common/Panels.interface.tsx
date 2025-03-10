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

export interface Exterior_LightingInterface {
  input: {
     "ANTI_COLLISION":	string,
     "EXT_LIGHT_MASTER":	string,
     "FORM_LIGHT":	string,
     "FUSELAGE":	string,
  }
  handleSendRequest?: (switchName: string, switchValue: string) => void;
}

export interface Fuel_FlowInterface {
  input: {
     "FUEL_NEEDLE":	string,
     "FUEL_QUANTITY_NUMBER":	string,
  }
  handleSendRequest?: (switchName: string, switchValue: string) => void;
}

export interface Electrical_ControlInterface {
  input: {
     "CAUTION_RESET":	string,
  }
  handleSendRequest?: (switchName: string, switchValue: string) => void;
}

export type InterfaceMap = {
     "LandingGear_Wheels":	LandingGear_WheelsInterface;
     "Cmds_Program":	Cmds_ProgramInterface;
     "Exterior_Lighting":	Exterior_LightingInterface;
     "Fuel_Flow":	Fuel_FlowInterface;
     "Electrical_Control":	Electrical_ControlInterface;
}

export type InterfaceKey = keyof InterfaceMap;