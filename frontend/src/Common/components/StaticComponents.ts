import styled from 'styled-components';
import { GenericTypeComponent } from '../Common.interface'


export const ComponentStatic = styled.img.attrs<GenericTypeComponent>(({ state, data }) => ({
    src: data.component.imageProps.imageDefault,
    id: data.backend.key,
})) <GenericTypeComponent>`
    position: absolute;
    width: ${(props) => (props.scale * props.data.component.position.width / 100)}px;
    height: ${(props) => (props.scale * props.data.component.position.height / 100)}px;
    top: ${props => (props.scale * props.data.component.position.top / 100)}px;
    left: ${props => (props.scale * props.data.component.position.left / 100)}px;
`

