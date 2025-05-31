import { useState } from "react";
import styles from "./AddEntity.module.css";

function AddEntity() {
    const [formData, setFormData] = useState({
        name: "",
        phoneNumbers: [""],
        address: "",
        accountNumbers: [""],
    });

    const [message, setMessage] = useState("");

    const handleChange = (e, field, index = null) => {
        if (index !== null) {
            const updatedArray = [...formData[field]];
            updatedArray[index] = e.target.value;
            setFormData({ ...formData, [field]: updatedArray });
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

            const response = await fetch("http://localhost:3000/entity/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage("Entity added successfully!");
                setFormData({
                    name: "",
                    phoneNumbers: [""],
                    address: "",
                    accountNumbers: [""],
                });
            } else {
                setMessage(data.message || "Failed to add entity.");
            }
        } catch (error) {
            setMessage("An error occurred: " + error.message);
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Add Entity</h2>
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
                    {formData.phoneNumbers.map((phone, index) => (
                        <input
                            key={index}
                            type="text"
                            value={phone}
                            onChange={(e) => handleChange(e, "phoneNumbers", index)}
                        />
                    ))}
                    <div className={styles.buttonGroup}>
                        <button type="button" onClick={() => addField("phoneNumbers")}>
                            + Add Phone
                        </button>
                    </div>
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
                    {formData.accountNumbers.map((acc, index) => (
                        <input
                            key={index}
                            type="text"
                            value={acc}
                            onChange={(e) => handleChange(e, "accountNumbers", index)}
                        />
                    ))}
                    <div className={styles.buttonGroup}>
                        <button type="button" onClick={() => addField("accountNumbers")}>
                            + Add Account
                        </button>
                    </div>
                </div>
                <button className={styles.submitButton} type="submit">Submit</button>
            </form>
            {message && <p className={styles.message}>{message}</p>}
        </div>
    );
}

export default AddEntity;
