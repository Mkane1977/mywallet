import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Categories } from "./pages/Categories";
import { Dashboard } from "./pages/Dashboard";
import {Login} from "./pages/Login";
import Register from "./pages/Register";
import { Transactions } from "./pages/Transactions";
import {Header} from "./components/Header";


const App = () => {
  return (
      <BrowserRouter>
        <Routes>
          {/* Public routes (no header) */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* App routes (with header) */}
          <Route
              path="/dashboard"
              element={
                <>
                  <Header />
                  <Dashboard />
                </>
              }
          />
          <Route
              path="/transactions"
              element={
                <>
                  <Header />
                  <Transactions />
                </>
              }
          />
          <Route
              path="/categories"
              element={
                <>
                  <Header />
                  <Categories />
                </>
              }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
  );
};

export default App;
