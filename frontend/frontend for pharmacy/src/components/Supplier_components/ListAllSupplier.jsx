import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./ListAllSupplier.module.css";

function ListAllSupplier() {
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [searchTerm, suppliers]);

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get("http://localhost:3000/supplier/all");
      setSuppliers(res.data);
    } catch (err) {
      console.error("Error fetching suppliers:", err);
      alert("Failed to load suppliers.");
    }
  };

  const applyFilter = () => {
    const filtered = suppliers.filter((supplier) =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSuppliers(filtered);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>All Suppliers</h1>

      <input
        type="text"
        placeholder="Search by supplier name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={styles.input}
      />

      {filteredSuppliers.length === 0 ? (
        <p className={styles.noData}>No suppliers found.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone Numbers</th>
              <th>Account Numbers</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {filteredSuppliers.map((supplier) => (
              <tr key={supplier._id}>
                <td>{supplier.name}</td>
                <td>{supplier.email}</td>
                <td>{supplier.phone_numbers.join(", ")}</td>
                <td>{supplier.account_numbers.length > 0 ? supplier.account_numbers.join(", ") : "—"}</td>
                <td>{new Date(supplier.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ListAllSupplier;
