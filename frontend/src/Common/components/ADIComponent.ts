import styled from 'styled-components';
import { ADIComponent } from '../Common.interface'
 

//  Translation accoding to pitch and rotation according to roll values
export const ComponentADI = styled.img.attrs<ADIComponent>(({ state, data }) => ({
    src: data.component.imageProps.imageDefault,
    id: data.backend.key,
})) <ADIComponent>`
    position: ${(props)=> props.data.component.additionalCssProps?.position};
    width: ${(props) => (props.scale * (props.data.component.position.imgScale / 100)* props.data.component.position.imgWidth / 100)}px;
    height: ${(props) => (props.scale * (props.data.component.position.imgScale / 100)* props.data.component.position.imgHeight / 100)}px;
    top: ${props => (props.scale * pitchOffset(props.state.pitch, props.data) / 100)}px;
    left: ${props => (props.scale * Number(props.data.component.position.posLeft) / 100)}px;
    transform: rotate(${(props) => Number(props.state.roll) || 0}deg);
    transform-origin: center ${props => (props.scale / 100 * (-pitchOffset(props.state.pitch, props.data) + (props.data.component.analogProps?.adiProps?.transformOriginConstant || 0)))}px;
    z-index: ${(props) => props.data.component.position.zIndex};
    clip-path: circle(${props => props.scale * 200 / 100}px at ${props => props.scale * 240 / 100}px ${props => props.scale / 100 * ((props.data.component.analogProps?.adiProps?.transformOriginConstant || 0) - pitchOffset(props.state.pitch, props.data))}px);
`

const pitchOffset = (pitch: number, data: any): number => {
    return (data.component.analogProps.adiProps?.pitchOffsetSlope * pitch - data.component.analogProps.adiProps?.pitchOffsetConstant) | 0;
};