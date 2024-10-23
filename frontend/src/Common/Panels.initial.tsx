import * as Interface from './Panels.interface'

export const LGControlInitialValues: Interface.LGControlInterface['input'] = {
     "LANDING_GEAR_HANDLE_IN":	"",
     "LANDING_GEAR_HANDLE_CLICK_IN":	"",
}

export const CMDSInitialValues: Interface.CMDSInterface['input'] = {
     "RWR_SWITCH_IN":	"",
     "JMR_SWITCH_IN":	"",
     "MWS_SWITCH_IN":	"",
     "SWITCH_01_IN":	"",
     "SWITCH_02_IN":	"",
     "SWITCH_CH_IN":	"",
     "SWITCH_FL_IN":	"",
     "SWITCH_JETT_IN":	"",
     "KNOB_PRGM_IN":	"",
     "KNOB_MODE_IN":	"",
     "DISPENSE_IN":	"",
     "RDY_IN":	"",
     "FLR_QTY_IN":	"",
     "CH_QTY_IN":	"",
}

export const IFFInitialValues: Interface.IFFInterface['input'] = {
     "IFF_MASTER_KNOB_IN":	"",
     "M4_CODE_IN":	"",
     "MODE4_REPLY_IN":	"",
     "MODE3_TACAN_BAND_IN":	"",
     "MODE3_TACAN_BAND_SELECTOR_IN":	"",
     "MODE3_TACAN_FREQUENCY___X_SELECTOR_IN":	"",
     "MODE1_TACAN_FREQUENCY__X__SELECTOR_IN":	"",
     "MODE1_TACAN_FREQUENCY_X___SELECTOR_IN":	"",
}

export const InteriorLightingInitialValues: Interface.InteriorLightingInterface['input'] = {
     "PRIMARY_CONSOLES_BRT_IN":	"",
}

export const initialValues: { [K in keyof Interface.InterfaceMap]: Interface.InterfaceMap[K]['input'] } = {
	"LGControl":	LGControlInitialValues,
	"CMDS":	CMDSInitialValues,
	"IFF":	IFFInitialValues,
	"InteriorLighting":	InteriorLightingInitialValues,
}

