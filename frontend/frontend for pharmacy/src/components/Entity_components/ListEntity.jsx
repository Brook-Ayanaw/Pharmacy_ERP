import { useEffect, useState } from "react";
import styles from "./ListEntity.module.css";

function ListEntity() {
    const [entities, setEntities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchEntities = async () => {
            try {
                const response = await fetch("https://pharmacy-erp.onrender.com/entity/all");
                const data = await response.json();

                if (response.ok) {
                    setEntities(data);
                } else {
                    setError(data.message || "Failed to fetch entities");
                }
            } catch (err) {
                setError("An error occurred while fetching entities.");
            } finally {
                setLoading(false);
            }
        };

        fetchEntities();
    }, []);

    if (loading) return <p className={styles.loading}>Loading...</p>;
    if (error) return <p className={styles.error}>{error}</p>;

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Entities</h2>
            {entities.length === 0 ? (
                <p>No entities found.</p>
            ) : (
                <ul className={styles.list}>
                    {entities.map((entity) => (
                        <li key={entity._id} className={styles.card}>
                            <h3>{entity.name}</h3>
                            <p><strong>Address:</strong> {entity.address}</p>
                            <p><strong>Phone:</strong> {entity.phoneNumbers?.join(", ")}</p>
                            <p><strong>Account Numbers:</strong> {entity.accountNumbers?.join(", ")}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default ListEntity;
