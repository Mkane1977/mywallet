import { Link, useLocation, useNavigate } from "react-router-dom";

import logo from "../assets/logo.png";


export function Header() {
    const location = useLocation();
    const navigate = useNavigate();

    const getLinkClass = (path: string) => {
        return location.pathname === path
            ? "text-blue-600 hover:text-blue-800"
            : "text-gray-600 hover:text-gray-800";
    };

    const handleLogout = () => {
        // Adjust these keys to match what you store on login ( for JWT)
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/", { replace: true });
    };

    return (
        <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <img
                        src={logo}
                        alt="MyWallet Logo"
                        className="w-30 h-30 object-contain"
                    />
                    <span className="text-xl font-bold text-gray-900">
        MyWallet
    </span>
                </div>
                <nav className="flex gap-6">
                    <Link to="/dashboard" className={getLinkClass("/dashboard")}>
                        Dashboard
                    </Link>
                    <Link to="/transactions" className={getLinkClass("/transactions")}>
                        Transactions
                    </Link>
                    <Link to="/categories" className={getLinkClass("/categories")}>
                        Categories
                    </Link>

                    <button
                        onClick={handleLogout}
                        className="ml-2 rounded bg-green-500 px-3 py-1 text-white hover:bg-green-600 transition"
                    >
                        Logout
                    </button>
                    
                </nav>
            </div>
        </header>
    );
}

