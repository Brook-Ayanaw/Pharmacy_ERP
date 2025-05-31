import { useEffect, useState } from "react";
import Select from "react-select";
import { jwtDecode } from "jwt-decode";
import styles from "./Sale.module.css";

function Sale() {
  const [allStores, setAllStores] = useState([]);
  const [appointedStoreIds, setAppointedStoreIds] = useState([]);
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [formData, setFormData] = useState({
    productId: "",
    quantity: 1,
    patientId: "",
    customerName: "",
  });
  const [message, setMessage] = useState("");
  const [isPharmacist, setIsPharmacist] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      const roles = decoded.roleByName || [];
      setIsPharmacist(roles.includes("pharmacist"));
      setAppointedStoreIds(decoded.appointedStore || []);
    } catch (err) {
      console.error("JWT decode error:", err);
    }
  }, []);

  useEffect(() => {
    if (!isPharmacist) return;

    fetch("http://localhost:3000/store/all")
      .then(res => res.json())
      .then(data => setAllStores(data))
      .catch(err => {
        console.error("Error fetching stores:", err);
        setMessage("Error loading stores.");
      });
  }, [isPharmacist]);

  const filteredStores = allStores.filter(store =>
    appointedStoreIds.includes(store._id)
  );

  const handleStoreChange = async (storeId) => {
    setSelectedStoreId(storeId);
    setSelectedBrand(null);
    setProducts([]);
    setFormData(prev => ({ ...prev, productId: "" }));

    try {
      const res = await fetch("http://localhost:3000/product/allBrand");
      const data = await res.json();
      const filtered = data.filter(b => b.store?._id === storeId);
      setBrands(filtered);
    } catch (err) {
      console.error("Error fetching brands:", err);
      setMessage("Failed to load brands.");
    }
  };

  const handleBrandChange = async (option) => {
    setSelectedBrand(option);
    setFormData(prev => ({ ...prev, productId: "" }));
    setProducts([]);

    if (!option) return;

    try {
      const res = await fetch(
        `http://localhost:3000/product/byStoreAndBrand?storeId=${selectedStoreId}&brandId=${option.value}`
      );
      const data = await res.json();

      if (Array.isArray(data) && data.length > 0) {
        setProducts(data);
      } else {
        setMessage("❌ No products found for this brand in this store.");
      }
    } catch (err) {
      console.error("Error loading products:", err);
      setMessage("❌ Error loading products.");
    }
  };

  const handleChange = (e, field) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!formData.patientId && !formData.customerName) {
      setMessage("❌ Please provide either a Patient ID or Customer Name.");
      return;
    }

    if (!formData.productId || !formData.quantity) {
      setMessage("❌ Please select a product and enter quantity.");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/sale/sell", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (res.ok) {
        setMessage("✅ Sale recorded successfully.");
        setFormData({ productId: "", quantity: 1, patientId: "", customerName: "" });
      } else {
        setMessage(`❌ Sale failed: ${result.message || "Invalid data"}`);
      }
    } catch (err) {
      console.error("Submit error:", err);
      setMessage("❌ Server error. Please try again.");
    }
  };

  if (!isPharmacist) {
    return <p className={styles.message}>❌ Access denied. Pharmacist only.</p>;
  }

  const brandOptions = brands.map(brand => ({
    value: brand._id,
    label: brand.name,
  }));

  return (
    <div className={styles.container}>
      <h2>Sale Entry</h2>

      <div className={styles.formGroup}>
        <label>Store:</label>
        <select value={selectedStoreId} onChange={(e) => handleStoreChange(e.target.value)}>
          <option value="">-- Select Store --</option>
          {filteredStores.map(store => (
            <option key={store._id} value={store._id}>{store.name}</option>
          ))}
        </select>
      </div>

      {selectedStoreId && (
        <div className={styles.formGroup}>
          <label>Brand:</label>
          <Select
            value={selectedBrand}
            onChange={handleBrandChange}
            options={brandOptions}
            placeholder="Choose a brand"
            isClearable
          />
        </div>
      )}

      {selectedBrand && (
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Product:</label>
            <select
              value={formData.productId}
              onChange={(e) => handleChange(e, "productId")}
              required
            >
              <option value="">-- Select Product --</option>
              {products.map(product => (
                <option key={product._id} value={product._id}>
                  {product.name} | Qty: {product.quantity} | Exp: {new Date(product.expiry_date).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Quantity:</label>
            <input
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => handleChange(e, "quantity")}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Patient ID (optional):</label>
            <input
              type="text"
              value={formData.patientId}
              onChange={(e) => handleChange(e, "patientId")}
              placeholder="Enter Patient ID or leave blank"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Customer Name (optional):</label>
            <input
              type="text"
              value={formData.customerName}
              onChange={(e) => handleChange(e, "customerName")}
              placeholder="Enter Customer Name or leave blank"
            />
          </div>

          <button type="submit" className={styles.submitButton}>Submit Sale</button>
        </form>
      )}

      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
}

export default Sale;
