import icones from "./icones.json";

// A seta para baixo aparece nas telas, mas não está no icones.json do design.
const todos = { ...icones, "chevron-down": '<path d="m6 9 6 6 6-6"/>' };

export function Icone({ nome }: { nome: keyof typeof todos }) {
  return (
    <svg
      className="mk-ico"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: todos[nome] }}
    />
  );
}
