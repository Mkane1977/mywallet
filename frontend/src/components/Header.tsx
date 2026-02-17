import { Link, useLocation } from "react-router-dom";

export function Header() {
    const location = useLocation();

    const getLinkClass = (path: string) => {
        return location.pathname === path
            ? "text-blue-600 hover:text-blue-800"
            : "text-gray-600 hover:text-gray-800";
    };

    return (
        <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-gray-900">MyWallet</h1>
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
                </nav>
            </div>
        </header>
    );
}

