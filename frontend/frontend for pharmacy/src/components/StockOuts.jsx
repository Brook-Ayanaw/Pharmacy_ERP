import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./StockOuts.module.css";

function StockOuts() {
  const [groupedProducts, setGroupedProducts] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get("http://localhost:3000/product/stockOut");

      const stockOuts = response.data.stockOuts || [];

      // Group by entity -> store
      const grouped = {};
      for (let product of stockOuts) {
        const entityName = product.entity?.name || "Unknown Entity";
        const storeName = product.store?.name || "Unknown Store";

        if (!grouped[entityName]) grouped[entityName] = {};
        if (!grouped[entityName][storeName]) grouped[entityName][storeName] = [];

        grouped[entityName][storeName].push(product);
      }

      setGroupedProducts(grouped);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1>Stock Out Products</h1>

      {loading && <p>Loading...</p>}
      {error && <p className={styles.error}>{error}</p>}

      {!loading && !error && Object.keys(groupedProducts).length === 0 && (
        <p>No stock-out products found.</p>
      )}

      {!loading && !error && Object.entries(groupedProducts).map(([entity, stores]) => (
        <div key={entity} className={styles.entityBlock}>
          <h2>{entity}</h2>

          {Object.entries(stores).map(([store, products]) => (
            <div key={store} className={styles.storeBlock}>
              <h3>{store}</h3>
              <ul>
                {products.map((product, index) => (
                  <li key={index} className={styles.listItem}>
                    <strong>{product.brand?.name}</strong> - {product.name} (Qty: {product.quantity})
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default StockOuts;
