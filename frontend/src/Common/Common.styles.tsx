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
