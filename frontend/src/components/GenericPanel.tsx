import settings from '../settings.json'
import React, { useState, useEffect } from 'react';
import BlinkingQueue from '../Common/BlinkingQueue';
import { GenericPanelInterface, GenericTypeComponent, ClickType, BasicTypeComponent } from '../Common/Common.interface'
import { ComponentWrapper } from '../Common/Common.function';
import useDynamicState from '../useDynamicState';
import { InterfaceMap } from '../Common/Panels.interface'
import { Panel } from '../Common/Common.styles'
import ClickContainer from '../Common/ClickContainer';
import clickingMapping from '../data/mapping/ClickingMapping.json'
import { getParsedCommandLineOfConfigFile } from 'typescript';


const GenericPanel: React.FC<GenericPanelInterface> = ({ static_data, dynamic_data, handleSendRequest }) => {

    const defaultScale = static_data.panel_scale

    const [blinkingQueue] = useState(new BlinkingQueue());
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [jsonData, setJsonData] = useState<any>(null);
    const [state, setState] = useDynamicState(static_data.panel_name as keyof InterfaceMap);
    const [lastValueSent, setLastValueSent] = useState<string>("")


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
        // eslint-disable-next-line
    }, [static_data.panel_data]);

    useEffect(() => {
        console.log(dynamic_data)
        if (dynamic_data) {
            for (let index = 0; index < dynamic_data.length; index++) {
                if (static_data.panel_name === dynamic_data[index].panel) {
                    try {
                        const elementName: string = dynamic_data[index].element;
                        const elementData = jsonData.find((item: BasicTypeComponent['data']) => {
                            return elementName === item.backend.key;
                        })
                        console.log(elementData)
                        console.log(dynamic_data[index].value, typeof (dynamic_data[index].value))
                        let newValue: string | undefined = "";
                        if (Object.keys(elementData.backend.dbsimProps.enumMapping).length === 0) {
                            console.log(`No dbsim enum mapping found, new value is ${dynamic_data[index].value}`)
                            newValue = dynamic_data[index].value
                        } else {
                            newValue = Object.keys(elementData.backend.dbsimProps.enumMapping).find(key =>
                                elementData.backend.dbsimProps.enumMapping[key as keyof typeof elementData.backend.dbsimProps.enumMapping] === Number(dynamic_data[index].value)
                            );
                        }
                        console.info(`Receive - Panel: ${dynamic_data[index].panel}, Switch: ${elementName}, Value: ${newValue}`)
                        console.log(state, elementName in state)
                        if (state) {
                            if (elementName in state) {
                                setState(prevState => ({
                                    ...prevState,
                                    [elementName]: newValue
                                }));
                                if (dynamic_data[index].blinking === true) {
                                    blinkingQueue.enqueue(elementName);
                                }
                            }
                        }
                    } catch (e) {
                        console.log(e)
                    }
                }
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

        let [newValueToSend, showOnLogger]: [string, string] = ["", ""]
        const clickMap = clickingMapping.filter((obj: any) => {
            return componentName === obj.key;
        })

        if (clickMap.length > 0) {
            [newValueToSend, showOnLogger] = nextValueToSend(clickMap[0].source, clickedName, "click");
            if (showOnLogger === "true") {
                console.info(`Send - Panel: ${static_data?.panel_name}, Switch: ${clickMap[0].source.replace("_IN", "_OUT")}, Value: ${newValueToSend}`)
            }
            handleSendRequest(static_data?.panel_name, clickMap[0].source, newValueToSend);
        } else {
            [newValueToSend, showOnLogger] = nextValueToSend(componentName, clickedName, "click");
            if (showOnLogger === "true") {
                console.info(`Send - Panel: ${static_data?.panel_name}, Switch: ${componentName.replace("_IN", "_OUT")}, Value: ${newValueToSend}`)
            }
            handleSendRequest(static_data?.panel_name, componentName, newValueToSend);
        }
    }

    const handleOnLongPress = (componentName: string, clickedName: string) => {

        let [newValueToSend, showOnLogger]: [string, string] = ["", ""]
        const clickMap = clickingMapping.filter((obj: any) => {
            return componentName === obj.key;
        })

        if (clickMap.length > 0) {
            [newValueToSend, showOnLogger] = nextValueToSend(clickMap[0].source, clickedName, "LongPress");
            if (showOnLogger === "true") {
                console.info(`Send - Panel: ${static_data?.panel_name}, Switch: ${clickMap[0].source.replace("_IN", "_OUT")}, Value: ${newValueToSend}`)
            }
            handleSendRequest(static_data?.panel_name, clickMap[0].source, newValueToSend);
        } else {
            [newValueToSend, showOnLogger] = nextValueToSend(componentName, clickedName, "LongPress");
            if (showOnLogger === "true") {
                console.info(`Send - Panel: ${static_data?.panel_name}, Switch: ${componentName.replace("_IN", "_OUT")}, Value: ${newValueToSend}`)
            }
            handleSendRequest(static_data?.panel_name, componentName, newValueToSend);
        }
    }

    const nextValueToSend = (componentName: string, clickedName: string, pressType: ClickType): [string, string] => {
        const filteredName = jsonData?.find((item: any) => {
            return item.backend.key === componentName
        })
        // // console.log(componentName, clickedName, filteredName);
        const currentValue = getValue(componentName);
        console.log(currentValue, typeof (currentValue))
        switch (filteredName.type) {
            case "static":
            case "stateN":
                //  Cases that return the exect value that was pressed
                // ! There is no difference if the user pressed long press or click
                const nextValue = (Object.keys(filteredName.backend.dbsimProps.enumMapping).length === 0) ? clickedName : filteredName.backend.dbsimProps.enumMapping[clickedName]
                return [nextValue, filteredName.component.logger?.display || "true"];
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
                    {ComponentWrapper(defaultScale, getValue(item.backend.key), item)}
                    <ClickContainer
                        scale={defaultScale}
                        data={item}
                        isBlinking={blinkingQueue.search(item.backend.key)}
                        handleClick={handleOnClick}
                        handleLongPress={handleOnLongPress}
                    />
                </div>
            )}
        </Panel>
    )
};

export default GenericPanel;

