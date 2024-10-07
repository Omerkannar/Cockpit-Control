import settings from './settings.json'
import { GenericPanelInterface, PanelContainerInterface } from './Common/Common.interface';
import { Container, MainContainer } from './Common/Common.styles';
import { useWebSocket } from './useWebSocket';
import GenericPanel from './components/GenericPanel';
import panelsStaticData from './data/Panels.json';
import containerConfigs from './data/PanelContainers.json';
import FloatingLogger from './Logger/FloatingLogger';

const App = () => {

  const { message, sendMessage } = useWebSocket('ws://localhost:8765');


  const handleSendRequest = (panelName: string, switchName: string, switchValue: string) => {
    console.log(`App.tsx received change request for ${panelName} panel, ${switchName} => ${switchValue}`)
    sendMessage(panelName, switchName, switchValue);
  }



  return (
    <MainContainer>
      {settings.logger.showLogger && <FloatingLogger limit={100} />}
      {containerConfigs.map((container: PanelContainerInterface) => {
        return (
          <Container {...container}>
            {
              // eslint-disable-next-line
              panelsStaticData.map((data: GenericPanelInterface['static_data']) => {
                if (data.panel_container === container.container_name) {
                  return (
                    <GenericPanel
                      static_data={data}
                      dynamic_data={message || undefined}
                      handleSendRequest={handleSendRequest}
                    />
                  )
                }
              }
              )}
          </Container>
        )
      })
      }
    </MainContainer>
  );
}

export default App;


