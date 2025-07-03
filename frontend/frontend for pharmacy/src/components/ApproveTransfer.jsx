import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import styles from "./ApproveTransfer.module.css";

function ApproveTransfer() {
  const [transferHistories, setTransferHistories] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchAllTransferHistories();
  }, []);

  const fetchAllTransferHistories = async () => {
    try {
      const query = [];
      if (startDate) query.push(`startDate=${startDate}`);
      if (endDate) query.push(`endDate=${endDate}`);
      const queryString = query.length ? `?${query.join("&")}` : "";

      const res = await axios.get(`http://localhost:3000/product/transfers${queryString}`);
      setTransferHistories(res.data.message || []);
    } catch (error) {
      console.error("Error fetching transfer history:", error);
      alert("Error: " + (error.response?.data?.message || error.message));
    }
  };

  const handleApprove = async (transfer) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("No token found. Please log in again.");

      const decoded = jwtDecode(token);
      const userId = decoded?.id;
      if (!userId) return alert("Invalid token. Please login again.");

      await axios.put(
        `http://localhost:3000/product/approveTransfer/${transfer._id}`,
        { status: "approved", userId }
      );

      alert("Transfer approved successfully");
      fetchAllTransferHistories(); // Refresh list
    } catch (error) {
      console.error("Error approving transfer:", error);
      alert("Approval failed: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Approve Transfer Requests</h1>

      <div className={styles.filters}>
        <label>
          Start Date:
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </label>
        <label>
          End Date:
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </label>
        <button onClick={fetchAllTransferHistories} className={styles.button}>
          Filter
        </button>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Product</th>
            <th>Sender Store</th>
            <th>Receiver Store</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Batch</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {transferHistories.map((t, index) => (
            <tr key={t._id || index}>
              <td>{t.product?.name || "N/A"}</td>
              <td>{t.senderStore?.name || "N/A"}</td>
              <td>{t.receiverStore?.name || "N/A"}</td>
              <td>{t.quantity}</td>
              <td>{t.price} Birr</td>
              <td>{t.batch}</td>
              <td>
                {t.status === "approved" ? (
                  <span className={styles.statusApproved}>Approved</span>
                ) : (
                  <button className={styles.button} onClick={() => handleApprove(t)}>
                    Approve
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ApproveTransfer;
