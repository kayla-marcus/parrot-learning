import SubjectCard from './SubjectCard'

const subjectDetails = {
  math: 'Numbers, patterns, and problem solving',
  reading: 'Stories, details, and big ideas',
  writing: 'Words, sentences, and clear ideas',
}

const subjectIcons = {
  math: '∑',
  reading: '📖',
  writing: '✍️',
}

function SubjectSelector({ selectedSubject, onSelectSubject }) {
  const subjects = ['math', 'reading', 'writing']

  return (
    <div className="subject-selector" aria-label="Subjects">
      {subjects.map((subject) => (
        <SubjectCard
          key={subject}
          title={
            subject === 'math'
              ? 'Math'
              : subject === 'reading'
                ? 'Reading Comprehension'
                : 'Writing'
          }
          description={subjectDetails[subject]}
          icon={subjectIcons[subject]}
          isSelected={selectedSubject === subject}
          onSelect={() => onSelectSubject(subject)}
        />
      ))}
    </div>
  )
}

export default SubjectSelector
