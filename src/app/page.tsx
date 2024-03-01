import Image from "next/image";
import Navbar from "./Components/Navbar";
import HomeFooter from "./Components/HomeFooter";
import LandingPage from "./LandingPage/LandingPage";
import "./Style/genural.css"
export default function Home() {
  return (
    <main>
      <LandingPage />
    </main>
  );
}
