type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  style?: React.CSSProperties;
};

export default function Input({ label, error, style, ...rest }: Props) {
  const id = rest.id || rest.name || String(Math.random());

  const base: React.CSSProperties = {
    width: "100%",
    height: 44,
    padding: "0 12px",
    borderRadius: 6,
    border: "1px solid #d0d0d0",
    outline: "none",
    background: "#fff",
    color: "#333",
  };

  return (
    <div style={{ display: "grid", gap: 6 }}>
      {label && (
        <label htmlFor={id} style={{ fontSize: 12, color: "#666" }}>
          {label}
        </label>
      )}
      <input id={id} {...rest} style={{ ...base, ...style }} />
      {error && <small style={{ color: "#c0392b" }}>{error}</small>}
    </div>
  );
}
