import type { Route } from "./+types/$id";
import { Form, redirect, useLoaderData } from "react-router";

const API_BASE = import.meta.env.VITE_API_BASE as string;

type Doc = { id: string; title: string; content: string };
type LoaderData = { doc: Doc };

export async function loader({ params }: Route.LoaderArgs): Promise<LoaderData> {
  const { id } = params;
  if (!id) throw new Response("Missing id", { status: 400 });

  const res = await fetch(`${API_BASE}/${id}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) throw new Response("Not found", { status: res.status });

  const data = (await res.json()) as { _id?: string; id?: string; title?: string; content?: string };
  const doc: Doc = {
    id: String(data._id ?? data.id ?? id),
    title: data.title ?? "",
    content: data.content ?? "",
  };

  return { doc };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "");
  const content = String(formData.get("content") || "");
  if (!id) throw new Response("Missing id", { status: 400 });

  const res = await fetch(`${API_BASE}/update`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ id, title, content }),
  });

  if (!res.ok) throw new Response("Failed to update", { status: res.status });
  return redirect(`/`);
}

export function meta({ params }: Route.MetaArgs) {
  return [{ title: `Documents - ${params.id ?? ""}` }];
}

export default function DocRoute() {
  const { doc } = useLoaderData<LoaderData>();

  return (
    <>
      <h2>Dokument</h2>
      <Form method="post" className="new-doc">
        <input type="hidden" name="id" value={doc.id} />

        <label htmlFor="title">Titel</label>
        <input type="text" name="title" defaultValue={doc.title} />

        <label htmlFor="content">Innehåll</label>
        <textarea name="content" defaultValue={doc.content} />

        <input type="submit" value="Uppdatera" />
      </Form>
    </>
  );
}
