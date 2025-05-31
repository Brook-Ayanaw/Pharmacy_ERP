import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./RefillProduct.module.css";
import { jwtDecode } from "jwt-decode";

function RefillProduct() {
  const [brands, setBrands] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    brandID: "",
    buyingPrice: "",
    sellingPrice: "",
    quantity: "",
    supplier: "",
    expiry_date: "",
    purchase_invoice: "",
    batch: ""
  });

  useEffect(() => {
    fetchBrands();
    fetchSuppliers();
  }, []);

  const fetchBrands = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const decoded = jwtDecode(token);
      const appointedStoreIds = decoded.appointedStore || [];

      const res = await axios.get("http://localhost:3000/product/allBrand");
      const allBrands = res.data;

      // Filter brands to only include those from appointed stores
      const filtered = allBrands.filter(brand =>
        appointedStoreIds.includes(brand.store?._id)
      );

      setBrands(filtered);
    } catch (err) {
      console.error("Error fetching brands:", err);
      setMessage(err.response?.data?.message || "Failed to fetch brands");
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get("http://localhost:3000/supplier/all");
      setSuppliers(res.data);
    } catch (err) {
      setMessage("Failed to fetch suppliers");
    }
  };

  const handleSelect = (brand) => {
    setSelectedBrand(brand);
    setFormData((prev) => ({
      ...prev,
      brandID: brand._id
    }));
    setMessage("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:3000/product/RefillBrandProduct",
        formData
      );

      setMessage(res.data.message);

      // Reset everything
      setSelectedBrand(null);
      setFormData({
        brandID: "",
        buyingPrice: "",
        sellingPrice: "",
        quantity: "",
        supplier: "",
        expiry_date: "",
        purchase_invoice: "",
        batch: ""
      });
    } catch (err) {
      setMessage(err.response?.data?.message || "Refill failed");
    }
  };

  const filteredBrands = brands.filter((brand) =>
    brand.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Refill Brand Products</h1>

      {message && <p className={styles.message}>{message}</p>}

      {!selectedBrand && (
        <>
          <input
            type="text"
            placeholder="Search by brand name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />

          <div className={styles.grid}>
            {filteredBrands.map((brand) => (
              <div key={brand._id} className={styles.card}>
                <h3>{brand.name}</h3>
                <p>Store: {brand.store?.name}</p>
                <p>Quantity: {brand.quantity}</p>
                <button
                  onClick={() => handleSelect(brand)}
                  className={styles.selectButton}
                >
                  Refill
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {selectedBrand && (
        <form className={styles.form} onSubmit={handleSubmit}>
          <h2>Refill: {selectedBrand.name}</h2>

          <input
            type="number"
            name="buyingPrice"
            placeholder="Buying Price"
            value={formData.buyingPrice}
            onChange={handleChange}
            required
            className={styles.inputField}
          />

          <input
            type="number"
            name="sellingPrice"
            placeholder="Selling Price (optional)"
            value={formData.sellingPrice}
            onChange={handleChange}
            className={styles.inputField}
          />

          <input
            type="number"
            name="quantity"
            placeholder="Quantity"
            value={formData.quantity}
            onChange={handleChange}
            required
            className={styles.inputField}
          />

          <select
            name="supplier"
            value={formData.supplier}
            onChange={handleChange}
            required
            className={styles.inputField}
          >
            <option value="">Select Supplier</option>
            {suppliers.map((sup) => (
              <option key={sup._id} value={sup._id}>
                {sup.name}
              </option>
            ))}
          </select>

          <input
            type="date"
            name="expiry_date"
            value={formData.expiry_date}
            onChange={handleChange}
            required
            className={styles.inputField}
          />

          <input
            type="text"
            name="purchase_invoice"
            placeholder="Purchase Invoice"
            value={formData.purchase_invoice}
            onChange={handleChange}
            className={styles.inputField}
          />

          <input
            type="text"
            name="batch"
            placeholder="Batch"
            value={formData.batch}
            onChange={handleChange}
            className={styles.inputField}
          />

          <button type="submit" className={styles.button}>
            Submit Refill
          </button>
          <button
            type="button"
            onClick={() => setSelectedBrand(null)}
            className={styles.cancelButton}
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}

export default RefillProduct;
