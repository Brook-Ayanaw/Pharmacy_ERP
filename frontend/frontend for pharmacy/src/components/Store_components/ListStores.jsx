import { useEffect, useState } from "react";
import styles from "./ListStore.module.css";

function ListStore() {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchStores = async () => {
            try {
                const res = await fetch("https://pharmacy-erp.onrender.com/store/all");
                const data = await res.json();

                if (res.ok) {
                    setStores(data);
                } else {
                    setError(data.message || "Failed to fetch stores");
                }
            } catch (err) {
                setError("Error fetching stores");
            } finally {
                setLoading(false);
            }
        };

        fetchStores();
    }, []);

    if (loading) return <p className={styles.loading}>Loading...</p>;
    if (error) return <p className={styles.error}>{error}</p>;

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Store List</h2>
            {stores.length === 0 ? (
                <p>No stores found.</p>
            ) : (
                <ul className={styles.list}>
                    {stores.map((store) => (
                        <li key={store._id} className={styles.card}>
                            <h3>{store.name}</h3>
                            <p><strong>Entity:</strong> {store.entity?.name || "N/A"}</p>
                            <div>
                                <strong>Contact Persons:</strong>
                                <ul className={styles.subList}>
                                    {store.contactPersons && store.contactPersons.length > 0 ? (
                                        store.contactPersons.map((person, idx) => (
                                            <li key={idx}>
                                                {person.name} - {person.phone_number}
                                            </li>
                                        ))
                                    ) : (
                                        <li>No contact persons</li>
                                    )}
                                </ul>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default ListStore;
