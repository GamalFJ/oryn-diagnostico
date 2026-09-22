export function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      <div
        data-anim="a"
        className="ambient-shape"
        style={{
          top: "-10%",
          left: "-10%",
          width: "55vw",
          height: "55vw",
          background: "radial-gradient(circle, #8368ff 0%, transparent 70%)",
          opacity: 0.16,
        }}
      />
      <div
        data-anim="b"
        className="ambient-shape"
        style={{
          bottom: "-15%",
          right: "-15%",
          width: "60vw",
          height: "60vw",
          background: "radial-gradient(circle, #5b4fd6 0%, transparent 70%)",
          opacity: 0.14,
        }}
      />
      <div
        data-anim="c"
        className="ambient-shape"
        style={{
          top: "30%",
          right: "10%",
          width: "38vw",
          height: "38vw",
          background: "radial-gradient(circle, #8368ff 0%, transparent 70%)",
          opacity: 0.1,
        }}
      />
    </div>
  );
}
