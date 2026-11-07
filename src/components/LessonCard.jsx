function LessonCard({ title, onSelect, isSelected }) {
  return (
    <button
      type="button"
      className={`lesson-card ${isSelected ? 'is-selected' : ''}`}
      onClick={onSelect}
      aria-pressed={isSelected}
    >
      {title}
    </button>
  )
}

export default LessonCard
