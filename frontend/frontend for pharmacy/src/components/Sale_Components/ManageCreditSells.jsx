import { useEffect, useState } from "react";
import styles from "./ManageCreditSells.module.css";
import { jwtDecode } from "jwt-decode";

function ManageCreditSells() {
  const [creditSales, setCreditSales] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("token");

  const fetchSales = async () => {
    try {
      const creditRes = await fetch("https://pharmacy-erp.onrender.com/creditSell/credit/all", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const creditData = await creditRes.json();
      if (Array.isArray(creditData)) setCreditSales(creditData);
    } catch (err) {
      console.error(err);
      setMessage("❌ Error fetching sales.");
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const handleDelete = async (saleId) => {
    if (!saleId || !reason) {
      setMessage("❌ Please provide a reason before deleting.");
      return;
    }

    try {
      const res = await fetch(`https://pharmacy-erp.onrender.com/creditSell/deleteCreditSale/${saleId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });

      const result = await res.json();

      if (res.ok) {
        setMessage("✅ Credit sale deleted successfully.");
        setReason("");
        fetchSales();
      } else {
        setMessage(`❌ ${result.message}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Error deleting credit sale.");
    }
  };

  const filteredSales = creditSales.filter((sale) => {
    const name = sale.product?.name?.toLowerCase() || "";
    const customer = sale.creditCustomer?.name?.toLowerCase() || sale.customerName?.toLowerCase() || "";
    const matchDate = dateFilter ? new Date(sale.createdAt).toISOString().slice(0, 10) === dateFilter : true;
    return (name.includes(searchQuery.toLowerCase()) || customer.includes(searchQuery.toLowerCase())) && matchDate;
  });

  return (
    <div className={styles.container}>
      <h2>Manage Credit Sales</h2>

      {message && <p className={styles.message}>{message}</p>}

      <div className={styles.formGroup}>
        <label>Search:</label>
        <input
          type="text"
          placeholder="Search by product or customer"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Filter by Date:</label>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Reason for Deletion:</label>
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter reason..."
        />
      </div>

      <h3>Active Credit Sales</h3>
      {filteredSales.length === 0 ? (
        <p>No active credit sales found.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th>Customer</th>
              <th>Store</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.map((sale) => (
              <tr key={sale._id}>
                <td>{sale.product?.name}</td>
                <td>{sale.quantity}</td>
                <td>{sale.creditCustomer?.name || sale.customerName}</td>
                <td>{sale.fromStore?.name}</td>
                <td>
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDelete(sale._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ManageCreditSells;
