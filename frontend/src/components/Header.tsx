import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export function Header() {
    const location = useLocation();
    const navigate = useNavigate();

    // Hide header on login routes
    const hideOnRoutes = ["/", "/login"];
    if (hideOnRoutes.includes(location.pathname)) return null;

    const isActive = (path: string) => location.pathname === path;

    const linkClass = (path: string) => {
        const active = isActive(path);
        return [
            "relative inline-flex items-center rounded-md px-3 py-1.5 text-sm font-semibold transition",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
            active
                ? "bg-white/15 text-white"
                : "text-white/85 hover:text-white hover:bg-white/10",
        ].join(" ");
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("userId");
        navigate("/", { replace: true });
    };

    return (
        <header className="sticky top-0 z-50 bg-gradient-to-r from-green-800 to-green-700 shadow-md">
            <div className="mx-auto max-w-7xl px-4">
                <div className="flex h-25 items-center justify-between">
                    {/* Left: Logo + Brand */}
                    <div className="flex items-center gap-3">
                        <img
                            src={logo}
                            alt="MyWallet Logo"
                            className="h-20 w-20 rounded bg-white/90 p-1 object-contain"
                        />
                        <span className="text-xl font-bold tracking-tight text-white">
              MyWallet
            </span>
                    </div>

                    {/* Right: Nav */}
                    <nav className="flex items-center gap-2 sm:gap-3">
                        <Link to="/dashboard" className={linkClass("/dashboard")}>
                            Dashboard
                        </Link>

                        <Link to="/transactions" className={linkClass("/transactions")}>
                            Transactions
                        </Link>

                        <Link to="/categories" className={linkClass("/categories")}>
                            Categories
                        </Link>

                        <button
                            onClick={handleLogout}
                            className="ml-2 inline-flex items-center rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-green-800 transition hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                        >
                            Logout
                        </button>
                    </nav>
                </div>
            </div>
        </header>
    );
}