import Link from "next/link";

export async function SiteFooter({ creatorName, footerLine }: { creatorName: string; footerLine: string }) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line">
      <div className="container-site flex flex-col gap-2 py-[35px] text-sm text-muted lg:flex-row lg:items-center lg:justify-between">
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
