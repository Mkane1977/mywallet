export default function Landing() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-blue-50">
            <div className="bg-white p-10 rounded-2xl shadow-lg text-center max-w-md w-full">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">MyWallet</h1>
                <p className="text-gray-600 mb-8">
                    Track your income and expenses. Take control of your finances.
                </p>
                <a
                    href="/login"
                    className="block w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition"
                >
                    Get Started
                </a>
            </div>
        </div>
    );
}


