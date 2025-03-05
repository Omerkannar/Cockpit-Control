
import React, { useState, useEffect } from 'react';
import BlinkingQueue from '../Common/BlinkingQueue';
import { GenericPanelInterface, GenericTypeComponent, BasicTypeComponent, DbsimProps } from '../Common/Common.interface'
import { ComponentWrapper } from '../Common/Common.function';
import useDynamicState from '../useDynamicState';
import { InterfaceMap } from '../Common/Panels.interface'
import { Panel } from '../Common/Common.styles'
import ClickContainer from '../Common/ClickContainer/ClickContainer';
import clickingMapping from '../data/mapping/ClickingMapping.json'
import { getValue, nextValueToSend, getObjectMonitorDbsimProps } from './GenericPanel.function';
import Modal from '../Modal/Modal';

const GenericPanel: React.FC<GenericPanelInterface> = ({ static_data, dynamic_data, handleSendRequest }) => {

    const defaultScale = static_data.panel_scale

    const [blinkingQueue] = useState(new BlinkingQueue());
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [jsonData, setJsonData] = useState<any>(null);
    const [state, setState] = useDynamicState(static_data.panel_name as keyof InterfaceMap);

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const handleOpenModal = () => setIsModalOpen(true && static_data.enlargeProps.enable);
    const handleCloseModal = () => setIsModalOpen(false);

    // Load JSON on the first render according to panel name
    useEffect(() => {
        // Dynamic import with try-catch for better error handling
        const loadJson = async () => {
            try {
                const module = await import(`../data/${static_data.panel_name}.json`)
                setJsonData(module.default);
            } catch (err) {
                console.error("Error loading JSON file:", err);
            }
        };
        loadJson();
        // eslint-disable-next-line
    }, [static_data.panel_name]);


    // Once new data arrives - update dynamic state
    useEffect(() => {
        if (dynamic_data) {
            for (let index = 0; index < dynamic_data.length; index++) {
                console.log(dynamic_data)
                if (static_data.panel_name.toLowerCase() === dynamic_data[index].panel.toLowerCase()) {
                    try {
                        let elementName: string = dynamic_data[index].element;
                        if (elementName.includes("_Monitor")) {
                            elementName = elementName.replace("_Monitor", "");
                        }
                        const elementData = jsonData.filter((item: BasicTypeComponent['data']) => {
                            return (elementName === item.backend.key) ;
                        })[0]
                        let newValue: string | undefined = "";
                        const monitorElementData: DbsimProps = getObjectMonitorDbsimProps(elementData.backend.dbsimProps);
                        if (Object.keys(monitorElementData.enumMapping).length === 0) {
                            console.log(`No dbsim enum mapping found, new value is ${dynamic_data[index].value}`)
                            newValue = dynamic_data[index].value
                        } else {
                            console.log(`Received new value, new value is ${dynamic_data[index].value}. Type ${typeof (dynamic_data[index].value)}`)
                            newValue = Object.keys(monitorElementData.enumMapping).find(key =>
                                monitorElementData.enumMapping[key as keyof typeof monitorElementData.enumMapping] == dynamic_data[index].value
                            );
                        }
                        console.info(`Receive - Panel: ${dynamic_data[index].panel}, Switch: ${elementName}, Value: ${newValue}`)
                        if (state) {
                            if (elementName in state) {
                                setState(prevState => ({
                                    ...prevState,
                                    [elementName]: newValue
                                }));
                                console.log(dynamic_data[index].blinking)
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

    // Set panel dimensions according to panel original size
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
        const clickMap: any = clickingMapping.filter((obj: any) => {
            return componentName === obj.key;
        })[0]

        if (clickMap) {
            [newValueToSend, showOnLogger] = nextValueToSend(jsonData, state, clickMap.source, clickedName, "click");
            if (showOnLogger === "true") {
                console.info(`Send - Panel: ${static_data?.panel_name}, Switch: ${clickMap.source}, Value: ${newValueToSend}`)
            }
            handleSendRequest(static_data?.panel_name, clickMap.source, newValueToSend);
        } else {
            const elementData: BasicTypeComponent['data'] = jsonData.filter((item: BasicTypeComponent['data']) => {
                return componentName === item.backend.key;
            })[0]
            if (elementData.type !== 'stateNMomentary') {
                [newValueToSend, showOnLogger] = nextValueToSend(jsonData, state, componentName, clickedName, "click");
                if (showOnLogger === "true") {
                    console.info(`Send - Panel: ${static_data?.panel_name}, Switch: ${componentName}, Value: ${newValueToSend}`)
                }
                handleSendRequest(static_data?.panel_name, componentName, newValueToSend);
            }
        }
    }

    const handleOnLongPress = (componentName: string, clickedName: string) => {

        let [newValueToSend, showOnLogger]: [string, string] = ["", ""]
        const clickMap: any = clickingMapping.filter((obj: any) => {
            return componentName === obj.key;
        })[0]

        if (clickMap) {
            [newValueToSend, showOnLogger] = nextValueToSend(jsonData, state, clickMap.source, clickedName, "longPress");
            if (showOnLogger === "true") {
                console.info(`Send - Panel: ${static_data?.panel_name}, Switch: ${clickMap.source}, Value: ${newValueToSend}`)
            }
            handleSendRequest(static_data?.panel_name, clickMap.source, newValueToSend);
        } else {
            const elementData: BasicTypeComponent['data'] = jsonData.filter((item: BasicTypeComponent['data']) => {
                return componentName === item.backend.key;
            })[0]
            if (elementData.type !== 'stateNMomentary') {
                [newValueToSend, showOnLogger] = nextValueToSend(jsonData, state, componentName, clickedName, "longPress");
                if (showOnLogger === "true") {
                    console.info(`Send - Panel: ${static_data?.panel_name}, Switch: ${componentName}, Value: ${newValueToSend}`)
                }
                handleSendRequest(static_data?.panel_name, componentName, newValueToSend);
            }
        }
    }

    const handleClickDown = (componentName: string, clickedName: string) => {
        let [newValueToSend, showOnLogger]: [string, string] = ["", ""]
        const elementData: BasicTypeComponent['data'] = jsonData.filter((item: BasicTypeComponent['data']) => {
            return componentName === item.backend.key;
        })[0]
        if (elementData.type === 'stateNMomentary') {
            console.log(`Mouse Down on stateNMomentary`);
            [newValueToSend, showOnLogger] = nextValueToSend(jsonData, state, componentName, clickedName, "click");
            handleSendRequest(static_data?.panel_name, componentName, newValueToSend);
        }
    }

    const handleClickUp = (componentName: string, clickedName: string) => {
        let [newValueToSend, showOnLogger]: [string, string] = ["", ""]
        const elementData: BasicTypeComponent['data'] = jsonData.filter((item: BasicTypeComponent['data']) => {
            return componentName === item.backend.key;
        })[0]
        if (elementData.type === 'stateNMomentary') {
            console.log(`Mouse Up on stateNMomentary`);
            [newValueToSend, showOnLogger] = nextValueToSend(jsonData, state, componentName, "RELEASE", "click");
            handleSendRequest(static_data?.panel_name, componentName, newValueToSend);
        }
    }



    return (
        <>
            <Panel
                url={static_data.panel_url}
                scale={defaultScale}
                width={dimensions.width}
                height={dimensions.height}
                top={static_data.panel_top}
                left={static_data.panel_left}
                onClick={handleOpenModal}
            >
                {jsonData?.map((item: GenericTypeComponent['data']) =>
                    <div>
                        {ComponentWrapper(defaultScale, getValue(state, item.backend.key), item)}
                        < ClickContainer
                            scale={defaultScale}
                            data={item}
                            isBlinking={blinkingQueue.search(item.backend.key)}
                            handleClick={handleOnClick}
                            handleLongPress={handleOnLongPress}
                            handleClickDown={handleClickDown}
                            handleClickUp={handleClickUp}
                        />
                    </div>
                )}
            </Panel>
            <Modal
                isOpen={isModalOpen}
                width={dimensions.width * (static_data.enlargeProps.scale) / 100}
                height={dimensions.height * (static_data.enlargeProps.scale) / 100}
                onClose={handleCloseModal}>
                <Panel
                    url={static_data.panel_url}
                    scale={static_data.enlargeProps.scale}
                    width={dimensions.width}
                    height={dimensions.height}
                    top={static_data.panel_top}
                    left={static_data.panel_left}
                >
                    {jsonData?.map((item: GenericTypeComponent['data']) =>
                        <div>
                            {ComponentWrapper(static_data.enlargeProps.scale, getValue(state, item.backend.key), item)}
                            < ClickContainer
                                scale={static_data.enlargeProps.scale}
                                data={item}
                                isBlinking={blinkingQueue.search(item.backend.key)}
                                handleClick={handleOnClick}
                                handleLongPress={handleOnLongPress}
                                handleClickDown={handleClickDown}
                                handleClickUp={handleClickUp}
                            />
                        </div>
                    )}
                </Panel>
            </Modal>
        </>
    )
};

export default GenericPanel;

