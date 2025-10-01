import { Link } from "react-router-dom";

export default function DocsList({ docs }) {
  return (
    <div>
      <h2>Documents</h2>
      {(!docs || docs.length === 0) && <p>No documents yet.</p>}
      {docs?.map((doc) => (
        <h3 key={doc.id}>
          <Link to={`/${doc.id}`}>{doc.title ?? "untitled"}</Link>
        </h3>
      ))}
    </div>
  );
}
