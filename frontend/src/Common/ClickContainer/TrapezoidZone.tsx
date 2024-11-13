import styled from "styled-components"

// Styled component for the trapezoid zones
const TrapezoidZone = styled.div<{ zoneColor: string; clipPath: string; cursor: boolean }>`
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: ${(props) => props.zoneColor};
  clip-path: ${(props) => props.clipPath};
  cursor:    ${(props) => (props.cursor ? "pointer" : "not-allowed")};
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
`;

export default TrapezoidZone;