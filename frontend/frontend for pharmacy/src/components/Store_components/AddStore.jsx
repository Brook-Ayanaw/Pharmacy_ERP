import { useState, useEffect } from "react";
import styles from "./AddStore.module.css";

function AddStore() {
    const [entities, setEntities] = useState([]);
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({
        name: "",
        entity: "",
        contactPersons: [],
    });
    const [selectedUserId, setSelectedUserId] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [entitiesRes, usersRes] = await Promise.all([
                    fetch("http://localhost:3000/entity/all"),
                    fetch("http://localhost:3000/user/all"),
                ]);

                const entitiesData = await entitiesRes.json();
                const usersData = await usersRes.json();

                if (entitiesRes.ok) setEntities(entitiesData);
                if (usersRes.ok) setUsers(usersData);
            } catch (err) {
                setMessage("Failed to load required data.");
            }
        };

        fetchData();
    }, []);

    const handleChange = (e, field) => {
        setFormData({ ...formData, [field]: e.target.value });
    };

    const handleSelectUser = () => {
        const user = users.find((u) => u._id === selectedUserId);
        if (!user || formData.contactPersons.some((u) => u._id === user._id)) return;

        setFormData({
            ...formData,
            contactPersons: [...formData.contactPersons, user],
        });

        setSelectedUserId(""); // reset after selection
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

            const res = await fetch("http://localhost:3000/store/add", {
                method: "POST",
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
                setMessage("Store added successfully!");
                setFormData({ name: "", entity: "", contactPersons: [] });
            } else {
                setMessage(data.message || "Failed to add store.");
            }
        } catch (err) {
            setMessage("Submission error.");
        }
    };

    return (
        <div className={styles.container}>
            <h2>Add Store</h2>
            <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                    <label>Store Name:</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange(e, "name")}
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Select Entity:</label>
                    <select
                        value={formData.entity}
                        onChange={(e) => handleChange(e, "entity")}
                        required
                    >
                        <option value="">-- Select an entity --</option>
                        {entities.map((entity) => (
                            <option key={entity._id} value={entity._id}>
                                {entity.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.formGroup}>
                    <label>Add Contact Person:</label>
                    <div className={styles.contactSelectRow}>
                        <select
                            value={selectedUserId}
                            onChange={(e) => setSelectedUserId(e.target.value)}
                        >
                            <option value="">-- Select a user --</option>
                            {users.map((user) => (
                                <option key={user._id} value={user._id}>
                                    {user.name} ({user.phone_number})
                                </option>
                            ))}
                        </select>
                        <button type="button" onClick={handleSelectUser}>
                            Add
                        </button>
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label>Selected Contact Persons:</label>
                    {formData.contactPersons.length === 0 ? (
                        <p>No contact person selected.</p>
                    ) : (
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
                    )}
                </div>

                <button type="submit" className={styles.submitButton}>
                    Submit
                </button>
            </form>
            {message && <p className={styles.message}>{message}</p>}
        </div>
    );
}

export default AddStore;
