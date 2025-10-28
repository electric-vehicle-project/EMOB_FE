import React from "react";

const SectionTitle = ({ text }: { text: string }) => {
  return (
    <h2 style={{ textAlign: "center", marginBottom: 20, color: "#76885b" }}>
      {<span className="text-3xl font-bold text-900 mb-2">{text}</span>}
    </h2>
  );
};

export default SectionTitle;
