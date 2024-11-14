import * as Interface from './Panels.interface'

export const CMDSInitialValues: Interface.CMDSInterface['input'] = {
     "RWR_SWITCH_IN":	"",
     "JMR_SWITCH_IN":	"",
     "MWS_SWITCH_IN":	"",
     "KNOB_PRGM_IN":	"",
     "JETT_SWITCH_IN":	"",
}

export const IFFInitialValues: Interface.IFFInterface['input'] = {
     "IFF_MASTER_KNOB_IN":	"",
     "MODE3_XY_SELECTOR_IN":	"",
     "MODE3_TACAN_BAND_IN":	"",
     "MODE3_TACAN_FREQ_ONES_IN":	"",
     "MODE1_TACAN_FREQ_TENS_IN":	"",
     "MODE1_TACAN_FREQ_HUNDREDS_IN":	"",
     "MODE4_REPLY_IN":	"",
}

export const LGControlInitialValues: Interface.LGControlInterface['input'] = {
     "LANDING_GEAR_HANDLE_IN":	"",
     "LANDING_GEAR_HANDLE_CLICK_IN":	"",
     "FRONT_WHEEL_IN":	"",
     "RIGHT_WHEEL_IN":	"",
     "LEFT_WHEEL_IN":	"",
}

export const initialValues: { [K in keyof Interface.InterfaceMap]: Interface.InterfaceMap[K]['input'] } = {
	"CMDS":	CMDSInitialValues,
	"IFF":	IFFInitialValues,
	"LGControl":	LGControlInitialValues,
}

