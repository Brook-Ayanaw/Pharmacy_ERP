import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./EditProfile.module.css";
import { jwtDecode } from "jwt-decode";

function EditProfile() {
  const [formData, setFormData] = useState({
    email: "",
    phone_number: "",
    password: ""
  });
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setMessage("User not logged in");
        return;
      }

      const decoded = jwtDecode(token);
      const userId = decoded._id || decoded.id;

      if (!userId) {
        setMessage("Invalid token: no user ID");
        return;
      }

      const res = await axios.get(`http://localhost:3000/user/userById/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setFormData({
        email: res.data.email,
        phone_number: res.data.phone_number,
        password: ""
      });
    } catch (err) {
      console.error(err);
      setMessage("Failed to fetch profile data.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setSuccess(false);

    try {
      const token = localStorage.getItem("token");
      await axios.put("http://localhost:3000/user/edit-profile", formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setSuccess(true);
      setFormData((prev) => ({ ...prev, password: "" }));
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update profile.");
    }
  };

  return (
    <div className={styles.container}>
      <h2>Edit My Profile</h2>

      {message && <p className={styles.error}>{message}</p>}
      {success && <p className={styles.success}>Profile updated successfully ✅</p>}

      <form className={styles.form} onSubmit={handleSubmit}>
        <label>Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          autoComplete="email"
          required
        />

        <label>Phone Number</label>
        <input
          type="text"
          name="phone_number"
          value={formData.phone_number}
          onChange={handleChange}
          autoComplete="tel"
          required
        />

        <label>New Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          autoComplete="new-password"
          placeholder="Leave empty to keep current password"
        />

        <button type="submit" className={styles.saveBtn}>Save Changes</button>
      </form>
    </div>
  );
}

export default EditProfile;