import React, { useContext, useEffect } from 'react';
import { AppContext } from '../Context/AppContext';

function UserTable() {
  const { logData } = useContext(AppContext);

  useEffect(() => {
    // This effect runs when logData changes
  }, [logData]);
  if (!logData.length) {
    return <p>Loading data...</p>;
  }

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
        {logData.map(({ timestamp, strike, callLtp, putLtp, callDiff, putDiff }, index) => (
          <tr key={index}>
            <td>{timestamp}</td>
            <td>{strike}</td>
            <td>{callLtp.toFixed(2)}</td>
            <td>{putLtp.toFixed(2)}</td>
            <td>{callDiff.toFixed(2)}</td>
            <td>{putDiff.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default UserTable;
