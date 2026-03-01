import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export function Header() {
    const location = useLocation();
    const navigate = useNavigate();

    const getLinkClass = (path: string) => {
        const isActive = location.pathname === path;

        return `
      relative px-1 py-2 text-sm font-semibold transition
      ${
            isActive
                ? "text-green-900"
                : "text-green-600 hover:text-green-800"
        }
    `;
    };

    const getIndicator = (path: string) => {
        return location.pathname === path
            ? "absolute left-0 -bottom-1 h-0.5 w-full bg-green-600 rounded"
            : "";
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("userId");

        navigate("/", { replace: true });
    };

    return (
        <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <img
                        src={logo}
                        alt="MyWallet Logo"
                        className="w-10 h-10 object-contain"
                    />
                    <span className="text-xl font-bold text-green-900">
            MyWallet
          </span>
                </div>

                <nav className="flex items-center gap-6">
                    <div className="relative">
                        <Link to="/dashboard" className={getLinkClass("/dashboard")}>
                            Dashboard
                        </Link>
                        <span className={getIndicator("/dashboard")} />
                    </div>

                    <div className="relative">
                        <Link to="/transactions" className={getLinkClass("/transactions")}>
                            Transactions
                        </Link>
                        <span className={getIndicator("/transactions")} />
                    </div>

                    <div className="relative">
                        <Link to="/categories" className={getLinkClass("/categories")}>
                            Categories
                        </Link>
                        <span className={getIndicator("/categories")} />
                    </div>

                    <button
                        onClick={handleLogout}
                        className="ml-2 rounded bg-green-600 px-3 py-1 text-white hover:bg-green-700 transition"
                    >
                        Logout
                    </button>
                </nav>
            </div>
        </header>
    );
}