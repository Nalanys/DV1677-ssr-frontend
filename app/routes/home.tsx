import type { Route } from "./+types/home";
import { redirect, useLoaderData } from "react-router";
import HomePage from "../pages/HomePage";
import type { DocListItem } from "../components/DocsList";

const API_BASE = import.meta.env.VITE_API_BASE as string;

type LoaderData = { docs: DocListItem[] };

export async function loader(): Promise<LoaderData> {
  const res = await fetch(`${API_BASE}/`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) throw new Response("Failed to fetch docs", { status: res.status });

  const raw = (await res.json()) as Array<{ _id?: string; id?: string | number; title?: string }>;
  const docs: DocListItem[] = raw.map((d) => ({
    id: String(d._id ?? d.id),
    title: d.title ?? "untitled",
  }));

  return { docs };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData) as Record<string, string>;

  const res = await fetch(`${API_BASE}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Response("Failed to create", { status: res.status });

  const { id } = (await res.json()) as { id: string };
  return redirect(`/${id}`);
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "SSR Editor - Home" },
    { name: "description", content: "List documents and create new ones" },
  ];
}

export default function HomeRoute() {
  const { docs } = useLoaderData<LoaderData>();
  return <HomePage docs={docs} />;
}
