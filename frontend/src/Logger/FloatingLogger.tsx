import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import settings from '../settings.json';

const LoggerContainer = styled.div<{ isMinimized: boolean; zoomScale: number }>`
  position: fixed;
  top: 20px;
  left: 20px;
  width: ${settings.logger.properties.width}px; 
  max-height: ${({ isMinimized }) => (isMinimized ? 50 : settings.logger.properties.maxHeight)}px; /* Smaller height when minimized */
  overflow-y: ${({ isMinimized }) => (isMinimized ? 'hidden' : 'auto')}; /* Hide overflow when minimized */
  background-color: ${settings.logger.properties.color};
  color: #fff;
  padding: ${({ isMinimized }) => (isMinimized ? '10px' : '10px')}; /* Smaller padding when minimized */
  border-radius: 5px;
  font-family: monospace;
  z-index: 9999;
  transform-origin: top left;
  transform: ${({ zoomScale }) => `scale(${zoomScale})`}; /* Adjust based on zoom scale */
  font-size: 14px; /* Fixed font size */
  transition: max-height 0.3s; /* Smooth transition for minimization */
`;

const LoggerHeader = styled.div`
  display: flex;
  top: 10px;
  padding-bottom: 10px;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  cursor: pointer;
`;

const LogEntry = styled.div`
  margin-bottom: 5px;
`;

const ClearButton = styled.button<{ zoomScale: number }>`
  position: absolute;
  top: 10px;
  right: 80px;
  background: none;
  color: #fff;
  border: 1px solid #fff;
  border-width: var(--button-border-width, 1px); /* Use CSS variable for border width */
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  box-sizing: border-box;
`;

const ToggleButton = styled.button<{ zoomScale: number }>`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  color: #fff;
  border: 1px solid #fff;
  border-width: var(--button-border-width, 1px); /* Use CSS variable for border width */
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  box-sizing: border-box;
`;

interface FloatingLoggerProps {
  limit?: number;
}

const FloatingLogger: React.FC<FloatingLoggerProps> = ({ limit = 50 }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [zoomScale, setZoomScale] = useState<number>(1); // State to track zoom scale
  const [isMinimized, setIsMinimized] = useState<boolean>(false); // State to toggle minimized/restored
  const logRef = useRef(logs);

  useEffect(() => {
    logRef.current = logs;
  }, [logs]);

  useEffect(() => {
    const originalInfo = console.info;

    // Override console.info to capture messages
    console.info = (...args) => {
      const message = args.map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : arg)).join(' ');
      setLogs((prevLogs) => {
        const newLogs = [message, ...prevLogs]; // Insert new log at the beginning
        return newLogs.slice(0, limit); // Keep only the latest logs up to the limit
      });
      originalInfo.apply(console, args);
    };

    return () => {
      console.info = originalInfo; // Restore console.info when component unmounts
    };
  }, [limit]);

  // Function to handle zoom level changes
  const handleZoomChange = () => {
    const newScale = 1 / window.devicePixelRatio; // Calculate scale to counteract zoom
    setZoomScale(newScale);

        // Set CSS variable for the border width based on zoom level
        document.documentElement.style.setProperty('--button-border-width', `${newScale}px`);
  };

  useEffect(() => {
    handleZoomChange(); // Set initial scale based on zoom level

    // Listen to resize events to detect zoom changes
    window.addEventListener('resize', handleZoomChange);

    return () => {
      window.removeEventListener('resize', handleZoomChange);
    };
  }, []);

  const handleClearLogs = () => {
    setLogs([]);
  };

  const toggleMinimize = () => {
    setIsMinimized((prevState) => !prevState); // Toggle minimized state
  };

  return (
    <LoggerContainer isMinimized={isMinimized} zoomScale={zoomScale}>
      <LoggerHeader onClick={toggleMinimize}>
        Info
        <ToggleButton onClick={(e) => {
            e.stopPropagation();
            toggleMinimize()
            }} zoomScale={zoomScale}>
          {isMinimized ? 'Restore' : 'Minimize'}
        </ToggleButton>
      </LoggerHeader>
      {!isMinimized && (
        <>
          {logs.map((log, index) => (
            <LogEntry key={index}>{log}</LogEntry>
          ))}
           <ClearButton onClick={handleClearLogs} zoomScale={zoomScale}>Clear</ClearButton>
        </>
      )}
    </LoggerContainer>
  );
};

export default FloatingLogger;
