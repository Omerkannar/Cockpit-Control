import {useState} from 'react'
import { InterfaceKey, InterfaceMap } from "./Common/Panels.interface";
import {initialValues} from './Common/Panels.initial'

function useDynamicState<T extends InterfaceKey>(key: T) {
    const initialState = initialValues[key];
    const [state, setState] = useState<InterfaceMap[T]['input']>(initialState);
    
    return [state, setState] as const;
}

export default useDynamicState;