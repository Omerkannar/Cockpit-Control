import styled, { css } from "styled-components"
import { BasicComponentContainer } from '../Common.interface';
import { blink } from './ClickContainer.function';

// Styled component for the large square container
const LargeSquare = styled.div<BasicComponentContainer>`
  position:               absolute;
  display:                grid;
  top:                    ${props => (props.scale * (Number(props.data.component.position.posTop) + (Number(props.data.component.position.imgHeight) / 2) * (1 - Number(props.data.component.clickProps?.clickBoundsHeightFactor))) / 100) | 0}px;
  left:                   ${props => (props.scale * (Number(props.data.component.position.posLeft) + (Number(props.data.component.position.imgWidth) / 2) * (1 - Number(props.data.component.clickProps?.clickBoundsWidthFactor))) / 100) | 0}px;
  width:                  ${props => (props.scale * props.data.component.position.imgWidth * Number(props.data.component.clickProps?.clickBoundsWidthFactor) / 100) | 0}px;
  height:                 ${props => (props.scale * props.data.component.position.imgHeight * Number(props.data.component.clickProps?.clickBoundsHeightFactor) / 100) | 0}px;
  background-color: rgba(255,255,255,0);
  border: 2px solid transparent;
  ${props => (props.isBlinking && props.data.type !== "number" && props.data.component.blinking?.color) && css`
     animation: ${blink(props.data.component.blinking.color)} 0.8s infinite;
   `}
`;

export default LargeSquare;