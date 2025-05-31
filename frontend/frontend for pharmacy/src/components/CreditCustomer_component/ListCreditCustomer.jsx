import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./ListCreditCustomer.module.css";

function ListCreditCustomer() {
  const [customers, setCustomers] = useState([]);
  const [message, setMessage] = useState("");
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("https://pharmacy-erp.onrender.com/creditCustomer/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCustomers(res.data);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to fetch customers.");
    }
  };

  const toggleBlockStatus = async (id) => {
    try {
      setLoadingId(id);
      const token = localStorage.getItem("token");
      const res = await axios.patch(
        `https://pharmacy-erp.onrender.com/creditCustomer/blockUnblock/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage(res.data.message);
      fetchCustomers();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to toggle status.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Credit Customers</h1>

      {message && <p className={styles.message}>{message}</p>}

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Balance</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c._id}>
                <td>{c.name}</td>
                <td>{c.email}</td>
                <td>{c.phoneNumber}</td>
                <td>{c.balance} Br</td>
                <td>
                  <span
                    className={`${styles.status} ${
                      c.isValid ? styles.active : styles.blocked
                    }`}
                  >
                    {c.isValid ? "Active" : "Blocked"}
                  </span>
                </td>
                <td>
                  <button
                    className={styles.button}
                    onClick={() => toggleBlockStatus(c._id)}
                    disabled={loadingId === c._id}
                  >
                    {loadingId === c._id
                      ? "Processing..."
                      : c.isValid
                      ? "Block"
                      : "Unblock"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ListCreditCustomer;
