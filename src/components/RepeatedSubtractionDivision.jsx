import { useEffect, useRef, useState } from 'react'

const successMessages = [
  'Nice job!',
  'Way to go!',
  'You’re awesome!',
  'That’s right!',
  'Great work!',
  'Fantastic!',
  'So smart!',
  'Excellent!',
  'Keep it up!',
  'You got it!',
]
const incorrectMessages = [
  'Not quite',
  'Try again',
  'Almost there!',
  'Keep trying!',
  'Give it another shot!',
]

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const makeProblem = () => {
  const divisor = randomInt(1, 12)
  const quotient = randomInt(1, 12)
  return { dividend: divisor * quotient, divisor }
}

let savedLessonState = null

function RepeatedSubtractionDivision({ onAnswerSubmit }) {
  const [problem, setProblem] = useState(() => savedLessonState?.problem ?? makeProblem())
  const [steps, setSteps] = useState(() => savedLessonState?.steps ?? [{ value: problem.dividend, answer: '', checked: false }])
  const [confirmation, setConfirmation] = useState(() => savedLessonState?.confirmation ?? false)
  const [statusMessage, setStatusMessage] = useState(() => savedLessonState?.statusMessage ?? '')
  const [complete, setComplete] = useState(() => savedLessonState?.complete ?? false)
  const [finalAnswer, setFinalAnswer] = useState(() => savedLessonState?.finalAnswer ?? { times: '', quotient: '' })
  const [feedback, setFeedback] = useState({ visible: false, kind: 'success', message: '' })
  const [showAnswerButton, setShowAnswerButton] = useState(() => savedLessonState?.showAnswerButton ?? false)
  const [answerRevealed, setAnswerRevealed] = useState(() => savedLessonState?.answerRevealed ?? false)
  const feedbackTimeoutRef = useRef(null)

  useEffect(() => {
    savedLessonState = {
      problem,
      steps,
      confirmation,
      statusMessage,
      complete,
      finalAnswer,
      showAnswerButton,
      answerRevealed,
    }
  }, [problem, steps, confirmation, statusMessage, complete, finalAnswer, showAnswerButton, answerRevealed])

  const updateAnswer = (index, value) => {
    setSteps((current) => current.map((step, stepIndex) => stepIndex === index
      ? { ...step, answer: value.replace(/[^0-9]/g, ''), checked: false }
      : step))
    setConfirmation(false)
  }

  const confirmAnswer = () => {
    const step = steps[steps.length - 1]
    const remainder = Number(step.answer)
    if (!step.answer || !Number.isInteger(remainder) || remainder !== step.value - problem.divisor || remainder < 0) return
    setSteps((current) => current.map((item, index) => index === current.length - 1 ? { ...item, checked: true } : item))
    setStatusMessage('')
    setConfirmation(true)
  }

  const answerYesNo = (saysZero) => {
    const finalStep = steps[steps.length - 1]
    const isZero = Number(finalStep.answer) === 0
    if (saysZero !== isZero) {
      showFeedback('error', 'Try again')
      return
    }
    setConfirmation(false)
    if (isZero) {
      setComplete(true)
      setStatusMessage('')
      return
    }
    setStatusMessage(`Correct!|Let's subtract ${problem.divisor} again until we get to 0.`)
    setSteps((current) => [...current, { value: Number(current[current.length - 1].answer), answer: '', checked: false }])
  }

  const startNextProblem = () => {
    const next = makeProblem()
    setProblem(next)
    setSteps([{ value: next.dividend, answer: '', checked: false }])
    setConfirmation(false)
    setStatusMessage('')
    setComplete(false)
    setFinalAnswer({ times: '', quotient: '' })
    setShowAnswerButton(false)
    setAnswerRevealed(false)
    setFeedback({ visible: false, kind: 'success', message: '' })
  }

  const showFeedback = (kind, message, onComplete = null) => {
    if (feedbackTimeoutRef.current) {
      window.clearTimeout(feedbackTimeoutRef.current)
    }

    setFeedback({ visible: true, kind, message })
    feedbackTimeoutRef.current = window.setTimeout(() => {
      setFeedback((current) => ({ ...current, visible: false }))
      if (onComplete) onComplete()
    }, 2000)
  }

  const handleRevealAnswer = () => {
    setAnswerRevealed(true)
    setShowAnswerButton(false)
    setFinalAnswer({ times: String(steps.length), quotient: String(steps.length) })
  }

  const handleFinalAnswerCheck = () => {
    const timesText = finalAnswer.times.trim()
    const quotientText = finalAnswer.quotient.trim()

    if (!timesText || !quotientText) {
      setShowAnswerButton(false)
      showFeedback('blank', 'Oops! You forgot to type your answer')
      return
    }

    const times = Number(timesText)
    const quotient = Number(quotientText)

    if (!Number.isInteger(times) || !Number.isInteger(quotient)) {
      setShowAnswerButton(true)
      showFeedback('error', incorrectMessages[Math.floor(Math.random() * incorrectMessages.length)])
      return
    }

    if (times === steps.length && quotient === steps.length) {
      setAnswerRevealed(false)
      setShowAnswerButton(false)
      onAnswerSubmit(true)
      showFeedback('success', successMessages[Math.floor(Math.random() * successMessages.length)], () => {
        startNextProblem()
      })
      return
    }

    setShowAnswerButton(true)
    onAnswerSubmit(false)
    showFeedback('error', incorrectMessages[Math.floor(Math.random() * incorrectMessages.length)])
  }

  return (
    <section className="repeated-division" aria-label="Use repeated subtraction to divide">
      <p className="lesson-detail__question repeated-division__instruction">Solve the problem: Keep subtracting until you get to 0.</p>
      <table className="repeated-division__table">
        <tbody>
          {steps.map((step, index) => (
            <tr key={`${index}-${step.value}`}>
              <td>{step.value}</td><td className="repeated-division__operator" aria-label="minus">-</td><td className={`repeated-division__divisor-cell ${complete ? 'is-highlighted' : ''}`}>{problem.divisor}</td><td>=</td>
              <td><input aria-label={`Difference after subtraction ${index + 1}`} type="text" inputMode="numeric" value={step.answer}
                onChange={(event) => updateAnswer(index, event.target.value)} disabled={step.checked || complete} /></td>
              <td>{index === steps.length - 1 && !step.checked && !complete ? <button type="button" className="repeated-division__check" onClick={confirmAnswer}>Check</button> : null}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {statusMessage ? (
        <p className="repeated-division__message" role="status">
          {statusMessage.includes('|') ? (
            <>
              <span className="repeated-division__message-success">{statusMessage.split('|')[0]}</span>
              <span className="repeated-division__message-text"> {statusMessage.split('|')[1]}</span>
            </>
          ) : (
            statusMessage
          )}
        </p>
      ) : null}
      {confirmation && !complete ? (
        <div className="repeated-division__confirmation" role="group" aria-label="Is the difference zero?">
          <p>Does {steps[steps.length - 1].value} - {problem.divisor} = 0?</p>
          <button type="button" className="repeated-division__choice" onClick={() => answerYesNo(true)}>Yes</button>
          <button type="button" className="repeated-division__choice" onClick={() => answerYesNo(false)}>No</button>
        </div>
      ) : null}
      {feedback.visible ? (
        <div className="lesson-detail__success-overlay" aria-live="polite">
          <div className="lesson-detail__success-box">
            <span className={`lesson-detail__success-icon ${feedback.kind === 'error' ? 'is-incorrect' : ''} ${feedback.kind === 'blank' ? 'is-blank' : ''}`} aria-hidden="true">
              {feedback.kind === 'blank' ? '!' : feedback.kind === 'success' ? '✓' : '×'}
            </span>
            <span>{feedback.message}</span>
          </div>
        </div>
      ) : null}
      {complete ? (
        <div className="repeated-division__result" role="status">
          <p className="repeated-division__final-equation">
            <span>{problem.divisor}</span>
            <span> was subtracted </span>
            <input
              className="repeated-division__final-input"
              type="text"
              inputMode="numeric"
              value={finalAnswer.times}
              readOnly={answerRevealed}
              onChange={(event) => setFinalAnswer((current) => ({ ...current, times: event.target.value.replace(/[^0-9]/g, '') }))}
              aria-label="Number of times the divisor was subtracted"
            />
            <span> times, so {problem.dividend} ÷ {problem.divisor} = </span>
            <input
              className="repeated-division__final-input"
              type="text"
              inputMode="numeric"
              value={finalAnswer.quotient}
              readOnly={answerRevealed}
              onChange={(event) => setFinalAnswer((current) => ({ ...current, quotient: event.target.value.replace(/[^0-9]/g, '') }))}
              aria-label="Quotient for the division problem"
            />
            <span>.</span>
          </p>
          <p className="repeated-division__hint">
            Hint: Count how many times the number is <span className="repeated-division__highlighted-word">highlighted</span> above.
          </p>
          <div className="repeated-division__final-actions">
            <button type="button" className="repeated-division__check" onClick={handleFinalAnswerCheck}>Check</button>
            {showAnswerButton && !answerRevealed ? (
              <button type="button" className="lesson-detail__reveal" onClick={handleRevealAnswer}>Reveal answer</button>
            ) : null}
            {answerRevealed ? (
              <span className="lesson-detail__revealed-status">
                <span className="lesson-detail__revealed-icon" aria-hidden="true">✓</span>
                Answer revealed
              </span>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default RepeatedSubtractionDivision
