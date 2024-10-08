import React from 'react';
import styled, { keyframes, css } from "styled-components"
import { BasicComponentContainer } from './Common.interface';

const DEFAULT_BLINK_COLOR = 'rgb(255, 255, 255)'; // White
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
  top:                    ${props => (props.scale * (Number(props.data.top) + (Number(props.data.height) / 2) * (1 - Number(props.data.clickProps?.clickBoundsHeightFactor))) / 100) | 0}px;
  left:                   ${props => (props.scale * (Number(props.data.left) + (Number(props.data.width) / 2) * (1 - Number(props.data.clickProps?.clickBoundsWidthFactor))) / 100) | 0}px;
  width:                  ${props => (props.scale * props.data.width * Number(props.data.clickProps?.clickBoundsWidthFactor) / 100) | 0}px;
  height:                 ${props => (props.scale * props.data.height * Number(props.data.clickProps?.clickBoundsHeightFactor) / 100) | 0}px;
  background-color: rgba(255,255,255,0);
  border: 2px solid transparent;
  ${props => (props.isBlinking && props.data.type !== "number") && css`
     animation: ${blink(props.data.blinking.color)} 0.8s infinite;
   `}
`;

// Styled component for the smaller square at the center
const SmallSquare = styled.div<BasicComponentContainer>`
  position: absolute;
  width:                ${props => (props.scale * props.data.width * Number(props.data.clickProps?.clickBoundsWidthFactor) / 100 / REDUCE_FACTOR) | 0}px;
  height:               ${props => (props.scale * props.data.height * Number(props.data.clickProps?.clickBoundsHeightFactor) / 100 / REDUCE_FACTOR) | 0}px;
  background-color:     ${props => (props.data.clickProps?.mapping?.center ? "rgba(0, 255, 0, 0.2)" : "rgba(255, 0, 0, 0.2)")};
  cursor:               ${props => (props.data.clickProps?.mapping?.center ? "pointer" : "not-allowed")};
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
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
`;


const ClickContainer: React.FC<BasicComponentContainer> = (props) => {

    const largeRectangleHeight :number = Number(props.data.clickProps?.clickBoundsHeightFactor) * Number(props.data.height) * props.scale / 100;
    const largeRectangleWidth: number = Number(props.data.clickProps?.clickBoundsWidthFactor) * Number(props.data.width) * props.scale / 100;
    const smallRectangleHeight : number = Number(props.data.clickProps?.clickBoundsHeightFactor) * Number(props.data.height) * props.scale / 100 / REDUCE_FACTOR;
    const smallRectangleWidth : number = Number(props.data.clickProps?.clickBoundsWidthFactor) * Number(props.data.width) * props.scale / 100 / REDUCE_FACTOR;

    const handleOnClick = (event: any) => {
        //console.log(`Clicked on ${event.target.id}`)
        if (props.handleClick) {
            props.handleClick(props.data.backend_name, event.target.id)
        }
    }

    return (
        <LargeSquare {...props}>
            {!props.data.isClickable ? null :
                <SmallSquare {...props}
                    id={props.data.clickProps?.mapping?.center || "undefined"}
                    onClick={(e) => {
                      if(props.data.clickProps?.mapping?.center){ 
                        handleOnClick(e)
                      }}} />
            }
            {!props.data.isClickable ? null :
            // Top Trapezoid
                <TrapezoidZone
                    id={props.data.clickProps?.mapping?.top || "undefined"}
                    onClick={(e) => {
                      if(props.data.clickProps?.mapping?.top){ 
                        handleOnClick(e)
                      }}}
                    zoneColor={props.data.clickProps?.mapping?.top ? "rgba(0, 255, 0, 0.2)" : "rgba(255, 0, 0, 0.2)"}
                    cursor = {props.data.clickProps?.mapping?.top ? true : false}
                    clipPath={`polygon(
                    0 0, 
                    100% 0, 
                    ${(largeRectangleWidth / 2 + smallRectangleWidth / 2) / largeRectangleWidth * 100}% ${(largeRectangleHeight / 2 - smallRectangleHeight / 2) / largeRectangleHeight * 100}%, 
                    ${(largeRectangleWidth / 2 - smallRectangleWidth / 2) / largeRectangleWidth * 100}% ${(largeRectangleHeight / 2 - smallRectangleHeight / 2) / largeRectangleHeight * 100}%
                  )`
                    }
                />
            }
            {!props.data.isClickable ? null :
                <TrapezoidZone
                    id={props.data.clickProps?.mapping?.bottom || "undefined"}
                    onClick={(e) => {
                      if(props.data.clickProps?.mapping?.bottom){ 
                        handleOnClick(e)
                      }}}
                    zoneColor={props.data.clickProps?.mapping?.bottom ? "rgba(0, 255, 0, 0.2)" : "rgba(255, 0, 0, 0.2)"}
                    cursor = {props.data.clickProps?.mapping?.bottom ? true : false}
                    clipPath={`polygon(
                    0 100%, 
                    100% 100%, 
                    ${(largeRectangleWidth / 2 + smallRectangleWidth / 2) / largeRectangleWidth * 100}% ${(largeRectangleHeight / 2 + smallRectangleHeight / 2) / largeRectangleHeight * 100}%, 
                    ${(largeRectangleWidth / 2 - smallRectangleWidth / 2) / largeRectangleWidth * 100}% ${(largeRectangleHeight / 2 + smallRectangleHeight / 2) / largeRectangleHeight * 100}%
                  )`
                    }
                />
            }
            {!props.data.isClickable ? null :
                <TrapezoidZone
                    id={props.data.clickProps?.mapping?.left || "undefined"}
                    onClick={(e) => {
                      if(props.data.clickProps?.mapping?.left){ 
                        handleOnClick(e)
                      }}}
                    zoneColor={props.data.clickProps?.mapping?.left ? "rgba(0, 255, 0, 0.2)" : "rgba(255, 0, 0, 0.2)"}
                    cursor = {props.data.clickProps?.mapping?.left ? true : false}
                    clipPath={`polygon(
                    0 0, 
                    0 100%, 
                    ${(largeRectangleWidth / 2 - smallRectangleWidth / 2) / largeRectangleWidth * 100}% ${(largeRectangleHeight / 2 + smallRectangleHeight / 2) / largeRectangleHeight * 100}%, 
                    ${(largeRectangleWidth / 2 - smallRectangleWidth / 2) / largeRectangleWidth * 100}% ${(largeRectangleHeight / 2 - smallRectangleHeight / 2) / largeRectangleHeight * 100}%
                  )`
                    }
                />
            }
            {!props.data.isClickable ? null :
                <TrapezoidZone
                    id={props.data.clickProps?.mapping?.right || "undefined"}
                    onClick={(e) => {
                      if(props.data.clickProps?.mapping?.right){ 
                        handleOnClick(e)
                      }}}
                    zoneColor={props.data.clickProps?.mapping?.right ? "rgba(0, 255, 0, 0.2)" : "rgba(255, 0, 0, 0.2)"}
                    cursor = {props.data.clickProps?.mapping?.right ? true : false}
                    clipPath={`polygon(
                    100% 0, 
                    100% 100%, 
                    ${(largeRectangleWidth / 2 + smallRectangleWidth / 2) / largeRectangleWidth * 100}% ${(largeRectangleHeight / 2 + smallRectangleHeight / 2) / largeRectangleHeight * 100}%, 
                    ${(largeRectangleWidth / 2 + smallRectangleWidth / 2) / largeRectangleWidth * 100}% ${(largeRectangleHeight / 2 - smallRectangleHeight / 2) / largeRectangleHeight * 100}%
                  )`
                    }
                />
            }
        </LargeSquare>
    );
};

export default ClickContainer;
