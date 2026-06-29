export function RoutineCard({ routine }) {
  return (
    <article className="routine-card">
      <p className="eyebrow">Rutina sugerida</p>
      <h3>{routine.title}</h3>
      <p>{routine.description}</p>
    </article>
  );
}
