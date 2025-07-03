import { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import styles from "./EditBrand.module.css";

function EditBrand() {
  const [brands, setBrands] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const token = localStorage.getItem("token");
      const decoded = jwtDecode(token);
      const appointedStores = decoded.appointedStore || [];

      const res = await axios.get("http://localhost:3000/product/allBrand");
      const filtered = res.data.filter(b => appointedStores.includes(b.store._id));
      setBrands(filtered);
    } catch (err) {
      setMessage("Failed to load brands");
    }
  };

  const handleSelect = (brand) => {
    setSelectedBrand(brand._id);
    setFormData({
      name: brand.name || "",
      category: brand.category || "",
      minStock: brand.minStock || 0,
      sellingPrice: brand.sellingPrice || 0,
      sellingUnit: brand.sellingUnit || "",
    });
    setMessage("");
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      await axios.put(
        `http://localhost:3000/product/editBrand/${selectedBrand}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage("✅ Brand updated successfully");
      setSelectedBrand(null);
      fetchBrands();
    } catch (err) {
      setMessage(err.response?.data?.message || "Update failed");
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Edit Brand</h2>

      <input
        className={styles.searchInput}
        placeholder="Search brand..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <ul className={styles.list}>
        {brands
          .filter((b) => b.name.toLowerCase().includes(search.toLowerCase()))
          .map((b) => (
            <li key={b._id} className={styles.item}>
              <div className={styles.nameBlock}>
                <strong>{b.name}</strong> — <span>{b.store?.name}</span>
              </div>
              <button className={styles.editBtn} onClick={() => handleSelect(b)}>
                ✏️ Edit
              </button>
            </li>
          ))}
      </ul>

      {selectedBrand && (
        <form className={styles.form} onSubmit={handleSubmit}>
          <label>Name</label>
          <input name="name" value={formData.name} onChange={handleChange} required />

          <label>Category</label>
          <input name="category" value={formData.category} onChange={handleChange} />

          <label>Min Stock</label>
          <input type="number" name="minStock" value={formData.minStock} onChange={handleChange} />

          <label>Selling Price</label>
          <input type="number" name="sellingPrice" value={formData.sellingPrice} onChange={handleChange} />

          <label>Selling Unit</label>
          <input name="sellingUnit" value={formData.sellingUnit} onChange={handleChange} />

          <div className={styles.buttonRow}>
            <button type="submit" className={styles.saveBtn}>Save</button>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => setSelectedBrand(null)}
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

export default EditBrand;
