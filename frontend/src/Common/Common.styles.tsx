import settings from '../settings.json'
import styled, { keyframes, css } from "styled-components"
import { BasicComponentContainer, PanelContainerInterface } from "./Common.interface";

const DEFAULT_BLINK_COLOR = 'rgb(255, 255, 255)'; // White

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

export const MainContainer = styled.div`
  background-color: #282c34;
  display: grid;
  grid-template-columns: repeat(${settings.general.width / settings.general.gridDensity}, ${settings.general.gridDensity}px);
  grid-template-rows: repeat(${settings.general.height / settings.general.gridDensity}, ${settings.general.gridDensity}px);
  row-gap: 0.0em;
  column-gap: 0em;
  width: ${settings.general.width}px;
  height: ${settings.general.height}px;
`

export const Panel = styled.div<{ url: string; scale: number, width: number; height: number; top: number; left: number }>`
    background-image: url(${props => props.url});
    background-color: rgb(20, 20, 19);
    background-repeat: no-repeat;
    background-size: contain;
    width: ${props => (props.scale * props.width) / 100}px;
    height: ${props => (props.scale * props.height) / 100}px;
    grid-column-start: ${props => props.left};
    grid-row-start: ${props => props.top}; 
    position: relative;
`

// Define styled containers
export const Container = styled.div<PanelContainerInterface>`
    background-color: #525864;
    background-repeat: no-repeat;
    background-size: contain;
    grid-column-start: ${props => props.container_left};
    grid-row-start: ${props => props.container_top};
    grid-template-columns: ${props => `repeat(${props.container_width}, 5px)`};
    grid-template-rows: ${props => `repeat(${props.container_height}, 5px)`};
    position: relative;
    width: ${props => props.container_width}px;
    height: ${props => props.container_height}px;
    display: grid;
`;
