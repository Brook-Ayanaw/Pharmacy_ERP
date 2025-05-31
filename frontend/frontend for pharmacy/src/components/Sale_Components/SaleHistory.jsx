import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import styles from "./SaleHistory.module.css";

function SaleHistory() {
  const [sales, setSales] = useState([]);
  const [allStores, setAllStores] = useState([]);
  const [appointedStoreIds, setAppointedStoreIds] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      const appointed = decoded.appointedStore || [];
      setAppointedStoreIds(appointed);
    } catch (err) {
      console.error("JWT decode error:", err);
    }
  }, []);

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    if (appointedStoreIds.length > 0) {
      fetchSales();
    }
  }, [selectedDate, selectedStoreId, appointedStoreIds]);

  const fetchStores = async () => {
    try {
      const res = await fetch("https://pharmacy-erp.onrender.com/store/all");
      const data = await res.json();
      if (res.ok) setAllStores(data);
    } catch (err) {
      console.error("Error fetching stores:", err);
    }
  };

  const fetchSales = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      const url = selectedStoreId
        ? "https://pharmacy-erp.onrender.com/sale/sellHistoryByDate"
        : "https://pharmacy-erp.onrender.com/sale/sellHistoryByStores";

      const payload = selectedStoreId
        ? { date: selectedDate, storeId: selectedStoreId }
        : { date: selectedDate, storeIds: appointedStoreIds };

      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setSales(data);
        const total = data.reduce((sum, sale) => sum + (sale.totalPrice || 0), 0);
        setTotalRevenue(total);
        setMessage("");
      } else {
        setSales([]);
        setTotalRevenue(0);
        setMessage(data.message || "No sales found.");
      }
    } catch (err) {
      console.error("Error fetching sales:", err);
      setMessage("Server error while loading sales.");
    }
  };

  const filteredStores = allStores.filter((store) =>
    appointedStoreIds.includes(store._id)
  );

  return (
    <div className={styles.container}>
      <h2>📊 Sale History</h2>

      <div className={styles.filterGroup}>
        <div className={styles.formGroup}>
          <label>Select Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Select Store:</label>
          <select
            value={selectedStoreId}
            onChange={(e) => setSelectedStoreId(e.target.value)}
          >
            <option value="">-- All My Stores --</option>
            {filteredStores.map((store) => (
              <option key={store._id} value={store._id}>
                {store.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {message && <p className={styles.message}>{message}</p>}

      {sales.length > 0 && (
        <>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Customer</th>
                <th>Qty</th>
                <th>Total</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale._id}>
                  <td>{sale.product?.name || "N/A"}</td>
                  <td>{sale.customerName || sale.patientId || "N/A"}</td>
                  <td>{sale.quantity}</td>
                  <td>{sale.totalPrice?.toFixed(2)} Br</td>
                  <td>{new Date(sale.createdAt).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className={styles.total}>
            🧾 Total Revenue: <strong>{totalRevenue.toFixed(2)} Br</strong>
          </p>
        </>
      )}
    </div>
  );
}

export default SaleHistory;
