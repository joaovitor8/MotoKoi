import icones from "./icones.json";

// A seta para baixo aparece nas telas, mas não está no icones.json do design.
const todos = { ...icones, "chevron-down": '<path d="m6 9 6 6 6-6"/>' };

export function Icone({ nome }: { nome: keyof typeof todos }) {
  return (
    <svg
      // "mk-ico" fica como nome de referência: os componentes ajustam o tamanho e a cor do ícone por ele
      // (ex.: [&_.mk-ico]:text-[20px]). O tamanho segue o font-size do pai, por isso 1em.
      className="mk-ico block size-[1em] flex-none"
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
