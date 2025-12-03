import React from 'react';
  const { logData } = useContext(AppContext);
// Helper to format ISO timestamp to dd-MMM-yyyy HH:mm:ss
function formatTimestamp(isoString) {
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, '0');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}

function ApiDataTable() {
  if (!logData || logData.length === 0) {
    return <p>No data available.</p>;
  }

  return (
    <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', width: '100%' }}>
      <thead style={{ backgroundColor: '#f0f0f0' }}>
        <tr>
          <th>Strike</th>
          <th>Side</th>
          <th>First LTP</th>
          <th>Last LTP</th>
          <th>Difference</th>
          <th>Threshold</th>
          <th>Min Change</th>
          <th>Stoploss</th>
          <th>Gap</th>
          <th>Call OI Change</th>
          <th>Call Vol Ratio</th>
          <th>Call IV Change</th>
          <th>Token</th>
          <th>Timestamp</th>
        </tr>
      </thead>
      <tbody>
        {logData.map((item) => (
          <tr key={item._id}>
            <td>{item.strike}</td>
            <td>{item.side}</td>
            <td>{item.firstLTP.toFixed(2)}</td>
            <td>{item.lastLTP.toFixed(2)}</td>
            <td>{item.difference.toFixed(2)}</td>
            <td>{item.level.threshold}</td>
            <td>{item.level.minChange}</td>
            <td>{item.level.stoploss}</td>
            <td>{item.level.gap}</td>
            <td>{item.callOIChange.toFixed(4)}</td>
            <td>{item.callVolRatio.toExponential(2)}</td>
            <td>{item.callIVChange.toFixed(4)}</td>
            <td>{item.token}</td>
            <td>{formatTimestamp(item.timestamp)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ApiDataTable;
