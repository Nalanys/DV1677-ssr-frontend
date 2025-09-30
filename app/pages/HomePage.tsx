import React from "react";
import CreateForm from "../components/CreateForm";
import DocsList, { type DocListItem } from "../components/DocsList";

export interface HomePageProps {
  docs: DocListItem[];
}

const HomePage: React.FC<HomePageProps> = ({ docs }) => {
  return (
    <div>
      <DocsList docs={docs} />
      <CreateForm />
    </div>
  );
};

export default HomePage;
