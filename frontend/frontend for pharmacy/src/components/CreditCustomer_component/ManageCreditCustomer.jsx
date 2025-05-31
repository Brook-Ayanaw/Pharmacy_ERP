import { useEffect, useState } from "react";
import styles from "./ManageCreditCustomer.module.css";

function ManageCreditCustomer() {
  const [customers, setCustomers] = useState([]);
  const [message, setMessage] = useState("");
  const [refillAmounts, setRefillAmounts] = useState({});

  const token = localStorage.getItem("token");

  const fetchCustomers = async () => {
    try {
      const res = await fetch("http://localhost:3000/creditCustomer/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) setCustomers(data);
      else setMessage("❌ Failed to load customers");
    } catch (err) {
      console.error(err);
      setMessage("❌ Error fetching credit customers");
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleToggleStatus = async (id) => {
    try {
      const res = await fetch(`http://localhost:3000/creditCustomer/blockUnblock/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMessage(data.message);
      fetchCustomers();
    } catch (err) {
      console.error(err);
      setMessage("❌ Error toggling customer status");
    }
  };

  const handleRefill = async (id) => {
    const amount = refillAmounts[id];
    if (!amount || isNaN(amount)) {
      setMessage("❌ Enter a valid refill amount");
      return;
    }
    try {
      const res = await fetch(`http://localhost:3000/creditCustomer/refill/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: parseFloat(amount) }),
      });
      const data = await res.json();
      setMessage(data.message);
      setRefillAmounts((prev) => ({ ...prev, [id]: "" }));
      fetchCustomers();
    } catch (err) {
      console.error(err);
      setMessage("❌ Error refilling balance");
    }
  };

  return (
    <div className={styles.container}>
      <h2>Manage Credit Customers</h2>
      {message && <p className={styles.message}>{message}</p>}

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Balance</th>
            <th>Status</th>
            <th>Refill</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((cust) => (
            <tr key={cust._id}>
              <td>{cust.name}</td>
              <td>{cust.email}</td>
              <td>{cust.phoneNumber}</td>
              <td>{cust.balance}</td>
              <td>{cust.isValid ? "Active" : "Blocked"}</td>
              <td>
                <input
                  type="number"
                  value={refillAmounts[cust._id] || ""}
                  onChange={(e) =>
                    setRefillAmounts((prev) => ({ ...prev, [cust._id]: e.target.value }))
                  }
                  placeholder="Amount"
                />
                <button onClick={() => handleRefill(cust._id)} className={styles.refillBtn}>
                  Refill
                </button>
              </td>
              <td>
                <button onClick={() => handleToggleStatus(cust._id)} className={styles.toggleBtn}>
                  {cust.isValid ? "Ban" : "Unban"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ManageCreditCustomer;
