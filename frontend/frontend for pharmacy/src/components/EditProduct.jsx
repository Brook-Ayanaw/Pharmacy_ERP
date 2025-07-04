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
        axios.get("https://pharmacy-erp.onrender.com/product/allProduct"),
        axios.get("https://pharmacy-erp.onrender.com/supplier/all"),
        axios.get("https://pharmacy-erp.onrender.com/store/all"),
      ]);

      const filteredProducts = prodRes.data.filter((p) =>
        p.store && appointed.includes(p.store._id)
      );

      const filteredStores = storeRes.data.filter((s) =>
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
      name: product.name || "",
      category: product.category || "",
      buyingPrice: product.buyingPrice || 0,
      sellingPrice: product.brand?.sellingPrice || 0,
      quantity: product.quantity || 0,
      purchaseQuantity: product.purchaseQuantity || 0,
      supplier: product.supplier?._id || "",
      store: product.store?._id || "",
      expiry_date: product.expiry_date?.split("T")[0] || "",
      purchase_invoice: product.purchase_invoice || "",
      batch: product.batch || "",
      brand: product.brand?._id || "",
    });
    setMessage("");
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return alert("Please log in");

    try {
      await axios.put(
        `https://pharmacy-erp.onrender.com/product/editProduct/${selectedProduct}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("✅ Product updated!");
      setSelectedProduct(null); // Collapse dialog box
    } catch (err) {
      setMessage(err.response?.data?.message || "Update failed.");
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Edit Product</h2>

      <input
        className={styles.searchInput}
        placeholder="Search product..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
<ul className={styles.list}>
  {products
    .filter((p) =>
      `${p.name} ${p.batch}`.toLowerCase().includes(search.toLowerCase())
    )
    .map((p) => (
      <li key={p._id} className={styles.item}>
        <div className={styles.nameBlock}>
          <div className={styles.productTitle}>
            <strong>{p.name}</strong>{" "}
            <span className={styles.batch}>Batch: <em>{p.batch}</em></span>
          </div>
          <div className={styles.storeName}>{p.store?.name}</div>
        </div>

        <div className={styles.buttonWrapper}>
          <button
            className={styles.editBtn}
            onClick={() => handleSelect(p)}
          >
            ✏️ Edit
          </button>
        </div>
      </li>
    ))}
</ul>



      {selectedProduct && (
        <form className={styles.form} onSubmit={handleSubmit}>
          <h3 className={styles.formTitle}>Editing: {formData.name}</h3>

          <label>Name</label>
          <input name="name" value={formData.name} onChange={handleChange} required />

          <label>Category</label>
          <input name="category" value={formData.category} onChange={handleChange} required />

          <label>Buying Price</label>
          <input type="number" name="buyingPrice" value={formData.buyingPrice} onChange={handleChange} required />

          <label>Selling Price</label>
          <input type="number" name="sellingPrice" value={formData.sellingPrice} onChange={handleChange} />

          <label>Quantity</label>
          <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required />

          <label>Purchase Quantity</label>
          <input type="number" name="purchaseQuantity" value={formData.purchaseQuantity} onChange={handleChange} required />

          <label>Batch</label>
          <input name="batch" value={formData.batch} onChange={handleChange} />

          <label>Invoice</label>
          <input name="purchase_invoice" value={formData.purchase_invoice} onChange={handleChange} />

          <label>Expiry Date</label>
          <input type="date" name="expiry_date" value={formData.expiry_date} onChange={handleChange} />

          <label>Supplier</label>
          <select name="supplier" value={formData.supplier} onChange={handleChange} required>
            <option value="">Select Supplier</option>
            {suppliers.map((s) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>

          <label>Store</label>
          <select name="store" value={formData.store} onChange={handleChange} required>
            <option value="">Select Store</option>
            {stores.map((s) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>

          <div className={styles.buttonRow}>
            <button type="submit" className={styles.saveBtn}>💾 Save</button>
            <button type="button" className={styles.cancelBtn} onClick={() => setSelectedProduct(null)}>❌ Cancel</button>
          </div>
        </form>
      )}

      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
}

export default EditProduct;
