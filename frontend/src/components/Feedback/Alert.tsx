export default function Alert({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: "10px 12px",
        borderRadius: 6,
        background: "#fdecea",
        color: "#c0392b",
        border: "1px solid #f5c6cb",
      }}
    >
      {children}
    </div>
  );
}
