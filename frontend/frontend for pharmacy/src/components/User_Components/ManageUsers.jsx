import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./ManageUsers.module.css";
import { jwtDecode } from "jwt-decode";
import Select from "react-select";

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [stores, setStores] = useState([]);
  const [message, setMessage] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    checkIfAdmin();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
      fetchRoles();
      fetchStores();
    }
  }, [isAdmin]);

  const checkIfAdmin = () => {
    try {
      const decoded = jwtDecode(token);
      const roleNames = decoded.roleByName || [];
      setIsAdmin(roleNames.includes("admin"));
    } catch {
      setIsAdmin(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get("https://pharmacy-erp.onrender.com/user/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      setMessage("Failed to load users.");
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await axios.get("https://pharmacy-erp.onrender.com/role/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRoles(res.data);
    } catch (err) {
      console.error(err);
      setMessage("Failed to load roles.");
    }
  };

  const fetchStores = async () => {
    try {
      const res = await axios.get("https://pharmacy-erp.onrender.com/store/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStores(res.data);
    } catch (err) {
      console.error(err);
      setMessage("Failed to load stores.");
    }
  };

  const handleAddRole = async (userId, roleId) => {
    try {
      await axios.patch(
        `https://pharmacy-erp.onrender.com/user/addUserRole/${userId}`,
        { role: roleId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to add role.");
    }
  };

  const handleRemoveRole = async (userId, roleId) => {
    try {
      await axios.patch(
        `https://pharmacy-erp.onrender.com/user/removeUserRole/${userId}`,
        { role: roleId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to remove role.");
    }
  };

  const toggleBlockStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === "ok" ? "block" : "ok";
    try {
      await axios.patch(
        `https://pharmacy-erp.onrender.com/user/setBlockStatus/${userId}`,
        { blockStatus: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to update block status.");
    }
  };

  const handleAddAppointedStore = async (userId, selected) => {
    const storeId = selected?.value;
    if (!storeId) return;

    try {
      await axios.patch(
        `https://pharmacy-erp.onrender.com/user/addAppointedStore/${userId}`,
        { storeId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchUsers();
    } catch (err) {
      console.error("Add store error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to appoint store.");
    }
  };

  const handleRemoveAppointedStore = async (userId, storeId) => {
    if (!storeId) return;
    try {
      await axios.patch(
        `https://pharmacy-erp.onrender.com/user/removeAppointedStore/${userId}/${storeId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers();
    } catch (err) {
      console.error("Remove store error:", err.response?.data || err.message);
      alert("Failed to remove appointed store.");
    }
  };

  if (!isAdmin) {
    return (
      <div className={styles.container}>
        <h2>Access Denied</h2>
        <p className={styles.error}>Only admins can manage users.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2>Manage Users</h2>
      {message && <p className={styles.error}>{message}</p>}

      <div className={styles.userTable}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Roles</th>
              <th>Add Role</th>
              <th>Appointed Stores</th>
              <th>Assign Store</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.phone_number}</td>
                <td>
                  {u.role.map((r) => (
                    <div key={r._id}>
                      {r.name}{" "}
                      <button
                        className={styles.removeBtn}
                        onClick={() => handleRemoveRole(u._id, r._id)}
                      >
                        ❌
                      </button>
                    </div>
                  ))}
                </td>
                <td>
                  <Select
                    options={roles.map((r) => ({ value: r._id, label: r.name }))}
                    onChange={(selected) => handleAddRole(u._id, selected.value)}
                    placeholder="Select role"
                    classNamePrefix="select"
                  />
                </td>
                <td>
                  {u.appointedStore?.map((store) =>
                    store && store._id ? (
                      <div key={store._id}>
                        {store.name}{" "}
                        <button
                          className={styles.removeBtn}
                          onClick={() => handleRemoveAppointedStore(u._id, store._id)}
                        >
                          ❌
                        </button>
                      </div>
                    ) : null
                  )}
                </td>
                <td>
                  <Select
                    options={stores.map((s) => ({ value: s._id, label: s.name }))}
                    onChange={(selected) => handleAddAppointedStore(u._id, selected)}
                    placeholder="Assign store"
                    classNamePrefix="select"
                  />
                </td>
                <td>
                  <button
                    className={`${styles.blockBtn} ${
                      u.blockStatus === "block" ? styles.unblock : styles.block
                    }`}
                    onClick={() => toggleBlockStatus(u._id, u.blockStatus)}
                  >
                    {u.blockStatus === "block" ? "Unblock" : "Block"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ManageUsers;
