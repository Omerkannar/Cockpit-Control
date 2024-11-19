import { useState, useEffect } from 'react';
import settings from './settings.json';
import { GenericPanelInterface, PanelContainerInterface } from './Common/Common.interface';
import { Container, MainContainer, LayoutNavigation, LayoutButton } from './Common/Common.styles';
import { useWebSocket } from './useWebSocket';
import GenericPanel from './components/GenericPanel';
import panelsStaticData from './data/Panels.json';
import containerConfigs from './data/PanelContainers.json';
import layoutsData from './data/Layouts.json';
import FloatingLogger from './Logger/FloatingLogger';

const App = () => {

  const { message, sendMessage } = useWebSocket('ws://localhost:8765');
  const [currentLayout, setCurrentLayout] = useState(layoutsData[0].layout_name);
  const [zoomScale, setZoomScale] = useState<number>(1); // State to track zoom scale


  const handleSendRequest = (panelName: string, switchName: string, switchValue: string) => {
    console.log(`App.tsx received change request for ${panelName} panel, ${switchName} => ${switchValue}`)
    sendMessage(panelName, switchName, switchValue);
  }

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

  const handleLayoutChange = (layoutName: string) => {
    setCurrentLayout(layoutName);
  };

  const currentLayoutData = layoutsData.find(layout => layout.layout_name === currentLayout);
  const visibleContainers = containerConfigs.filter(container =>
    currentLayoutData?.containers.includes(container.container_name)
  );


  return (
    <MainContainer>
      {settings.logger.showLogger && <FloatingLogger limit={100} />}

      {/* Navigation UI (only shown if there are multiple layouts) */}
      {layoutsData.length > 1 && (
        <LayoutNavigation zoomScale={zoomScale}>
          {layoutsData.map(layout => (
            <LayoutButton
              key={layout.layout_name}
              onClick={() => handleLayoutChange(layout.layout_name)}
            >
              {layout.layout_name}
            </LayoutButton>
          ))}
        </LayoutNavigation>
      )}
      {visibleContainers.map((container: PanelContainerInterface) => (
        <Container 
        key={container.container_name} {...container}>
          {panelsStaticData
            .filter((data: GenericPanelInterface['static_data']) => data.panel_container === container.container_name)
            .map((data: GenericPanelInterface['static_data']) => (
              <GenericPanel
                key={data.panel_name}
                static_data={data}
                dynamic_data={message || undefined}
                handleSendRequest={handleSendRequest}
              />
            ))}
        </Container>
      ))}
    </MainContainer>
  );
}

export default App;