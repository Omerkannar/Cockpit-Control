import settings from '../../settings.json';
import React, { useState, useRef } from 'react';
import { BasicComponentContainer } from '../Common.interface';
import { REDUCE_FACTOR, OPACITY } from './ClickContainer.function';
import LargeSquare from './LargeSquare';
import SmallSquare from './SmallSquare';
import TrapezoidZone from './TrapezoidZone';


const ClickContainer: React.FC<BasicComponentContainer> = (props) => {

  const largeRectangleHeight: number = Number(props.data.component.clickProps?.clickBoundsHeightFactor) * Number(props.data.component.position.imgHeight) * props.scale / 100;
  const largeRectangleWidth: number = Number(props.data.component.clickProps?.clickBoundsWidthFactor) * Number(props.data.component.position.imgWidth) * props.scale / 100;
  const smallRectangleHeight: number = Number(props.data.component.clickProps?.clickBoundsHeightFactor) * Number(props.data.component.position.imgHeight) * props.scale / 100 / REDUCE_FACTOR;
  const smallRectangleWidth: number = Number(props.data.component.clickProps?.clickBoundsWidthFactor) * Number(props.data.component.position.imgWidth) * props.scale / 100 / REDUCE_FACTOR;

  const isCenter1Mapping = props.data.component.clickProps?.mapping?.mapPressPull1; // 1st center zone
  const isCenter2Mapping = props.data.component.clickProps?.mapping?.mapPressPull2; // 2nd center zone (optional)
  const isTopMapping = props.data.component.clickProps?.mapping?.mapTop;
  const isBottomMapping = props.data.component.clickProps?.mapping?.mapBottom;
  const isRightMapping = props.data.component.clickProps?.mapping?.mapRight;
  const isLeftMapping = props.data.component.clickProps?.mapping?.mapLeft;

  const [isLongPress, setIsLongPress] = useState<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Duration to differentiate between short click and long press (ms)
  const longPressThreshold = settings.componentsBehavior.analogLongPressDelay || 200;

  const handleOnMouseDown = (event: any) => {
    // const target = event.target as HTMLElement; // Cast to HTMLElement
    // console.log(event.button)
    setIsLongPress(false);
    timeoutRef.current = setTimeout(() => {
      setIsLongPress(true);
      // Start an interval to fire the handleLongPress event every longPressThreshold
      intervalRef.current = setInterval(() => {
        if (props.handleLongPress) {
          props.handleLongPress(props.data.backend.key, event.target.id);
        }
      }, longPressThreshold);
    }, longPressThreshold);
  }

  const handleOnMouseUp = (event: any) => {
    // If timeoutRef exists and long press hasn't started, it's a short click
    if (timeoutRef.current && !isLongPress && props.handleClick) {
      props.handleClick(props.data.backend.key, event.target.id);
    }

    // Clear timeout and interval
    clearTimeout(timeoutRef.current as NodeJS.Timeout);
    clearInterval(intervalRef.current as NodeJS.Timeout);

    timeoutRef.current = null;
    intervalRef.current = null;
    setIsLongPress(false);
  }

  return (
    <LargeSquare {...props}>
      {!props.data.component.isClickable ? null :
        <SmallSquare {...props}
          id={isCenter1Mapping}
          onMouseDown={(e) => isCenter1Mapping && handleOnMouseDown(e)}
          onMouseUp={(e) => isCenter1Mapping && handleOnMouseUp(e)}
          onMouseLeave={(e) => isCenter1Mapping && handleOnMouseUp(e)} 
          />
      }
      {!props.data.component.isClickable ? null :
        // Top Trapezoid
        <TrapezoidZone
        id={isTopMapping}
        onMouseDown={(e) => isTopMapping && handleOnMouseDown(e)}
        onMouseUp={(e) => isTopMapping && handleOnMouseUp(e)}
        onMouseLeave={(e) => isTopMapping && handleOnMouseUp(e)}
        zoneColor={!props.data.component.debugMode ? "" : isTopMapping ? `rgba(0, 255, 0, ${OPACITY})` : `rgba(255, 0, 0, ${OPACITY})`}
        cursor={isTopMapping ? true : false}
          clipPath={`polygon(
                    0 0, 
                    100% 0, 
                    ${(largeRectangleWidth / 2 + smallRectangleWidth / 2) / largeRectangleWidth * 100}% 
                    ${(largeRectangleHeight / 2 - smallRectangleHeight / 2) / largeRectangleHeight * 100}%, 
                    ${(largeRectangleWidth / 2 - smallRectangleWidth / 2) / largeRectangleWidth * 100}% 
                    ${(largeRectangleHeight / 2 - smallRectangleHeight / 2) / largeRectangleHeight * 100}%
                  )`
          }
        />
      }
      {!props.data.component.isClickable ? null :
        // Bottom Trapezoid
        <TrapezoidZone
          id={isBottomMapping}
          onMouseDown={(e) => isBottomMapping && handleOnMouseDown(e)}
          onMouseUp={(e) => isBottomMapping && handleOnMouseUp(e)}
          onMouseLeave={(e) => isBottomMapping && handleOnMouseUp(e)}
          zoneColor={!props.data.component.debugMode ? "" : isBottomMapping ? `rgba(0, 255, 0, ${OPACITY})` : `rgba(255, 0, 0, ${OPACITY})`}
          cursor={isBottomMapping ? true : false}
          clipPath={`polygon(
                    0 100%, 
                    100% 100%, 
                    ${(largeRectangleWidth / 2 + smallRectangleWidth / 2) / largeRectangleWidth * 100}% 
                    ${(largeRectangleHeight / 2 + smallRectangleHeight / 2) / largeRectangleHeight * 100}%, 
                    ${(largeRectangleWidth / 2 - smallRectangleWidth / 2) / largeRectangleWidth * 100}% 
                    ${(largeRectangleHeight / 2 + smallRectangleHeight / 2) / largeRectangleHeight * 100}%
                  )`
          }
        />
      }
      {!props.data.component.isClickable ? null :
        // Left Trapezoid
        <TrapezoidZone
          id={isLeftMapping}
          onMouseDown={(e) => isLeftMapping && handleOnMouseDown(e)}
          onMouseUp={(e) => isLeftMapping && handleOnMouseUp(e)}
          onMouseLeave={(e) => isLeftMapping && handleOnMouseUp(e)}
          zoneColor={!props.data.component.debugMode ? "" : isLeftMapping ? `rgba(0, 255, 0, ${OPACITY})` : `rgba(255, 0, 0, ${OPACITY})`}
          cursor={isLeftMapping ? true : false}
          clipPath={`polygon(
                    0 0, 
                    0 100%, 
                    ${(largeRectangleWidth / 2 - smallRectangleWidth / 2) / largeRectangleWidth * 100}% 
                    ${(largeRectangleHeight / 2 + smallRectangleHeight / 2) / largeRectangleHeight * 100}%, 
                    ${(largeRectangleWidth / 2 - smallRectangleWidth / 2) / largeRectangleWidth * 100}% 
                    ${(largeRectangleHeight / 2 - smallRectangleHeight / 2) / largeRectangleHeight * 100}%
                  )`
          }
        />
      }
      {!props.data.component.isClickable ? null :
        // Right Trapezoid
        <TrapezoidZone
          id={isRightMapping}
          onMouseDown={(e) => isRightMapping && handleOnMouseDown(e)}
          onMouseUp={(e) => isRightMapping && handleOnMouseUp(e)}
          onMouseLeave={(e) => isRightMapping && handleOnMouseUp(e)}
          zoneColor={!props.data.component.debugMode ? "" : isRightMapping ? `rgba(0, 255, 0, ${OPACITY})` : `rgba(255, 0, 0, ${OPACITY})`}
          cursor={isRightMapping ? true : false}
          clipPath={`polygon(
                    100% 0, 
                    100% 100%, 
                    ${(largeRectangleWidth / 2 + smallRectangleWidth / 2) / largeRectangleWidth * 100}% 
                    ${(largeRectangleHeight / 2 + smallRectangleHeight / 2) / largeRectangleHeight * 100}%, 
                    ${(largeRectangleWidth / 2 + smallRectangleWidth / 2) / largeRectangleWidth * 100}% 
                    ${(largeRectangleHeight / 2 - smallRectangleHeight / 2) / largeRectangleHeight * 100}%
                  )`
          }
        />
      }
    </LargeSquare>
  );
};

export default ClickContainer;
