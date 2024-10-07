import styled from 'styled-components';
import { GenericTypeComponent } from '../Common.interface'

export const ComponentIntegerKnob = styled.img.attrs<GenericTypeComponent>(({ state, data }) => ({
    src: data.imageProps.imageDefault,
    id: data.backend_name,
})) <GenericTypeComponent>`
    position: absolute;
    width: ${(props) => (props.scale * props.data.width / 100)}px;
    height: ${(props) => (props.scale * props.data.height / 100)}px;
    top: ${props => (props.scale * props.data.top / 100)}px;
    left: ${props => (props.scale * props.data.left / 100)}px;
    transform: rotate(${(props) => Number(props.state) || 0}deg);
`


export const ComponentMultiStateSwitch = styled.img.attrs<GenericTypeComponent>(({ state, data }) => ({
    src: data.imageProps.additionalImageData[state.toString()] || data.imageProps.imageDefault,
    id: data.backend_name,
})) <GenericTypeComponent>`
    position: absolute;
    width: ${(props) => (props.scale * props.data.width / 100)}px;
    height: ${(props) => (props.scale * props.data.height / 100)}px;
    top: ${props => (props.scale * props.data.top / 100)}px;
    left: ${props => (props.scale * props.data.left / 100)}px;
`

