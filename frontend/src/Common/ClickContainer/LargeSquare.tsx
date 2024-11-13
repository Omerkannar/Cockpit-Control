import styled, { css } from "styled-components"
import { BasicComponentContainer } from '../Common.interface';
import { blink } from './ClickContainer.function';

// Styled component for the large square container
const LargeSquare = styled.div<BasicComponentContainer>`
  position:               absolute;
  display:                grid;
  top:                    ${props => (props.scale * (Number(props.data.component.position.top) + (Number(props.data.component.position.height) / 2) * (1 - Number(props.data.component.clickProps?.clickBoundsHeightFactor))) / 100) | 0}px;
  left:                   ${props => (props.scale * (Number(props.data.component.position.left) + (Number(props.data.component.position.width) / 2) * (1 - Number(props.data.component.clickProps?.clickBoundsWidthFactor))) / 100) | 0}px;
  width:                  ${props => (props.scale * props.data.component.position.width * Number(props.data.component.clickProps?.clickBoundsWidthFactor) / 100) | 0}px;
  height:                 ${props => (props.scale * props.data.component.position.height * Number(props.data.component.clickProps?.clickBoundsHeightFactor) / 100) | 0}px;
  background-color: rgba(255,255,255,0);
  border: 2px solid transparent;
  ${props => (props.isBlinking && props.data.type !== "number" && props.data.component.blinking?.color) && css`
     animation: ${blink(props.data.component.blinking.color)} 0.8s infinite;
   `}
`;

export default LargeSquare;