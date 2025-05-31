import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./AddProduct.module.css";
import { jwtDecode } from "jwt-decode";

const validSellingUnits = ["Pcs", "Vials", "Amp", "Tab", "Pk", "Boxes", "Str"];

const AddProduct = () => {
  const [formData, setFormData] = useState({
    name: "", category: "", buyingPrice: "", sellingPrice: "",
    quantity: "", supplier: "", store: "", expiry_date: "",
    purchase_invoice: "", minStock: "", batch: "", sellingUnit: ""
  });
  const [suppliers, setSuppliers] = useState([]);
  const [stores, setStores] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
  
    try {
      const decoded = jwtDecode(token);
      const appointedStoreIds = decoded.appointedStore || [];
  
      axios.get("http://localhost:3000/store/all").then(res => {
        const filteredStores = res.data.filter(store =>
          appointedStoreIds.includes(store._id)
        );
        setStores(filteredStores);
      });
    } catch (err) {
      console.error("JWT decode failed or fetch error:", err);
    }
  
    axios.get("http://localhost:3000/supplier/all").then(res => setSuppliers(res.data));
  }, []);
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:3000/product/addNewBrandProduct", formData);
      alert("Product added successfully!");
    } catch (err) {
      alert("Error adding product: " + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <h2>Add New Brand Product</h2>
      <input name="name" placeholder="Name" onChange={handleChange} required className={styles.inputField} />
      <input name="category" placeholder="Category" onChange={handleChange} required className={styles.inputField} />
      <input name="buyingPrice" type="number" placeholder="Buying Price" onChange={handleChange} required className={styles.inputField} />
      <input name="sellingPrice" type="number" placeholder="Selling Price" onChange={handleChange} className={styles.inputField} />
      <input name="quantity" type="number" placeholder="Quantity" onChange={handleChange} required className={styles.inputField} />
      <input name="purchase_invoice" placeholder="Purchase Invoice" onChange={handleChange} className={styles.inputField} />
      <input name="minStock" type="number" placeholder="Min Stock" onChange={handleChange} required className={styles.inputField} />
      <input name="batch" placeholder="Batch" onChange={handleChange} required className={styles.inputField} />
      <input name="expiry_date" type="date" onChange={handleChange} required className={styles.inputField} />

      <select name="supplier" onChange={handleChange} required className={styles.selectField}>
        <option value="">Select Supplier</option>
        {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
      </select>

      <select name="store" onChange={handleChange} required className={styles.selectField}>
        <option value="">Select Store</option>
        {stores.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
      </select>

      <select name="sellingUnit" onChange={handleChange} required className={styles.selectField}>
        <option value="">Select Unit</option>
        {validSellingUnits.map(u => <option key={u} value={u}>{u}</option>)}
      </select>

      <button type="submit" className={styles.button}>Add</button>
    </form>
  );
};

export default AddProduct;
