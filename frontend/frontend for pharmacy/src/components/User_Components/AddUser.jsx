import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./AddUser.module.css";
import { jwtDecode } from "jwt-decode";
import Select from "react-select";

function AddUser() {
  const [formData, setFormData] = useState({
    name: "",
    phone_number: "",
    email: "",
    password: "",
    role: []
  });

  const [roleOptions, setRoleOptions] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    checkIfAdmin();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchRoles();
    }
  }, [isAdmin]);

  const checkIfAdmin = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const decoded = jwtDecode(token);
      const roles = decoded.roleByName || [];

      setIsAdmin(roles.includes("admin"));
    } catch (err) {
      console.error("Invalid token:", err.message);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await axios.get("http://localhost:3000/role/all");
      const options = res.data.map((r) => ({
        value: r._id,
        label: r.name
      }));
      setRoleOptions(options);
    } catch (err) {
      console.error(err);
      setMessage("Failed to load roles.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleRoleChange = (selectedOptions) => {
    const selectedRoleIds = selectedOptions.map((opt) => opt.value);
    setFormData((f) => ({ ...f, role: selectedRoleIds }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      await axios.post("http://localhost:3000/user/add", formData);
      alert("User added successfully!");
      setFormData({
        name: "",
        phone_number: "",
        email: "",
        password: "",
        role: []
      });
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to add user.";
      setMessage(errorMsg);
    }
  };

  if (!isAdmin) {
    return (
      <div className={styles.container}>
        <h2>Access Denied</h2>
        <p className={styles.error}>Only admins can add new users.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2>Add New User</h2>
      {message && <p className={styles.error}>{message}</p>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
          autoComplete="name"
        />
        <input
          name="phone_number"
          placeholder="Phone Number"
          value={formData.phone_number}
          onChange={handleChange}
          required
          autoComplete="tel"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          autoComplete="email"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          autoComplete="new-password"
        />

        <label>Select Roles:</label>
        <Select
          isMulti
          options={roleOptions}
          classNamePrefix="select"
          onChange={handleRoleChange}
          placeholder="Select one or more roles"
        />

        <button type="submit" className={styles.submitBtn}>Add User</button>
      </form>
    </div>
  );
}

export default AddUser;
