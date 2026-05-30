export function SectionHeading({ eyebrow, title, description, align = "split" }) {
  return (
    <div className={align === "stack" ? "section-heading stack" : "section-heading"}>
      <div>
        <p className="section-tag">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      <p>{description}</p>
    </div>
  );
}
