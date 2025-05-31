import { useEffect, useState } from "react";
import styles from "./CreditSaleHistory.module.css";

function CreditSaleHistory() {
  const [creditSales, setCreditSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("https://pharmacy-erp.onrender.com/creditSell/credit/all", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Failed to fetch sales.");
        }

        const data = await res.json();
        setCreditSales(data);
      } catch (err) {
        console.error("Error fetching credit sales:", err);
        setMessage("❌ Failed to load credit sales history.");
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, []);

  return (
    <div className={styles.container}>
      <h2>Credit Sale History</h2>
      {loading && <p>Loading...</p>}
      {message && <p className={styles.message}>{message}</p>}
      {!loading && creditSales.length === 0 && <p>No credit sales found.</p>}

      {creditSales.length > 0 && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Total Price</th>
              <th>Customer</th>
              <th>Store</th>
              <th>Sold By</th>
            </tr>
          </thead>
          <tbody>
            {creditSales.map((sale) => (
              <tr key={sale._id}>
                <td>{new Date(sale.createdAt).toLocaleDateString()}</td>
                <td>{sale.product?.name}</td>
                <td>{sale.quantity}</td>
                <td>{sale.totalPrice} Br</td>
                <td>{sale.creditCustomer?.name}</td>
                <td>{sale.fromStore?.name}</td>
                <td>{sale.user?.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default CreditSaleHistory;
