import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./ListUser.module.css";
import { useNavigate } from "react-router-dom";

function ListUser() {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("https://pharmacy-erp.onrender.com/user/all");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      setMessage("Failed to load users.");
    }
  };

  
  return (
    <div className={styles.container}>
      <h2>User List</h2>
      
      {message && <p className={styles.error}>{message}</p>}

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Roles</th>
            <th>Status</th>
            <th>Appointed Stores</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.phone_number}</td>
              <td>{u.role.map((r) => r.name).join(", ")}</td>
              <td>{u.blockStatus === "block" ? "Blocked" : "Active"}</td>
              <td>
                {u.appointedStore && u.appointedStore.length > 0
                  ? u.appointedStore.map((store) => store.name).join(", ")
                  : "None"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ListUser;
