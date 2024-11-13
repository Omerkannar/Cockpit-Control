import settings from '../settings.json'
import { ClickType, OpertaionType } from '../Common/Common.interface'


function getValueByKey<T extends Record<string, any>>(obj: T, key: string): any {
    return obj[key as keyof T];  // Type assertion
}

export const getValue = (state: any, name: string): string => {
    return getValueByKey(state, name);
}

// ! There are 3 parameters to determine what will be the next value:
// ! 1) Component type - Every type has unique behavior
// ! 2) Click or Long press
// ! 3) Click behavior type - Component is toggle or press by value (value determined where the user pressed)
export const nextValueToSend = (jsonData: any, state: any, componentName: string, clickedName: string, pressType: ClickType): [string, string] => {

    const filteredName = jsonData?.filter((item: any) => {
        return item.backend.key === componentName
    })[0]

    const currentValue = getValue(state, componentName);
    const clickBehaviorType: OpertaionType = filteredName.component.clickProps.clickType || "clickByValue"; // Click behavior is "Click by value" by default
    const showInLogger: string = filteredName.component.logger?.display || "true"; // Show changed value in logger by default
    switch (filteredName.type) {
        case "static":
        case "stateN":
            return [handleSimpleComponentNextValue(filteredName, clickedName, clickBehaviorType, currentValue), showInLogger];
        case "knobInteger":
            return [handleKnobNextValue(filteredName, clickedName, clickBehaviorType, currentValue), showInLogger];
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


//  Cases that return the exect value that was pressed
// ! There is no difference if the user pressed long press or click
const handleSimpleComponentNextValue = (selectedComponent: any, clickedName: string, clickBehaviorType: OpertaionType, currentValue: string): string => {
    let nextValue = ""
    if (clickBehaviorType === "clickByValue") {
        nextValue = (Object.keys(selectedComponent.backend.dbsimProps.enumMapping).length === 0) ?
            clickedName : selectedComponent.backend.dbsimProps.enumMapping[clickedName]
        console.log(nextValue, typeof (nextValue))
        return nextValue;
    } else if (clickBehaviorType === "toggle") {
        if (Object.keys(selectedComponent.backend.dbsimProps.enumMapping).length === 0) {
            return "";
        } else {
            const getNextEnumValue = (currentValue: keyof typeof selectedComponent.backend.dbsimProps.enumMapping): keyof typeof selectedComponent.backend.dbsimProps.enumMapping => {
                const enumMapping = selectedComponent.backend.dbsimProps.enumMapping;
                const enumKeys = Object.keys(enumMapping) as Array<keyof typeof enumMapping>;
                const currentIndex = enumKeys.indexOf(currentValue);
                const nextIndex = (currentIndex + 1) % enumKeys.length;
                const nextKey = enumKeys[nextIndex];
                return enumMapping[nextKey];
            }
            console.log(String(getNextEnumValue(currentValue)), typeof (String(getNextEnumValue(currentValue))))
            return String(getNextEnumValue(currentValue));
        }
    } else {
        return ""
    }
}

//  Cases that handles knob changes (Enum value changes)
// ! There is no difference if the user pressed long press or click
const handleKnobNextValue = (selectedComponent: any, clickedName: string, clickBehaviorType: OpertaionType, currentValue: string): string => {
    //  In this case - According to the value that was pressed, the logic will search the next value based on knobProps data
    //  If the user pressed DECREASE or CCW the logic will provide the previous value 
    //  If the user pressed INCREASE or CW the logic will provide the next value 
    // ! There is no difference if the user pressed long press or click
    let nextValue = ""
    if (currentValue === "") {
        return nextValue
    }

    // In this case we have knobProps properties
    // Sort the available knob rotation according to their values
    const keys = Object.keys(selectedComponent.component.knobProps.rotation).sort((a, b) => {
        const valueA = selectedComponent.component.knobProps.rotation[a];
        const valueB = selectedComponent.component.knobProps.rotation[b];
        return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
    })
    const index = keys.indexOf(currentValue.toString());
    const knobPropsRotationLength: number = Object.keys(selectedComponent.component.knobProps.rotation).length;
    if (index === -1) {
        throw new Error(`Key "${currentValue.toString()}" not found in the ${selectedComponent.backend.key}`);
    }

    // Find the next index, if we found the last item - return the first.
    let nextIndex: number = -1;

    if (clickBehaviorType === "clickByValue") {

        if (clickedName === "DECREASE" || clickedName === "CCW") {
            if (index === 0) nextIndex = 0;
            else nextIndex = index - 1;
        } else if (clickedName === "INCREASE" || clickedName === "CW") {
            if (index === keys.length - 1) nextIndex = keys.length - 1;
            else nextIndex = index + 1;
        }
        return String(nextIndex);
    } else if (clickBehaviorType === "toggle") {
        nextIndex = (index + 1) % knobPropsRotationLength;
        return String(nextIndex);
    } else {
        return ""
    }
}
