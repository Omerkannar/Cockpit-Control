import settings from '../settings.json'
import React, { useState, useEffect } from 'react';
import BlinkingQueue from '../Common/BlinkingQueue';
import { GenericPanelInterface, GenericTypeComponent, ClickType } from '../Common/Common.interface'
import { ComponentWrapper } from '../Common/Common.function';
import useDynamicState from '../useDynamicState';
import { InterfaceMap } from '../Common/Panels.interface'
import { Panel } from '../Common/Common.styles'
import ClickContainer from '../Common/ClickContainer';

const GenericPanel: React.FC<GenericPanelInterface> = ({ static_data, dynamic_data, handleSendRequest }) => {

    const defaultScale = static_data.panel_scale

    const [blinkingQueue] = useState(new BlinkingQueue());
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [jsonData, setJsonData] = useState<any>(null);
    const [state, setState] = useDynamicState(static_data.panel_name as keyof InterfaceMap);


    useEffect(() => {
        // Dynamic import with try-catch for better error handling
        const loadJson = async () => {
            try {
                const module = await import(`../data/${static_data.panel_data}.json`)
                setJsonData(module.default);
            } catch (err) {
                console.error("Error loading JSON file:", err);
            }
        };
        loadJson();
        //console.log(jsonData)
        // eslint-disable-next-line
    }, [static_data.panel_data]);

    useEffect(() => {
        if (static_data.panel_name === dynamic_data?.panel) {
            try {
                const elementName = dynamic_data?.element;
                const newValue = dynamic_data?.value;
                console.info(`Receive - Panel: ${dynamic_data?.panel}, Switch: ${dynamic_data?.element}, Value: ${dynamic_data?.value}`)
                if (state) {
                    if (elementName in state) {
                        setState(prevState => prevState ? ({
                            ...prevState,
                            [elementName]: newValue
                        }) : prevState);
                        blinkingQueue.enqueue(elementName);
                    }
                }
            } catch (e) {
                console.log(e)
            }
        }
        // eslint-disable-next-line
    }, [dynamic_data]);


    useEffect(() => {
        const img = new Image();
        img.src = static_data.panel_url
        img.onload = () => {
            setDimensions({ width: img.width, height: img.height })
        }
        // eslint-disable-next-line
    }, [dimensions])


    const handleOnClick = (componentName: string, clickedName: string) => {
        const [newValueToSend, showOnLogger]: [string, string] = nextValueToSend(componentName, clickedName, "click");
        if (showOnLogger === "true") {
            console.info(`Send - Panel: ${static_data?.panel_name}, Switch: ${componentName.replace("_IN", "_OUT")}, Value: ${newValueToSend}`)
        }
        handleSendRequest(static_data?.panel_name, componentName.replace("_IN", "_OUT"), newValueToSend);
    }

    const handleOnLongPress = (componentName: string, clickedName: string) => {

        console.log(`On Long press ${componentName} - ${clickedName}`)
        const [newValueToSend, showOnLogger]: [string, string] = nextValueToSend(componentName, clickedName, "LongPress");
        if (showOnLogger === "true") {
            console.info(`Send - Panel: ${static_data?.panel_name}, Switch: ${componentName.replace("_IN", "_OUT")}, Value: ${newValueToSend}`)
        }
        handleSendRequest(static_data?.panel_name, componentName.replace("_IN", "_OUT"), newValueToSend);
    }

    const nextValueToSend = (componentName: string, clickedName: string, pressType: ClickType): [string, string] => {
        const filteredName = jsonData?.filter((item: any) => {
            return item.backend_name === componentName
        })[0]
        //console.log(componentName, clickedName, filteredName);
        const currentValue = getValue(componentName);
        console.log(currentValue, typeof (currentValue))
        switch (filteredName.type) {
            case "knobInteger":
                if (currentValue === "") {
                    return ["undefined", "false"];
                }
                // In this case we have knob_props properties
                // Sort the available knob rotation according to their values
                const keys = Object.keys(filteredName.knob_props.rotation).sort((a, b) => {
                    const valueA = filteredName.knob_props.rotation[a];
                    const valueB = filteredName.knob_props.rotation[b];
                    return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
                })
                console.log(keys)
                const index = keys.indexOf(currentValue.toString());
                if (index === -1) {
                    throw new Error(`Key "${currentValue.toString()}" not found in the ${filteredName.backend_name}`);
                }
                // Find the next index, if we found the last item - return the first.
                let nextIndex: number = -1;
                if (clickedName === "DECREASE") {
                    if (index === 0) { nextIndex = 0; }
                    else nextIndex = index - 1;
                } else if (clickedName === "INCREASE") {
                    if (index === keys.length - 1) nextIndex = keys.length - 1;
                    else nextIndex = index + 1;
                }
                return [keys[nextIndex], filteredName.logger?.display || "true"];
            case "analog_rotation":
            case "analog_vertical_translation":
            case "analog_horizontal_translation":
                if (clickedName === "DECREASE") {
                    if (currentValue === "0") {
                        return ["0", filteredName.logger?.display || "true"];
                    }
                    else {
                        if (pressType === 'click') {
                            return [String(Number(currentValue) - 1), filteredName.logger?.display || "true"];
                        } else { // 'Long Press'
                            if (Number(currentValue) < settings.components_behavior.analogLongPressStep) {
                                return ["0", filteredName.logger?.display || "true"];
                            } else {
                                return [String(Number(currentValue) - settings.components_behavior.analogLongPressStep), filteredName.logger?.display || "true"];
                            }
                        }
                    }
                } else if (clickedName === "INCREASE") {
                    if (currentValue === "100") {
                        return ["100", filteredName.logger?.display || "true"];
                    }
                    else {
                        if (pressType === 'click') {
                            return [String(Number(currentValue) + 1), filteredName.logger?.display || "true"];
                        } else {
                            if ((100 - Number(currentValue)) < settings.components_behavior.analogLongPressStep) {
                                return ["100", filteredName.logger?.display || "true"];
                            } else {
                                return [String(Number(currentValue) + settings.components_behavior.analogLongPressStep), filteredName.logger?.display || "true"];
                            }
                        }
                    }
                } else {
                    return [clickedName, filteredName.logger?.display || "true"];
                }
            default:
                return [clickedName, filteredName.logger?.display || "true"];
        }
    }

    function getValueByKey<T extends Record<string, any>>(obj: T, key: string): any {
        return obj[key as keyof T];  // Type assertion
    }

    const getValue = (name: string): string => {
        return getValueByKey(state, name);
    }

    return (
        <Panel
            url={static_data.panel_url}
            scale={defaultScale}
            width={dimensions.width}
            height={dimensions.height}
            top={static_data.panel_top}
            left={static_data.panel_left}
        >
            {jsonData?.map((item: GenericTypeComponent['data']) =>
                <div>
                    {ComponentWrapper(defaultScale, getValue(item.backend_name), item)}
                    <ClickContainer
                        scale={defaultScale}
                        data={item}
                        isBlinking={blinkingQueue.search(item.backend_name)}
                        handleClick={handleOnClick}
                        handleLongPress={handleOnLongPress}
                    />
                </div>
            )}
        </Panel>
    )
};

export default GenericPanel;

