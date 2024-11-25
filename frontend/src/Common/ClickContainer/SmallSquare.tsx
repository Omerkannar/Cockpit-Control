import styled from "styled-components"
import { BasicComponentContainer } from '../Common.interface';
import { OPACITY, REDUCE_FACTOR } from "./ClickContainer.function";

// Styled component for the smaller square at the center
const SmallSquare = styled.div<BasicComponentContainer>`
  position: absolute;
  width:                ${props => (props.scale * props.data.component.position.imgWidth * Number(props.data.component.clickProps?.clickBoundsWidthFactor) / 100 / REDUCE_FACTOR) | 0}px;
  height:               ${props => (props.scale * props.data.component.position.imgHeight * Number(props.data.component.clickProps?.clickBoundsHeightFactor) / 100 / REDUCE_FACTOR) | 0}px;
  background-color:     ${props => (!props.data.component.debugMode ? "" : props.data.component.clickProps?.mapping?.mapPressPull1 ? `rgba(0, 255, 0, ${OPACITY})` : `rgba(255, 0, 0, ${OPACITY})`)};
  cursor:               ${props => (props.data.component.clickProps?.mapping?.mapPressPull1 ? "pointer" : "not-allowed")};
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
`;

export default SmallSquare;