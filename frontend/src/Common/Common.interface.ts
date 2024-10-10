
type Type                       = "static" | "stateN" | "knobInteger" | "analog_rotation" | "analog_vertical_translation" | "analog_horizontal_translation" | "string" | "number";
type State                      = boolean  | number    | string;
export type ClickType           = "click"  | "LongPress";

export interface IncomingMessage {
    panel: string;
    element: string;
    value: string;
}


export interface GenericPanelInterface {
    static_data: {
        panel_name : string,
        panel_container: string;
        panel_url : string,
        panel_data: string,
        panel_resources : string,
        panel_scale: number,
        panel_top: number,
        panel_left: number
    }
    dynamic_data? : IncomingMessage;
    handleSendRequest : (panelName: string, switchName: string, switchValue: string) => void;
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
    "height" : number,
    "width": number,
    "scale": number,
    handleClick? : (clickPosition: string) => void
}

// state: boolean                       Component is on (true) or off (false)
// scale: number;                       [%] Default size is 100. Defines the size of the component
//     data: {                          
//         width: number;               [px] Default size of the component
//         left: number;                [px] Left location of the component on the panel (from top- left corner) (0 - Left side of the panel)
//         top: number;                 [px] Top location of the component on the panel (from top- left corner) (0 - Top side of the panel)
//         offset_on: number;           [px] Offset addition to the top position when the component is set to on
//         offset_off: number;          [px] Offset addition to the top position when the component is set to off
//         backend_name: string;        The exect name as it define on backend
//         imageOn: string;            The relative path to image when the component is set to on
//         imageDefault: string;           The relative path to image when the component is set to off
//         debugMode: boolean;          (Optional - Default false) Show debug data of the component
//     }

interface BasicData {
    backend_name: string;
    type: Type;
    width: number;
    height: number;
    left: number;
    top: number;
    imageProps: {
        imageDefault: string;
        additionalImageData?: any;
    };
    offset_on?: number;
    offset_off?: number;
    debugMode?: boolean;
    isClickable: boolean;
    clickProps?: {
        clickBoundsHeightFactor: number; 
        clickBoundsWidthFactor: number;
        mapping: {
            center?: string;
            top?: string;
            bottom?: string;
            left?: string;
            right?: string;
        }
    };
    knob_props?: {
        rotation: any;
    };
    analog_props?: {
        conversion: any;
    };
    string_props?: {
        maxStringLength: number,
    };
    blinking?: {
        color: string;
    };
    logger? : {
        display: string;
    };
}

export interface BasicTypeComponent {
    scale: number;
    data: BasicData;
}


export interface BasicComponentContainer extends BasicTypeComponent{
    isBlinking?: boolean;
    handleClick? : (componentName: string, clickedName: string) => void;
    handleLongPress? : (componentName: string, clickedName: string) => void;
}
  

export interface GenericTypeComponent extends BasicTypeComponent {
    state: State;
    [key: string] : any;
}