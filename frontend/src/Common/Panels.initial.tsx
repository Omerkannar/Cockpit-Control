import * as Interface from './Panels.interface'

export const LandingGear_WheelsInitialValues: Interface.LandingGear_WheelsInterface['input'] = {
     "LEFT_WHEEL_IN":	"",
}

export const Cmds_ProgramInitialValues: Interface.Cmds_ProgramInterface['input'] = {
     "KNOB_PRGM_IN":	"",
}

export const Epu_FuelInitialValues: Interface.Epu_FuelInterface['input'] = {
     "EPU_FUEL_IN":	"",
}

export const Lg_ParkingInitialValues: Interface.Lg_ParkingInterface['input'] = {
     "LG_PARKING_IN":	"",
}

export const initialValues: { [K in keyof Interface.InterfaceMap]: Interface.InterfaceMap[K]['input'] } = {
	"LandingGear_Wheels":	LandingGear_WheelsInitialValues,
	"Cmds_Program":	Cmds_ProgramInitialValues,
	"Epu_Fuel":	Epu_FuelInitialValues,
	"Lg_Parking":	Lg_ParkingInitialValues,
}

