import { keyframes} from "styled-components"

export const OPACITY: number = 0.2;
export const DEFAULT_BLINK_COLOR = 'rgba(0, 0, 0, 0)'; // White
export const REDUCE_FACTOR: number = 3; // = largeRectangle / smallRectangle

// Function to validate if a string is a valid CSS color
const isValidColor = (color: string): boolean => {
  const s = new Option().style;
  s.color = color;
  return s.color !== '';
};

// Function to get a valid color or return the default
const getValidColor = (color: string | undefined, defaultColor: string): string => {
  if (color && isValidColor(color)) {
    return color;
  }
  return defaultColor;
};

export const blink = (color: string) => keyframes`
  0% {
    border-color: transparent;
  }
  50% {
    border-color: ${getValidColor(color, DEFAULT_BLINK_COLOR)};
  }
  100% {
    border-color: transparent;
  }
`;