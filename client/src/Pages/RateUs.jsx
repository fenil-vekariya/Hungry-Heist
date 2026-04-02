import { useState } from "react";
import API from "../services/api";

function RateUs() {
    const [formData, setFormData] = useState({
        user: "",
        message: "",
        rating: 5,
    });
    const [status, setStatus] = useState({ type: "", message: "" });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: "", message: "" });

        try {
            const res = await API.post("/feedback", formData);
            setStatus({ type: "success", message: res.data.message || "Feedback submitted successfully!" });
            setFormData({ user: "", message: "", rating: 5 });
        } catch (error) {
            console.error(error);
            const errorMsg = error.response?.data?.message || "Something went wrong. Please try again.";
            setStatus({ type: "error", message: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <div className="form-card" style={{ maxWidth: '500px', width: '100%', padding: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', borderRadius: '8px', backgroundColor: '#fff' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#ff4d4d' }}>Rate Our Platform</h2>

                {status.message && (
                    <div style={{
                        padding: '10px',
                        marginBottom: '15px',
                        borderRadius: '4px',
                        backgroundColor: status.type === 'success' ? '#d4edda' : '#f8d7da',
                        color: status.type === 'success' ? '#155724' : '#721c24'
                    }}>
                        {status.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Name</label>
                        <input
                            type="text"
                            name="user"
                            value={formData.user}
                            onChange={handleChange}
                            placeholder="Enter your name"
                            required
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Rating</label>
                        <select
                            name="rating"
                            value={formData.rating}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                        >
                            <option value="5">5 - Excellent</option>
                            <option value="4">4 - Good</option>
                            <option value="3">3 - Average</option>
                            <option value="2">2 - Poor</option>
                            <option value="1">1 - Terrible</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Message</label>
                        <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Enter your feedback message"
                            required
                            rows="4"
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: '12px',
                            backgroundColor: '#ff4d4d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontWeight: 'bold',
                            marginTop: '10px'
                        }}
                    >
                        {loading ? "Submitting..." : "Submit Feedback"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default RateUs;
