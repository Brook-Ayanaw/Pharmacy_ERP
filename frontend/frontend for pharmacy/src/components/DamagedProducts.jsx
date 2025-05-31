import { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import styles from "./DamagedProducts.module.css";

function DamagedProducts() {
  const [stores, setStores] = useState([]);
  const [appointedStoreIds, setAppointedStoreIds] = useState([]);
  const [selectedStore, setSelectedStore] = useState("");
  const [startDate, setStartDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [reports, setReports] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const decoded = jwtDecode(token);
    const appointed = decoded.appointedStore || [];
    setAppointedStoreIds(appointed);

    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const res = await axios.get("https://pharmacy-erp.onrender.com/store/all");
      setStores(res.data);
    } catch (err) {
      console.error("Error fetching stores:", err);
    }
  };

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("token");

      const payload = {
        startDate,
        endDate,
      };

      if (selectedStore) {
        payload.storeId = selectedStore;
      }

      const res = await axios.post(
        "https://pharmacy-erp.onrender.com/product/listDamagedByStoreAndDate",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setReports(res.data);
      setMessage("");
    } catch (err) {
      console.error("Error fetching damaged reports:", err);
      setMessage("Failed to fetch reports.");
    }
  };

  useEffect(() => {
    fetchReports();
  }, [startDate, endDate, selectedStore]);

  const filteredStores = stores.filter((store) =>
    appointedStoreIds.includes(store._id)
  );

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>🛠️ Damaged Products Report</h2>

      <div className={styles.filterGroup}>
        <div className={styles.formGroup}>
          <label>Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label>End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Store:</label>
          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
          >
            <option value="">-- All Stores --</option>
            {filteredStores.map((store) => (
              <option key={store._id} value={store._id}>
                {store.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {message && <p className={styles.message}>{message}</p>}

      {reports.length > 0 ? (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th>Reason</th>
              <th>Store</th>
              <th>Reported By</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r._id}>
                <td>{r.product?.name || "N/A"}</td>
                <td>{r.quantity}</td>
                <td>{r.reason}</td>
                <td>{r.fromStore?.name || "N/A"}</td>
                <td>{r.reportedBy?.name || "N/A"}</td>
                <td>{new Date(r.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className={styles.message}>No damaged products found for this selection.</p>
      )}
    </div>
  );
}

export default DamagedProducts;
