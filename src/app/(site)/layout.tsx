import { Rodape } from "@/components/Rodape";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <div
      style={{
        minHeight: "100%",
        background: "var(--bg)",
        color: "var(--text)",
        fontFamily: "var(--font-sans)",
        overflowX: "hidden",
      }}
    >
      {children}
      <Rodape />
    </div>
  );
}
