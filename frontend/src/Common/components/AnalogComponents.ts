import styled from 'styled-components';
import { GenericTypeComponent } from '../Common.interface'
 

//  Rotation over the center of component (needles etc.)
export const ComponentRotationAnalog = styled.img.attrs<GenericTypeComponent>(({ state, data }) => ({
    src: data.component.imageProps.imageDefault,
    id: data.backend.key,
})) <GenericTypeComponent>`
    position: absolute;
    width: ${(props) => (props.scale * props.data.component.position.imgWidth / 100)}px;
    height: ${(props) => (props.scale * props.data.component.position.imgHeight / 100)}px;
    top: ${props => (props.scale * Number(props.data.component.position.posTop) / 100)}px;
    left: ${props => (props.scale * Number(props.data.component.position.posLeft) / 100)}px;
    transform: rotate(${(props) => Number(props.state) || 0}deg);
`

// Translation up and down (vertical handles)
export const ComponentVerticalTranslationAnalog = styled.img.attrs<GenericTypeComponent>(({ state, data }) => ({
    src: data.component.imageProps.imageDefault,
    id: data.backend.key,
})) <GenericTypeComponent>`
    position: absolute;
    width: ${(props) => (props.scale * props.data.component.position.imgWidth / 100)}px;
    height: ${(props) => (props.scale * props.data.component.position.imgHeight / 100)}px;
    top: ${props => (props.scale * (Number(props.data.component.position.posTop) + Number(props.state)) / 100)}px;
    left: ${props => (props.scale * Number(props.data.component.position.posLeft) / 100)}px;
`

// Translation right and left (horizontal handles)
export const ComponentHorizontalTranslationAnalog = styled.img.attrs<GenericTypeComponent>(({ state, data }) => ({
    src: data.component.imageProps.imageDefault,
    id: data.backend.key,
})) <GenericTypeComponent>`
    position: absolute;
    width: ${(props) => (props.scale * props.data.component.position.imgWidth / 100)}px;
    height: ${(props) => (props.scale * props.data.component.position.imgHeight / 100)}px;
    top: ${props => (props.scale * Number(props.data.component.position.posTop)  / 100)}px;
    left: ${props => (props.scale * (Number(props.data.component.position.posLeft) + Number(props.state)) / 100)}px;
`

// Translation up and down with cyclic capabilities (vertical ruler for example)
export const ComponentVerticalTranslationCyclicAnalog = styled.img.attrs<GenericTypeComponent>(({ state, data }) => ({
    src: data.component.imageProps.imageDefault,
    id: data.backend.key,
})) <GenericTypeComponent>`
    position: absolute;
    width: ${(props) => (props.scale * props.data.component.position.imgWidth / 100)}px;
    height: ${(props) => (props.scale * props.data.component.position.imgHeight / 100)}px;
    top: ${props => (props.scale * Number(props.data.component.position.posTop)  / 100)}px;
    left: ${props => {
        // Calculate the cyclic position
        const cyclicPosition = (Number(props.state) % 100 + 100) % 100; // Ensures it wraps around correctly
        return `${props.scale * (Number(props.data.component.position.posLeft) + cyclicPosition) / 100}px`;
    }};
`

// Translation right and left with cyclic capabilities (horizontal compass for example)
export const ComponentHorizontalTranslationCyclicAnalog = styled.img.attrs<GenericTypeComponent>(({ state, data }) => ({
    src: data.component.imageProps.imageDefault,
    id: data.backend.key,
})) <GenericTypeComponent>`
    position: absolute;
    width: ${(props) => (props.scale * props.data.component.position.imgWidth / 100)}px;
    height: ${(props) => (props.scale * props.data.component.position.imgHeight / 100)}px;
    top: ${props => (props.scale * Number(props.data.component.position.posTop)  / 100)}px;
    left: ${props => {
        // Calculate the cyclic position
        const cyclicPosition = (Number(props.state) % 100 + 100) % 100; // Ensures it wraps around correctly
        return `${props.scale * (Number(props.data.component.position.posLeft) + cyclicPosition) / 100}px`;
    }};
`

