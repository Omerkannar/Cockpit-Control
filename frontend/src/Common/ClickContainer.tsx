import settings from '../settings.json';
import React, { useState, useRef } from 'react';
import styled, { keyframes, css } from "styled-components"
import { BasicComponentContainer } from './Common.interface';

const OPACITY: number = 0.2;
const DEFAULT_BLINK_COLOR = 'rgba(0, 0, 0, 0)'; // White
const REDUCE_FACTOR: number = 3; // = largeRectangle / smallRectangle

// Function to validate if a string is a valid CSS color
const isValidColor = (color: string): boolean => {
  const s = new Option().style;
  s.color = color;
  return s.color !== '';
};

// Function to get a valid color or return the default
const getValidColor = (color: string | undefined, defaultColor: string): string => {
  if (color && isValidColor(color)) {
    return color;
  }
  return defaultColor;
};

const blink = (color: string) => keyframes`
  0% {
    border-color: transparent;
  }
  50% {
    border-color: ${getValidColor(color, DEFAULT_BLINK_COLOR)};
  }
  100% {
    border-color: transparent;
  }
`;

// Styled component for the large square container
const LargeSquare = styled.div<BasicComponentContainer>`
  position:               absolute;
  display:                grid;
  top:                    ${props => (props.scale * (Number(props.data.component.position.top) + (Number(props.data.component.position.height) / 2) * (1 - Number(props.data.component.clickProps?.clickBoundsHeightFactor))) / 100) | 0}px;
  left:                   ${props => (props.scale * (Number(props.data.component.position.left) + (Number(props.data.component.position.width) / 2) * (1 - Number(props.data.component.clickProps?.clickBoundsWidthFactor))) / 100) | 0}px;
  width:                  ${props => (props.scale * props.data.component.position.width * Number(props.data.component.clickProps?.clickBoundsWidthFactor) / 100) | 0}px;
  height:                 ${props => (props.scale * props.data.component.position.height * Number(props.data.component.clickProps?.clickBoundsHeightFactor) / 100) | 0}px;
  background-color: rgba(255,255,255,0);
  border: 2px solid transparent;
  ${props => (props.isBlinking && props.data.type !== "number" &&props.data.component.blinking?.color) && css`
     animation: ${blink(props.data.component.blinking.color)} 0.8s infinite;
   `}
`;

// Styled component for the smaller square at the center
const SmallSquare = styled.div<BasicComponentContainer>`
  position: absolute;
  width:                ${props => (props.scale * props.data.component.position.width * Number(props.data.component.clickProps?.clickBoundsWidthFactor) / 100 / REDUCE_FACTOR) | 0}px;
  height:               ${props => (props.scale * props.data.component.position.height * Number(props.data.component.clickProps?.clickBoundsHeightFactor) / 100 / REDUCE_FACTOR) | 0}px;
  background-color:     ${props => (!props.data.component.debugMode ? "" : props.data.component.clickProps?.mapping?.center ? `rgba(0, 255, 0, ${OPACITY})` : `rgba(255, 0, 0, ${OPACITY})`)};
  cursor:               ${props => (props.data.component.clickProps?.mapping?.center ? "pointer" : "not-allowed")};
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
`;

// Styled component for the trapezoid zones
const TrapezoidZone = styled.div<{ zoneColor: string; clipPath: string; cursor: boolean }>`
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: ${(props) => props.zoneColor};
  clip-path: ${(props) => props.clipPath};
  cursor:    ${(props) => (props.cursor ? "pointer" : "not-allowed")};
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
`;


const ClickContainer: React.FC<BasicComponentContainer> = (props) => {

  const largeRectangleHeight: number = Number(props.data.component.clickProps?.clickBoundsHeightFactor) * Number(props.data.component.position.height) * props.scale / 100;
  const largeRectangleWidth: number = Number(props.data.component.clickProps?.clickBoundsWidthFactor) * Number(props.data.component.position.width) * props.scale / 100;
  const smallRectangleHeight: number = Number(props.data.component.clickProps?.clickBoundsHeightFactor) * Number(props.data.component.position.height) * props.scale / 100 / REDUCE_FACTOR;
  const smallRectangleWidth: number = Number(props.data.component.clickProps?.clickBoundsWidthFactor) * Number(props.data.component.position.width) * props.scale / 100 / REDUCE_FACTOR;

  const [isLongPress, setIsLongPress] = useState<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Duration to differentiate between short click and long press (ms)
  const longPressThreshold = settings.components_behavior.analogLongPressDelay || 200;

  const handleOnMouseDown = (event: any) => {
    // const target = event.target as HTMLElement; // Cast to HTMLElement
    // console.log(event.button)
    setIsLongPress(false);
    timeoutRef.current = setTimeout(() => {
      setIsLongPress(true);
      // Start an interval to fire the handleLongPress event every longPressThreshold
      intervalRef.current = setInterval(() => {
        if (props.handleLongPress) {
          props.handleLongPress(props.data.backend.key, event.target.id);
        }
      }, longPressThreshold);
    }, longPressThreshold);
  }

  const handleOnMouseUp = (event: any) => {
        // If timeoutRef exists and long press hasn't started, it's a short click
        if (timeoutRef.current && !isLongPress && props.handleClick) {
          props.handleClick(props.data.backend.key, event.target.id);
        }
    
        // Clear timeout and interval
        clearTimeout(timeoutRef.current as NodeJS.Timeout);
        clearInterval(intervalRef.current as NodeJS.Timeout);
    
        timeoutRef.current = null;
        intervalRef.current = null;
        setIsLongPress(false);
  }

  return (
    <LargeSquare {...props}>
      {!props.data.component.isClickable ? null :
        <SmallSquare {...props}
          id={props.data.component.clickProps?.mapping?.center || "undefined"}
          onMouseDown={(e) => {
            if (props.data.component.clickProps?.mapping?.center) {
              handleOnMouseDown(e)
            }
          }}
          onMouseUp={(e) => {
            if (props.data.component.clickProps?.mapping?.center) {
              handleOnMouseUp(e)
            }
          }}
          onMouseLeave={(e) => {
            if (props.data.component.clickProps?.mapping?.center) {
              handleOnMouseUp(e)
            }
          }} />
      }
      {!props.data.component.isClickable ? null :
        // Top Trapezoid
        <TrapezoidZone
          id={props.data.component.clickProps?.mapping?.top || "undefined"}
          onMouseDown={(e) => {
            if (props.data.component.clickProps?.mapping?.top) {
              handleOnMouseDown(e)
            }
          }}
          onMouseUp={(e) => {
            if (props.data.component.clickProps?.mapping?.top) {
              handleOnMouseUp(e)
            }
          }}
          onMouseLeave={(e) => {
            if (props.data.component.clickProps?.mapping?.top) {
              handleOnMouseUp(e)
            }
          }}
          zoneColor={!props.data.component.debugMode ? "" : props.data.component.clickProps?.mapping?.top ? `rgba(0, 255, 0, ${OPACITY})` : `rgba(255, 0, 0, ${OPACITY})`}
          cursor={props.data.component.clickProps?.mapping?.top ? true : false}
          clipPath={`polygon(
                    0 0, 
                    100% 0, 
                    ${(largeRectangleWidth / 2 + smallRectangleWidth / 2) / largeRectangleWidth * 100}% 
                    ${(largeRectangleHeight / 2 - smallRectangleHeight / 2) / largeRectangleHeight * 100}%, 
                    ${(largeRectangleWidth / 2 - smallRectangleWidth / 2) / largeRectangleWidth * 100}% 
                    ${(largeRectangleHeight / 2 - smallRectangleHeight / 2) / largeRectangleHeight * 100}%
                  )`
          }
        />
      }
      {!props.data.component.isClickable ? null :
        <TrapezoidZone
          id={props.data.component.clickProps?.mapping?.bottom || "undefined"}
          onMouseDown={(e) => {
            if (props.data.component.clickProps?.mapping?.bottom) {
              handleOnMouseDown(e)
            }
          }}
          onMouseUp={(e) => {
            if (props.data.component.clickProps?.mapping?.bottom) {
              handleOnMouseUp(e)
            }
          }}
          onMouseLeave={(e) => {
            if (props.data.component.clickProps?.mapping?.bottom) {
              handleOnMouseUp(e)
            }
          }}
          zoneColor={!props.data.component.debugMode ? "" : props.data.component.clickProps?.mapping?.bottom ? `rgba(0, 255, 0, ${OPACITY})` : `rgba(255, 0, 0, ${OPACITY})`}
          cursor={props.data.component.clickProps?.mapping?.bottom ? true : false}
          clipPath={`polygon(
                    0 100%, 
                    100% 100%, 
                    ${(largeRectangleWidth / 2 + smallRectangleWidth / 2) / largeRectangleWidth * 100}% 
                    ${(largeRectangleHeight / 2 + smallRectangleHeight / 2) / largeRectangleHeight * 100}%, 
                    ${(largeRectangleWidth / 2 - smallRectangleWidth / 2) / largeRectangleWidth * 100}% 
                    ${(largeRectangleHeight / 2 + smallRectangleHeight / 2) / largeRectangleHeight * 100}%
                  )`
          }
        />
      }
      {!props.data.component.isClickable ? null :
        <TrapezoidZone
          id={props.data.component.clickProps?.mapping?.left || "undefined"}
          onMouseDown={(e) => {
            if (props.data.component.clickProps?.mapping?.left) {
              handleOnMouseDown(e)
            }
          }}
          onMouseUp={(e) => {
            if (props.data.component.clickProps?.mapping?.left) {
              handleOnMouseUp(e)
            }
          }}
          onMouseLeave={(e) => {
            if (props.data.component.clickProps?.mapping?.left) {
              handleOnMouseUp(e)
            }
          }}
          zoneColor={!props.data.component.debugMode ? "" : props.data.component.clickProps?.mapping?.left ? `rgba(0, 255, 0, ${OPACITY})` : `rgba(255, 0, 0, ${OPACITY})`}
          cursor={props.data.component.clickProps?.mapping?.left ? true : false}
          clipPath={`polygon(
                    0 0, 
                    0 100%, 
                    ${(largeRectangleWidth / 2 - smallRectangleWidth / 2) / largeRectangleWidth * 100}% 
                    ${(largeRectangleHeight / 2 + smallRectangleHeight / 2) / largeRectangleHeight * 100}%, 
                    ${(largeRectangleWidth / 2 - smallRectangleWidth / 2) / largeRectangleWidth * 100}% 
                    ${(largeRectangleHeight / 2 - smallRectangleHeight / 2) / largeRectangleHeight * 100}%
                  )`
          }
        />
      }
      {!props.data.component.isClickable ? null :
        <TrapezoidZone
          id={props.data.component.clickProps?.mapping?.right || "undefined"}
          onMouseDown={(e) => {
            if (props.data.component.clickProps?.mapping?.right) {
              handleOnMouseDown(e)
            }
          }}
          onMouseUp={(e) => {
            if (props.data.component.clickProps?.mapping?.right) {
              handleOnMouseUp(e)
            }
          }}
          onMouseLeave={(e) => {
            if (props.data.component.clickProps?.mapping?.right) {
              handleOnMouseUp(e)
            }
          }}
          zoneColor={!props.data.component.debugMode ? "" : props.data.component.clickProps?.mapping?.right ? `rgba(0, 255, 0, ${OPACITY})` : `rgba(255, 0, 0, ${OPACITY})`}
          cursor={props.data.component.clickProps?.mapping?.right ? true : false}
          clipPath={`polygon(
                    100% 0, 
                    100% 100%, 
                    ${(largeRectangleWidth / 2 + smallRectangleWidth / 2) / largeRectangleWidth * 100}% 
                    ${(largeRectangleHeight / 2 + smallRectangleHeight / 2) / largeRectangleHeight * 100}%, 
                    ${(largeRectangleWidth / 2 + smallRectangleWidth / 2) / largeRectangleWidth * 100}% 
                    ${(largeRectangleHeight / 2 - smallRectangleHeight / 2) / largeRectangleHeight * 100}%
                  )`
          }
        />
      }
    </LargeSquare>
  );
};

export default ClickContainer;
