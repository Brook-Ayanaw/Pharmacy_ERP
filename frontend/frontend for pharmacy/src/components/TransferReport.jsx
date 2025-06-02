import { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import styles from "./TransferReport.module.css";

function TransferReport() {
  const [stores, setStores] = useState([]);
  const [senderStore, setSenderStore] = useState("");
  const [receiverStore, setReceiverStore] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalPrice, setTotalPrice] = useState(null);
  const [transfers, setTransfers] = useState([]);
  const [filter, setFilter] = useState("");
  const [sortField, setSortField] = useState("product");
  const [sortAsc, setSortAsc] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await axios.get("http://localhost:3000/store/all", authHeaders);
        setStores(res.data);
      } catch (err) {
        setError("❌ Failed to load stores.");
      }
    };

    fetchStores();
  }, []);

  const handleGenerateReport = async () => {
    if (!senderStore || !receiverStore || !startDate || !endDate) {
      setError("⚠️ Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError("");
    setTotalPrice(null);
    setTransfers([]);

    try {
      const res = await axios.post(
        "http://localhost:3000/product/transferReport",
        { senderStore, receiverStore, startDate, endDate },
        authHeaders
      );

      setTotalPrice(res.data.totalPrice);
      setTransfers(res.data.transfers || []);
    } catch (err) {
      setError("❌ Error generating report.");
    } finally {
      setLoading(false);
    }
  };

  const filteredTransfers = transfers
    .filter((t) =>
      t.product?.name?.toLowerCase().includes(filter.toLowerCase()) ||
      t.batch?.toLowerCase().includes(filter.toLowerCase())
    )
    .sort((a, b) => {
      const valA = a[sortField]?.name || a[sortField];
      const valB = b[sortField]?.name || b[sortField];
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const exportExcel = () => {
    const sheetData = filteredTransfers.map((t) => ({
      Product: t.product?.name,
      Batch: t.batch,
      Quantity: t.quantity,
      Price: t.price,
      Total: (t.quantity ?? 0) * (t.price ?? 0),
      Date: new Date(t.createdAt).toLocaleDateString()
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(wb, ws, "Transfers");
    XLSX.writeFile(wb, "transfer_report.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [["Product", "Batch", "Qty", "Price", "Total", "Date"]],
      body: filteredTransfers.map((t) => [
        t.product?.name,
        t.batch,
        t.quantity,
        t.price,
        (t.quantity ?? 0) * (t.price ?? 0),
        new Date(t.createdAt).toLocaleDateString(),
      ]),
    });
    doc.save("transfer_report.pdf");
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Transfer Report</h2>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.formGroup}>
        <label>Sender Store:</label>
        <select value={senderStore} onChange={(e) => setSenderStore(e.target.value)}>
          <option value="">-- Select Sender --</option>
          {stores.map((store) => (
            <option key={store._id} value={store._id}>{store.name}</option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label>Receiver Store:</label>
        <select value={receiverStore} onChange={(e) => setReceiverStore(e.target.value)}>
          <option value="">-- Select Receiver --</option>
          {stores.map((store) => (
            <option key={store._id} value={store._id}>{store.name}</option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label>Start Date:</label>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
      </div>

      <div className={styles.formGroup}>
        <label>End Date:</label>
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      </div>

      <button onClick={handleGenerateReport} disabled={loading}>
        {loading ? "Loading..." : "Generate Report"}
      </button>

      {totalPrice !== null && (
        <p className={styles.totalPrice}>✅ Total Price: {totalPrice} ETB</p>
      )}

      {transfers.length > 0 && (
        <div className={styles.report}>
          <div className={styles.formGroup}>
            <label>🔍 Filter by Product/Batch:</label>
            <input type="text" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Type to filter..." />
          </div>

          <button onClick={exportExcel}>📥 Export Excel</button>
          <button onClick={exportPDF}>📄 Export PDF</button>

          <div className={styles.tableContainer}>
            <table>
              <thead>
                <tr>
                  <th onClick={() => toggleSort("product")}>Product</th>
                  <th onClick={() => toggleSort("batch")}>Batch</th>
                  <th onClick={() => toggleSort("quantity")}>Quantity</th>
                  <th onClick={() => toggleSort("price")}>Price</th>
                  <th>Total</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransfers.map((t) => (
                  <tr key={t._id}>
                    <td>{t.product?.name || "Unknown"}</td>
                    <td>{t.batch || "-"}</td>
                    <td>{t.quantity ?? 0}</td>
                    <td>{t.price ?? 0}</td>
                    <td>{(t.quantity ?? 0) * (t.price ?? 0)}</td>
                    <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default TransferReport;
