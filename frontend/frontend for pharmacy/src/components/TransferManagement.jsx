import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import { jwtDecode } from "jwt-decode";
import styles from "./TransferManagment.module.css";

function TransferManagment() {
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [appointedStoreIds, setAppointedStoreIds] = useState([]);

  const [selectedProductOption, setSelectedProductOption] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [receiverStoreOption, setReceiverStoreOption] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      setAppointedStoreIds(decoded.appointedStore || []);
    }
  }, []);

  useEffect(() => {
    if (appointedStoreIds.length > 0) {
      fetchProducts();
      fetchStores();
    }
  }, [appointedStoreIds]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("https://pharmacy-erp.onrender.com/product/allProduct");
      const filtered = res.data.filter((p) =>
        appointedStoreIds.includes(p.store?._id)
      );
      setProducts(filtered);
    } catch (err) {
      console.error("Error loading products:", err);
    }
  };

  const fetchStores = async () => {
    try {
      const res = await axios.get("https://pharmacy-erp.onrender.com/store/all");
      setStores(res.data);
    } catch (err) {
      console.error("Error loading stores:", err);
    }
  };

  const handleProductChange = (selectedOption) => {
    setSelectedProductOption(selectedOption);
    const product = products.find((p) => p._id === selectedOption.value);

    if (product) {
      setSelectedProduct(product);
      setPrice(product?.buyingPrice ?? "");
    } else {
      setSelectedProduct(null);
      setPrice("");
    }
  };

  const handleTransfer = async () => {
    if (!selectedProduct || !receiverStoreOption) {
      return alert("Please complete all selections.");
    }

    const senderStore = selectedProduct.store?._id;
    const receiverStore = receiverStoreOption.value;

    if (senderStore === receiverStore) {
      return alert("Sender and receiver stores must be different.");
    }
    if (!quantity || Number(quantity) <= 0) {
      return alert("Quantity must be a positive number.");
    }

    if (selectedProduct.quantity < Number(quantity)) {
      return alert("Insufficient stock available.");
    }

    try {
      const res = await axios.put(
        `https://pharmacy-erp.onrender.com/product/transfer/${selectedProduct._id}`,
        {
          quantity: Number(quantity),
          senderId: senderStore,
          receiverId: receiverStore,
          price: Number(price),
        }
      );

      alert("Transfer request submitted successfully!");
      setQuantity("");
      setPrice("");
      setReceiverStoreOption(null);
      setSelectedProductOption(null);
      setSelectedProduct(null);
    } catch (err) {
      console.error("Transfer error:", err.response?.data || err.message);
      alert("Transfer failed: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Transfer Product</h2>

      <div className={styles.selectRow}>
        <label className={styles.label}>Select Product:</label>
        <Select
          value={selectedProductOption}
          onChange={handleProductChange}
          options={products.map((p) => ({ value: p._id, label: p.name }))}
          placeholder="Search and select a product"
          isSearchable
          className={styles.select}
        />
      </div>

      {selectedProduct && (
        <p className={styles.infoLabel}>
          Available Quantity: <strong>{selectedProduct.quantity}</strong> | Selling Price: {" "}
          <strong>
            {selectedProduct.brand?.sellingPrice !== undefined
              ? `${selectedProduct.brand.sellingPrice} Birr`
              : "N/A"}
          </strong>
        </p>
      )}

      <div className={styles.selectRow}>
        <label className={styles.label}>Sender Store:</label>
        <Select
          value={{
            value: selectedProduct?.store?._id,
            label: selectedProduct?.store?.name,
          }}
          isDisabled
          placeholder="Sender Store"
          className={styles.select}
        />
      </div>

      <div className={styles.selectRow}>
        <label className={styles.label}>Receiver Store:</label>
        <Select
          value={receiverStoreOption}
          onChange={setReceiverStoreOption}
          options={stores
            .filter((s) => s._id !== selectedProduct?.store?._id)
            .map((s) => ({ value: s._id, label: s.name }))}
          placeholder="Search and select a receiver store"
          isSearchable
          className={styles.select}
        />
      </div>

      <div className={styles.selectRow}>
        <label className={styles.label}>Quantity:</label>
        <input
          type="number"
          placeholder="Quantity to transfer"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className={styles.input}
        />
      </div>

      <div className={styles.selectRow}>
        <label className={styles.label}>Price (optional):</label>
        <input
          type="number"
          placeholder="Price (optional)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className={styles.input}
        />
      </div>

      <button onClick={handleTransfer} className={styles.button}>
        Submit Transfer
      </button>
    </div>
  );
}

export default TransferManagment;
