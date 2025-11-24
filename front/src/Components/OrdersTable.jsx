import React, { useEffect, useState } from 'react';
import { Table, Spin, Alert } from 'antd';
import { fetchOrdersDetails } from '../Utils/apiCalling';

function OrdersTable() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch orders from API
  // useEffect(() => {
  //   fetch('/placeorder/details')
  //     .then((res) => {
  //       if (!res.ok) throw new Error('Failed to fetch orders');
  //       return res.json();
  //     })
  //     .then((data) => {
  //       setOrders(data ? (Array.isArray(data) ? data : [data]) : []);
  //       setLoading(false);
  //     })
  //     .catch((err) => {
  //       setError(err.message);
  //       setLoading(false);
  //     });
  // }, []);

   useEffect(() => {
    const loadOrders = async () => {
      try {
        // This function now automatically uses the API_BASE_URL defined in apiCalling.js
        const data = await fetchOrdersDetails(); 
        setOrders(data ? (Array.isArray(data) ? data : [data]) : []);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    loadOrders();
  }, []);


  // Define columns for Ant Design Table
const columns = [
  { title: "Order Type", dataIndex: "type", key: "type" },
  { title: "Instrument Token", dataIndex: "token", key: "token" },
  {
    title: "Entry Price",
    dataIndex: "entryPrice",
    key: "entryPrice",
    render: (v) => (typeof v === "number" ? v.toFixed(2) : "-"),
  },
  {
    title: "Stoploss Price",
    dataIndex: "stoplossPrice",
    key: "stoplossPrice",
    render: (v) => (typeof v === "number" ? v.toFixed(2) : "-"),
  },
  {
    title: "Trailing Gap",
    dataIndex: "trailingGap",
    key: "trailingGap",
    render: (v) => (typeof v === "number" ? v.toFixed(2) : "-"),
  },
  { title: "Quantity", dataIndex: "qty", key: "qty" },
  { title: "Status", dataIndex: "status", key: "status" },
  {
    title: "Target Price",
    dataIndex: "targetPrice",
    key: "targetPrice",
    render: (v) => (typeof v === "number" ? v.toFixed(2) : "-"),
  },
  { title: "Entry Time", dataIndex: "entryTime", key: "entryTime" },
  { title: "Exit Time", dataIndex: "exitTime", key: "exitTime" },
  { title: "Exit Reason", dataIndex: "exitReason", key: "exitReason" },
];


  if (loading) return <Spin tip="Loading orders..." />;
  if (error) return <Alert type="error" message={error} />;

  return (
    <Table
      rowKey={(record) => record.realOrderId || record.entryTime}
      columns={columns}
      dataSource={orders}
      pagination={{ pageSize: 10 }}
      scroll={{ x: 'max-content' }}
      bordered
    />
  );
}

export default OrdersTable;
