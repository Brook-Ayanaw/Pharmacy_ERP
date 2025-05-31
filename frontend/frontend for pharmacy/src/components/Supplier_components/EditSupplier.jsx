import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./EditSupplier.module.css";

function EditSupplier() {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_numbers: [""],
    account_numbers: [""]
  });
  const [message, setMessage] = useState("");
  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get("http://localhost:3000/supplier/all");
      setSuppliers(res.data);
    } catch (err) {
      console.error(err);
      setMessage("Failed to load suppliers.");
    }
  };

  const handleSelect = (supplier) => {
    setSelectedSupplier(supplier._id);
    setFormData({
      name: supplier.name || "",
      email: supplier.email || "",
      phone_numbers: supplier.phone_numbers.length ? supplier.phone_numbers : [""],
      account_numbers: supplier.account_numbers.length ? supplier.account_numbers : [""]
    });
  };

  const handleChange = (e) => {
    setFormData((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleArrayChange = (key, index, value) => {
    const updated = [...formData[key]];
    updated[index] = value;
    setFormData((f) => ({ ...f, [key]: updated }));
  };

  const addField = (key) => {
    setFormData((f) => ({ ...f, [key]: [...f[key], ""] }));
  };

  const removeField = (key, index) => {
    const updated = formData[key].filter((_, i) => i !== index);
    setFormData((f) => ({ ...f, [key]: updated }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSupplier) return;

    try {
      await axios.put(`http://localhost:3000/supplier/edit/${selectedSupplier}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Supplier updated successfully.");
      setSelectedSupplier(null);
      fetchSuppliers();
    } catch (err) {
      console.error(err);
      setMessage("Update failed. " + err.response.data.message );
    }
  };

  return (
    <div className={styles.container}>
      <h2>Edit Supplier</h2>

      <input
        className={styles.searchInput}
        placeholder="Search supplier..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <ul className={styles.list}>
        {suppliers
          .filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
          .map((s) => (
            <li key={s._id} className={styles.item}>
              <span className={styles.name}>{s.name}</span>
              <button
                className={styles.editBtn}
                onClick={() => handleSelect(s)}
              >
                Edit
              </button>
            </li>
          ))}
      </ul>

      {selectedSupplier && (
        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Name"
            required
          />
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
          />

          <label>Phone Numbers:</label>
          {formData.phone_numbers.map((p, i) => (
            <div key={i} className={styles.arrayField}>
              <input
                value={p}
                onChange={(e) => handleArrayChange("phone_numbers", i, e.target.value)}
              />
              {formData.phone_numbers.length > 1 && (
                <button type="button" onClick={() => removeField("phone_numbers", i)}>✕</button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => addField("phone_numbers")}>+ Add Phone</button>

          <label>Account Numbers:</label>
          {formData.account_numbers.map((a, i) => (
            <div key={i} className={styles.arrayField}>
              <input
                value={a}
                onChange={(e) => handleArrayChange("account_numbers", i, e.target.value)}
              />
              {formData.account_numbers.length > 1 && (
                <button type="button" onClick={() => removeField("account_numbers", i)}>✕</button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => addField("account_numbers")}>+ Add Account</button>

          <div className={styles.buttonRow}>
            <button type="submit" className={styles.saveBtn}>Save</button>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => setSelectedSupplier(null)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
}

export default EditSupplier;
