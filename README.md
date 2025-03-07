# Cockpit Controls / VICO

## Installation

1. Create symbolic link of `./data` folder: \
 - `cd frontend` and then
 - `mklink /D src\data ..\data` \
> Where:
> - /D → Creates a directory symlink.
> - src\data → New virtual folder inside src/ (where CRA allows imports).
> - ..\data → Points to your actual data folder outside src/.


 


## Element interface

| Property		| Type		| Comment|
|---------------|-----------|--------|
|*type*                                             |string 	|Type of the component. Can be one of the follwowing options (static", "stateN", "knobInteger", "analogRotation", "analogVerticalTranslation", "analogHorizontalTranslation", "string", "number")|
|*backend*                                          |object		|Defines all properties to Backend|
|*backend\key*                                      |string		|Logical name of the component|
|*backend\dbsimProps*                               |object		|Defines all properties to DBSIM|
|*backend\dbsimProps\operationType*                 |string		|Define if the elment is used for monitor, injection or both ("Monitor" for monitor, "Injection" for injection or leave empty for both monitor and injection) |
|*backend\dbsimProps\stationName*                   |string		|Name of the station (Default: "")|
|*backend\dbsimProps\blockName*                     |string		|Block name|
|*backend\dbsimProps\elementName*                   |string		|Element name|
|*backend\dbsimProps\elementType*                   |string		|Element type Can be one of the follwowing options ("Double", "Float", "Integer", "Boolean", "String")|
|*backend\dbsimProps\enumMapping*                   |object		|Defines the enum's values of the DBSIM element|
|*component*                                        |object		|Defines all properties to component|
|*component\debugMode*                              |boolean	|Defines if the component is in debug mode (Gives component additional data)|
|*component\isClickable*                            |boolean	|Defines if the component can be clicked from the app|
|*component\position*                               |object	    |Defines all position and size properties of the component|
|*component\position\imgScale*                      |%     	    |Default scale of the component|
|*component\position\imgWidth*                      |px     	|Default width size of the component|
|*component\position\imgHeight                      |px     	|Default height size of the component|
|*component\position\posLeft*                       |px     	|Left location of the component on the panel (from top- left corner) (0 - Left side of the panel)|
|*component\position\posTop*                        |px     	|Top location of the component on the panel (from top- left corner) (0 - Top side of the panel)|
|*component\imageProps*                             |object 	|Defines all images properties|
|*component\imageProps\imageDefault*                |string 	|URL to the off state image|
|*component\imageProps\additionalImageData*         |object 	|Defines all other images URLs|
|*component\clickProps*                             |object 	|Defines all click properties|
|*component\clickProps\clickBoundsHeightFactor*     |number 	|Defines the height boundaries of the container where is allowed to click. This number defines the height factor of the original height of the component|
|*component\clickProps\clickBoundsWidthFactor*      |number 	|Defines the width boundaries of the container where is allowed to click. This number defines the width factor of the original width of the component|
|*component\clickProps\mapping*                     |object 	| Defines the behavior of the different areas in the click container|
|*component\clickProps\mapping\center*              |string 	| Defines the behavior of the center area|
|*component\clickProps\mapping\top*                 |string 	| Defines the behavior of the top area|
|*component\clickProps\mapping\bottom*              |string 	| Defines the behavior of the bottom area|
|*component\clickProps\mapping\left*                |string 	| Defines the behavior of the left area|
|*component\clickProps\mapping\right*               |string 	| Defines the behavior of the right area|
|*component\knobProps*                             |object 	|Defines the knob properties if type == "knobInteger"|
|*component\analogProps*                           |object 	|Defines the component properties if type == "analogRotation" \ "analogVerticalTranslation" \ "analogHorizontalTranslation"|
|*component\stringProps*                           |object 	|Defines the component properties if type == "string"|
|*component\blinking*                               |object 	|Defines the blinking properties when the component changes state|
|*component\blinking\color*                         |string 	| Color of the blinking boundaries|
|*component\logger*                                 |object 	|Defines the logger properties of the component|
|*component\logger\display*                         |boolean 	| Defines if the element will dispaly changes|
|Optional|

### Examples
## StateN Component
```
{
    "type": "stateN",
    "backend": {
        "key": "RWR_SWITCH_IN",
        "dbsimProps": [
            {
                "operationType": "Monitor",
                "stationName": "",
                "blockName": "IOToHost.CMDS",
                "elementName": "Data.RWR_SWITCH",
                "elementType": "String",
                "enumMapping": {
                    "OFF": "OFF",
                    "ON": "ON"
                }
            },
            {
                "operationType": "Injection",
                "stationName": "",
                "blockName": "HostToIO.CMDS",
                "elementName": "Data.RWR_SWITCH",
                "elementType": "String",
                "enumMapping": {
                    "OFF": "OFF",
                    "ON": "ON"
                }
            }
        ]
    },
    "component": {
        "debugMode": false,
        "isClickable": true,
        "position": {
            "imgScale": "100",
            "imgWidth": "85",
            "imgHeight": "160",
            "posLeft": "156",
            "posTop": "60"
        },
        "imageProps": {
            "imageDefault": "/CMDSPanel/SWITCH_10_DOWN_1.png",
            "additionalImageData": {
                "ON": "/CMDSPanel/SWITCH_10_UP1.png",
                "OFF": "/CMDSPanel/SWITCH_10_DOWN_1.png"
            }
        },
        "clickProps": {
            "clickBoundsHeightFactor": 1,
            "clickBoundsWidthFactor": 2,
            "mapping": {
                "mapTop": "ON",
                "mapBottom": "OFF"
            }
        },
        "knobProps": {},
        "analogProps": {},
        "stringProps": {},
        "blinking": {
            "color": "yellow"
        },
        "logger": {
            "display": true
        }
    }
}
```

## knobInteger Component
```
{
    "type": "knobInteger",
    "backend": {
        "key": "KNOB_PRGM_IN",
        "dbsimProps": {
            "opertionType": "",
            "stationName": "",
            "blockName": "IOToHost.CMDS",
            "elementName": "Data.KNOB_PRGM",
            "elementType": "Integer",
            "enumMapping": {
                "BIT": "BIT",
                "1": "1",
                "2": "2",
                "3": "3",
                "4": "4"
            }
        }
    },
    "component": {
        "debugMode": false,
        "isClickable": true,
        "position": {
            "imgScale": "100",
            "imgWidth": "78",
            "imgHeight": "78",
            "posLeft": "533",
            "posTop": "443"
        },
        "imageProps": {
            "imageDefault": "/CMDSPanel/Knob_Plus.png"
        },
        "clickProps": {
            "clickBoundsHeightFactor": 2,
            "clickBoundsWidthFactor": 2,
            "mapping": {
                "mapTop": "INCREASE",
                "mpaRight": "INCREASE",
                "mapBottom": "DECREASE",
                "mpaLeft": "DECREASE"
            }
        },
        "knobProps": {
            "rotation": {
                "BIT": -90,
                "1": -55,
                "2": -15,
                "3": 25,
                "4": 69
            }
        },
        "analogProps": {},
        "stringProps": {},
        "blinking": {
            "color": "yellow"
        },
        "logger": {
            "display": true
        }
    }
}
```

