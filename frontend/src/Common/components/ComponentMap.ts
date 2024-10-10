import React from 'react';
import { GenericTypeComponent } from '../Common.interface'
import { ComponentRotationAnalog, ComponentVerticalTranslationAnalog} from './AnalogComponents'
import { ComponentIntegerKnob, ComponentMultiStateSwitch } from './IntegerComponents';
import { ComponentError } from './ErrorComponent';
import { ComponentStringNumber } from './StringComponents';
import { ComponentStatic } from './StaticComponents';

type ComponentMap = {
    [key: string]: React.ComponentType<GenericTypeComponent>;
};


const componentMap: ComponentMap = {
    "AnalogRotation": ComponentRotationAnalog,
    "AnalogVerticalTranslation": ComponentVerticalTranslationAnalog,
    "IntegerKnob": ComponentIntegerKnob,
    "MultiStateSwitch": ComponentMultiStateSwitch,
    "StringNumber" : ComponentStringNumber,
    "Static" : ComponentStatic,
    "Error" : ComponentError
};

export const getComponentById = (key: string): React.ComponentType<GenericTypeComponent> => {
    return componentMap[key] || ComponentError; // Default to Component1 if id is invalid
}