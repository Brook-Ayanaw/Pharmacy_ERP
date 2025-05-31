import { useState } from "react";
import axios from "axios";
import styles from "./AddSupplier.module.css";

function AddSupplier() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumbers, setPhoneNumbers] = useState([""]);
  const [accountNumbers, setAccountNumbers] = useState([""]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      return alert("Supplier name is required.");
    }

    try {
      const payload = {
        name,
        email,
        phone_numbers: phoneNumbers.filter((p) => p.trim() !== ""),
        account_numbers: accountNumbers.filter((a) => a.trim() !== ""),
      };

      const res = await axios.post("http://localhost:3000/supplier/add", payload);
      alert("Supplier added successfully!");
      console.log(res.data);

      // Reset form
      setName("");
      setEmail("");
      setPhoneNumbers([""]);
      setAccountNumbers([""]);

    } catch (err) {
      console.error(err);
      alert("Failed to add supplier.");
    }
  };

  const handleArrayChange = (setter, index, value) => {
    setter((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const addField = (setter) => setter((prev) => [...prev, ""]);
  const removeField = (setter, index) => setter((prev) => prev.filter((_, i) => i !== index));

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Add New Supplier</h1>
      <form onSubmit={handleSubmit} className={styles.form}>

        <label>Name:</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required />

        <label>Email:</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />

        <label>Phone Numbers:</label>
        {phoneNumbers.map((num, idx) => (
          <div key={idx} className={styles.fieldGroup}>
            <input
              value={num}
              onChange={(e) => handleArrayChange(setPhoneNumbers, idx, e.target.value)}
            />
            {phoneNumbers.length > 1 && (
              <button type="button" onClick={() => removeField(setPhoneNumbers, idx)}>✕</button>
            )}
          </div>
        ))}
        <button type="button" onClick={() => addField(setPhoneNumbers)}>+ Add Phone</button>

        <label>Account Numbers:</label>
        {accountNumbers.map((acc, idx) => (
          <div key={idx} className={styles.fieldGroup}>
            <input
              value={acc}
              onChange={(e) => handleArrayChange(setAccountNumbers, idx, e.target.value)}
            />
            {accountNumbers.length > 1 && (
              <button type="button" onClick={() => removeField(setAccountNumbers, idx)}>✕</button>
            )}
          </div>
        ))}
        <button type="button" onClick={() => addField(setAccountNumbers)}>+ Add Account</button>

        <button type="submit" className={styles.submitButton}>Submit</button>
      </form>
    </div>
  );
}

export default AddSupplier;
