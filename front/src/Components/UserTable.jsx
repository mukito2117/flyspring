import React, { useEffect, useState } from 'react';

function UserTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/users')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then((data) => {
        setUsers(data.users);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p>Loading users...</p>;
  }

  if (error) {
    return <p>Error loading users: {error}</p>;
  }

  return (
    <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Email</th>
        </tr>
      </thead>
      <tbody>
        {users.length === 0 ? (
          <tr>
            <td colSpan="3">No users found</td>
          </tr>
        ) : (
          users.map(({ id, name, email }) => (
            <tr key={id}>
              <td>{id}</td>
              <td>{name}</td>
              <td>{email}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

export default UserTable;
