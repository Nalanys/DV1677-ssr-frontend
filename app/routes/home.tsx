import type { Route } from "./+types/home";
import HomePage from "../pages/HomePage";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "SSR Editor - Home" },
    { name: "description", content: "Welcome to the homepage" },
  ];
}

export default function Home() {
  return <HomePage />;
}
