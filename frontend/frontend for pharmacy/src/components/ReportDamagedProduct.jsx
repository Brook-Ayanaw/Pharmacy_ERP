import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import Select from "react-select";
import styles from "./ReportDamagedProduct.module.css";

function ReportDamagedProduct() {
  const [products, setProducts] = useState([]);
  const [appointedStores, setAppointedStores] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      setAppointedStores(decoded.appointedStore || []);
    } catch (err) {
      console.error("Error decoding token:", err);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [appointedStores]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("https://pharmacy-erp.onrender.com/product/allProduct");
      const filtered = res.data.filter((p) => appointedStores.includes(p.store?._id));
      setProducts(filtered);
    } catch (err) {
      console.error("Error loading products:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!selectedProduct || !quantity || !reason) {
      return setMessage("❌ All fields are required");
    }

    try {
      const res = await axios.post(
        "https://pharmacy-erp.onrender.com/product/addDamaged",
        { productId: selectedProduct.value, quantity, reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage("✅ Damaged report submitted successfully");
      setSelectedProduct(null);
      setQuantity("");
      setReason("");
    } catch (err) {
      console.error("Error submitting report:", err);
      setMessage("❌ Submission failed: " + (err.response?.data?.message || err.message));
    }
  };

  const productOptions = products.map((p) => ({
    value: p._id,
    label: `${p.name} (Store: ${p.store?.name}) | Qty: ${p.quantity}`,
  }));

  return (
    <div className={styles.container}>
      <h2>Report Damaged Product</h2>

      {message && <p className={styles.message}>{message}</p>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <label>Product:</label>
        <Select
          options={productOptions}
          value={selectedProduct}
          onChange={setSelectedProduct}
          isSearchable
          placeholder="Search and select a product"
        />

        <label>Quantity:</label>
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />

        <label>Reason:</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
        ></textarea>

        <button type="submit">Submit Report</button>
      </form>
    </div>
  );
}

export default ReportDamagedProduct;
