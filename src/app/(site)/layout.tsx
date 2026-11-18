import { Rodape } from "@/components/Rodape";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="min-h-full bg-bg text-text font-sans overflow-x-hidden">
      {children}
      <Rodape />
    </div>
  );
}
