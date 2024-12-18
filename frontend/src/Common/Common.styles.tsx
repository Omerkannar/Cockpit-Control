import settings from '../settings.json'
import styled from "styled-components"
import { PanelContainerInterface } from "./Common.interface";

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
    background-image: ${props => props.container_url? `url(${props.container_url})` : null};
    background-color:  ${props => props.container_url? null : '#525864'};
    background-repeat: no-repeat;
    background-size: contain;
    grid-column-start: ${props => props.container_left};
    grid-row-start: ${props => props.container_top};
    grid-template-columns: ${props => `repeat(${props.container_width}, 5px)`};
    grid-template-rows: ${props => `repeat(${props.container_height}, 5px)`};
    position: relative;
    width: ${props => (props.container_scale * props.container_width) / 100}px;
    height: ${props => (props.container_scale * props.container_height) / 100}px;
    display: grid;
`;

export const LayoutNavigation = styled.div<{ zoomScale: number }>`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: ${({ zoomScale }) => `scale(${zoomScale})`}; /* Adjust based on zoom scale */
  z-index: 9999;
  border-radius: 5px;
  width: 900px; // Fixed width for consistency
  height: auto;
  transform-origin: top left;
`;

export const LayoutButton = styled.button`
  padding: 10px 20px;
  font-size: ${settings.layoutNavigation.textSize}; // Fixed size in px for consistent appearance: ;
  background-color: ${settings.layoutNavigation.backgroundColor};
  color:${settings.layoutNavigation.textColor};
  border-radius: 4px;
  text-align: 'center';
  min-width: '100px';
`;
