import { useState, useEffect } from 'react'

function NumberLine({ firstNumber, secondNumber }) {
  const [inputs, setInputs] = useState({})

  // Clear inputs when question changes
  useEffect(() => {
    setInputs({})
  }, [firstNumber, secondNumber])

  // Calculate the steps needed to go from firstNumber to answer
  const answer = firstNumber + secondNumber
  const totalDistance = secondNumber

  // Break the distance into steps (max 10 steps)
  const generateSteps = () => {
    const steps = []
    let remaining = totalDistance
    let maxSteps = 10

    // Prefer larger jumps first
    const jumpSizes = [10, 5, 1]

    for (const jumpSize of jumpSizes) {
      while (remaining >= jumpSize && steps.length < maxSteps) {
        steps.push(jumpSize)
        remaining -= jumpSize
      }
    }

    // Add any remaining as 1s
    while (remaining > 0 && steps.length < maxSteps) {
      steps.push(1)
      remaining -= 1
    }

    return steps
  }

  const steps = generateSteps()

  // Calculate positions for each point on the number line
  const positions = [firstNumber]
  let current = firstNumber
  for (const step of steps) {
    current += step
    positions.push(current)
  }

  // Calculate positions with minimum 40px spacing
  const minSpacingPx = 40
  const positions100Based = [0] // First position is always at 0%
  
  // Calculate positions ensuring at least 40px between visible steps
  // We'll use the number of steps to calculate required width
  const requiredMinWidth = minSpacingPx * (positions.length - 1)
  
  for (let i = 1; i < positions.length; i++) {
    // Calculate percentage position with minimum spacing
    const percentPosition = (i / (positions.length - 1)) * 100
    positions100Based.push(Math.max(positions100Based[i - 1] + (minSpacingPx / requiredMinWidth) * 100, percentPosition))
  }

  const handleInputChange = (index, value) => {
    setInputs({ ...inputs, [index]: value })
  }

  return (
    <div className="number-line">
      <div className="number-line__container" style={{ minWidth: `${requiredMinWidth}px` }}>
        {/* Number labels and ticks */}
        <div className="number-line__labels">
          {positions.map((position, index) => {
            const isStart = index === 0
            const isEnd = index === positions.length - 1
            const leftPercent = positions100Based[index]
            const isInput = index > 0 && index % 2 === 1

            return (
              <div
                key={index}
                className="number-line__point"
                style={{ left: `${leftPercent}%` }}
              >
                <div className="number-line__tick-mark" />
                <div className="number-line__label">
                  {isEnd ? (
                    '?'
                  ) : isInput ? (
                    <input
                      type="text"
                      className="number-line__input"
                      value={inputs[index] || ''}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      placeholder="?"
                    />
                  ) : (
                    position
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Step labels (jump amounts) */}
        <div className="number-line__steps">
          {steps.map((step, index) => {
            const startPercent = positions100Based[index]
            const endPercent = positions100Based[index + 1]
            const midPercent = (startPercent + endPercent) / 2

            return (
              <div
                key={index}
                className="number-line__step-label"
                style={{ left: `${midPercent}%` }}
              >
                +{step}
              </div>
            )
          })}
        </div>

        {/* SVG line */}
        <svg viewBox="0 0 100 20" className="number-line__svg" preserveAspectRatio="none">
          <line
            x1={positions100Based[0]}
            y1="10"
            x2={positions100Based[positions100Based.length - 1]}
            y2="10"
            className="number-line__line"
          />
        </svg>
      </div>

      {/* Explanation box */}
      <div className="number-line__explanation">
        <p>
          <strong>How it works:</strong> Start at <strong>{firstNumber}</strong>. Then make jumps forward by <strong>{secondNumber}</strong> using the steps shown above (tens, fives, and ones). Each jump moves you closer to the answer.
        </p>
      </div>
    </div>
  )
}

export default NumberLine
