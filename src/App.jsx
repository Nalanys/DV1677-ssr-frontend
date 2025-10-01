import { Outlet } from "react-router-dom";
import Header from "./components/includes/Header";
import Footer from "./components/includes/Footer";
import "./App.css";

export default function App() {
  return (
    <>
      <Header />
      <main className="main">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
