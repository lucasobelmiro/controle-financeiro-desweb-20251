export default function Card({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        width: 420,
        background: "#fff",
        borderRadius: 8,
        boxShadow: "0 4px 16px rgba(0,0,0,.08)",
        padding: 24,
      }}
    >
      {title && (
        <h1
          style={{
            textAlign: "center",
            fontSize: 28,
            margin: "8px 0 24px",
            color: "#333",
          }}
        >
          {title}
        </h1>
      )}
      {children}
    </div>
  );
}
