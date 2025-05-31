import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./EditProduct.module.css";
import { jwtDecode } from "jwt-decode";

function EditProduct() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [stores, setStores] = useState([]);
  const [appointedStores, setAppointedStores] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const decoded = jwtDecode(token);
      const appointed = decoded.appointedStore || [];
      setAppointedStores(appointed);

      const [prodRes, suppRes, storeRes] = await Promise.all([
        axios.get("http://localhost:3000/product/allProduct"),
        axios.get("http://localhost:3000/supplier/all"),
        axios.get("http://localhost:3000/store/all"),
      ]);

      const filteredProducts = prodRes.data.filter(p =>
        p.store && appointed.includes(p.store._id)
      );

      const filteredStores = storeRes.data.filter(s =>
        appointed.includes(s._id)
      );

      setProducts(filteredProducts);
      setSuppliers(suppRes.data);
      setStores(filteredStores);
    } catch (err) {
      setMessage("Failed to load data.");
    }
  };

  const handleSelect = (product) => {
    setSelectedProduct(product._id);
    setFormData({
      name: product.name,
      category: product.category,
      buyingPrice: product.buyingPrice,
      sellingPrice: product.brand?.sellingPrice || "",
      quantity: product.quantity,
      supplier: product.supplier?._id || "",
      store: product.store?._id || "",
      expiry_date: product.expiry_date?.split("T")[0] || "",
      purchase_invoice: product.purchase_invoice || "",
      batch: product.batch || ""
    });
  };

  const handleChange = (e) => {
    setFormData((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return alert("Please log in");

    try {
      await axios.put(
        `http://localhost:3000/product/editProduct/${selectedProduct}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      alert("✅ Product updated!");
      navigate("/dashboard");
    } catch (err) {
      setMessage(err.response?.data?.message || "Update failed.");
    }
  };

  return (
    <div className={styles.container}>
      <h2>Edit Product</h2>

      <input
        className={styles.searchInput}
        placeholder="Search product..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <ul className={styles.list}>
        {products
          .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
          .map((p) => (
            <li key={p._id} className={styles.item}>
              <span className={styles.name}>
                {p.name} — {p.store?.name}
              </span>
              <button className={styles.editBtn} onClick={() => handleSelect(p)}>
                Edit
              </button>
            </li>
          ))}
      </ul>

      {selectedProduct && (
        <form className={styles.form} onSubmit={handleSubmit}>
          <label htmlFor="name">Name</label>
          <input name="name" value={formData.name} onChange={handleChange} required />

          <label htmlFor="category">Category</label>
          <input name="category" value={formData.category} onChange={handleChange} required />

          <label htmlFor="buyingPrice">Buying Price</label>
          <input type="number" name="buyingPrice" value={formData.buyingPrice} onChange={handleChange} required />

          <label htmlFor="sellingPrice">Selling Price</label>
          <input type="number" name="sellingPrice" value={formData.sellingPrice} onChange={handleChange} />

          <label htmlFor="quantity">Quantity</label>
          <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required />

          <label htmlFor="batch">Batch</label>
          <input name="batch" value={formData.batch} onChange={handleChange} />

          <label htmlFor="purchase_invoice">Invoice</label>
          <input name="purchase_invoice" value={formData.purchase_invoice} onChange={handleChange} />

          <label htmlFor="expiry_date">Expiry Date</label>
          <input type="date" name="expiry_date" value={formData.expiry_date} onChange={handleChange} />

          <label htmlFor="supplier">Supplier</label>
          <select name="supplier" value={formData.supplier} onChange={handleChange} required>
            <option value="">Select Supplier</option>
            {suppliers.map((s) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>

          <label htmlFor="store">Store</label>
          <select name="store" value={formData.store} onChange={handleChange} required>
            <option value="">Select Store</option>
            {stores.map((s) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>

          <div className={styles.buttonRow}>
            <button type="submit" className={styles.saveBtn}>Save</button>
            <button type="button" className={styles.cancelBtn} onClick={() => navigate("/dashboard")}>Cancel</button>
          </div>
        </form>
      )}

      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
}

export default EditProduct;
