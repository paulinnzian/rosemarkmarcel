import { cacheLife } from "next/cache";

// new Date() est interdit pendant le prérendu (cacheComponents) : l'année est calculée dans un cache d'un jour.
async function currentYear(): Promise<number> {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

export async function SiteFooter({ creatorName, footerLine }: { creatorName: string; footerLine: string }) {
  const year = await currentYear();

  return (
    <footer className="border-t border-line">
      <div className="container-site flex flex-col gap-2 py-[35px] text-xs text-muted lg:flex-row lg:items-center lg:justify-between">
        <p className="font-bold uppercase text-ink">{creatorName}.</p>
        <p>{footerLine}</p>
        <p>
          © {year} {creatorName}
        </p>
      </div>
    </footer>
  );
}
