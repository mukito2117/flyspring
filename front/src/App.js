import React, { useState, useEffect, useContext } from "react";
import { Layout, Menu, Button } from "antd";
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  DashboardOutlined,
  OrderedListOutlined,
} from "@ant-design/icons";
import UserTable from "./Components/UserTable";
import OrdersTable from "./Components/OrdersTable";
import { AppContextProvider, AppContext } from "./Context/AppContext";

const { Header, Content, Footer, Sider } = Layout;
//const redirect_url = 'http://localhost/getCode';
const redirect_url = 'https://flyspring-feh2b5gqc4bchgh0.canadacentral-01.azurewebsites.net/getCode';
const clientIds = [
  '64bcafc6-5965-46c3-9e9b-113e396b1ecb',
  '15b39ed0-f0b0-4e16-9948-80a46f62e295',
  '6cfc3a27-df0f-4aa8-9e33-7b8bc20b255b',
  '7b717ec7-2cd4-4ff8-b852-de03162a80f1',
  'a34aec7f-b199-4fc7-b0a3-ee965b61d9e1',
  '03f2cbd6-b835-43ad-a587-ca8a6190bf33',
];

const stateValues = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
];

function Dashboard() {
  return (
    <div
      style={{
        display: "flex",
        gap: 20,
        flexWrap: "wrap",
        justifyContent: "space-between",
      }}>
     
 <div
      style={{
        display: "flex",
        gap: 20,
        flexWrap: "wrap",
        justifyContent: "space-between",
        flexDirection: "row",
      }}
    >
      {clientIds.map((clientId, index) => {
        const state = stateValues[index];
        const url = `https://api.upstox.com/v2/login/authorization/dialog?response_type=code&client_id=${clientId}&redirect_uri=${redirect_url}&state=${state}`;
        return (
          <a
            key={index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none" }}
          >
            <button style={{ cursor: "pointer" }}>
              GenerateToken{index + 1}
            </button>
          </a>
        );
      })}
    </div>
    

    <div
      style={{
        display: "flex",
        gap: 20,
        flexWrap: "wrap",
        justifyContent: "space-between",
      }}
    >
      <div style={{ flex: "1 1 400px", minWidth: 300 }}>
        <h2>LTP Table</h2>
        <UserTable />
      </div>
      <div style={{ flex: "1 1 400px", minWidth: 300 }}>
        <h2>Orders Table</h2>
        <OrdersTable />
      </div>
    </div>
    </div>
  );
}

function AppContent() {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("dashboard");
  const { setLogData } = useContext(AppContext);

  useEffect(() => {
    const fetchData = () => {
      fetch("/api/loglist")
        .then((res) => {
          if (!res.ok) throw new Error("Network response was not ok");
          return res.json();
        })
        .then((data) => setLogData(data))
        .catch(console.error);
    };

    fetchData();

    const intervalId = setInterval(fetchData, 1000);

    return () => clearInterval(intervalId);
  }, [setLogData]);

  const toggle = () => {
    setCollapsed(!collapsed);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          backgroundColor: "#001529",
          padding: "0 16px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "20px",
            gap: "12px",
            flexShrink: 0,
          }}
        >
          <div>FlySpring</div>
          <Button
            type="text"
            onClick={toggle}
            style={{ fontSize: "18px", color: "#fff", padding: 0 }}
            aria-label="Toggle sidebar"
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </Button>
        </div>
        {/* Spacer pushes any other header content to right */}
        <div style={{ flexGrow: 1 }} />
      </Header>

      <Layout>
        <Sider
          width={200}
          breakpoint="lg"
          collapsedWidth="0"
          collapsed={collapsed}
          onCollapse={(val) => setCollapsed(val)}
          style={{ backgroundColor: "#001529" }}
        >
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[selectedMenu]}
            onClick={(e) => setSelectedMenu(e.key)}
            style={{ height: "100%", borderRight: 0 }}
            items={[
              { key: "dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
              { key: "orders", icon: <OrderedListOutlined />, label: "Orders" },
            ]}
          />
        </Sider>

        <Layout style={{ padding: "24px", minHeight: "100vh" }}>
          <Content
            style={{
              backgroundColor: "#fff",
              padding: 24,
              margin: 0,
              overflow: "auto",
            }}
          >
            {selectedMenu === "dashboard" && <Dashboard />}
            {selectedMenu === "orders" && <OrdersTable />}
          </Content>
          <Footer style={{ textAlign: "center" }}>
            FlySpring ©2025 Created by FlySpring
          </Footer>
        </Layout>
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
