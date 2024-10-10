import React from 'react';
import { GenericTypeComponent } from './Common.interface'
import { getComponentById } from './components/ComponentMap'
import { ComponentStringContainer } from './components/StringComponents';
import { getValueByKey, linearInterpolation, readDigits } from './Common.function.Aux';

// Function to get value by key
export const ComponentWrapper = (scale: number, state: string, data: GenericTypeComponent['data']): React.ReactNode => {
    switch (data.type) {
        // const SelectedComponent = getComponentById("Error") as React.ComponentType<GenericTypeComponent>;
        // return <SelectedComponent scale={scale} state={state} data={data}>Error {data.backend_name} - Grid directin no defined</SelectedComponent>;
        case "knobInteger":
            {
                const SelectedComponent = getComponentById("IntegerKnob") as React.ComponentType<GenericTypeComponent>;
                const rot = getValueByKey(state, data.knob_props?.rotation)
                return <SelectedComponent scale={scale} state={rot} data={data} />
            }
        case "stateN":
            {
                const SelectedComponent = getComponentById("MultiStateSwitch") as React.ComponentType<GenericTypeComponent>;
                return <SelectedComponent scale={scale} state={state} data={data} />
            }
        case "number":
            const elements = [];
            if (data.string_props?.maxStringLength) {
                for (let digit = 0; digit < data.string_props?.maxStringLength; digit++) {
                    const SelectedComponent = getComponentById("StringNumber") as React.ComponentType<GenericTypeComponent>;
                    elements.push(<SelectedComponent scale={scale} state={readDigits(state.toString(), data.string_props?.maxStringLength)[digit]} data={data} digitOffset={data.width * digit} />)
                }
                return (
                    <ComponentStringContainer container_width={data.width * data.string_props?.maxStringLength} container_height={data.height} container_left={data.left} container_top={data.top}>
                        {elements.length > 0 && elements}
                    </ComponentStringContainer>
                )
            } else {
                const SelectedComponent = getComponentById("Error") as React.ComponentType<GenericTypeComponent>;
                return <SelectedComponent scale={scale} state={state} data={data}>Error {data.backend_name} - maxStringLength not defined</SelectedComponent>;
            }
        case "analog_rotation":
            {
                const SelectedComponent = getComponentById("AnalogRotation") as React.ComponentType<GenericTypeComponent>;
                return <SelectedComponent scale={scale} state={linearInterpolation(data.analog_props, Number(state))} data={data} />
            }
        case "analog_vertical_translation":
            //console.log("analog_rotation")
            {
                const SelectedComponent = getComponentById("AnalogVerticalTranslation") as React.ComponentType<GenericTypeComponent>;
                return <SelectedComponent scale={scale} state={linearInterpolation(data.analog_props, Number(state))} data={data} />
            }
        case "static":
            {
                const SelectedComponent = getComponentById("Static") as React.ComponentType<GenericTypeComponent>;
                return <SelectedComponent scale={scale} state={state} data={data} />
            }

        default:
            const SelectedComponent = getComponentById("Error") as React.ComponentType<GenericTypeComponent>;
            return <SelectedComponent scale={scale} state={state} data={data}>Error {data.backend_name} - Type not defined</SelectedComponent>;
    }
}