import * as Interface from './Panels.interface'

export const LandingGear_WheelsInitialValues: Interface.LandingGear_WheelsInterface['input'] = {
     "LEFT_WHEEL_IN":	"",
}

export const Cmds_ProgramInitialValues: Interface.Cmds_ProgramInterface['input'] = {
     "KNOB_PRGM":	"",
}

export const Exterior_LightingInitialValues: Interface.Exterior_LightingInterface['input'] = {
     "ANTI_COLLISION":	"",
     "EXT_LIGHT_MASTER":	"",
     "FORM_LIGHT":	"",
     "FUSELAGE":	"",
}

export const Fuel_FlowInitialValues: Interface.Fuel_FlowInterface['input'] = {
     "FUEL_NEEDLE":	"",
     "FUEL_QUANTITY_NUMBER":	"",
}

export const Electrical_ControlInitialValues: Interface.Electrical_ControlInterface['input'] = {
     "CAUTION_RESET":	"",
}

export const initialValues: { [K in keyof Interface.InterfaceMap]: Interface.InterfaceMap[K]['input'] } = {
	"LandingGear_Wheels":	LandingGear_WheelsInitialValues,
	"Cmds_Program":	Cmds_ProgramInitialValues,
	"Exterior_Lighting":	Exterior_LightingInitialValues,
	"Fuel_Flow":	Fuel_FlowInitialValues,
	"Electrical_Control":	Electrical_ControlInitialValues,
}

