import { RoutineCard } from "../ui/RoutineCard";
import { SectionHeading } from "../ui/SectionHeading";

export function ExperienceSection({ experience }) {
  return (
    <section className="experience-section">
      <div className="experience-panel">
        <SectionHeading
          eyebrow={experience.panel.eyebrow}
          title={experience.panel.title}
          description={experience.panel.description}
          align="stack"
        />
      </div>

      <div className="routine-grid">
        {experience.routines.map((routine) => (
          <RoutineCard key={routine.title} routine={routine} />
        ))}
      </div>
    </section>
  );
}
