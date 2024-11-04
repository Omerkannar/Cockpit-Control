import styled from 'styled-components';
import { GenericTypeComponent } from '../Common.interface'

export const ComponentRotationAnalog = styled.img.attrs<GenericTypeComponent>(({ state, data }) => ({
    src: data.component.imageProps.imageDefault,
    id: data.backend.key,
})) <GenericTypeComponent>`
    position: absolute;
    width: ${(props) => (props.scale * props.data.component.position.width / 100)}px;
    height: ${(props) => (props.scale * props.data.component.position.height / 100)}px;
    top: ${props => (props.scale * Number(props.data.component.position.top) / 100)}px;
    left: ${props => (props.scale * Number(props.data.component.position.left) / 100)}px;
    transform: rotate(${(props) => Number(props.state) || 0}deg);
`

export const ComponentVerticalTranslationAnalog = styled.img.attrs<GenericTypeComponent>(({ state, data }) => ({
    src: data.component.imageProps.imageDefault,
    id: data.backend.key,
})) <GenericTypeComponent>`
    position: absolute;
    width: ${(props) => (props.scale * props.data.component.position.width / 100)}px;
    height: ${(props) => (props.scale * props.data.component.position.height / 100)}px;
    top: ${props => (props.scale * (Number(props.data.component.position.top) + Number(props.state)) / 100)}px;
    left: ${props => (props.scale * Number(props.data.component.position.left) / 100)}px;
`

export const ComponentHorizontalTranslationAnalog = styled.img.attrs<GenericTypeComponent>(({ state, data }) => ({
    src: data.component.imageProps.imageDefault,
    id: data.backend.key,
})) <GenericTypeComponent>`
    position: absolute;
    width: ${(props) => (props.scale * props.data.component.position.width / 100)}px;
    height: ${(props) => (props.scale * props.data.component.position.height / 100)}px;
    top: ${props => (props.scale * Number(props.data.component.position.top)  / 100)}px;
    left: ${props => {
        // Calculate the cyclic position
        const cyclicPosition = (Number(props.state) % 100 + 100) % 100; // Ensures it wraps around correctly
        return `${props.scale * (Number(props.data.component.position.left) + cyclicPosition) / 100}px`;
    }};
`

