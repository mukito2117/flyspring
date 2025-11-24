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
import { setExpiry } from './Utils/apiCalling';

const { Header, Content, Footer, Sider } = Layout;
const { Option } = Select;
const { Text } = Typography;

const redirect_url = "https://localhost/getCode";

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


  const handleUpdateClick = async () => {
  
    try {
      const response = await setExpiry();

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
      <Card style={{ borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
        <Space align="center" size="middle" wrap>
        
          <Button type="primary" onClick={handleUpdateClick}>
            Update Expiry
          </Button>
        </Space>
      </Card>

      {/* Token generation buttons */}
      <Card
        title="Generate Tokens"
        style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)", borderRadius: 8 }}
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
          className="ltp-table-card"
        >
          <div style={{ borderRadius: 6, overflow: "hidden" }}>
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
          <div style={{ borderRadius: 6, overflow: "hidden" }}>
            <OrdersTable />
          </div>
        </Card>
      </div>

      {/* Scoped styles to reorder LTP table on mobile */}
      <style jsx>{`
        /* Desktop: no change */
        @media (max-width: 768px) {
          /* Hide normal header cells except timestamp and strike */
          .ltp-table-card .ant-table-thead > tr > th {
            display: none;
          }
          .ltp-table-card .ant-table-thead > tr > th:nth-child(1),
          .ltp-table-card .ant-table-thead > tr > th:nth-child(2) {
            display: table-cell;
          }

          /* Change each table row into a multi-line block */
          .ltp-table-card .ant-table-tbody > tr > td {
            display: block;
            border: none;
            padding: 6px 12px !important;
            box-sizing: border-box;
            width: 100%;
          }
          /* Hide default cells except timestamp and strike */
          .ltp-table-card .ant-table-tbody > tr > td:nth-child(n + 3) {
            display: none;
          }
          /* Use ::before pseudo element to add lines for call and put data */
          .ltp-table-card .ant-table-tbody > tr {
            position: relative;
            padding: 12px 0;
            border-bottom: 1px solid #f0f0f0;
          }
          .ltp-table-card .ant-table-tbody > tr::before {
            content: attr(data-time-strike);
            display: block;
            font-weight: 600;
            white-space: nowrap;
            margin-bottom: 4px;
          }
          .ltp-table-card .ant-table-tbody > tr::after {
            content: attr(data-call-ltp) "  " attr(data-call-diff);
            display: block;
            margin-bottom: 2px;
            color: #1890ff;
          }
          .ltp-table-card .ant-table-tbody > tr > td:first-child::after {
            content: attr(data-put-ltp) "  " attr(data-put-diff);
            display: block;
            color: #f5222d;
          }
        }
      `}</style>
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
