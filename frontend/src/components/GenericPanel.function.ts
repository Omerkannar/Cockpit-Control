import  settings from '../settings.json' 
import { ClickType } from '../Common/Common.interface'


function getValueByKey<T extends Record<string, any>>(obj: T, key: string): any {
    return obj[key as keyof T];  // Type assertion
}

export const getValue = (state: any, name: string): string => {
    return getValueByKey(state, name);
}

export const nextValueToSend = (jsonData: any, state: any, componentName: string, clickedName: string, pressType: ClickType): [string, string] => {
    const filteredName = jsonData?.filter((item: any) => {
        return item.backend.key === componentName
    })[0]
    // // console.log(componentName, clickedName, filteredName);
    const currentValue = getValue(state, componentName);
    //console.log(currentValue, typeof (currentValue))
    switch (filteredName.type) {
        case "static":
        case "stateN":
            //  Cases that return the exect value that was pressed
            // ! There is no difference if the user pressed long press or click
            const nextValue = (Object.keys(filteredName.backend.dbsimProps.enumMapping).length === 0) ? clickedName : filteredName.backend.dbsimProps.enumMapping[clickedName]
            console.log(nextValue, typeof(nextValue))
            return [nextValue, filteredName.component.logger?.display || "true"];
        case "toggle":
            if(Object.keys(filteredName.backend.dbsimProps.enumMapping).length === 0) {
                return ["", "false"];
            } else {
                const getNextEnumValue = (currentValue: keyof typeof filteredName.backend.dbsimProps.enumMapping): keyof typeof filteredName.backend.dbsimProps.enumMapping => {
                    const enumMapping = filteredName.backend.dbsimProps.enumMapping;
                    const enumKeys = Object.keys(enumMapping) as Array<keyof typeof enumMapping>;
                    const currentIndex = enumKeys.indexOf(currentValue);
                    const nextIndex = (currentIndex + 1) % enumKeys.length;
                    const nextKey = enumKeys[nextIndex];
                    return enumMapping[nextKey];
                  }
                  console.log(String(getNextEnumValue(currentValue)), typeof(String(getNextEnumValue(currentValue))))
                  return [String(getNextEnumValue(currentValue)), filteredName.component.logger?.display || "true"];
            }
        case "knobInteger":
            //  In this case - According to the value that was pressed, the logic will search the next value based on knobProps data
            //  If the user pressed DECREASE or CCW the logic will provide the previous value 
            //  If the user pressed INCREASE or CW the logic will provide the next value 
            // ! There is no difference if the user pressed long press or click
            if (currentValue === "") {
                return ["undefined", "false"];
            }
            // In this case we have knobProps properties
            // Sort the available knob rotation according to their values
            const keys = Object.keys(filteredName.component.knobProps.rotation).sort((a, b) => {
                const valueA = filteredName.component.knobProps.rotation[a];
                const valueB = filteredName.component.knobProps.rotation[b];
                return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
            })
            console.log(keys)
            const index = keys.indexOf(currentValue.toString());
            if (index === -1) {
                throw new Error(`Key "${currentValue.toString()}" not found in the ${filteredName.backend.key}`);
            }
            // Find the next index, if we found the last item - return the first.
            let nextIndex: number = -1;
            if (clickedName === "DECREASE" || clickedName === "CCW") {
                if (index === 0) { nextIndex = 0; }
                else nextIndex = index - 1;
            } else if (clickedName === "INCREASE" || clickedName === "CW") {
                if (index === keys.length - 1) nextIndex = keys.length - 1;
                else nextIndex = index + 1;
            }
            return [nextIndex.toString(), filteredName.component.logger?.display || "true"];
        case "analog_rotation":
        case "analog_vertical_translation":
        case "analog_horizontal_translation":
            //  In this case - According to the value that was pressed, the logic will provide the next value
            //  If the user pressed DECREASE or CCW the logic will substract 1 if the user clicked and 10 (configuration) if the user long pressed 
            //  If the user pressed DECREASE or CCW the logic will add 1 if the user clicked and 10 (configuration) if the user long pressed
            // ! There is difference if the user pressed long press or click
            if (clickedName === "DECREASE" || clickedName === "CCW") {
                if (currentValue === "0") {
                    return ["0", filteredName.component.logger?.display || "true"];
                }
                else {
                    if (pressType === 'click') {
                        console.log(`click on ${filteredName.component}`)
                        return [String(Number(currentValue) - 1), filteredName.logger?.display || "true"];
                    } else { // 'Long Press'
                        if (Number(currentValue) < settings.components_behavior.analogLongPressStep) {
                            return ["0", filteredName.component.logger?.display || "true"];
                        } else {
                            return [String(Number(currentValue) - settings.components_behavior.analogLongPressStep), filteredName.component.logger?.display || "true"];
                        }
                    }
                }
            } else if (clickedName === "INCREASE" || clickedName === "CW") {
                if (currentValue === "100") {
                    return ["100", filteredName.component.logger?.display || "true"];
                }
                else {
                    if (pressType === 'click') {
                        return [String(Number(currentValue) + 1), filteredName.component.logger?.display || "true"];
                    } else {
                        if ((100 - Number(currentValue)) < settings.components_behavior.analogLongPressStep) {
                            return ["100", filteredName.component.logger?.display || "true"];
                        } else {
                            return [String(Number(currentValue) + settings.components_behavior.analogLongPressStep), filteredName.component.logger?.display || "true"];
                        }
                    }
                }
            } else {
                return [clickedName, filteredName.component.logger?.display || "true"];
            }
        default:
            return [clickedName, filteredName.component.logger?.display || "true"];
    }
}