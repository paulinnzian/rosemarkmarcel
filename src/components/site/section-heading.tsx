import { Decorated } from "@/components/site/decorated";
import type { Heading } from "@/content/schema";

type SectionHeadingProps = {
  as: "h1" | "h2";
  heading: Heading;
  id?: string;
  /** Couleur des lignes avant highlightFrom. */
  className?: string;
  /** Couleur des lignes à partir de highlightFrom. */
  highlightClassName?: string;
};

export function SectionHeading({
  as: Tag,
  heading,
  id,
  className = "text-ink",
  highlightClassName = "text-accent",
}: SectionHeadingProps) {
  const size = Tag === "h1" ? "text-h1" : "text-h2";
  const { highlightFrom } = heading;

  return (
    <Tag id={id} className={`${size} text-balance ${className}`}>
      {heading.lines.map((line, index) => (
        <span key={index} className={`block ${highlightFrom !== null && index >= highlightFrom ? highlightClassName : ""}`}>
          <Decorated text={line} />
        </span>
      ))}
    </Tag>
  );
}
