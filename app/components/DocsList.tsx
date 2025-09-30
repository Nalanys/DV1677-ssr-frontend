import React from "react";

export type DocListItem = { id: string | number; title: string };

interface DocsListProps {
  docs: DocListItem[];
}

const DocsList: React.FC<DocsListProps> = ({ docs }) => {
  if (!docs?.length) return <p>No documents yet.</p>;

  return (
    <>
      <h2>Documents</h2>
      {docs.map((doc) => (
        <h3 key={doc.id}>
          <a href={`/${doc.id}`}>{doc.title}</a>
        </h3>
      ))}
    </>
  );
};

export default DocsList;
