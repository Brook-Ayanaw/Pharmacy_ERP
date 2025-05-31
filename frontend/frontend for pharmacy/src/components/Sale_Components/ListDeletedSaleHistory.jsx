import { useEffect, useState } from "react";
import styles from "./ListDeletedSaleHistory.module.css";

function ListDeletedSaleHistory() {
  const [deletedSales, setDeletedSales] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchDeletedSales = async () => {
    try {
      const res = await fetch("http://localhost:3000/sale/listDeleted");
      const data = await res.json();

      if (Array.isArray(data)) setDeletedSales(data);
    } catch (err) {
      console.error("Error fetching deleted sales:", err);
    }
  };

  useEffect(() => {
    fetchDeletedSales();
  }, []);

  const filteredSales = deletedSales.filter((sale) =>
    sale.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <h2>Deleted Sale History</h2>

      <input
        type="text"
        className={styles.search}
        placeholder="Search by product or reason..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {filteredSales.length === 0 ? (
        <p>No deleted sales found.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Reason</th>
              <th>Deleted By</th>
              <th>Date</th>
              <th>Store</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.map((sale) => (
              <tr key={sale._id}>
                <td>{sale.product?.name || "-"}</td>
                <td>{sale.quantity}</td>
                <td>{sale.reason}</td>
                <td>{sale.deletedBy?.name || "-"}</td>
                <td>{new Date(sale.originalSaleDate).toLocaleDateString()}</td>
                <td>{sale.fromStore?.name || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ListDeletedSaleHistory;