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
          <th>First LTP</th>
          <th>Last LTP</th>
          <th>Diff</th>
          <th>Side</th>
        </tr>
      </thead>
      <tbody>
        {logData.map(({ timestamp, strike, firstLTP, lastLTP, difference, side }, index) => (
          <tr key={index}>
            <td>{timestamp}</td>
            <td>{strike}</td>
            <td>{firstLTP?.toFixed(2)}</td>
            <td>{lastLTP?.toFixed(2)}</td>
            <td>{difference?.toFixed(2)}</td>
            <td>{side}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default UserTable;
