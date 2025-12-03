import React, { useContext, useEffect } from 'react';
import { AppContext } from '../Context/AppContext';

function UserTable() {
  const { logData } = useContext(AppContext);

  useEffect(() => {
    // Effect runs when logData changes
  }, [logData]);

  if (!logData || !logData.length) {
    return <p>Loading data...</p>;
  }

  return (
    <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', width: '100%' }}>
      <thead style={{ backgroundColor: '#f0f0f0' }}>
        <tr>
          <th>Timestamp</th>
          <th>Strike</th>
          <th>Side</th>
          <th>Type</th>
          <th>Entry</th>
          <th>StopLoss</th>
           <th>LTP</th>
        </tr>
      </thead>
      <tbody>
        {logData.map(({ timestamp, strike, side, type, entryPrice, stopLoss,ltp }, index) => (
          <tr key={index}>
            <td>{timestamp}</td>
            <td>{strike?.toFixed(2)}</td>
            <td>{side}</td>
            <td>{type}</td>
            <td>{entryPrice?.toFixed(2)}</td>
            <td>{stopLoss?.toFixed(2)}</td>
            <td>{ltp?.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default UserTable;
