export function ConceptCard({ lines }: { lines: [string, string] }) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-accent px-[35px] py-[58px]">
      <span aria-hidden="true" className="absolute -right-12 -top-12 size-44 rounded-full border-[18px] border-sky" />
      <p className="relative text-h2 text-on-accent">
        <span className="block">{lines[0]}</span>
        <span className="block text-highlight">{lines[1]}</span>
      </p>
    </div>
  );
}
