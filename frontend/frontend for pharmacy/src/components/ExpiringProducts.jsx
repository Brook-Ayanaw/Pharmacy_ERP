import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./ExpiringProducts.module.css";
import Select from "react-select";

function ExpiringProducts() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [months, setMonths] = useState(2);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchStores();
    fetchData(months);
  }, [months]);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, selectedStore, products]);

  const fetchStores = async () => {
    try {
      const res = await axios.get("https://pharmacy-erp.onrender.com/store/all");
      const options = res.data.map((s) => ({
        value: s._id,
        label: s.name,
      }));
      setStores(options);
    } catch (err) {
      console.error("Error fetching stores", err);
    }
  };

  const fetchData = async (monthRange) => {
    try {
      const response = await axios.get(
        "https://pharmacy-erp.onrender.com/product/shortExpiringWithMonth",
        {
          params: { month: monthRange },
        }
      );
      setProducts(response.data);
    } catch (error) {
      console.error(error);
      alert("Failed to load expiring products.");
    }
  };

  const applyFilters = () => {
    let result = [...products];

    if (searchTerm) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedStore) {
      result = result.filter(
        (p) => p.store && p.store._id === selectedStore.value
      );
    }

    setFiltered(result);
  };

  const getMonthDiff = (expiryDate) => {
    const now = new Date();
    const exp = new Date(expiryDate);
    return (exp.getFullYear() - now.getFullYear()) * 12 + (exp.getMonth() - now.getMonth());
  };

  const getRowClass = (expiryDate) => {
    const diff = getMonthDiff(expiryDate);
    if (diff <= 2) return styles.red;
    if (diff <= 4) return styles.yellow;
    return styles.green;
  };

  const handleExport = () => {
    const rows = [
      ["Product Name", "Quantity", "Buying Price", "Total Cost", "Store", "Expiry Date", "Expires In"],
      ...filtered.map((p) => [
        p.name,
        p.quantity,
        p.buyingPrice,
        p.buyingPrice * p.quantity,
        p.store?.name || "Unknown",
        new Date(p.expiry_date).toLocaleDateString(),
        `${getMonthDiff(p.expiry_date)} mo`
      ])
    ];

    const csvContent = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "Expiring_Products.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    const printContent = document.getElementById("printSection").innerHTML;
    const win = window.open("", "", "width=1000,height=600");
    win.document.write("<html><head><title>Print Expiring Products</title></head><body>");
    win.document.write(printContent);
    win.document.write("</body></html>");
    win.document.close();
    win.print();
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Expiring Products</h1>

      <div className={styles.controls}>
        <label>
          Months:{" "}
          <input
            type="number"
            min="1"
            value={months}
            onChange={(e) => setMonths(e.target.value)}
            className={styles.input}
          />
        </label>

        <input
          type="text"
          placeholder="Search product name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.input}
        />

        <Select
          options={stores}
          placeholder="Filter by store"
          isClearable
          onChange={setSelectedStore}
          className={styles.select}
        />

        <button onClick={handleExport}>📄 Export CSV</button>
        <button onClick={handlePrint}>🖨️ Print</button>
      </div>

      <div id="printSection">
        {filtered.length === 0 ? (
          <p className={styles.noData}>No matching expiring products found.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Quantity</th>
                <th>Buying Price</th>
                <th>Total Cost</th>
                <th>Store</th>
                <th>Expiry Date</th>
                <th>Expires In</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, index) => (
                <tr key={index} className={getRowClass(p.expiry_date)}>
                  <td>{p.name}</td>
                  <td>{p.quantity}</td>
                  <td>{p.buyingPrice}</td>
                  <td>{p.buyingPrice * p.quantity}</td>
                  <td>{p.store?.name || "Unknown"}</td>
                  <td>{new Date(p.expiry_date).toLocaleDateString()}</td>
                  <td>{getMonthDiff(p.expiry_date)} mo</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default ExpiringProducts;
