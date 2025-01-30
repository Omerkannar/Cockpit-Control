import styled from 'styled-components';
import { ADIComponent } from '../Common.interface'
 

//  Translation accoding to pitch and rotation according to roll values
export const ComponentADI = styled.img.attrs<ADIComponent>(({ pitch, roll, data }) => ({
    src: data.component.imageProps.imageDefault,
    id: data.backend.key,
})) <ADIComponent>`
    position: absolute;
    width: ${(props) => (props.scale * (props.data.component.position.imgScale / 100)* props.data.component.position.imgWidth / 100)}px;
    height: ${(props) => (props.scale * (props.data.component.position.imgScale / 100)* props.data.component.position.imgHeight / 100)}px;
    top: ${props => (props.scale * pitchOffset(props.pitch, props.data) / 100)}px;
    left: ${props => (props.scale * Number(props.data.component.position.posLeft) / 100)}px;
    transform: rotate(${(props) => Number(props.roll) || 0}deg);
    transform-origin: center ${props => (-pitchOffset(props.pitch, props.data) + (props.data.component.analogProps?.adiProps?.transformOriginConstant || 0))}px;
    z-index: ${(props) => props.data.component.position.zIndex};
`

const pitchOffset = (pitch: number, data: any): number => {
    return (data.component.analogProps.adiProps.pitchOffsetSlope * pitch - data.component.analogProps.adiProps.pitchOffsetConstant);
};