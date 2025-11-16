import React, { useState, useEffect, useContext } from "react";
import {
  Layout,
  Menu,
  Button,
  Space,
  Card,
  Select,
  DatePicker,
  Typography,
  message,
} from "antd";
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  DashboardOutlined,
  OrderedListOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import UserTable from "./Components/UserTable";
import OrdersTable from "./Components/OrdersTable";
import { AppContextProvider, AppContext } from "./Context/AppContext";

const { Header, Content, Footer, Sider } = Layout;
const { Option } = Select;
const { Text } = Typography;

const redirect_url =
  "https://flyspring-feh2b5gqc4bchgh0.canadacentral-01.azurewebsites.net/getCode";

const clientIds = [
  "64bcafc6-5965-46c3-9e9b-113e396b1ecb",
  "15b39ed0-f0b0-4e16-9948-80a46f62e295",
  "6cfc3a27-df0f-4aa8-9e33-7b8bc20b255b",
  "7b717ec7-2cd4-4ff8-b852-de03162a80f1",
  "a34aec7f-b199-4fc7-b0a3-ee965b61d9e1",
  "03f2cbd6-b835-43ad-a587-ca8a6190bf33",
];

const stateValues = ["1", "2", "3", "4", "5", "6"];

function Dashboard() {
  const [selectedIndex, setSelectedIndex] = useState("NSE_INDEX|Nifty 50");
  const [expiryDate, setExpiryDate] = useState(null);

  const handleUpdateClick = async () => {
    if (!expiryDate) {
      message.error("Please select an expiry date before updating.");
      return;
    }
    try {
      const response = await fetch("/api/setExpiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ index: selectedIndex, expiry: expiryDate }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      const result = await response.json();
      message.success("Update successful");
      console.log("Update result:", result);
    } catch (error) {
      message.error("Update failed: " + error.message);
      console.error("Error posting update:", error);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Top card with dropdown, datepicker, and update button */}
      <Card
        style={{ borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
      >
        <Space align="center" size="middle" wrap>
          <Select
            value={selectedIndex}
            onChange={setSelectedIndex}
            style={{ minWidth: 180 }}
            dropdownMatchSelectWidth={false}
          >
            <Option value="NSE_INDEX|Nifty 50">Nifty</Option>
            <Option value="BSE_INDEX|SENSEX">Sensex</Option>
          </Select>

          <Text strong>Select Expiry</Text>
          <DatePicker
            onChange={(_, dateString) => setExpiryDate(dateString)}
            style={{ width: 160 }}
          />

          <Button type="primary" onClick={handleUpdateClick}>
            Update
          </Button>
        </Space>
      </Card>

      {/* Token generation buttons */}
      <Card
        title="Generate Tokens"
        style={{
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          borderRadius: 8,
        }}
      >
        <Space wrap>
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
                <Button
                  type="primary"
                  icon={<LinkOutlined />}
                  shape="round"
                  size="middle"
                  style={{
                    backgroundColor: "#1677ff",
                    borderColor: "#1677ff",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                    transition: "all 0.3s ease",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "#4096ff";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "#1677ff";
                  }}
                >
                  Generate Token {index + 1}
                </Button>
              </a>
            );
          })}
        </Space>
      </Card>

      {/* Tables section */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          flexDirection: "column",
          gap: 24,
          justifyContent: "space-between",
        }}
      >
        <Card
          title="LTP Table"
          bordered={false}
          style={{
            flex: "1 1 400px",
            minWidth: 350,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            borderRadius: 8,
          }}
          bodyStyle={{ padding: 16 }}
        >
          <div
            style={{
              borderRadius: 6,
              overflow: "hidden",
            }}
          >
            <UserTable />
          </div>
        </Card>

        <Card
          title="Orders Table"
          bordered={false}
          style={{
            flex: "1 1 400px",
            minWidth: 350,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            borderRadius: 8,
          }}
          bodyStyle={{ padding: 16 }}
        >
          <div
            style={{
              borderRadius: 6,
              overflow: "hidden",
            }}
          >
            <OrdersTable />
          </div>
        </Card>
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

  const toggle = () => setCollapsed(!collapsed);

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
              backgroundColor: "#f5f6fa",
              padding: 24,
              borderRadius: 8,
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
