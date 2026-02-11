import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import { Transactions } from "./pages/Transactions";
import { Categories } from "./pages/Categories";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path={"/transactions"} element={<Transactions />} />
        <Route path={"/categories"} element={<Categories />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
