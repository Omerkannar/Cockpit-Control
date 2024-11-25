import styled from 'styled-components';
import { GenericTypeComponent } from '../Common.interface'

export const ComponentIntegerKnob = styled.img.attrs<GenericTypeComponent>(({ state, data }) => ({
    src: data.component.imageProps.imageDefault,
    id: data.backend.key,
})) <GenericTypeComponent>`
    position: absolute;
    width: ${(props) => (props.scale * props.data.component.position.imgWidth / 100)}px;
    height: ${(props) => (props.scale * props.data.component.position.imgHeight / 100)}px;
    top: ${props => (props.scale * props.data.component.position.posTop / 100)}px;
    left: ${props => (props.scale * props.data.component.position.posLeft / 100)}px;
    transform: rotate(${(props) => Number(props.state) || 0}deg);
`


export const ComponentMultiStateSwitch = styled.img.attrs<GenericTypeComponent>(({ state, data }) => ({
    src: data.component.imageProps.additionalImageData[state.toString()] || data.component.imageProps.imageDefault,
    id: data.backend.key,
})) <GenericTypeComponent>`
    position: absolute;
    width: ${(props) => (props.scale * props.data.component.position.imgWidth / 100)}px;
    height: ${(props) => (props.scale * props.data.component.position.imgHeight / 100)}px;
    top: ${props => (props.scale * props.data.component.position.posTop / 100)}px;
    left: ${props => (props.scale * props.data.component.position.posLeft / 100)}px;
`

