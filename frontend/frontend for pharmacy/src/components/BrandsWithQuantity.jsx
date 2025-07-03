import { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import styles from "./BrandsWithQuantity.module.css";

function BrandsWithQuantity() {
  const [brands, setBrands] = useState([]);
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [brandsRes, storesRes] = await Promise.all([
        axios.get("https://pharmacy-erp.onrender.com/product/allBrand"),
        axios.get("https://pharmacy-erp.onrender.com/store/all"),
      ]);

      // Only include brands with quantity > 0
      const filteredBrands = brandsRes.data.filter((b) => b.quantity > 0);

      setBrands(filteredBrands);
      setStores(storesRes.data);
    } catch (err) {
      console.error("Error loading data:", err);
    }
  };

  const handleStoreChange = (e) => {
    setSelectedStore(e.target.value);
  };

  const filteredBrands = selectedStore
    ? brands.filter((b) => b.store?._id === selectedStore)
    : brands;

  const exportToExcel = () => {
    const data = filteredBrands.map((b) => ({
      Brand: b.name,
      Category: b.category,
      Quantity: b.quantity,
      "Selling Price": b.sellingPrice,
      Store: b.store?.name || "N/A",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Brands");

    XLSX.writeFile(wb, "BrandsWithQuantity.xlsx");
  };

  return (
    <div className={styles.container}>
      <h2>Brands With Quantity</h2>

      <div className={styles.controls}>
        <select onChange={handleStoreChange} value={selectedStore} className={styles.select}>
          <option value="">All Stores</option>
          {stores.map((store) => (
            <option key={store._id} value={store._id}>
              {store.name}
            </option>
          ))}
        </select>

        <button className={styles.exportBtn} onClick={exportToExcel}>
          📤 Export to Excel
        </button>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Brand</th>
            <th>Category</th>
            <th>Quantity</th>
            <th>Selling Price</th>
            <th>Store</th>
          </tr>
        </thead>
        <tbody>
          {filteredBrands.map((b) => (
            <tr key={b._id}>
              <td>{b.name}</td>
              <td>{b.category}</td>
              <td>{b.quantity}</td>
              <td>{b.sellingPrice}</td>
              <td>{b.store?.name || "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default BrandsWithQuantity;
