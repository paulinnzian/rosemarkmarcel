import { Decorated } from "@/components/site/decorated";
import { HeroImage } from "@/components/site/hero-image";
import type { SiteContent } from "@/content/schema";

type HeroPhotoProps = {
  photo: SiteContent["photo"];
  label: SiteContent["photoLabel"];
  /** Affiché dans le cadre si la photo ne charge pas. */
  fallbackText: string;
};

export function HeroPhoto({ photo, label, fallbackText }: HeroPhotoProps) {
  return (
    <figure className="relative mx-auto w-full max-w-[604px]">
      <div className="radius-photo aspect-hero-photo relative overflow-hidden bg-tint">
        <HeroImage photo={photo} fallbackText={fallbackText} />
      </div>
      <figcaption className="absolute bottom-6 left-3 -rotate-5 bg-canvas px-[22px] py-[15px] text-ink shadow-label lg:-left-6">
        <span className="block text-kicker uppercase">{label.kicker}</span>
        <span className="block text-label">
          <Decorated text={label.text} />
        </span>
      </figcaption>
    </figure>
  );
}
