import { useEffect, useState } from 'react'

const placeValues = ['Hundreds', 'Tens', 'Ones']

function PlaceValueSubtraction({ minuend, subtrahend }) {
  const [inputs, setInputs] = useState({
    minuend: ['', '', ''],
    subtrahend: ['', '', ''],
    answer: ['', '', ''],
  })
  const [borrowedDigits, setBorrowedDigits] = useState({})

  useEffect(() => {
    setInputs({
      minuend: ['', '', ''],
      subtrahend: ['', '', ''],
      answer: ['', '', ''],
    })
    setBorrowedDigits({})
  }, [minuend, subtrahend])

  const updateInput = (row, index, value) => {
    setInputs((previous) => ({
      ...previous,
      [row]: previous[row].map((digit, digitIndex) => digitIndex === index ? value : digit),
    }))
    if (row === 'minuend' && index < 2) {
      setBorrowedDigits((previous) => ({
        ...previous,
        [index]: undefined,
      }))
    }
  }

  const decreaseTopDigit = (index) => {
    const enteredDigit = inputs.minuend[index]
    if (enteredDigit === '') return
    const rightDigit = inputs.minuend[index + 1]

    setBorrowedDigits((previous) => ({
      ...previous,
      [index]: enteredDigit,
    }))
    setInputs((previous) => ({
      ...previous,
      minuend: previous.minuend.map((digit, digitIndex) => {
        if (digitIndex === index) return String(Number(digit) - 1)
        if (digitIndex === index + 1) return String(Number(rightDigit || 0) + 10)
        return digit
      }),
    }))
  }

  const showBorrowKey = inputs.minuend[0] !== '' || inputs.minuend[1] !== ''

  const renderRow = (row, label, number) => (
    <div className="place-value-subtraction__row">
      <span className="place-value-subtraction__number" aria-label={`${label} number`}>{number}</span>
      <span className="place-value-subtraction__operator">{row === 'subtrahend' ? '−' : ''}</span>
      {placeValues.map((place, index) => (
        <label className="place-value-subtraction__cell" key={`${row}-${place}`}>
          <span className="sr-only">{label} {place}</span>
          {row === 'minuend' && index < 2 && borrowedDigits[index] !== undefined ? (
            <span className="place-value-subtraction__borrowed-digit" aria-label={`Original digit ${borrowedDigits[index]}`}>
              {borrowedDigits[index]}
            </span>
          ) : null}
          <input
            type="text"
            inputMode="numeric"
            maxLength="2"
            value={inputs[row][index]}
            onChange={(event) => updateInput(row, index, event.target.value.replace(/[^0-9-]/g, ''))}
          />
          {row === 'minuend' && index < 2 && inputs[row][index] !== '' && borrowedDigits[index] === undefined ? (
            <button
              type="button"
              className="place-value-subtraction__decrease"
              onClick={() => decreaseTopDigit(index)}
              aria-label={`Decrease ${place} digit by one`}
              title="Decrease by 1"
            >
              −
            </button>
          ) : null}
        </label>
      ))}
    </div>
  )

  return (
    <section className="place-value-subtraction" aria-label="Subtract using place values">
      <div className="place-value-subtraction__table-wrap">
        {showBorrowKey ? (
          <div className="place-value-subtraction__key">
            <span>Click</span>
            <span className="place-value-subtraction__decrease place-value-subtraction__decrease--key" aria-hidden="true">−</span>
            <span>to borrow</span>
          </div>
        ) : null}
        <div className="place-value-subtraction__grid place-value-subtraction__grid--header">
          <span className="place-value-subtraction__number-spacer" />
          <span className="place-value-subtraction__operator-spacer" />
          {placeValues.map((place) => <strong key={place}>{place}</strong>)}
        </div>
        {renderRow('minuend', 'First', minuend)}
        {renderRow('subtrahend', 'Second', subtrahend)}
        <div className="place-value-subtraction__answer-row">
          <span className="place-value-subtraction__number-spacer" />
          <span className="place-value-subtraction__operator-spacer" />
          {placeValues.map((place, index) => (
            <label className="place-value-subtraction__cell place-value-subtraction__cell--answer" key={`answer-${place}`}>
              <span className="sr-only">Answer {place}</span>
              <input
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={inputs.answer[index]}
                onChange={(event) => updateInput('answer', index, event.target.value.replace(/[^0-9]/g, ''))}
              />
              <span>{place}</span>
            </label>
          ))}
        </div>
      </div>
    </section>
  )
}

export default PlaceValueSubtraction
