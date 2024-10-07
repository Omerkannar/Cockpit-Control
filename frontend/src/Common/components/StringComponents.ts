import styled from 'styled-components';
import { GenericTypeComponent, StringContainerInterface} from '../Common.interface'

export const ComponentStringContainer = styled.div<StringContainerInterface>`
    background-repeat: no-repeat;
    background-size: contain;
    left: ${props => props.container_left}px;
    top: ${props => props.container_top}px;
    position: relative;
    width: ${props => props.container_width}px;
    height: ${props => props.container_height}px;
    display: grid;
`

export const ComponentStringNumber = styled.img.attrs<GenericTypeComponent>(({ state, data }) => ({
    src: data.imageProps.additionalImageData[state.toString()] || data.imageProps.imageDefault,
    id: data.backend_name,
})) <GenericTypeComponent>`
    position: absolute;
    width: ${(props) => (props.scale * Number(props.data.width) / 100)}px;
    height: ${(props) => (props.scale * Number(props.data.height) / 100)}px;
    top: ${props =>  (props.scale * 0 / 100)}px;
    left: ${props => (props.scale *  Number(props.digitOffset) / 100)}px;
`