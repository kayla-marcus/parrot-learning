function LessonGroup({
  title,
  lessons,
  selectedLesson,
  onSelectLesson,
  lessonScores = {},
  lessonCompletionCounts = {},
  className = '',
}) {
  return (
    <section className={`lesson-group ${className}`.trim()} aria-labelledby={`${title}-heading`}>
      <h3 id={`${title}-heading`} className="lesson-group__title">
        {title}
      </h3>

      <ol className="lesson-group__list">
        {lessons.map((lesson) => {
          const lessonTitle = lesson.title
          const isSelected = selectedLesson === lessonTitle
          const isCompleted = Boolean(lesson.completed)
          const score = lessonScores[lessonTitle] ?? lesson.progress ?? 0
          const completionCount = lessonCompletionCounts[lessonTitle] ?? 0
          const progressLabel = `(${score})`

          return (
            <li key={lessonTitle} className="lesson-group__item">
              <button
                type="button"
                className={`lesson-link ${isSelected ? 'is-selected' : ''}`}
                onClick={() => onSelectLesson(lessonTitle)}
                aria-pressed={isSelected}
              >
                <span>{lessonTitle}</span>
                <span className="lesson-link__progress-group">
                  {progressLabel ? (
                    <span
                      className={`lesson-link__progress ${isCompleted ? 'is-complete' : score > 0 ? 'is-in-progress' : 'is-zero'}`}
                    >
                      {progressLabel}
                    </span>
                  ) : null}
                  {completionCount > 0 ? (
                    <span
                      className="lesson-link__completions"
                      aria-label={`${completionCount} times completed`}
                    >
                      <span className="lesson-link__completion-star" aria-hidden="true">★</span>
                      {completionCount}
                    </span>
                  ) : null}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

export default LessonGroup
