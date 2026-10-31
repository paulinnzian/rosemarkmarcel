import { cacheLife } from "next/cache";
import Link from "next/link";

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
        <p className="flex flex-wrap items-center gap-x-4">
          <span>
            © {year} {creatorName}
          </span>
          <Link href="/confidentialite" className="inline-flex min-h-11 items-center text-ink underline-offset-4 hover:underline">
            Confidentialité
          </Link>
        </p>
      </div>
    </footer>
  );
}
