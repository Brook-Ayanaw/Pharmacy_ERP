import { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";
import styles from "./EditCreditCustomer.module.css";

function EditCreditCustomer() {
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    balance: 0,
    isValid: true,
  });
  const [message, setMessage] = useState("");

  // Fetch customer list for the dropdown
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:3000/creditCustomer/all", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const formatted = res.data.map((c) => ({
          value: c._id,
          label: `${c.name} (${c.phoneNumber})`,
        }));
        setOptions(formatted);
      } catch (err) {
        setMessage("❌ " + (err.response?.data?.message || "Failed to fetch list."));
      }
    };

    fetchAll();
  }, []);

  // Fetch selected customer's data
  useEffect(() => {
    const fetchCustomer = async () => {
      if (!selectedOption) return;
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:3000/creditCustomer/${selectedOption.value}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setFormData(res.data);
        setMessage("");
      } catch (err) {
        setMessage("❌ Failed to load customer data.");
      }
    };

    fetchCustomer();
  }, [selectedOption]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOption) return;

    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:3000/creditCustomer/edit/${selectedOption.value}`,
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
      setMessage("✅ Credit customer updated successfully.");
    } catch (err) {
      setMessage("❌ " + (err.response?.data?.message || "Update failed."));
    }
  };

  return (
    <div className={styles.container}>
      <h2>Edit Credit Customer</h2>
      {message && <p className={styles.message}>{message}</p>}

      <label>Select a customer to edit:</label>
      <Select
        options={options}
        onChange={setSelectedOption}
        placeholder="Search by name or phone..."
        isClearable
      />

      {selectedOption && (
        <form onSubmit={handleSubmit} className={styles.form}>
          <label>Name:</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label>Email:</label>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label>Phone Number:</label>
          <input
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
          />

          <label>Balance:</label>
          <input
            name="balance"
            type="number"
            min="0"
            step="0.01"
            value={formData.balance}
            onChange={handleChange}
          />

          <div className={styles.checkboxContainer}>
            <input
              type="checkbox"
              name="isValid"
              checked={formData.isValid}
              onChange={handleChange}
            />
            <label htmlFor="isValid">Is Valid</label>
          </div>

          <button type="submit">Update</button>
        </form>
      )}
    </div>
  );
}

export default EditCreditCustomer;
