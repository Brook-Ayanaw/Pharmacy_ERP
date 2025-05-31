import { useEffect, useState } from "react";
import styles from "./EditEntity.module.css";

function EditEntity() {
    const [entities, setEntities] = useState([]);
    const [selectedId, setSelectedId] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        phoneNumbers: [""],
        address: "",
        accountNumbers: [""],
    });

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    // Fetch all entities to populate the selector
    useEffect(() => {
        const fetchEntities = async () => {
            try {
                const res = await fetch("http://localhost:3000/entity/all");
                const data = await res.json();
                if (res.ok) {
                    setEntities(data);
                } else {
                    setMessage(data.message || "Failed to load entities.");
                }
            } catch (err) {
                setMessage("Error loading entities.");
            }
        };
        fetchEntities();
    }, []);

    // Fetch the selected entity when ID changes
    useEffect(() => {
        if (!selectedId) return;

        const fetchEntity = async () => {
            setLoading(true);
            try {
                const res = await fetch(`http://localhost:3000/entity/entityById/${selectedId}`);
                const data = await res.json();
                if (res.ok) {
                    setFormData({
                        name: data.name || "",
                        phoneNumbers: data.phoneNumbers || [""],
                        address: data.address || "",
                        accountNumbers: data.accountNumbers || [""],
                    });
                    setMessage("");
                } else {
                    setMessage(data.message || "Entity not found.");
                }
            } catch (error) {
                setMessage("Error fetching entity.");
            } finally {
                setLoading(false);
            }
        };

        fetchEntity();
    }, [selectedId]);

    const handleChange = (e, field, index = null) => {
        if (index !== null) {
            const updated = [...formData[field]];
            updated[index] = e.target.value;
            setFormData({ ...formData, [field]: updated });
        } else {
            setFormData({ ...formData, [field]: e.target.value });
        }
    };

    const addField = (field) => {
        setFormData({ ...formData, [field]: [...formData[field], ""] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");

            const res = await fetch(`http://localhost:3000/entity/edit/${selectedId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage("Entity updated successfully!");
            } else {
                setMessage(data.message || "Update failed.");
            }
        } catch (err) {
            setMessage("Something went wrong.");
        }
    };

    return (
        <div className={styles.container}>
            <h2>Edit Entity</h2>

            {/* Entity selector */}
            <div className={styles.formGroup}>
                <label>Select an Entity:</label>
                <select
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                    className={styles.select}
                >
                    <option value="">-- Choose an entity --</option>
                    {entities.map((entity) => (
                        <option key={entity._id} value={entity._id}>
                            {entity.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Form shown only if an entity is selected */}
            {selectedId && !loading && (
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label>Name:</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleChange(e, "name")}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Phone Numbers:</label>
                        {formData.phoneNumbers.map((num, index) => (
                            <input
                                key={index}
                                type="text"
                                value={num}
                                onChange={(e) => handleChange(e, "phoneNumbers", index)}
                            />
                        ))}
                        <button type="button" onClick={() => addField("phoneNumbers")}>
                            + Add Phone
                        </button>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Address:</label>
                        <input
                            type="text"
                            value={formData.address}
                            onChange={(e) => handleChange(e, "address")}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Account Numbers:</label>
                        {formData.accountNumbers.map((num, index) => (
                            <input
                                key={index}
                                type="text"
                                value={num}
                                onChange={(e) => handleChange(e, "accountNumbers", index)}
                            />
                        ))}
                        <button type="button" onClick={() => addField("accountNumbers")}>
                            + Add Account
                        </button>
                    </div>

                    <button type="submit" className={styles.saveButton}>Save Changes</button>
                </form>
            )}

            {loading && <p className={styles.loading}>Loading entity data...</p>}
            {message && <p className={styles.message}>{message}</p>}
        </div>
    );
}

export default EditEntity;
