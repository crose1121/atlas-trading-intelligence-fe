import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout/MainLayout";
import LandingPage from "./pages/LandingPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
        </Route>

        {/* <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route> */}
      </Routes>
    </BrowserRouter>
  );
}
