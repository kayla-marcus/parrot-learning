function Sidebar({ grades, activeGrade, onSelectGrade }) {
  return (
    <aside className="sidebar" aria-label="Grade navigation">
      <nav className="grade-nav" aria-label="Grade levels">
        {grades.map((grade) => (
          <button
            key={grade}
            type="button"
            className={`grade-button ${activeGrade === grade ? 'is-active' : ''}`}
            onClick={() => onSelectGrade(grade)}
            aria-pressed={activeGrade === grade}
          >
            <span className="grade-button__text">{grade}</span>
          </button>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
