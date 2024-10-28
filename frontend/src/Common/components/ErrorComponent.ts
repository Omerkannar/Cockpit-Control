import styled from 'styled-components';
import { GenericTypeComponent } from '../Common.interface'


export const ComponentError = styled.div.attrs<GenericTypeComponent>(({ data }) => ({
})) <GenericTypeComponent>`
    position: absolute;
    width: ${(props) => (props.scale * props.data.component.position.width / 100)}px;
    height: ${(props) => (props.scale * props.data.component.position.height / 100)}px;
    top: ${props => props.state === true ?
        ((props.scale * (Number(props.data.component.position.top) )) / 100) :
        ((props.scale * (Number(props.data.component.position.top) )) / 100)}px;
    left: ${props => (props.scale * props.data.component.position.left / 100)}px;
    font-size: 15px;
    color: red;
`