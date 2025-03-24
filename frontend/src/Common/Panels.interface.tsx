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

export interface ADDSInterface {
  input: {
     "PROG_Button":	string,
     "Program_selector_IN":	string,
     "MODE_selector_IN":	string,
     "EMER_SWITCH_IN":	string,
     "R_indicators_lights_IN":	string,
     "T_indicators_lights_IN":	string,
     "P_indicators_lights_IN":	string,
     "C_BUTTON_IN":	string,
     "Panic_Button":	string,
     "NVIS_BTR_IN":	string,
     "CH_TOTAL_IN":	string,
     "FL_TOTAL_IN":	string,
     "RF_TOTAL_IN":	string,
     "CH_Button":	string,
     "FL_Button":	string,
     "RF_Button":	string,
     "CH_light_IN":	string,
     "FL_light_IN":	string,
     "RF_light_IN":	string,
     "ADDS_power_IN":	string,
  }
  handleSendRequest?: (switchName: string, switchValue: string) => void;
}

export interface ICPInterface {
  input: {
     "ICP_DUCK":	string,
  }
  handleSendRequest?: (switchName: string, switchValue: string) => void;
}

export type InterfaceMap = {
     "LandingGear_Wheels":	LandingGear_WheelsInterface;
     "Cmds_Program":	Cmds_ProgramInterface;
     "Exterior_Lighting":	Exterior_LightingInterface;
     "Fuel_Flow":	Fuel_FlowInterface;
     "Electrical_Control":	Electrical_ControlInterface;
     "ADDS":	ADDSInterface;
     "ICP":	ICPInterface;
}

export type InterfaceKey = keyof InterfaceMap;