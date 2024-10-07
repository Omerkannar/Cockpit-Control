# Cockpit Controls / VICO


## Element interface

| Property		| Type		| Comment|
|---------------|-----------|--------|
|*backend_name* |string		|The exect name as it define on backend|
|*type*         |string 	|Type of the component. Can be one of the follwowing options ("stateN", "knobInteger", "analog", "string",  "number")|
|*width*        |px     	|Default width size of the component|
|*height*       |px     	|Default height size of the component|
|*left*         |px     	|Left location of the component on the panel (from top- left corner) (0 - Left side of the panel)|
|*top*          |px     	|Top location of the component on the panel (from top- left corner) (0 - Top side of the panel)|
|*imageProps*   |object 	|Defines all images properties|
|               |       	|*imageDefault* [string] - URL to the off state image|
|               |       	|*additionalImageData* [object] - Defines all other images properties|
|*debugMode*    |boolean	|Defines if the component is in debug mode|
|*isClickable*  |boolean	|Defines if the component can be clicked from the app|
|*clickProps*   |object 	|Defines all click properties|
|               |       	|*clickBoundsHeightFactor* [number] - Defines the height boundaries of the container where is allowed to click. This number defines the height factor of the original height of the component|
|               |       	|*clickBoundsWidthFactor* [number] - Defines the width boundaries of the container where is allowed to click. This number defines the width factor of the original width of the component|
|*blinking*     |object 	|Defines the blinking properties when the component changes state|
|               |       	|*color* [string] - Color of the blinking boundaries|
|Optional|

### Exaple


```
{
        "type": "stateN",
        "backend_name": "M4_CODE_IN",
        "width": "106",
        "height": "84",
        "left": "110",
        "top": "366",
        "offset_on": "0",
        "offset_off": "0",
        "imageProps": {
            "imageDefault": "/IFFPanel/Edited/Grey_Switch_center.png",
            "additionalImageData": {
                "ZERO": "/IFFPanel/Edited/Grey_Switch_left.png",
                "AB": "/IFFPanel/Edited/Grey_Switch_center.png",
                "HOLD": "/IFFPanel/Edited/Grey_Switch_right.png"
            }
        },
        "debugMode": true,
        "isClickable": true,
        "clickProps": {
            "clickBoundsHeightFactor": 1,
            "clickBoundsWidthFactor": 2,
        },
        "blinking": {
            "color": "yellow"
        }
    }
```


<!-- - *`backend_name`* [string] The exect name as it define on backend
- *`type`*
- *`width`* [px] Default width size of the component
- *`height`* [px] Default height size of the component
- *`left`*  [px] Left location of the component on the panel (from top- left corner) (0 - Left side of the panel)
- *`top`* [px] Top location of the component on the panel (from top- left corner) (0 - Top side of the panel)
- *`offset_on`*  (Optional) [px] Offset addition to the top position when the component is set to on
- *`offset_off`*  (Optional) [px] Offset addition to the top position when the component is set to off
- *`imageOn`* The relative path to image when the component is set to on
- *`imageDefault`* The relative path to image when the component is set to off
- *`debugMode`* (Optional - Default false) Show debug data of the component
- *`clickBoundsHeightFactor`* (Optional)
- *`clickBoundsWidthFactor`* (Optional)


```
{
    backend_name: string;     
    type: string;
    width: number;
    height: number;
    left: number;
    top: number;
    imageOn: string;
    imageDefault: string;
    offset_on?: number;
    offset_off?: number;
    debugMode?: boolean;
    clickBoundsHeightFactor?: number; 
    clickBoundsWidthFactor?: number; 
}
``` -->

