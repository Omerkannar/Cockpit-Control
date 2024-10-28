import * as Interface from './Panels.interface'

export const CMDSInitialValues: Interface.CMDSInterface['input'] = {
     "RWR_SWITCH_IN":	"",
     "JMR_SWITCH_IN":	"",
     "MWS_SWITCH_IN":	"",
     "KNOB_PRGM_IN":	"",
}

export const IFFInitialValues: Interface.IFFInterface['input'] = {
     "IFF_MASTER_KNOB_IN":	"",
}

export const initialValues: { [K in keyof Interface.InterfaceMap]: Interface.InterfaceMap[K]['input'] } = {
	"CMDS":	CMDSInitialValues,
	"IFF":	IFFInitialValues,
}

