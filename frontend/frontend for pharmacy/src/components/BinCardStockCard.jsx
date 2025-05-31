import { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import DatePicker from "react-datepicker";
import { jwtDecode } from "jwt-decode";
import "react-datepicker/dist/react-datepicker.css";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import styles from "./BinCardStockCard.module.css";

function BinCardStockCard() {
  const [storesWithLabels, setStoresWithLabels] = useState([]);
  const [brandsWithLabels, setBrandsWithLabels] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [products, setProducts] = useState([]);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const token = localStorage.getItem("token");
      const decoded = jwtDecode(token);
      const appointedStores = decoded.appointedStore || [];

      const res = await axios.get("http://localhost:3000/store/all");
      const options = res.data
        .filter((s) => appointedStores.includes(s._id))
        .map((s) => ({ value: s._id, label: s.name }));

      setStoresWithLabels(options);
    } catch (err) {
      alert("Failed to load appointed stores.");
    }
  };

  const handleStoreChange = async (selectedOption) => {
    const storeId = selectedOption.value;
    setSelectedStoreId(storeId);
    setProducts([]);
    try {
      const res = await axios.get(`http://localhost:3000/binCard/brandsByStore/${storeId}`);
      const brandOptions = res.data.map((b) => ({
        value: b._id,
        label: b.name
      }));
      setBrandsWithLabels(brandOptions);
    } catch (err) {
      alert("Failed to load brands.");
    }
  };

  const handleBrandChange = async (selectedOption) => {
    if (!selectedStoreId) return alert("Select a store first.");
    try {
      const res = await axios.get("http://localhost:3000/binCard/byStoreAndBrand", {
        params: {
          storeId: selectedStoreId,
          brandId: selectedOption.value
        }
      });

      let filtered = res.data;

      if (startDate && endDate) {
        const start = new Date(startDate).setHours(0, 0, 0, 0);
        const end = new Date(endDate).setHours(23, 59, 59, 999);
        filtered = filtered.filter((p) => {
          const createdAt = new Date(p.createdAt).getTime();
          return createdAt >= start && createdAt <= end;
        });
      }

      setProducts(filtered);
    } catch (err) {
      alert("Failed to fetch bin card data.");
    }
  };

  const handleExport = () => {
    const sorted = [...products].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    let balance = 0;
    const exportData = sorted.map((p) => {
      const received = p.receivedQuantity || 0;
      const issued = p.issuedQuantity || 0;
      balance += received - issued;
      return {
        Name: p.name,
        Received: received,
        Issued: issued,
        Balance: balance,
        Date: new Date(p.createdAt).toLocaleDateString(),
        Store: p.store?.name || "Unknown",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "BinCard");

    const blob = new Blob(
      [XLSX.write(workbook, { bookType: "xlsx", type: "array" })],
      { type: "application/octet-stream" }
    );

    saveAs(blob, "BinCardReport.xlsx");
  };

  const handlePrint = () => {
    const printContent = document.getElementById("binCardTable");
    const printWindow = window.open("", "", "width=1000,height=600");
    printWindow.document.write("<html><head><title>Print Bin Card Report</title></head><body>");
    printWindow.document.write(printContent.innerHTML);
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Bin Card Stock</h1>

      <div className={styles.selectWrapper}>
        <Select
          options={storesWithLabels}
          onChange={handleStoreChange}
          isSearchable
          placeholder="Select a Store"
        />
        <Select
          options={brandsWithLabels}
          onChange={handleBrandChange}
          isSearchable
          placeholder="Select a Brand"
          isDisabled={!selectedStoreId}
        />
      </div>

      <div className={styles.selectWrapper}>
        <DatePicker
          selected={startDate}
          onChange={setStartDate}
          placeholderText="Start Date"
        />
        <DatePicker
          selected={endDate}
          onChange={setEndDate}
          placeholderText="End Date"
        />
      </div>

      <div className={styles.selectWrapper}>
        <button onClick={handleExport}>📄 Export to Excel</button>
        <button onClick={handlePrint}>🖨️ Print</button>
      </div>

      <div className={styles.tableWrapper} id="binCardTable">
        {products.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr className={styles.tr}>
                <th className={styles.th}>Name</th>
                <th className={styles.th}>Received</th>
                <th className={styles.th}>Issued</th>
                <th className={styles.th}>Balance</th>
                <th className={styles.th}>Date</th>
                <th className={styles.th}>Store</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const sorted = [...products].sort(
                  (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
                );
                let runningBalance = 0;
                return sorted.map((p, i) => {
                  const received = p.receivedQuantity || 0;
                  const issued = p.issuedQuantity || 0;
                  runningBalance += received - issued;
                  return (
                    <tr key={i} className={styles.tr}>
                      <td className={styles.td}>{p.name}</td>
                      <td className={styles.td}>{received}</td>
                      <td className={styles.td}>{issued}</td>
                      <td className={styles.td}>{runningBalance}</td>
                      <td className={styles.td}>
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td className={styles.td}>{p.store?.name || "Unknown"}</td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        ) : (
          <p className={styles.noProducts}>No bin card entries to show.</p>
        )}
      </div>
    </div>
  );
}

export default BinCardStockCard;
