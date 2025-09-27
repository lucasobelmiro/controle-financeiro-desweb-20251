export default function Button({
  loading,
  fullWidth,
  children,
  ...rest
}: Props) {
  const disabled = loading || rest.disabled;
  return (
    <button
      {...rest}
      disabled={disabled}
      style={{
        width: fullWidth ? "100%" : undefined,
        height: 44,
        border: "none",
        borderRadius: 8,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        background: disabled ? "#bdbdbd" : "#6b6b6b",
        color: "#fff",
        opacity: 1,
      }}
    >
      {loading ? "Processando..." : children}
    </button>
  );
}
