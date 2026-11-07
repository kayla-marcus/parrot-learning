function SubjectCard({ title, description, icon, isSelected, onSelect }) {
  return (
    <button
      type="button"
      className={`subject-card ${isSelected ? 'is-selected' : ''}`}
      onClick={onSelect}
      aria-pressed={isSelected}
    >
      <span className="subject-card__content">
        {icon ? <span className="subject-card__icon" aria-hidden="true">{icon}</span> : null}
        <span className="subject-card__text">
          <span className="subject-card__title">{title}</span>
          <span className="subject-card__description">{description}</span>
        </span>
      </span>
    </button>
  )
}

export default SubjectCard
