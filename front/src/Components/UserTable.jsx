import React, { useEffect, useState } from 'react';

function CallPutTableFromLog() {
  const [logData, setLogData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/loglist') // Your API endpoint returning array of objects
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        setLogData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [logData]);

  if (loading) return <p>Loading data...</p>;
  if (error) return <p>Error loading data: {error}</p>;

  return (
    <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', width: '100%' }}>
      <thead style={{ backgroundColor: '#f0f0f0' }}>
        <tr>
          <th>Timestamp</th>
          <th>Strike</th>
          <th>Call LTP</th>
          <th>Put LTP</th>
          <th>Call Diff</th>
          <th>Put Diff</th>
        </tr>
      </thead>
      <tbody>
        {logData.length === 0 ? (
          <tr>
            <td colSpan="6" style={{ textAlign: 'center' }}>No data found</td>
          </tr>
        ) : (
          logData.map(({ timestamp, strike, callLtp, putLtp, callDiff, putDiff }, index) => (
            <tr key={index}>
              <td>{timestamp}</td>
              <td>{strike}</td>
              <td>{callLtp.toFixed(2)}</td>
              <td>{putLtp.toFixed(2)}</td>
              <td>{callDiff.toFixed(2)}</td>
              <td>{putDiff.toFixed(2)}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

export default CallPutTableFromLog;
