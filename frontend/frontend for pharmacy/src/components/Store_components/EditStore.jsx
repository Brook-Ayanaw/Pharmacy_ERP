import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import styles from "./EditStore.module.css";

function EditStore() {
    const [stores, setStores] = useState([]);
    const [entities, setEntities] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedStoreId, setSelectedStoreId] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        entity: "",
        contactPersons: [],
    });
    const [message, setMessage] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);

    // ✅ Decode JWT and check for admin role
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const decoded = jwtDecode(token);
            const roles = decoded.roleByName || [];
            setIsAdmin(roles.includes("admin"));
        } catch (err) {
            console.error("Invalid token", err);
        }
    }, []);

    // ✅ Fetch store, entity, and user data
    useEffect(() => {
        if (!isAdmin) return;

        const fetchData = async () => {
            try {
                const [storeRes, entityRes, userRes] = await Promise.all([
                    fetch("http://localhost:3000/store/all"),
                    fetch("http://localhost:3000/entity/all"),
                    fetch("http://localhost:3000/user/all"),
                ]);

                const [storeData, entityData, userData] = await Promise.all([
                    storeRes.json(),
                    entityRes.json(),
                    userRes.json(),
                ]);

                if (storeRes.ok) setStores(storeData);
                if (entityRes.ok) setEntities(entityData);
                if (userRes.ok) setUsers(userData);
            } catch (err) {
                setMessage("Error fetching data.");
            }
        };

        fetchData();
    }, [isAdmin]);

    // ✅ When a store is selected, load its data into form
    useEffect(() => {
        if (!selectedStoreId) return;
        const store = stores.find((s) => s._id === selectedStoreId);
        if (store) {
            setFormData({
                name: store.name,
                entity: store.entity?._id || "",
                contactPersons: store.contactPersons || [],
            });
        }
    }, [selectedStoreId, stores]);

    const handleChange = (e, field) => {
        setFormData({ ...formData, [field]: e.target.value });
    };

    const handleSelectUser = (id) => {
        const user = users.find((u) => u._id === id);
        if (user && !formData.contactPersons.some((u) => u._id === user._id)) {
            setFormData({
                ...formData,
                contactPersons: [...formData.contactPersons, user],
            });
        }
    };

    const removeContactPerson = (id) => {
        setFormData({
            ...formData,
            contactPersons: formData.contactPersons.filter((u) => u._id !== id),
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");

            const res = await fetch(`http://localhost:3000/store/edit/${selectedStoreId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...formData,
                    contactPersons: formData.contactPersons.map((u) => u._id),
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage("✅ Store updated successfully!");
            } else {
                setMessage(data.message || "❌ Update failed.");
            }
        } catch (err) {
            setMessage("❌ Error while updating store.");
        }
    };

    // ✅ Block access for non-admin users
    if (!isAdmin) {
        return <p className={styles.message}>❌ Access denied: Admins only.</p>;
    }

    return (
        <div className={styles.container}>
            <h2>Edit Store</h2>

            <div className={styles.formGroup}>
                <label>Select a Store:</label>
                <select
                    value={selectedStoreId}
                    onChange={(e) => setSelectedStoreId(e.target.value)}
                >
                    <option value="">-- Choose a store --</option>
                    {stores.map((store) => (
                        <option key={store._id} value={store._id}>
                            {store.name}
                        </option>
                    ))}
                </select>
            </div>

            {selectedStoreId && (
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label>Store Name:</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleChange(e, "name")}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Entity:</label>
                        <select
                            value={formData.entity}
                            onChange={(e) => handleChange(e, "entity")}
                        >
                            <option value="">-- Select an entity --</option>
                            {entities.map((ent) => (
                                <option key={ent._id} value={ent._id}>
                                    {ent.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Contact Persons:</label>
                        <select onChange={(e) => handleSelectUser(e.target.value)}>
                            <option value="">-- Add a contact person --</option>
                            {users.map((user) => (
                                <option key={user._id} value={user._id}>
                                    {user.name} ({user.phone_number})
                                </option>
                            ))}
                        </select>

                        <ul className={styles.selectedList}>
                            {formData.contactPersons.map((user) => (
                                <li key={user._id}>
                                    {user.name} ({user.phone_number}){" "}
                                    <button type="button" onClick={() => removeContactPerson(user._id)}>
                                        ❌
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <button type="submit" className={styles.submitButton}>Save Changes</button>
                </form>
            )}

            {message && <p className={styles.message}>{message}</p>}
        </div>
    );
}

export default EditStore;
