import React, { useEffect, useState } from "react";
import axios from "axios";

function Dashboard() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get("http://localhost:8070/quiz/dashboard");
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Quiz Dashboard</h2>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Email</th>
            <th>Total Attempts</th>
            <th>Highest Score (%)</th>
            <th>Certificate</th>
          </tr>
        </thead>

        <tbody>
          {data.map((user, index) => (
            <tr key={index}>
              <td>{user._id}</td>
              <td>{user.totalAttempts}</td>
              <td>{user.highestScore.toFixed(2)}</td>
              <td>
                {user.highestScore >= 60 ? "Eligible ✅" : "Not Eligible ❌"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;