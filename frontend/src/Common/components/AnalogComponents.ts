import styled from 'styled-components';
import { GenericTypeComponent } from '../Common.interface'

export const ComponentRotationAnalog = styled.img.attrs<GenericTypeComponent>(({ state, data }) => ({
    src: data.imageProps.imageDefault,
    id: data.backend_name,
})) <GenericTypeComponent>`
    position: absolute;
    width: ${(props) => (props.scale * props.data.width / 100)}px;
    height: ${(props) => (props.scale * props.data.height / 100)}px;
    top: ${props => (props.scale * Number(props.data.top) / 100)}px;
    left: ${props => (props.scale * Number(props.data.left) / 100)}px;
    transform: rotate(${(props) => Number(props.state) || 0}deg);
`

export const ComponentVerticalTranslationAnalog = styled.img.attrs<GenericTypeComponent>(({ state, data }) => ({
    src: data.imageProps.imageDefault,
    id: data.backend_name,
})) <GenericTypeComponent>`
    position: absolute;
    width: ${(props) => (props.scale * props.data.width / 100)}px;
    height: ${(props) => (props.scale * props.data.height / 100)}px;
    top: ${props => (props.scale * (Number(props.data.top) + Number(props.state)) / 100)}px;
    left: ${props => (props.scale * Number(props.data.left) / 100)}px;
`

