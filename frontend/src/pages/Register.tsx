import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, name, password }),
      });

      if (!response.ok) {
        let message = `Registration failed (${response.status})`;
        try {
          const err = await response.json();
          if (err?.message) message = `${message}: ${err.message}`;
        } catch {}
        throw new Error(message);
      }

      navigate("/login");
    } catch (err) {
      setError(
        err instanceof Error ?
          err.message
        : "Failed to register. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-black-300 mb-8">
          Create Account
        </h1>

        {error && (
          <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="name"
            placeholder="Username"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-green-600 text-white p-3 rounded-full font-semibold hover:bg-green-700 disabled:opacity-60 transition"
          >
            {loading ? "Registering..." : "Register"}
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full text-green-500 font-semibold hover:underline"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
