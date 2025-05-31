import { useEffect, useState } from "react";
import styles from "./ManageSaleHistory.module.css";

function ManageSaleHistory() {
  const [sales, setSales] = useState([]);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const token = localStorage.getItem("token");

  const fetchSales = async () => {
    try {
      const saleRes = await fetch("http://localhost:3000/sale/all", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const salesData = await saleRes.json();
      if (Array.isArray(salesData)) setSales(salesData);
    } catch (err) {
      console.error(err);
      setMessage("❌ Error fetching sale records.");
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const handleDelete = async (saleId) => {
    const reason = prompt("Enter reason for deletion:");
    if (!reason) return;

    try {
      const res = await fetch(`http://localhost:3000/sale/deleteSale/${saleId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });

      const result = await res.json();

      if (res.ok) {
        setMessage("✅ Sale deleted successfully.");
        fetchSales();
      } else {
        setMessage(`❌ ${result.message}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Error deleting sale record.");
    }
  };

  const filteredSales = sales.filter((sale) => {
    const matchesSearch =
      sale.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customerName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate = selectedDate
      ? new Date(sale.createdAt).toLocaleDateString() === new Date(selectedDate).toLocaleDateString()
      : true;

    return matchesSearch && matchesDate;
  });

  return (
    <div className={styles.container}>
      <h2>Manage Sale History</h2>

      {message && <p className={styles.message}>{message}</p>}

      <input
        type="text"
        placeholder="Search active sales..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={styles.search}
      />

      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        className={styles.search}
      />

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Product</th>
            <th>Qty</th>
            <th>Customer</th>
            <th>Store</th>
            <th>Date</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {filteredSales.map((sale) => (
            <tr key={sale._id}>
              <td>{sale.product?.name}</td>
              <td>{sale.quantity}</td>
              <td>{sale.patientId || sale.customerName || '-'}</td>
              <td>{sale.fromStore?.name || '-'}</td>
              <td>{new Date(sale.createdAt).toLocaleDateString()}</td>
              <td>
                <button
                  onClick={() => handleDelete(sale._id)}
                  className={styles.deleteButton}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ManageSaleHistory;
