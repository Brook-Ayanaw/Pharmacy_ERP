import { useEffect, useState } from "react";
import styles from "./AddCreditCustomer.module.css";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

function AddCreditCustomer() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    balance: 0,
    isValid: true,
  });

  const [message, setMessage] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      const roles = decoded.roleByName || [];
      setIsAdmin(roles.includes("admin"));
    } catch (err) {
      console.error("JWT decode error:", err);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const { name, email, phoneNumber } = formData;
    if (!name || !email || !phoneNumber) {
      return setMessage("❌ All fields are required.");
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:3000/creditCustomer/add",
        {
          ...formData,
          balance: parseFloat(formData.balance),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("✅ Credit customer added successfully.");
      setFormData({
        name: "",
        email: "",
        phoneNumber: "",
        balance: 0,
        isValid: true,
      });
    } catch (err) {
      console.error("Error adding credit customer:", err);
      setMessage("❌ Error: " + (err.response?.data?.message || err.message));
    }
  };

  if (!isAdmin) {
    return <p className={styles.error}>❌ Access denied. Admins only.</p>;
  }

  return (
    <div className={styles.container}>
      <h2>Add Credit Customer</h2>
      {message && <p className={styles.message}>{message}</p>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div>
          <label htmlFor="name">Name:</label>
          <input
            name="name"
            id="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="email">Email:</label>
          <input
            name="email"
            id="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="phoneNumber">Phone Number:</label>
          <input
            name="phoneNumber"
            id="phoneNumber"
            type="text"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="balance">Balance:</label>
          <input
            name="balance"
            id="balance"
            type="number"
            min="0"
            step="0.01"
            value={formData.balance}
            onChange={handleChange}
          />
        </div>

        <div className={styles.checkboxContainer}>
          <input
            type="checkbox"
            name="isValid"
            id="isValid"
            checked={formData.isValid}
            onChange={handleChange}
          />
          <label htmlFor="isValid">Is Valid</label>
        </div>

        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default AddCreditCustomer;
