import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./ListAllProduct.module.css";

function ListAllProduct() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:3000/product/allProduct");
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error.response?.data || error.message);
        alert("Error: " + (error.response?.data?.error || error.message));
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((p) => {
    const searchTerm = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(searchTerm) ||
      p.category?.toLowerCase().includes(searchTerm) ||
      p.supplier?.name?.toLowerCase().includes(searchTerm) ||
      p.store?.name?.toLowerCase().includes(searchTerm) ||
      p.brand?.name?.toLowerCase().includes(searchTerm) ||
      p.entity?.name?.toLowerCase().includes(searchTerm) ||
      p.buyingPrice?.toString().includes(searchTerm) ||
      p.quantity?.toString().includes(searchTerm) ||
      p.purchaseQuantity?.toString().includes(searchTerm)
    );
  });

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>All Products</h1>

      <input
        type="text"
        placeholder="Search..."
        className={styles.searchInput}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Quantity</th>
            <th>Buying Price</th>
            <th>Selling Price</th>
            <th>Purchase Quantity</th>
            <th>Supplier</th>
            <th>Expiry Date</th>
            <th>Store</th>
            <th>Brand</th>
            <th>Entity</th>
            <th>Invoice Number</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((p, index) => (
            <tr key={index}>
              <td>{p.name}</td>
              <td>{p.category}</td>
              <td>{p.quantity}</td>
              <td>{p.buyingPrice}</td>
              <td>{p.brand?.sellingPrice || "-"}</td>
              <td>{p.purchaseQuantity}</td>
              <td>{p?.supplier?.name || "-"}</td>
              <td>{p?.expiry_date?.substring(0, 10) || "-"}</td>
              <td>{p?.store?.name || "-"}</td>
              <td>{p?.brand?.name || "-"}</td>
              <td>{p?.entity?.name || "-"}</td>
              <td>{p?.purchase_invoice|| "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ListAllProduct;
