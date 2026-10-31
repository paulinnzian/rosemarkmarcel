// Squelette pendant la vérification de la session et la lecture de la base.
export default function AdminLoading() {
  return (
    <div aria-busy="true" aria-label="Chargement" className="grid gap-4">
      <div className="h-9 w-2/3 animate-pulse rounded-sm bg-line" />
      <div className="h-4 w-1/2 animate-pulse rounded-sm bg-line" />
      <div className="mt-4 h-40 animate-pulse rounded-lg bg-surface" />
      <div className="h-40 animate-pulse rounded-lg bg-surface" />
    </div>
  );
}
