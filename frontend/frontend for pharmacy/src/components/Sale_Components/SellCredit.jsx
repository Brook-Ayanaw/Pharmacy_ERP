import { useEffect, useState } from "react";
import Select from "react-select";
import { jwtDecode } from "jwt-decode";
import styles from "./SellCredit.module.css";
import axios from "axios";
function SellCredit() {
  const [allStores, setAllStores] = useState([]);
  const [appointedStoreIds, setAppointedStoreIds] = useState([]);
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [creditCustomers, setCreditCustomers] = useState([]);
  const [formData, setFormData] = useState({
    productId: "",
    quantity: 1,
    creditCustomer: "",
    patientId: "",
    customerName: "",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      setAppointedStoreIds(decoded.appointedStore || []);
    } catch (err) {
      console.error("JWT decode error:", err);
    }
  }, []);

  useEffect(() => {
    fetch("https://pharmacy-erp.onrender.com/store/all")
      .then(res => res.json())
      .then(data => setAllStores(data))
      .catch(err => {
        console.error("Error fetching stores:", err);
        setMessage("Error loading stores.");
      });

    const token = localStorage.getItem("token");
    axios
      .get("https://pharmacy-erp.onrender.com/creditCustomer/all", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setCreditCustomers(
          res.data.map((c) => ({
            value: c._id,
            label: `${c.name} (${c.email})`,
          }))
        );
      })
      .catch(() => {
        setMessage("❌ Could not load credit customers.");
      });
  }, []);

  const filteredStores = allStores.filter(store =>
    appointedStoreIds.includes(store._id)
  );

  const handleStoreChange = async (storeId) => {
    setSelectedStoreId(storeId);
    setSelectedBrand(null);
    setProducts([]);
    setFormData(prev => ({ ...prev, productId: "" }));

    try {
      const res = await fetch("https://pharmacy-erp.onrender.com/product/allBrand");
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
        `https://pharmacy-erp.onrender.com/product/byStoreAndBrand?storeId=${selectedStoreId}&brandId=${option.value}`
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

  const handleSelectChange = (selectedOption, field) => {
    setFormData({ ...formData, [field]: selectedOption?.value || "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const { productId, quantity, creditCustomer, patientId, customerName } = formData;

    if (!productId || !creditCustomer || !quantity || (!patientId && !customerName)) {
      return setMessage("❌ Please fill all required fields.");
    }

    try {
      const res = await axios.post(
        "https://pharmacy-erp.onrender.com/creditSell/sell",
        {
          productId,
          creditCustomer,
          quantity: Number(quantity),
          patientId: patientId || null,
          customerName: customerName || null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("✅ Credit sale recorded successfully.");
      setFormData({
        productId: "",
        quantity: 1,
        creditCustomer: "",
        patientId: "",
        customerName: "",
      });
      setProducts([]);
      setSelectedStoreId("");
      setSelectedBrand(null);
    } catch (err) {
      console.error("Submit error:", err);
      setMessage("❌ " + (err.response?.data?.message || "Something went wrong."));
    }
  };

  const brandOptions = brands.map((brand) => ({
    value: brand._id,
    label: brand.name,
  }));

  return (
    <div className={styles.container}>
      <h2>Sell on Credit</h2>

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label>Store:</label>
          <select
            value={selectedStoreId}
            onChange={(e) => handleStoreChange(e.target.value)}
          >
            <option value="">-- Select Store --</option>
            {filteredStores.map((store) => (
              <option key={store._id} value={store._id}>
                {store.name}
              </option>
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
          <>
            <div className={styles.formGroup}>
              <label>Product:</label>
              <select
                value={formData.productId}
                onChange={(e) => handleChange(e, "productId")}
                required
              >
                <option value="">-- Select Product --</option>
                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name} | Qty: {product.quantity} | Exp:{" "}
                    {new Date(product.expiry_date).toLocaleDateString()}
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
              <label>Credit Customer:</label>
              <Select
                options={creditCustomers}
                value={creditCustomers.find((c) => c.value === formData.creditCustomer)}
                onChange={(option) => handleSelectChange(option, "creditCustomer")}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Patient ID (optional):</label>
              <input
                type="text"
                value={formData.patientId}
                onChange={(e) => handleChange(e, "patientId")}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Customer Name (optional):</label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => handleChange(e, "customerName")}
              />
            </div>

            <button type="submit" className={styles.submitButton}>
              Submit Credit Sale
            </button>
          </>
        )}
      </form>

      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
}

export default SellCredit;
