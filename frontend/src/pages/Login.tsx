import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (isRegister: boolean) => {
        setError("");
        try {
            const response = await fetch(
                `/api/users/upsert?email=${encodeURIComponent(email)}&username=${encodeURIComponent(email.split("@")[0])}`,
                { method: "POST" }
            );

            if (!response.ok) {
                throw new Error("Authentication failed");
            }

            const user = await response.json();
            localStorage.setItem("userId", user.id);
            navigate("/dashboard");
        } catch (err) {
            setError("Failed to authenticate. Please try again.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-blue-50">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
                    MyWallet
                </h1>

                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
                )}

                <div className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                    <button
                        onClick={() => handleSubmit(false)}
                        className="w-full bg-blue-500 text-white p-3 rounded-lg font-semibold hover:bg-blue-600"
                    >
                        Log In
                    </button>
                    <button
                        onClick={() => handleSubmit(true)}
                        className="w-full text-blue-500 font-semibold hover:underline"
                    >
                        Register
                    </button>
                </div>
            </div>
        </div>
    );
}



