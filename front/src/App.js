import React, { useEffect, useContext } from 'react';
import { Layout, Menu } from 'antd';
import { UserOutlined, LaptopOutlined, NotificationOutlined } from '@ant-design/icons';
import UserTable from './Components/UserTable';
import { AppContextProvider, AppContext } from './Context/AppContext';

const { Header, Content, Footer, Sider } = Layout;

function AppContent() {
  const { setLogData } = useContext(AppContext);

useEffect(() => {
  const fetchData = () => {
    fetch('/api/loglist')
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => setLogData(data))
      .catch(console.error);
  };

  fetchData(); // Initial fetch

  const intervalId = setInterval(fetchData, 5000); // Fetch every 5 seconds

  return () => clearInterval(intervalId); // Cleanup on unmount
}, []);


  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={200} className="site-layout-background">
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['1']}
          style={{ height: '100%', borderRight: 0 }}
        >
          <Menu.Item key="1" icon={<UserOutlined />}>Users</Menu.Item>
          <Menu.Item key="2" icon={<LaptopOutlined />}>Devices</Menu.Item>
          <Menu.Item key="3" icon={<NotificationOutlined />}>Notifications</Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', textAlign: 'center', fontSize: '20px', padding: 0 }}>
          FlySpring
        </Header>
        <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
          <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
            <UserTable />
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>FlySpring ©2025 Created by You</Footer>
      </Layout>
    </Layout>
  );
}

function App() {
  return (
    <AppContextProvider>
      <AppContent />
    </AppContextProvider>
  );
}

export default App;
