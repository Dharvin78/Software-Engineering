"use client";

interface AssetCardProps {
  name: string;
  type: string;
}

export default function AssetCard({ name, type }: AssetCardProps) {
  return (
    <div style={{ border: "1px solid #ccc", padding: "1rem", width: "200px" }}>
      <p>{name}</p>
      <p>{type}</p>
    </div>
  );
}
