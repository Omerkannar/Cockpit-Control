
type Type = "static" | 
            "stateN" | 
            "knobInteger" | 
            "analog_rotation" | 
            "analog_vertical_translation" |
            "analog_horizontal_translation" | 
            "analog_horizontal_translation_cyclic" | 
            "analog_vertical_translation_cyclic" |
            "string" | 
            "number";
type State = boolean | number | string;
export type ClickType = "click" | "longPress";
export type OpertaionType = "toggle" | "clickByValue"
type ElementType = "Double" | "Float" | "Integer" | "Boolean" | "String";


export interface IncomingMessage {
    panel: string;
    element: string;
    value: string;
    blinking: boolean;
}


export interface GenericPanelInterface {
    static_data: {
        panel_name: string,
        panel_container: string;
        panel_url: string;
        panel_resources: string;
        panel_scale: number;
        panel_top: number;
        panel_left: number;
        enlargeProps: {
            enable: boolean;
            scale: number;
        }
    }
    dynamic_data?: IncomingMessage[];
    handleSendRequest: (panelName: string, switchName: string, switchValue: string) => void;
}

export interface PanelContainerInterface {
    "container_url"?: string,
    "container_name": string,
    "container_top": number,
    "container_left": number,
    "container_width": number,
    "container_height": number,
    "container_scale": number
}

export interface StringContainerInterface {
    "container_top": number,
    "container_left": number,
    "container_width": number,
    "container_height": number
}

export interface ClickContainerInterface {
    "height": number,
    "width": number,
    "scale": number,
    handleClick?: (clickPosition: string) => void
}

interface BasicData {
    type: Type;
    backend: {
        key: string;
        dbsimProps?: {
            stationName: string;
            blockName: string;
            elementName: string;
            elementType: ElementType;
            enumMapping?: any;
        }
    };
    component: {
        debugMode?: boolean;
        isClickable: boolean;
        position: {
            imgScale: number;
            imgWidth: number;
            imgHeight: number;
            posLeft: number;
            posTop: number;
            zIndex: number;
        };
        imageProps: {
            imageDefault: string;
            additionalImageData?: any;
        };
        clickProps?: {
            clickBoundsHeightFactor: number;
            clickBoundsWidthFactor: number;
            mapping: {
                mapPressPull1?: string;
                mapPressPull2?: string;
                mapTop?: string;
                mapBottom?: string;
                mapLeft?: string;
                mapRight?: string;
            };
            clickType?: OpertaionType; // "toggle" OR "clickByValue"
        };
        knobProps?: {
            rotation: any;
        };
        analogProps?: {
            conversion: any;
        };
        stringProps?: {
            maxStringLength: number;
        };
        blinking?: {
            color: string;
        };
        logger?: {
            display: boolean;
        };
    }
}

export interface BasicTypeComponent {
    scale: number;
    data: BasicData;
}


export interface BasicComponentContainer extends BasicTypeComponent {
    isBlinking?: boolean;
    handleClick?: (componentName: string, clickedName: string) => void;
    handleLongPress?: (componentName: string, clickedName: string) => void;
}


export interface GenericTypeComponent extends BasicTypeComponent {
    state: State;
    [key: string]: any;
}