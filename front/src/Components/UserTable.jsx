import React, { useEffect, useState } from 'react';

function DateTimeLogTable() {
  const [logData, setLogData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/datetimelog')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then((data) => {
        setLogData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p>Loading datetime log...</p>;
  }

  if (error) {
    return <p>Error loading datetime log: {error}</p>;
  }

  return (
    <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th>Index</th>
          <th>Datetime</th>
        </tr>
      </thead>
      <tbody>
        {logData.length === 0 ? (
          <tr>
            <td colSpan="2">No datetime log found</td>
          </tr>
        ) : (
          logData.map(({ datetime }, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{datetime}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

export default DateTimeLogTable;
