
type Type = "static" |
    "stateN" |
    "knobInteger" |
    "analogRotation" |
    "analogVerticalTranslation" |
    "analogHorizontalTranslation" |
    "analogHorizontalTranslationCyclic" |
    "analogVerticalTranslationCyclic" |
    "string" |
    "number" |
    "stateNMomentary" |
    "adi";
type State = boolean | number | string | any;
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
    "container_url"?: string;
    "container_name": string;
    "container_text"?: string;
    "container_top": number;
    "container_left": number;
    "container_width": number;
    "container_height": number;
    "container_scale": number;
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

interface AdditionalCssProps {
    position : "relative" | "absolute",
    objectFit: "cover" | "fill" | "contain";
}

export interface DbsimProps {
    operationType: string;
    stationName: string;
    blockName: string;
    elementName: string;
    elementType: ElementType;
    enumMapping?: any;
}

interface BasicData {
    type: Type;
    backend: {
        key: string;
        dbsimProps?: DbsimProps | DbsimProps[]
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
            adiProps?: {
                pitchOffsetSlope: number;
                pitchOffsetConstant: number;
                transformOriginConstant: number;
            }
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
        additionalCssProps? : AdditionalCssProps;
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
    handleClickDown?: (componentName: string, clickedName: string) => void;
    handleClickUp?: (componentName: string, clickedName: string) => void;
}


export interface GenericTypeComponent extends BasicTypeComponent {
    state: State;
    [key: string]: any;
}

export interface ADIComponent extends BasicTypeComponent {
    state: {
        pitch: number;
        roll: number;
    }
    [key: string]: any;
}