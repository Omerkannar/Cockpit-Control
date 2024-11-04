
type Type = "static" | "stateN" | "knobInteger" | "analog_rotation" | "analog_vertical_translation" | "analog_horizontal_translation" | "string" | "number";
type State = boolean | number | string;
export type ClickType = "click" | "LongPress";
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
        panel_url: string,
        panel_data: string,
        panel_resources: string,
        panel_scale: number,
        panel_top: number,
        panel_left: number
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
            scale: number;
            width: number;
            height: number;
            left: number;
            top: number;
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
                center?: string;
                top?: string;
                bottom?: string;
                left?: string;
                right?: string;
            };
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