import React from "react";
import styled from "styled-components";

// Styled components
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;

const ModalContainer = styled.div<{ width: number; height: number }>`
  background-color: #282c34;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
`;

const CloseButton = styled.button`
  align-self: flex-end;
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
`;

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    width?: number;
    height?: number;
    children: React.ReactNode;
  }
  
  const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    width = 400, // Default width
    height = 300, // Default height
    children,
  }) => {
    if (!isOpen) return null;
  
    return (
      <Overlay onClick={onClose}>
        <ModalContainer
          width={width}
          height={height}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </ModalContainer>
      </Overlay>
    );
  };

export default Modal;
