import { useState } from "react";
import axios from "axios";
import styles from "./SearchByInv.module.css";

function SearchByInv() {
  const [products, setProducts] = useState([]);
  const [invNum, setInvNum] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);

  async function handleSearch() {
    try {
      const response = await axios.post("http://localhost:3000/product/allByInvoice", {
        invoiceNumber: invNum,
      });

      if (!response || !response.data) {
        return alert("No response");
      }

      setProducts(response.data.the_products);
      setTotalPrice(response.data.total_price);
    } catch (error) {
      alert(error.response?.data?.message || error.message);
    }
  }

  function handleChange(e) {
    setInvNum(e.target.value);
  }

  return (
    <div className={styles.container}>
      <h1>Search by Invoice</h1>
      <div style={{ display: "flex", alignItems: "center" }}>
        <input
          type="text"
          value={invNum}
          onChange={handleChange}
          placeholder="Enter invoice number"
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {products.length > 0 && (
        <div className={styles.results}>
          <div className={styles.total}>Total Price: {totalPrice} ETB</div>
          <ul className={styles.productList}>
            {products.map((product, index) => (
              <li key={index} className={styles.productItem}>
                <strong>{product.name || "Unnamed product"}</strong><br />
                Quantity: {product.purchaseQuantity}<br />
                Buying Price: {product.buyingPrice} ETB<br />
                Brand: {product.brand?.name || "-"}<br />
                Store: {product.store?.name || "-"}<br />
                Supplier: {product.supplier?.name || "-"}<br />
                Purchase quantity: {product.purchaseQuantity || "-"}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default SearchByInv;
