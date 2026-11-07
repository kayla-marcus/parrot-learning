import { Fragment, useEffect, useMemo, useState } from 'react'
import Sidebar from './components/Sidebar'
import SubjectSelector from './components/SubjectSelector'
import LessonGroup from './components/LessonGroup'
import NumberLine from './components/NumberLine'
import PlaceValueSubtraction from './components/PlaceValueSubtraction'
import RepeatedSubtractionDivision from './components/RepeatedSubtractionDivision'
import { lessonData } from './data/lessonData'
import { readingLibrary } from './data/readingLibrary'
import './App.css'

const buildLessonList = (subjects) =>
  subjects.flatMap((subject) => subject.sections.flatMap((section) => section.lessons))

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
const wordProblemPairs = [
  ['stickers', 'album'],
  ['flowers', 'garden'],
  ['cookies', 'pan'],
  ['apples', 'basket'],
  ['pencils', 'case'],
  ['crayons', 'box'],
  ['books', 'shelf'],
  ['shells', 'bucket'],
  ['marbles', 'jar'],
  ['toys', 'chest'],
  ['leaves', 'pile'],
  ['buttons', 'jar'],
  ['eggs', 'carton'],
  ['balls', 'bag'],
  ['socks', 'drawer'],
  ['candles', 'box'],
  ['candies', 'bowl'],
  ['birds', 'nest'],
  ['fish', 'tank'],
  ['coins', 'purse'],
  ['cards', 'deck'],
  ['letters', 'envelope'],
  ['shoes', 'closet'],
  ['sandwiches', 'lunchbox'],
  ['cupcakes', 'tray'],
  ['oranges', 'crate'],
  ['tomatoes', 'basket'],
  ['carrots', 'bag'],
  ['potatoes', 'sack'],
  ['balloons', 'room'],
  ['pennies', 'piggy bank'],
  ['erasers', 'pouch'],
  ['markers', 'container'],
  ['paintbrushes', 'cup'],
  ['ribbons', 'drawer'],
  ['blocks', 'bin'],
  ['puzzles', 'closet'],
  ['towels', 'basket'],
  ['plates', 'cabinet'],
  ['cups', 'shelf'],
  ['forks', 'drawer'],
  ['spoons', 'drawer'],
  ['grapes', 'bowl'],
  ['bananas', 'bunch'],
  ['pears', 'crate'],
  ['books', 'backpack'],
  ['photos', 'frame'],
  ['stickers', 'notebook'],
  ['beads', 'box'],
  ['pom-poms', 'bag'],
]
function formatGradeLabel(grade) {
  const labels = {
    3: '3rd Grade',
    4: '4th Grade',
    5: '5th Grade',
    6: '6th Grade',
  }

  return labels[grade] ?? `${grade}th Grade`
}

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

const buildRandomNumber = (digits) => {
  if (digits <= 1) return randomInt(0, 9)

  const min = 10 ** (digits - 1)
  const max = 10 ** digits - 1
  return randomInt(min, max)
}

const numberWords = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen']
const tensWords = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']
const largePlaceNames = ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands', 'hundred thousands', 'millions']

const formatMixedFraction = (numerator, denominator) => {
  const wholeNumber = Math.floor(numerator / denominator)
  const remainder = numerator % denominator

  if (remainder === 0) return String(wholeNumber)
  if (wholeNumber === 0) return `${remainder}/${denominator}`
  return `${wholeNumber} ${remainder}/${denominator}`
}

const getEquivalentFractionValue = (answer) => {
  if (typeof answer === 'object' && answer !== null) {
    const whole = String(answer.whole ?? '').trim()
    const numerator = String(answer.numerator ?? '').trim()
    const denominator = String(answer.denominator ?? '').trim()
    if (whole && !numerator && !denominator) return getEquivalentFractionValue(whole)
    if (!numerator || !denominator) return null
    const fraction = `${numerator}/${denominator}`
    return getEquivalentFractionValue(whole ? `${whole} ${fraction}` : fraction)
  }

  const normalized = String(answer ?? '').trim().replaceAll(',', '')
  const mixedMatch = normalized.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/)
  if (mixedMatch) {
    const [, whole, numerator, denominator] = mixedMatch.map(Number)
    if (!denominator || numerator >= denominator) return null
    return (whole * denominator + numerator) / denominator
  }

  const fractionMatch = normalized.match(/^(\d+)\s*\/\s*(\d+)$/)
  if (fractionMatch) {
    const numerator = Number(fractionMatch[1])
    const denominator = Number(fractionMatch[2])
    if (!denominator) return null
    return numerator / denominator
  }

  const wholeMatch = normalized.match(/^\d+$/)
  return wholeMatch ? Number(normalized) : null
}

const parseFraction = (value) => {
  const match = String(value ?? '').match(/^(\d+)\/(\d+)$/)
  return match ? { numerator: Number(match[1]), denominator: Number(match[2]) } : null
}

const getFactors = (number) =>
  Array.from({ length: number }, (_, index) => index + 1)
    .filter((factor) => number % factor === 0)

function FractionVisual({ kind, numerator, denominator, compact = false }) {
  return (
    <div className={`fraction-visual__model${compact ? ' fraction-visual__model--compact' : ''}`}>
      {kind === 'bar' ? (
        <div className="fraction-visual__bar">
          {Array.from({ length: denominator }, (_, index) => (
            <span
              className={`fraction-visual__segment${index < numerator ? ' is-shaded' : ''}`}
              key={index}
            />
          ))}
        </div>
      ) : (
        <div className="fraction-visual__number-line">
          <span className="fraction-visual__endpoint fraction-visual__endpoint--start">0</span>
          <span className="fraction-visual__endpoint fraction-visual__endpoint--end">1</span>
          <div className="fraction-visual__track" />
          {Array.from({ length: denominator + 1 }, (_, index) => (
            <span
              className="fraction-visual__tick"
              key={index}
              style={{ left: `${index / denominator * 100}%` }}
            />
          ))}
          <span
            className="fraction-visual__marker"
            style={{ left: `${numerator / denominator * 100}%` }}
          />
        </div>
      )}
    </div>
  )
}

const numberToWords = (number) => {
  if (number < 20) return numberWords[number]
  if (number < 100) return `${tensWords[Math.floor(number / 10)]}${number % 10 ? `-${numberWords[number % 10]}` : ''}`
  if (number < 1000) return `${numberWords[Math.floor(number / 100)]} hundred${number % 100 ? ` ${numberToWords(number % 100)}` : ''}`
  if (number < 1000000) return `${numberToWords(Math.floor(number / 1000))} thousand${number % 1000 ? ` ${numberToWords(number % 1000)}` : ''}`
  return `${numberToWords(Math.floor(number / 1000000))} million${number % 1000000 ? ` ${numberToWords(number % 1000000)}` : ''}`
}

function FractionExpression({ operation, first, second, denominator }) {
  const renderTerm = ({ whole, numerator }) => (
    <span className="fraction-expression__term">
      {whole ? <span className="fraction-expression__whole">{whole}</span> : null}
      <span className="fraction-expression__fraction" aria-label={`${numerator} over ${denominator}`}>
        <span className="fraction-expression__numerator">{numerator}</span>
        <span className="fraction-expression__bar" aria-hidden="true" />
        <span className="fraction-expression__denominator">{denominator}</span>
      </span>
    </span>
  )

  return (
    <span className="fraction-expression">
      {operation === 'addition' ? 'Add: ' : 'Subtract: '}
      {renderTerm(first)}
      <span aria-hidden="true"> {operation === 'addition' ? '+' : '-'} </span>
      {renderTerm(second)}
      <span aria-hidden="true"> = ?</span>
    </span>
  )
}

const getScoreIncrease = (score) => {
  if (score < 50) return 20
  if (score < 80) return 4
  if (score < 90) return 3
  if (score < 100) return 1
  return 0
}

const getScoreDecrease = (score) => {
  if (score < 50) return 10
  if (score < 70) return 8
  if (score < 90) return 5
  if (score < 100) return 3
  return 3
}

const formatElapsedTime = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}

const loadLessonMap = (storageKey) => {
  try {
    const storedValue = window.localStorage.getItem(storageKey)
    const parsedValue = storedValue ? JSON.parse(storedValue) : {}
    return parsedValue && typeof parsedValue === 'object' && !Array.isArray(parsedValue) ? parsedValue : {}
  } catch (error) {
    console.error(`Unable to load ${storageKey} from local storage.`, error)
    return {}
  }

}

const loadViewSelection = () => {
  try {
    const storedValue = window.localStorage.getItem('parrot-learning-view-selection')
    const parsedValue = storedValue ? JSON.parse(storedValue) : {}

    return parsedValue && typeof parsedValue === 'object' && !Array.isArray(parsedValue)
      ? parsedValue
      : {}
  } catch (error) {
    console.error('Unable to load saved app view selection.', error)
    return {}
  }
}

const getInitialViewSelection = () => {
  const savedSelection = loadViewSelection()
  const savedGrade = lessonData.some(({ grade }) => grade === savedSelection.grade)
    ? savedSelection.grade
    : 3
  const gradeData = lessonData.find(({ grade }) => grade === savedGrade) ?? lessonData[0]
  const subjectEntries = Object.entries(gradeData.subjects)
  const savedSubject = subjectEntries.some(([subjectKey]) => subjectKey === savedSelection.subject)
    ? savedSelection.subject
    : subjectEntries[0][0]
  const subject = gradeData.subjects[savedSubject]
  const lessons = subject.sections.flatMap((section) => section.lessons)
  const lesson = lessons.some((entry) => entry.title === savedSelection.lesson)
    ? savedSelection.lesson
    : ''

  return {
    grade: savedGrade,
    subject: savedSubject,
    lesson,
  }
}

const getReadingQuestion = (skill, questionCount) => {
  const storyIndex = Math.floor(questionCount / 10) % readingLibrary.length
  const questionIndex = questionCount % 10
  const story = readingLibrary[storyIndex]
  const questions = story.questions.filter((question) => question.skill === skill)
  const selectedQuestion = questions[questionIndex] ?? questions[0]

  return {
    ...selectedQuestion,
    readingIndex: questionCount,
    storyTitle: story.title,
    storyText: story.text,
    storyPassageTwo: story.passageTwo,
  }
}

function StackedFraction({ numerator, denominator }) {
  return (
    <span className="fraction-expression__fraction" aria-label={`${numerator} over ${denominator}`}>
      <span className="fraction-expression__numerator">{numerator}</span>
      <span className="fraction-expression__bar" aria-hidden="true" />
      <span className="fraction-expression__denominator">{denominator}</span>
    </span>
  )
}

function FractionText({ value }) {
  const match = String(value).match(/^(\d+)\/(\d+)$/)

  return match
    ? <StackedFraction numerator={match[1]} denominator={match[2]} />
    : value
}

const getMathQuestionConfig = (lesson) => {
  const title = (lesson.title ?? '').toLowerCase()

  if (title.includes('fraction')) return { type: 'fraction', digits: 1, label: '' }
  if (title.includes('decimal')) return { type: 'decimal', digits: 1, label: '' }
  if (title.includes('subtract') && title.includes('place value')) return { type: 'place-value-subtraction', digits: 3, label: '' }
  if (title.includes('subtract') && title.includes('word problems')) return { type: 'subtraction-word-problem', digits: 3, label: '' }
  if (title.includes('missing number') && title.includes('subtract')) return { type: 'missing-number-subtraction', digits: 2, label: '' }
  if (title.includes('subtract across zeros')) return { type: 'subtraction-across-zeros', digits: 3, label: '' }
  if (title.includes('subtract') && title.includes('regrouping')) return { type: 'subtraction-regrouping', digits: 3, label: '' }
  if (title.includes('subtract')) return { type: 'subtraction', operandCount: 2, digits: 3, label: '' }
  if (!title.includes('subtract') && (title.includes('place value') || title.includes('large numbers') || title.includes('number form'))) {
    return { type: 'place-value', digits: 3, label: '' }
  }
  if (title === 'use arrays to solve multiplication facts') {
    return { type: 'multiplication', digits: 2, label: '', arrayGrid: true }
  }
  if (title === 'multiply two numbers with regrouping') {
    return { type: 'multiplication', digits: 2, label: '', regrouping: true }
  }
  if (title === 'solve multiplication word problems') {
    return { type: 'multiplication', digits: 2, label: '', multiplicationWordProblem: true }
  }
  if (title === 'multiply a one-digit number by a two-digit number') {
    return { type: 'multiplication', digits: 2, label: '', oneByTwoDigit: true }
  }
  if (title === 'find patterns in multiplication tables') {
    return { type: 'multiplication-pattern', digits: 2, label: '' }
  }
  if (title.includes('multiply')) return { type: 'multiplication', digits: 2, label: '' }
  if (title.includes('divide')) return { type: 'division', digits: 2, label: '' }
  if (title.includes('number line')) return { type: 'number-line', digits: 2, label: '' }

  if (title.includes('three numbers')) {
    return { type: 'addition', operandCount: 3, digits: title.includes('multi-digit') ? 3 : 2, label: '' }
  }

  if (title.includes('word problems')) {
    return { type: 'addition', operandCount: 2, digits: 3, label: 'stickers' }
  }

  if (title.includes('add')) {
    return { type: 'addition', operandCount: 2, digits: title.includes('three digits') ? 3 : 2, label: '' }
  }

  return { type: 'addition', operandCount: 2, digits: 2, label: '' }
}

const generateMathQuestion = (lesson, previousQuestion = null, lessonScore = null) => {
  const config = getMathQuestionConfig(lesson)
  const digits = config.digits
  const title = lesson.title.toLowerCase()

  if (title === 'use repeated subtraction to divide') {
    return { prompt: '', type: 'repeated-subtraction-division', label: '', operation: 'division', values: [1, 1] }
  }

  const shuffle = (items) => [...items].sort(() => Math.random() - 0.5)
  const makeMultipleChoice = (prompt, answer, distractors) => {
    const options = [...new Set([String(answer), ...distractors.map(String)])].slice(0, 4)

    return {
      prompt,
      type: 'radio',
      options: shuffle(options),
      answer: String(answer),
      label: '',
    }
  }

  const makeQuestion = (a, b, operation) => {
    const computedAnswer = operation === 'addition'
      ? a + b
      : operation === 'subtraction'
        ? a - b
        : operation === 'multiplication'
          ? a * b
          : Math.floor(a / b)

    return {
      prompt: `Solve: ${a} ${operation === 'addition' ? '+' : operation === 'subtraction' ? '-' : operation === 'multiplication' ? '×' : '÷'} ${b} = ?`,
      answer: String(computedAnswer),
      label: config.label,
      operation,
      digits,
      arrayGrid: config.arrayGrid,
      values: [a, b],
    }
  }

  if (title === 'simplify fractions using common factors with pictures') {
    const commonFactors = [2, 3, 4]
    const multiplier = commonFactors[randomInt(0, commonFactors.length - 1)]
    let numerator = randomInt(1, 4)
    let denominator = randomInt(numerator + 1, 8)

    while (Array.from({ length: numerator }, (_, index) => index + 1)
      .some((candidate) => numerator % candidate === 0 && denominator % candidate === 0 && candidate > 1)) {
      numerator = randomInt(1, 4)
      denominator = randomInt(numerator + 1, 8)
    }

    const originalNumerator = numerator * multiplier
    const originalDenominator = denominator * multiplier
    const answer = `${numerator}/${denominator}`
    const candidates = []

    for (let candidateDenominator = 2; candidateDenominator <= 12; candidateDenominator += 1) {
      for (let candidateNumerator = 1; candidateNumerator < candidateDenominator; candidateNumerator += 1) {
        if (candidateNumerator * denominator !== numerator * candidateDenominator) {
          candidates.push(`${candidateNumerator}/${candidateDenominator}`)
        }
      }
    }

    const options = shuffle([answer, `${originalNumerator}/${originalDenominator}`, ...shuffle(candidates).slice(0, 2)])
    const modelKind = Math.random() < 0.5 ? 'bar' : 'number-line'

    return {
      ...makeMultipleChoice(
        `The model shows ${originalNumerator}/${originalDenominator}. Which fraction shows ${originalNumerator}/${originalDenominator} in simplest form?`,
        answer,
        options.filter((option) => option !== answer),
      ),
      fractionVisual: {
        kind: modelKind,
        fractions: [{ numerator: originalNumerator, denominator: originalDenominator }],
        optionFractions: Object.fromEntries(options.map((fraction) => {
          const [optionNumerator, optionDenominator] = fraction.split('/').map(Number)
          return [fraction, { numerator: optionNumerator, denominator: optionDenominator }]
        })),
      },
    }
  }

  if (title === 'find equivalent fractions using pictures') {
    const denominator = randomInt(3, 8)
    const numerator = randomInt(1, denominator - 1)
    const multiplier = randomInt(2, 4)
    const answer = `${numerator * multiplier}/${denominator * multiplier}`
    const candidates = []

    for (let candidateDenominator = 2; candidateDenominator <= 12; candidateDenominator += 1) {
      for (let candidateNumerator = 1; candidateNumerator < candidateDenominator; candidateNumerator += 1) {
        if (candidateNumerator * denominator !== numerator * candidateDenominator) {
          candidates.push(`${candidateNumerator}/${candidateDenominator}`)
        }
      }
    }

    const options = shuffle([answer, ...shuffle(candidates).slice(0, 3)])
    const modelKind = Math.random() < 0.5 ? 'bar' : 'number-line'

    return {
      ...makeMultipleChoice(
        `The model shows ${numerator}/${denominator}. Which fraction has the same value?`,
        answer,
        options.filter((option) => option !== answer),
      ),
      fractionVisual: {
        kind: modelKind,
        fractions: [{ numerator, denominator }],
        optionFractions: Object.fromEntries(options.map((fraction) => {
          const [optionNumerator, optionDenominator] = fraction.split('/').map(Number)
          return [fraction, { numerator: optionNumerator, denominator: optionDenominator }]
        })),
      },
    }
  }

  if (title === 'compare fractions with visual models and number lines') {
    const firstDenominator = randomInt(2, 8)
    const firstNumerator = randomInt(1, firstDenominator - 1)
    let secondDenominator = randomInt(2, 8)
    let secondNumerator = randomInt(1, secondDenominator - 1)

    while (
      secondDenominator === firstDenominator ||
      secondNumerator === firstNumerator ||
      firstNumerator * secondDenominator === secondNumerator * firstDenominator
    ) {
      secondDenominator = randomInt(2, 8)
      secondNumerator = randomInt(1, secondDenominator - 1)
    }

    const firstValue = firstNumerator / firstDenominator
    const secondValue = secondNumerator / secondDenominator
    const firstFraction = `${firstNumerator}/${firstDenominator}`
    const secondFraction = `${secondNumerator}/${secondDenominator}`
    const firstChoice = `${firstFraction} is greater than ${secondFraction}`
    const secondChoice = `${secondFraction} is greater than ${firstFraction}`
    const answer = firstValue > secondValue ? firstChoice : secondChoice

    return {
      ...makeMultipleChoice(
        `Which fraction is greater: ${firstNumerator}/${firstDenominator} or ${secondNumerator}/${secondDenominator}?`,
        answer,
        [firstChoice, secondChoice],
      ),
      fractionVisual: {
        kind: Math.random() < 0.5 ? 'bar' : 'number-line',
        fractions: [
          { numerator: firstNumerator, denominator: firstDenominator },
          { numerator: secondNumerator, denominator: secondDenominator },
        ],
      },
    }
  }

  if (title === 'add and subtract fractions and mixed numbers with like denominators') {
    const denominator = randomInt(4, 8)
    const secondNumerator = 1
    const firstNumerator = randomInt(2, Math.min(3, denominator - secondNumerator - 1))
    const makeTerm = (numerator) => ({
      whole: Math.random() < 0.5 ? randomInt(numerator + 1, 3) : 0,
      numerator,
    })
    const operation = Math.random() < 0.5 ? 'addition' : 'subtraction'
    let first = makeTerm(firstNumerator)
    let second = makeTerm(secondNumerator)
    let firstValue = first.whole * denominator + first.numerator
    let secondValue = second.whole * denominator + second.numerator

    while (operation === 'subtraction' && firstValue < secondValue) {
      first = makeTerm(firstNumerator)
      second = makeTerm(secondNumerator)
      firstValue = first.whole * denominator + first.numerator
      secondValue = second.whole * denominator + second.numerator
    }

    const formatTerm = ({ whole, numerator }) => whole
      ? `${whole} ${numerator}/${denominator}`
      : `${numerator}/${denominator}`
    const resultNumerator = operation === 'addition'
      ? firstValue + secondValue
      : firstValue - secondValue
    const sign = operation === 'addition' ? '+' : '-'

    return {
      prompt: `${operation === 'addition' ? 'Add' : 'Subtract'}: ${formatTerm(first)} ${sign} ${formatTerm(second)} = ?`,
      type: 'fraction-entry',
      answer: formatMixedFraction(resultNumerator, denominator),
      fractionExpression: { operation, first, second, denominator },
      label: '',
    }
  }

  if (title === 'multiply a fraction by a whole number') {
    const denominator = randomInt(2, 8)
    const numerator = randomInt(1, denominator - 1)
    const wholeNumber = randomInt(2, 8)

    return {
      prompt: `Multiply: ${wholeNumber} × ${numerator}/${denominator} = ?`,
      type: 'fraction-entry',
      answer: formatMixedFraction(wholeNumber * numerator, denominator),
      label: '',
    }
  }

  if (title === 'solve simple division facts') {
    const quotient = randomInt(1, 12)
    let divisor = randomInt(1, 12)
    let question = makeQuestion(divisor * quotient, divisor, 'division')

    if (previousQuestion?.prompt === question.prompt) {
      divisor = divisor % 12 + 1
      question = makeQuestion(divisor * quotient, divisor, 'division')
    }

    return question
  }

  if (title === 'match division problems to pictures') {
    const groups = randomInt(1, 12)
    const amountPerGroup = groups === 1 ? randomInt(2, 12) : randomInt(1, 12)
    const total = groups * amountPerGroup
    const shape = Math.random() < 0.5 ? 'circle' : 'square'
    const useWordForm = Math.random() < 0.5
    const alternateDivisors = Array.from({ length: 12 }, (_, index) => index + 1)
      .filter((divisor) => divisor !== groups && total % divisor === 0)
    const alternateDivisor = alternateDivisors[randomInt(0, alternateDivisors.length - 1)]
    const shapeName = `${total} ${shape}${total === 1 ? '' : 's'}`
    const formatOption = (divisor) => useWordForm
      ? `${shapeName} split evenly into ${divisor} groups means there are ${total / divisor} in each group`
      : `${total} ÷ ${divisor} = ${total / divisor}`
    const answer = formatOption(groups)

    return {
      prompt: 'Which problem matches the picture?',
      type: 'radio',
      options: shuffle([answer, formatOption(alternateDivisor)]),
      answer,
      label: '',
      divisionPicture: { groups, amountPerGroup, shape, total },
    }
  }

  if (title === 'divide with remainders') {
    const divisor = randomInt(2, 9)
    const dividends = Array.from({ length: 95 }, (_, index) => index + 2)
      .filter((dividend) => dividend % divisor !== 0)
    const availableDividends = dividends.filter((dividend) => dividend !== previousQuestion?.values?.[0])
    const dividend = availableDividends[randomInt(0, availableDividends.length - 1)]

    return {
      ...makeQuestion(dividend, divisor, 'division'),
      type: 'division-remainder',
      answer: {
        quotient: String(Math.floor(dividend / divisor)),
        remainder: String(dividend % divisor),
      },
    }
  }

  if (title === 'use long division') {
    const dividend = randomInt(100, 9999)
    const divisor = randomInt(2, 9)

    return {
      ...makeQuestion(dividend, divisor, 'division'),
      prompt: `Solve: ${dividend.toLocaleString('en-US')} ÷ ${divisor} = ?`,
      type: 'long-division',
      answer: {
        quotient: String(Math.floor(dividend / divisor)),
        remainder: String(dividend % divisor),
      },
    }
  }

  if (title === 'identify the place value of an underlined digit (to millions)') {
    const number = randomInt(100000, 9999999)
    const numberText = String(number)
    const digitIndex = randomInt(0, numberText.length - 1)
    const placeName = largePlaceNames[numberText.length - digitIndex - 1]

    return {
      prompt: 'What is the place value of the underlined digit?',
      type: 'radio',
      options: shuffle(largePlaceNames),
      answer: placeName,
      label: '',
      placeValueDisplay: { number: numberText, digitIndex },
    }
  }

  if (title === 'write a number from its place values (to millions)') {
    const digitCount = randomInt(4, 7)
    const digits = Array.from({ length: digitCount }, (_, index) =>
      index === 0 ? randomInt(1, 9) : randomInt(0, 9),
    )
    const descriptions = digits.map((digit, index) => {
      const placeName = largePlaceNames[digitCount - index - 1]
      return `${digit} in the ${placeName} place`
    })

    return {
      prompt: `What number is described by these place values: ${descriptions.join(', ')}?`,
      type: 'text',
      answer: Number(digits.join('')).toLocaleString('en-US'),
      label: '',
    }
  }

  if (title === 'choose the correct way to say a number' && lesson.variant === 'millions') {
    const number = randomInt(100000, 9999999)
    const answer = numberToWords(number)

    return makeMultipleChoice(
      `Which is the correct way to say ${number.toLocaleString('en-US')}?`,
      answer,
      [numberToWords(number * 10), numberToWords(number - 100000), numberToWords(number + 1000)],
    )
  }

  if (title === 'make the greatest or least number from given digits (to millions)') {
    const digitCount = randomInt(4, 7)
    const digits = shuffle(Array.from({ length: 9 }, (_, index) => String(index + 1))).slice(0, digitCount)
    const makeGreatest = Math.random() < 0.5
    const answer = [...digits].sort((first, second) =>
      makeGreatest ? Number(second) - Number(first) : Number(first) - Number(second),
    )
    const placeNames = largePlaceNames.slice(0, digitCount).reverse().map((name) =>
      name[0].toUpperCase() + name.slice(1),
    )

    return {
      prompt: `Use each digit once to make the ${makeGreatest ? 'greatest' : 'least'} possible number: ${shuffle(digits).join(', ')}.`,
      type: 'place-value-arrangement',
      placeNames,
      answer,
      label: '',
    }
  }

  if (
    (title.startsWith('round to the nearest ') && title.includes('(to millions)')) ||
    title === 'round to the nearest 1,000,000' ||
    title === 'round to the nearest 10, 100, or 1,000' ||
    title === 'round the underlined digit (to millions)'
  ) {
    const place = title === 'round to the nearest 10, 100, or 1,000'
      ? [10, 100, 1000][randomInt(0, 2)]
      : title === 'round the underlined digit (to millions)'
        ? [10, 100, 1000, 10000, 100000, 1000000][randomInt(0, 5)]
        : Number(title.match(/nearest ([\d,]+)/)?.[1].replaceAll(',', ''))
    let number = randomInt(100000, 9999999)

    while (number % place === 0) {
      number = randomInt(100000, 9999999)
    }

    const answer = Math.round(number / place) * place
    const distractors = answer < place
      ? [answer + place, answer + place * 2, number]
      : [answer - place, answer + place, number]

    if (title === 'round the underlined digit (to millions)') {
      const placeValueDisplay = {
        number: String(number),
        digitIndex: String(number).length - 1 - Math.log10(place),
      }
      const prompt = `Round the underlined digit to the nearest ${place.toLocaleString('en-US')}.`

      if (lessonScore >= 90) {
        return {
          prompt,
          type: 'text',
          answer: answer.toLocaleString('en-US'),
          label: '',
          placeValueDisplay,
        }
      }

      return {
        ...makeMultipleChoice(
          prompt,
          answer.toLocaleString('en-US'),
          distractors.map((distractor) => distractor.toLocaleString('en-US')),
        ),
        placeValueDisplay,
      }
    }

    return makeMultipleChoice(
      `Round ${number.toLocaleString('en-US')} to the nearest ${place.toLocaleString('en-US')}.`,
      answer.toLocaleString('en-US'),
      distractors.map((distractor) => distractor.toLocaleString('en-US')),
    )
  }

  if (title === 'compare similar numbers to the millions') {
    const digits = Array.from({ length: 7 }, (_, index) =>
      index === 0 ? randomInt(1, 9) : randomInt(0, 9),
    )
    const first = Number(digits.join(''))
    let secondDigits = [...digits]
    const shouldMatch = Math.random() < 1 / 3

    if (!shouldMatch) {
      while (secondDigits[5] === secondDigits[6]) {
        secondDigits[6] = randomInt(0, 9)
      }
      const tensDigit = secondDigits[5]
      secondDigits[5] = secondDigits[6]
      secondDigits[6] = tensDigit
    }

    const second = Number(secondDigits.join(''))
    const answer = first > second ? '>' : first < second ? '<' : '='

    return makeMultipleChoice(
      `Compare: ${first.toLocaleString('en-US')} __ ${second.toLocaleString('en-US')}`,
      answer,
      ['>', '<', '='],
    )
  }

  if (title === 'find the missing number in expanded form (to millions)') {
    const placeValues = Array.from({ length: 7 }, (_, index) => {
      const digit = index === 0 ? randomInt(1, 9) : randomInt(0, 9)
      return digit * 10 ** (6 - index)
    })
    const missingValueIndices = placeValues
      .map((value, index) => (value > 0 ? index : -1))
      .filter((index) => index >= 0)
    const missingIndex = missingValueIndices[randomInt(0, missingValueIndices.length - 1)]
    const sum = placeValues.reduce((total, value) => total + value, 0)
    const expression = placeValues
      .map((value, index) => index === missingIndex ? '?' : value.toLocaleString('en-US'))
      .join(' + ')

    return {
      prompt: `Fill in the missing number: ${expression} = ${sum.toLocaleString('en-US')}.`,
      type: 'text',
      answer: String(placeValues[missingIndex]),
      placeValues,
      missingValueIndex: missingIndex,
      label: '',
    }
  }

  if (title === 'identify the place value of an underlined digit') {
    const number = randomInt(1000, 9999)
    const numberText = String(number)
    const digitIndex = randomInt(0, numberText.length - 1)
    const placeNames = ['ones', 'tens', 'hundreds', 'thousands']
    const placeName = placeNames[numberText.length - digitIndex - 1]

    return {
      prompt: 'What is the place value of the underlined digit?',
      type: 'radio',
      options: shuffle(placeNames),
      answer: placeName,
      label: '',
      placeValueDisplay: { number: numberText, digitIndex },
    }
  }

  if (title === 'write a number from its place values') {
    const hundreds = randomInt(1, 9)
    const tens = randomInt(0, 9)
    const ones = randomInt(0, 9)
    const descriptions = [
      `${hundreds} ${hundreds === 1 ? 'hundred' : 'hundreds'}`,
      `${tens} ${tens === 1 ? 'ten' : 'tens'}`,
      `${ones} ${ones === 1 ? 'one' : 'ones'}`,
    ]

    return {
      prompt: `What number is ${descriptions.join(', ')}?`,
      type: 'text',
      answer: String(hundreds * 100 + tens * 10 + ones),
      label: '',
    }
  }

  if (title === 'choose the correct way to say a number') {
    const useThousands = previousQuestion?.placeValueNumber !== undefined
      ? previousQuestion.placeValueNumber < 1000
      : Math.random() < 0.5
    const number = useThousands ? randomInt(1000, 9999) : randomInt(100, 999)
    const hundreds = Math.floor(number / 100)
    const tens = Math.floor((number % 100) / 10)
    const ones = number % 10
    const answer = numberToWords(number)
    const distractors = number < 1000
      ? [
          numberToWords(hundreds * 1000 + number),
          `${numberWords[hundreds]} ${answer}`,
          `${numberWords[hundreds]} hundred ${numberWords[tens]} ${numberWords[ones]}`,
        ]
      : [
          numberToWords(number * 10),
          numberToWords(number % 1000),
          `${numberWords[Math.floor(number / 1000)]} thousand ${numberWords[hundreds % 10]} hundred ${numberWords[tens]} ${numberWords[ones]}`,
        ]

    return {
      ...makeMultipleChoice(`Which is the correct way to say ${number.toLocaleString('en-US')}?`, answer, distractors),
      placeValueNumber: number,
    }
  }

  if (title === 'make the greatest or least number from given digits') {
    const digitCount = randomInt(3, 4)
    const digits = shuffle(Array.from({ length: 9 }, (_, index) => String(index + 1))).slice(0, digitCount)
    const makeGreatest = Math.random() < 0.5
    const answer = [...digits].sort((first, second) =>
      makeGreatest ? Number(second) - Number(first) : Number(first) - Number(second),
    )
    const placeNames = digitCount === 4
      ? ['Thousands', 'Hundreds', 'Tens', 'Ones']
      : ['Hundreds', 'Tens', 'Ones']

    return {
      prompt: `Use each digit once to make the ${makeGreatest ? 'greatest' : 'least'} possible number: ${shuffle(digits).join(', ')}.`,
      type: 'place-value-arrangement',
      placeNames,
      answer,
      label: '',
    }
  }

  if (title === 'round to the nearest 10' || title === 'round to the nearest 100') {
    const number = randomInt(100, 999)
    const place = title.endsWith('10') ? 10 : 100
    const answer = Math.round(number / place) * place
    const prompt = `Round ${number} to the nearest ${place}.`

    if (Math.random() >= 0.5) {
      return {
        prompt,
        type: 'text',
        answer: answer.toLocaleString('en-US'),
        label: '',
      }
    }

    return makeMultipleChoice(
      prompt,
      answer.toLocaleString('en-US'),
      [answer - place, answer + place, number].map((value) => value.toLocaleString('en-US')),
    )
  }

  if (title === 'compare similar three-digit numbers') {
    const digits = shuffle(Array.from({ length: 10 }, (_, index) => index))
    if (digits[0] === 0) [digits[0], digits[1]] = [digits[1], digits[0]]
    const first = digits[0] * 100 + digits[1] * 10 + digits[2]
    const second = digits[0] * 100 + digits[2] * 10 + digits[1]
    const answer = first > second ? '>' : '<'

    return makeMultipleChoice(`Compare: ${first} __ ${second}`, answer, ['>', '<', '='])
  }

  if (title === 'find the missing number in expanded form') {
    const placeValues = [
      randomInt(0, 9),
      randomInt(0, 9) * 10,
      randomInt(0, 9) * 100,
      randomInt(1, 9) * 1000,
    ]
    const missingValueIndices = placeValues
      .map((value, index) => (value > 0 ? index : -1))
      .filter((index) => index >= 0)
    const missingIndex = missingValueIndices[randomInt(0, missingValueIndices.length - 1)]
    const sum = placeValues.reduce((total, value) => total + value, 0)
    const expression = placeValues
      .map((value, index) => index === missingIndex ? '?' : String(value))
      .join(' + ')

    return {
      prompt: `Fill in the missing number: ${expression} = ${sum.toLocaleString('en-US')}.`,
      type: 'text',
      answer: String(placeValues[missingIndex]),
      placeValues,
      missingValueIndex: missingIndex,
      label: '',
    }
  }

  if (title.startsWith('find all the factors of a number')) {
    const maxNumber = Number(title.match(/\(1-(\d+)\)$/)?.[1] ?? 30)
    const number = randomInt(1, maxNumber)
    const factors = Array.from({ length: number }, (_, index) => index + 1)
      .filter((candidate) => number % candidate === 0)
      .map(String)

    return {
      prompt: `Find all the factors of ${number}.`,
      type: 'factor-list',
      answer: factors,
      label: '',
    }
  }

  if (title === 'fill in the missing multiples of a number') {
    const number = randomInt(2, 12)
    const sequenceLength = randomInt(5, 10)
    const sequence = Array.from({ length: sequenceLength }, (_, index) => number * (index + 2))
    const missingIndices = Array.from({ length: sequenceLength }, (_, index) => index)
      .filter((index) => index % 2 === 0)

    return {
      prompt: `Fill in the missing multiples of ${number}.`,
      type: 'missing-multiple-pattern',
      startingNumber: number,
      sequence,
      missingIndices,
      answer: missingIndices.map((index) => String(sequence[index])),
      label: '',
    }
  }

  if (title === 'write multiples of a number') {
    const number = randomInt(2, 12)
    const answerCount = randomInt(5, 10)

    return {
      prompt: `Write the next multiples of ${number}.`,
      type: 'multiple-list',
      answer: Array.from({ length: answerCount }, (_, index) => String(number * (index + 2))),
      startingNumber: number,
      label: '',
    }
  }

  if (title.startsWith('choose a factor of a number')) {
    const maxNumber = Number(title.match(/\(1-(\d+)\)$/)?.[1] ?? 50)
    const eligibleNumbers = Array.from({ length: maxNumber - 3 }, (_, index) => index + 4)
      .filter((candidate) =>
        Array.from({ length: candidate }, (_, index) => index + 1)
          .filter((factor) => candidate % factor === 0).length > 2,
      )
    const number = eligibleNumbers[randomInt(0, eligibleNumbers.length - 1)]
    const factors = Array.from({ length: number }, (_, index) => index + 1)
      .filter((candidate) => candidate > 1 && candidate < number && number % candidate === 0)
    const availableFactors = previousQuestion?.factorNumber === number && factors.length > 1
      ? factors.filter((candidate) => String(candidate) !== previousQuestion.answer)
      : factors
    const factor = availableFactors[randomInt(0, availableFactors.length - 1)]
    const distractors = Array.from({ length: number - 1 }, (_, index) => index + 1)
      .filter((candidate) => number % candidate !== 0)
      .sort((first, second) => Math.abs(first - factor) - Math.abs(second - factor))
    const options = shuffle([
      String(factor),
      ...distractors.slice(0, 3).map(String),
    ])

    return {
      prompt: `Which of these is a factor of ${number}?`,
      type: 'radio',
      options,
      answer: String(factor),
      factorNumber: number,
      label: '',
    }
  }

  if (title === 'choose a multiple of a number') {
    const number = randomInt(2, 12)
    const answer = number * randomInt(2, 12)
    const distractors = Array.from({ length: 143 }, (_, index) => index + 2)
      .filter((candidate) => candidate % number !== 0)
    const options = shuffle([
      String(answer),
      ...shuffle(distractors).slice(0, 3).map(String),
    ])

    return {
      prompt: `Which of these is a multiple of ${number}?`,
      type: 'radio',
      options,
      answer: String(answer),
      label: '',
    }
  }

  if (config.type === 'multiplication-pattern') {
    const buildPattern = (start, length) => {
      const values = [start]
      const increment = start <= 4
        ? randomInt(1, 4)
        : start <= 8
          ? randomInt(1, 2)
          : 1

      while (values.length < length) {
        values.push(values[values.length - 1] + increment)
      }

      return values
    }

    const columnHeaders = buildPattern(randomInt(1, 12), 4)
    const rowHeaders = buildPattern(randomInt(1, 12), 3)
    const products = rowHeaders.map((rowHeader) => columnHeaders.map((columnHeader) => rowHeader * columnHeader))
    const missingCells = shuffle(Array.from({ length: 12 }, (_, index) => index))
      .slice(0, 3)
      .map((cellIndex) => {
        const rowIndex = Math.floor(cellIndex / columnHeaders.length)
        const columnIndex = cellIndex % columnHeaders.length

        return {
          rowIndex,
          columnIndex,
          answer: products[rowIndex][columnIndex],
        }
      })

    return {
      prompt: 'Fill in the missing numbers.',
      type: 'multiplication-pattern',
      label: '',
      operation: 'multiplication',
      patternTable: {
        columnHeaders,
        rowHeaders,
        products,
        missingCells,
      },
    }
  }

  const makeWordProblem = (a, b, item, container) => ({
    prompt: `There are ${a} ${item} in one ${container} and ${b} in another. How many ${item} are there altogether?`,
    answer: String(a + b),
    label: item,
    operation: 'addition',
    digits,
    values: [a, b],
    wordPair: [item, container],
  })

  const makeSubtractionWordProblem = (a, b, item, container) => ({
    prompt: `There are ${a} ${item} in a ${container}. If ${b} are taken away, how many ${item} are left?`,
    answer: String(a - b),
    label: item,
    operation: 'subtraction',
    digits,
    values: [a, b],
    wordPair: [item, container],
  })

  if (config.type === 'fraction') {
    if (title === 'build an equivalent fraction with a picture') {
      const baseDenominator = randomInt(2, 6)
      const baseNumerator = randomInt(1, baseDenominator - 1)
      const showLargerDenominator = Math.random() < 0.5
      const numerator = showLargerDenominator ? baseNumerator * 2 : baseNumerator
      const denominator = showLargerDenominator ? baseDenominator * 2 : baseDenominator
      const answerNumerator = showLargerDenominator ? baseNumerator : baseNumerator * 2
      const answerDenominator = showLargerDenominator ? baseDenominator : baseDenominator * 2
      const answer = `${answerNumerator}/${answerDenominator}`

      return {
        prompt: `Use the empty rectangle below to find an equivalent fraction for ${numerator}/${denominator}.`,
        type: 'equivalent-fraction-builder',
        answer,
        label: '',
        fractionBuilder: {
          numerator,
          denominator,
          answerNumerator,
          answerDenominator,
        },
      }
    }

    if (title === 'identify equivalent fractions') {
      const baseDenominator = randomInt(3, 8)
      const baseNumerator = randomInt(1, baseDenominator - 1)
      const multiplier = randomInt(2, 4)
      const answerNumerator = baseNumerator * multiplier
      const answerDenominator = baseDenominator * multiplier
      const answer = `${answerNumerator}/${answerDenominator}`
      const candidates = [
        `${answerNumerator - 1}/${answerDenominator}`,
        `${answerNumerator + 1}/${answerDenominator}`,
        `${answerNumerator}/${answerDenominator - 1}`,
        `${answerNumerator}/${answerDenominator + 1}`,
        `${baseNumerator}/${answerDenominator}`,
        `${answerNumerator}/${baseDenominator}`,
      ].filter((fraction) => {
        const [candidateNumerator, candidateDenominator] = fraction.split('/').map(Number)
        return candidateNumerator > 0 &&
          candidateNumerator < candidateDenominator &&
          candidateDenominator > 1 &&
          candidateNumerator * baseDenominator !== baseNumerator * candidateDenominator
      })
      const options = shuffle([answer, ...shuffle([...new Set(candidates)]).slice(0, 3)])

      return {
        ...makeMultipleChoice(
          `Which fraction is equivalent to ${baseNumerator}/${baseDenominator}?`,
          answer,
          options.filter((option) => option !== answer),
        ),
        fractionVisual: {
          kind: 'bar',
          fractions: [{ numerator: baseNumerator, denominator: baseDenominator }],
          optionFractions: Object.fromEntries(options.map((fraction) => {
            const [optionNumerator, optionDenominator] = fraction.split('/').map(Number)
            return [fraction, { numerator: optionNumerator, denominator: optionDenominator }]
          })),
        },
        fractionPictureHelper: {
          base: { numerator: baseNumerator, denominator: baseDenominator },
          options,
          kind: 'bar',
        },
      }
    }

    if (title.includes('equivalent')) {
      const denominator = randomInt(2, 8)
      const numerator = randomInt(1, denominator - 1)
      const multiplier = randomInt(2, 4)
      const answer = `${numerator * multiplier}/${denominator * multiplier}`

      return makeMultipleChoice(
        `Which fraction is equivalent to ${numerator}/${denominator}?`,
        answer,
        [`${numerator + 1}/${denominator}`, `${numerator}/${denominator + 1}`, `${denominator}/${numerator}`],
      )
    }

    if (title === 'compare fractions with unlike denominators') {
      const firstDenominator = randomInt(3, 8)
      const firstNumerator = randomInt(1, firstDenominator - 1)
      let secondDenominator = randomInt(3, 8)
      while (secondDenominator === firstDenominator) {
        secondDenominator = randomInt(3, 8)
      }
      const secondNumerator = randomInt(1, secondDenominator - 1)
      const first = `${firstNumerator}/${firstDenominator}`
      const second = `${secondNumerator}/${secondDenominator}`
      const firstValue = first.split('/').reduce((numerator, value) => numerator / Number(value))
      const secondValue = second.split('/').reduce((numerator, value) => numerator / Number(value))
      const answer = firstValue > secondValue ? first : firstValue < secondValue ? second : 'They are equal'

      return {
        ...makeMultipleChoice(
        `Which is greater: ${first} or ${second}?`,
        answer,
        [first, second, 'They are equal'],
        ),
        fractionPictureHelper: {
          models: [
            { numerator: firstNumerator, denominator: firstDenominator, label: first },
            { numerator: secondNumerator, denominator: secondDenominator, label: second },
          ],
          kind: 'bar',
        },
      }
    }

    if (title.includes('compare')) {
      const first = `${randomInt(1, 5)}/${randomInt(6, 10)}`
      const second = `${randomInt(1, 5)}/${randomInt(6, 10)}`
      const firstValue = first.split('/').reduce((numerator, value) => numerator / Number(value))
      const secondValue = second.split('/').reduce((numerator, value) => numerator / Number(value))
      const answer = firstValue > secondValue ? first : firstValue < secondValue ? second : 'They are equal'

      return makeMultipleChoice(
        `Which is greater: ${first} or ${second}?`,
        answer,
        [first, second, 'They are equal'],
      )
    }

    if (title.includes('simplify')) {
      const denominator = randomInt(3, 8)
      const numerator = randomInt(1, denominator - 1)
      const factor = randomInt(2, 4)
      const originalNumerator = numerator * factor
      const originalDenominator = denominator * factor

      return {
        prompt: `Write ${originalNumerator}/${originalDenominator} in simplest form.`,
        type: 'fraction-entry',
        answer: `${numerator}/${denominator}`,
        label: '',
        originalFraction: { numerator: originalNumerator, denominator: originalDenominator },
      }
    }

    if (title.includes('number line')) {
      const denominator = randomInt(2, 8)
      const numerator = randomInt(1, denominator - 1)
      const answer = `${numerator}/${denominator}`

      return makeMultipleChoice(
        `Which fraction belongs at ${numerator}/${denominator} on the number line?`,
        answer,
        [`${numerator + 1}/${denominator}`, `${numerator}/${denominator + 1}`, `${denominator - numerator}/${denominator}`],
      )
    }

    if (title === 'add fractions with like denominators') {
      const denominator = randomInt(4, 8)
      const numerator = randomInt(1, denominator - 1)
      const secondNumerator = randomInt(1, denominator - 1)
      const resultNumerator = numerator + secondNumerator
      const fractionPictureModels = resultNumerator > denominator
        ? [
            { numerator: denominator, denominator, label: 'Whole' },
            { numerator: resultNumerator - denominator, denominator, label: 'Remaining fraction' },
          ]
        : [{ numerator: resultNumerator, denominator, label: 'Answer' }]

      return {
        prompt: `Add: ${numerator}/${denominator} + ${secondNumerator}/${denominator} = ?`,
        type: 'fraction-entry',
        answer: formatMixedFraction(resultNumerator, denominator),
        label: '',
        fractionPictureHelper: {
          models: fractionPictureModels,
          kind: 'bar',
          showModelLabels: false,
          showHint: resultNumerator >= denominator,
        },
      }
    }

    const denominator = randomInt(2, 8)
    const numerator = randomInt(1, denominator - 1)
    const secondNumerator = randomInt(1, denominator - 1)
    const answer = `${numerator + secondNumerator}/${denominator}`

    if (title.includes('word problems')) {
      return {
        prompt: `A recipe uses ${numerator}/${denominator} cup of flour in the morning and ${secondNumerator}/${denominator} cup later. How much flour is used altogether?`,
        type: 'text',
        answer,
        label: 'cups',
        values: [numerator, secondNumerator, denominator],
        operation: 'fraction-addition',
      }
    }

    return {
      prompt: `Add: ${numerator}/${denominator} + ${secondNumerator}/${denominator} = ?`,
      type: 'text',
      answer,
      label: '',
      values: [numerator, secondNumerator, denominator],
      operation: 'fraction-addition',
    }
  }

  if (config.type === 'decimal') {
    const first = Number((randomInt(10, 90) / 100).toFixed(2))
    const second = Number((randomInt(10, 90) / 100).toFixed(2))

    if (title.includes('compare')) {
      const answer = first > second ? '>' : first < second ? '<' : '='
      return makeMultipleChoice(`Compare: ${first} __ ${second}`, answer, ['>', '<', '='])
    }

    if (title.includes('convert')) {
      const numerator = randomInt(1, 9)
      const denominator = 10 ** randomInt(1, 2)
      const answer = String((numerator / denominator).toFixed(denominator === 10 ? 1 : 2))
      return { prompt: `Convert ${numerator}/${denominator} to a decimal.`, type: 'text', answer, label: '' }
    }

    const operation = title.includes('subtract') ? 'subtraction' : 'addition'
    const answer = (operation === 'addition' ? first + second : first - second).toFixed(2)
    return { ...makeQuestion(first, second, operation), prompt: `Solve: ${first} ${operation === 'addition' ? '+' : '-'} ${second} = ?`, answer }
  }

  if (config.type === 'place-value') {
    const number = randomInt(100000, 9999999)

    if (title.includes('round')) {
      const place = title.includes('hundred') ? 100 : 10
      const answer = String(Math.round(number / place) * place)
      return makeMultipleChoice(`Round ${number} to the nearest ${place === 100 ? 'hundred' : 'ten'}.`, answer, [number, answer - place, answer + place])
    }

    if (title.includes('compare') || title.includes('order')) {
      const values = [number, number + randomInt(10, 999), number - randomInt(10, 999)]
      const answer = title.includes('order') ? [...values].sort((a, b) => a - b).join(', ') : String(values[0] > values[1] ? '>' : '<')
      return title.includes('order')
        ? makeMultipleChoice(`Order these numbers from least to greatest: ${values.join(', ')}.`, answer, [values.join(', '), [...values].reverse().join(', '), [...values].sort((a, b) => b - a).join(', ')])
        : makeMultipleChoice(`Compare: ${values[0]} __ ${values[1]}`, answer, ['>', '<', '='])
    }

    if (title.includes('expanded')) {
      const answer = String(number).split('').map((digit, index, digitsArray) => `${digit}${'0'.repeat(digitsArray.length - index - 1)}`).filter((value) => !value.startsWith('0')).join(' + ')
      return { prompt: `Write ${number} in expanded form.`, type: 'text', answer, label: '' }
    }

    if (title.includes('word form')) {
      const answer = numberToWords(number)
      return makeMultipleChoice(`Which word form matches ${number}?`, answer, [numberToWords(number + 1), numberToWords(number - 1), numberToWords(number + 10)])
    }

    const digit = String(number)[randomInt(0, String(number).length - 1)]
    const answer = String(Number(digit) * 10 ** (String(number).length - 1 - String(number).indexOf(digit)))
    return makeMultipleChoice(`What is the value of the highlighted digit ${digit} in ${number}?`, answer, [String(Number(digit) * 10), digit, String(Number(digit) * 100)])
  }

  if (config.type === 'multiplication' || config.type === 'division') {
    const isMultiplyByTwoFiveTen = title === 'multiply by 2, 5, and 10'
    const isArrayLesson = config.arrayGrid === true
    const isRegroupingLesson = config.regrouping === true
    const isMultiplicationWordProblem = config.multiplicationWordProblem === true
    const isOneByTwoDigitLesson = config.oneByTwoDigit === true
    let a = config.type === 'multiplication'
      ? (isArrayLesson
        ? randomInt(1, 12)
        : isRegroupingLesson
          ? randomInt(1, 99)
          : isMultiplyByTwoFiveTen
            ? randomInt(1, 20)
            : buildRandomNumber(1))
      : randomInt(2, 12)
    let b = config.type === 'multiplication'
      ? (isArrayLesson
        ? randomInt(1, 12)
        : isRegroupingLesson
          ? randomInt(1, 9)
          : isMultiplyByTwoFiveTen
            ? [2, 5, 10][randomInt(0, 2)]
            : randomInt(2, 12))
      : buildRandomNumber(1)

    if (isMultiplicationWordProblem) {
      const oneDigitFactor = randomInt(1, 9)
      const factorLengthRoll = randomInt(1, 10)
      const otherFactor = factorLengthRoll <= 4
        ? randomInt(10, 99)
        : factorLengthRoll <= 8
          ? randomInt(100, 999)
          : randomInt(1000, 9999)

      if (Math.random() < 0.5) {
        a = oneDigitFactor
        b = otherFactor
      } else {
        a = otherFactor
        b = oneDigitFactor
      }
    }

    if (isOneByTwoDigitLesson) {
      const oneDigitFactor = randomInt(1, 9)
      const twoDigitFactor = randomInt(10, 99)

      if (Math.random() < 0.5) {
        a = oneDigitFactor
        b = twoDigitFactor
      } else {
        a = twoDigitFactor
        b = oneDigitFactor
      }
    }

    while (isRegroupingLesson && (a % 10) * (b % 10) <= 10) {
      a = randomInt(1, 99)
      b = randomInt(1, 9)
    }

    if (config.type === 'division') {
      a = b * randomInt(2, 12)
    }

    if (title.includes('word problems')) {
      const wordPair = wordProblemPairs[randomInt(0, wordProblemPairs.length - 1)]
      const prompt = config.type === 'multiplication'
        ? `There are ${a.toLocaleString('en-US')} ${wordPair[0]} in each ${wordPair[1]}. How many ${wordPair[0]} are there in ${b.toLocaleString('en-US')} ${wordPair[1]}s?`
        : `Share ${a.toLocaleString('en-US')} ${wordPair[0]} equally among ${b.toLocaleString('en-US')} ${wordPair[1]}s. How many ${wordPair[0]} go in each one?`
      const answer = config.type === 'multiplication' ? a * b : a / b

      return { prompt, type: 'text', answer: String(answer), label: wordPair[0], operation: config.type, values: [a, b], wordPair }
    }

    return makeQuestion(a, b, config.type)
  }

  if (config.type === 'addition' && title.includes('word problems')) {
    let a = buildRandomNumber(digits)
    let b = buildRandomNumber(digits)
    let wordPair = wordProblemPairs[randomInt(0, wordProblemPairs.length - 1)]

    while (
      previousQuestion &&
      a === previousQuestion.values[0] &&
      b === previousQuestion.values[1] &&
      wordPair[0] === previousQuestion.wordPair?.[0] &&
      wordPair[1] === previousQuestion.wordPair?.[1]
    ) {
      a = buildRandomNumber(digits)
      b = buildRandomNumber(digits)
      wordPair = wordProblemPairs[randomInt(0, wordProblemPairs.length - 1)]
    }

    return makeWordProblem(a, b, wordPair[0], wordPair[1])
  }

  if (config.type === 'subtraction-word-problem') {
    let a = buildRandomNumber(digits)
    let b = buildRandomNumber(digits)
    let wordPair = wordProblemPairs[randomInt(0, wordProblemPairs.length - 1)]

    while (
      a <= b ||
      (previousQuestion &&
        a === previousQuestion.values[0] &&
        b === previousQuestion.values[1] &&
        wordPair[0] === previousQuestion.wordPair?.[0] &&
        wordPair[1] === previousQuestion.wordPair?.[1])
    ) {
      a = buildRandomNumber(digits)
      b = buildRandomNumber(digits)
      wordPair = wordProblemPairs[randomInt(0, wordProblemPairs.length - 1)]
    }

    return makeSubtractionWordProblem(a, b, wordPair[0], wordPair[1])
  }

  if (config.type === 'missing-number-subtraction') {
    let a = buildRandomNumber(digits)
    let b = buildRandomNumber(digits)

    while (
      a <= b ||
      (previousQuestion && a === previousQuestion.values[0] && b === previousQuestion.values[1])
    ) {
      a = buildRandomNumber(digits)
      b = buildRandomNumber(digits)
    }

    const difference = a - b
    const missingPosition = randomInt(0, 2)
    const prompt = missingPosition === 0
      ? `Find the missing number: ? - ${b} = ${difference}`
      : missingPosition === 1
        ? `Find the missing number: ${a} - ? = ${difference}`
        : `Find the missing number: ${a} - ${b} = ?`
    const answer = missingPosition === 0 ? a : missingPosition === 1 ? b : difference

    return {
      prompt,
      type: 'text',
      answer: String(answer),
      label: '',
      operation: 'subtraction',
      digits,
      values: [a, b],
    }
  }

  if (config.type === 'addition' && title.includes('missing digit')) {
    let a = buildRandomNumber(2)
    let b = buildRandomNumber(2)
    const sum = a + b

    // Randomly choose which number to replace with "?"
    const missingPosition = randomInt(0, 2) // 0: first number, 1: second number, 2: sum

    const numberSentence = missingPosition === 0
      ? `? + ${b} = ${sum}`
      : missingPosition === 1
        ? `${a} + ? = ${sum}`
        : `${a} + ${b} = ?`
    const answer = missingPosition === 0 ? String(a) : missingPosition === 1 ? String(b) : String(sum)

    return {
      prompt: `Fill in the missing number:\n\n${numberSentence}`,
      type: 'text',
      answer,
      label: '',
    }
  }

  if (config.type === 'addition' && title.includes('estimation')) {
    const first = randomInt(20, 89)
    const second = randomInt(20, 89)
    const answer = String(Math.round(first / 10) * 10 + Math.round(second / 10) * 10)

    return makeMultipleChoice(
      `Estimate ${first} + ${second} by rounding to the nearest ten.`,
      answer,
      [String(first + second), String(Number(answer) - 10), String(Number(answer) + 10)],
    )
  }

  if (config.type === 'number-line') {
    let a = buildRandomNumber(digits)
    let b = buildRandomNumber(digits)

    while (previousQuestion && a === previousQuestion.values[0] && b === previousQuestion.values[1]) {
      a = buildRandomNumber(digits)
      b = buildRandomNumber(digits)
    }

    return {
      prompt: `What is ${a} + ${b}?`,
      type: 'number-line',
      answer: String(a + b),
      label: '',
      operation: 'addition',
      values: [a, b],
    }
  }

  if (config.type === 'place-value-subtraction') {
    let a = buildRandomNumber(digits)
    let b = buildRandomNumber(digits)

    while (a < b || (previousQuestion && a === previousQuestion.values[0] && b === previousQuestion.values[1])) {
      a = buildRandomNumber(digits)
      b = buildRandomNumber(digits)
    }

    return {
      prompt: `What is ${a} - ${b}?`,
      type: 'place-value-subtraction',
      answer: String(a - b),
      label: '',
      operation: 'subtraction',
      digits,
      values: [a, b],
    }
  }

  if (config.type === 'subtraction-across-zeros') {
    let a = randomInt(2, 9) * 100 + (Math.random() < 0.7 ? 0 : randomInt(1, 9))
    let b = randomInt(100, a - 1)

    while (
      b % 10 <= a % 10 ||
      (previousQuestion && a === previousQuestion.values[0] && b === previousQuestion.values[1])
    ) {
      a = randomInt(2, 9) * 100 + (Math.random() < 0.7 ? 0 : randomInt(1, 9))
      b = randomInt(100, a - 1)
    }

    return {
      prompt: `Solve: ${a} - ${b} = ?`,
      type: 'text',
      answer: String(a - b),
      label: '',
      operation: 'subtraction',
      digits,
      values: [a, b],
    }
  }

  if (config.type === 'subtraction-regrouping') {
    let a = buildRandomNumber(digits)
    const buildSecondNumber = () => buildRandomNumber(Math.random() < 0.5 ? 2 : 3)
    let b = buildSecondNumber()
    const getOnesDigit = (number) => number % 10
    const getTensDigit = (number) => Math.floor(number / 10) % 10

    while (
      a < b ||
      (getOnesDigit(a) >= getOnesDigit(b) && getTensDigit(a) >= getTensDigit(b)) ||
      (previousQuestion && a === previousQuestion.values[0] && b === previousQuestion.values[1])
    ) {
      a = buildRandomNumber(digits)
      b = buildSecondNumber()
    }

    return makeQuestion(a, b, 'subtraction')
  }

  if (config.type === 'addition' && (title.includes('pattern') || title.includes('number fact'))) {
    const first = randomInt(2, 20)
    const second = randomInt(2, 20)
    const answer = String(first + second)

    return makeMultipleChoice(
      `What is ${first} + ${second}?`,
      answer,
      [String(Number(answer) + 1), String(Number(answer) - 1), String(Number(answer) + 2)],
    )
  }

  if (config.type === 'addition' && config.operandCount === 3) {
    let a = buildRandomNumber(digits)
    let b = buildRandomNumber(digits)
    let c = buildRandomNumber(digits)

    while (
      previousQuestion &&
      a === previousQuestion.values[0] &&
      b === previousQuestion.values[1] &&
      c === previousQuestion.values[2]
    ) {
      a = buildRandomNumber(digits)
      b = buildRandomNumber(digits)
      c = buildRandomNumber(digits)
    }

    return {
      prompt: `Solve: ${a} + ${b} + ${c} = ?`,
      answer: String(a + b + c),
      label: '',
      operation: 'addition',
      digits,
      values: [a, b, c],
    }
  }

  if (config.type === 'subtraction') {
    let a = buildRandomNumber(digits)
    let b = buildRandomNumber(digits)

    while (a < b || (previousQuestion && a === previousQuestion.values[0] && b === previousQuestion.values[1])) {
      a = buildRandomNumber(digits)
      b = buildRandomNumber(digits)
    }

    return makeQuestion(a, b, 'subtraction')
  }

  if (config.type === 'addition' && title.includes('regrouping')) {
    let a = buildRandomNumber(digits)
    let b = buildRandomNumber(digits)
    const getOnesDigit = (num) => num % 10

    while (
      (getOnesDigit(a) + getOnesDigit(b) < 10) ||
      (previousQuestion && a === previousQuestion.values[0] && b === previousQuestion.values[1])
    ) {
      a = buildRandomNumber(digits)
      b = buildRandomNumber(digits)
    }

    return makeQuestion(a, b, 'addition')
  }

  let a = buildRandomNumber(digits)
  let b = buildRandomNumber(digits)

  while (previousQuestion && a === previousQuestion.values[0] && b === previousQuestion.values[1]) {
    a = buildRandomNumber(digits)
    b = buildRandomNumber(digits)
  }

  return makeQuestion(a, b, 'addition')
}

const computeMathAnswer = (question) => {
  if (!question) {
    return ''
  }

  if (question.type === 'multiplication-pattern') {
    return question.patternTable.missingCells.map(({ answer }) => String(answer))
  }

  if (question.type === 'division-remainder' || question.type === 'long-division') {
    return {
      quotient: String(Math.floor(question.values[0] / question.values[1])),
      remainder: String(question.values[0] % question.values[1]),
    }
  }

  if (Array.isArray(question.answer)) return question.answer.map(String)
  if (question.answer !== undefined) return String(question.answer)

  if (!Array.isArray(question.values) || question.values.length === 0) {
    return ''
  }

  if (question.operation === 'subtraction') {
    return String(question.values[0] - question.values[1])
  }

  if (question.operation === 'multiplication') {
    return String(question.values[0] * question.values[1])
  }

  if (question.operation === 'division') {
    return String(question.values[0] / question.values[1])
  }

  if (question.operation === 'fraction-addition') {
    return `${question.values[0] + question.values[1]}/${question.values[2]}`
  }

  return String(question.values.reduce((total, value) => total + value, 0))
}

function App() {
  const grades = useMemo(() => lessonData.map(({ grade }) => grade), [])
  const [activeGrade, setActiveGrade] = useState(() => {
    return getInitialViewSelection().grade
  })
  const [selectedSubject, setSelectedSubject] = useState(() => getInitialViewSelection().subject)
  const [selectedLesson, setSelectedLesson] = useState(() => getInitialViewSelection().lesson)
  const [lessonResponses, setLessonResponses] = useState({})
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false)
  const [successMessage, setSuccessMessage] = useState(successMessages[0])
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(true)
  const [isBlankAnswer, setIsBlankAnswer] = useState(false)
  const [mathQuestionMap, setMathQuestionMap] = useState(() => {
    const initialSelection = getInitialViewSelection()
    if (!initialSelection.lesson || initialSelection.subject !== 'math') return {}

    const gradeData = lessonData.find(({ grade }) => grade === initialSelection.grade) ?? lessonData[0]
    const lesson = Object.values(gradeData.subjects)
      .flatMap((subject) => subject.sections.flatMap((section) => section.lessons))
      .find((entry) => entry.title === initialSelection.lesson)

    return lesson ? { [initialSelection.lesson]: generateMathQuestion(lesson) } : {}
  })
  const [readingQuestionMap, setReadingQuestionMap] = useState(() => {
    const initialSelection = getInitialViewSelection()
    if (!initialSelection.lesson || initialSelection.subject === 'math') return {}

    const gradeData = lessonData.find(({ grade }) => grade === initialSelection.grade) ?? lessonData[0]
    const lesson = Object.values(gradeData.subjects)
      .flatMap((subject) => subject.sections.flatMap((section) => section.lessons))
      .find((entry) => entry.title === initialSelection.lesson)

    return lesson?.readingSkill
      ? { [initialSelection.lesson]: getReadingQuestion(lesson.readingSkill, 0) }
      : {}
  })
  const [lessonScores, setLessonScores] = useState(() => loadLessonMap('parrot-learning-scores'))
  const [lessonCompletionCounts, setLessonCompletionCounts] = useState(() => loadLessonMap('parrot-learning-completion-counts'))
  const [lessonAttempts, setLessonAttempts] = useState({})
  const [lessonTimes, setLessonTimes] = useState(() => loadLessonMap('parrot-learning-times'))
  const [lessonQuestionCounts, setLessonQuestionCounts] = useState(() => loadLessonMap('parrot-learning-question-counts'))
  const [revealedAnswers, setRevealedAnswers] = useState({})
  const [arrayCellSelections, setArrayCellSelections] = useState({})
  const [arrayCellUndoSelections, setArrayCellUndoSelections] = useState({})
  const [showExpandedFormHelp, setShowExpandedFormHelp] = useState(false)
  const [simplifyHelpStep, setSimplifyHelpStep] = useState(0)
  const [showFractionPictureHelper, setShowFractionPictureHelper] = useState(false)
  const [fractionPictureAnswers, setFractionPictureAnswers] = useState({})
  const [fractionVerificationResponses, setFractionVerificationResponses] = useState({})

  useEffect(() => {
    try {
      window.localStorage.setItem('parrot-learning-view-selection', JSON.stringify({
        grade: activeGrade,
        subject: selectedSubject,
        lesson: selectedLesson,
      }))
    } catch (error) {
      console.error('Unable to save app view selection.', error)
    }
  }, [activeGrade, selectedSubject, selectedLesson])

  useEffect(() => {
    if (!selectedLesson) return undefined

    const timerId = window.setInterval(() => {
      setLessonTimes((previous) => ({
        ...previous,
        [selectedLesson]: (previous[selectedLesson] ?? 0) + 1,
      }))
    }, 1000)

    return () => window.clearInterval(timerId)
  }, [selectedLesson])

  useEffect(() => {
    try {
      window.localStorage.setItem('parrot-learning-question-counts', JSON.stringify(lessonQuestionCounts))
    } catch (error) {
      console.error('Unable to save lesson question counts to local storage.', error)
    }
  }, [lessonQuestionCounts])

  useEffect(() => {
    try {
      window.localStorage.setItem('parrot-learning-scores', JSON.stringify(lessonScores))
    } catch (error) {
      console.error('Unable to save lesson scores to local storage.', error)
    }
  }, [lessonScores])

  useEffect(() => {
    try {
      window.localStorage.setItem('parrot-learning-times', JSON.stringify(lessonTimes))
    } catch (error) {
      console.error('Unable to save lesson times to local storage.', error)
    }
  }, [lessonTimes])

  useEffect(() => {
    try {
      window.localStorage.setItem('parrot-learning-completion-counts', JSON.stringify(lessonCompletionCounts))
    } catch (error) {
      console.error('Unable to save lesson completion counts to local storage.', error)
    }
  }, [lessonCompletionCounts])

  const selectedGradeData = useMemo(
    () => lessonData.find((entry) => entry.grade === activeGrade) ?? lessonData[0],
    [activeGrade],
  )

  const subjectEntries = Object.entries(selectedGradeData.subjects)
  const activeSubjectEntry =
    subjectEntries.find(([subjectKey]) => subjectKey === selectedSubject) ?? subjectEntries[0]
  const activeSubject = activeSubjectEntry[1]
  const activeSubjectKey = activeSubjectEntry[0]
  const activeSubjectLessons = activeSubject.sections.flatMap((section) => section.lessons)
  const progressValue = activeSubjectLessons.length > 0
    ? Math.round(
        activeSubjectLessons.reduce(
          (total, lesson) => total + (lessonScores[lesson.title] ?? lesson.progress ?? 0),
          0,
        ) / activeSubjectLessons.length,
      )
    : 0
  const progressRadius = 24
  const progressCircumference = 2 * Math.PI * progressRadius
  const progressOffset =
    progressCircumference - (progressValue / 100) * progressCircumference

  const availableLessons = useMemo(
    () => buildLessonList(Object.values(selectedGradeData.subjects)),
    [selectedGradeData],
  )

  const selectedLessonData = useMemo(
    () => availableLessons.find((lesson) => lesson.title === selectedLesson) ?? null,
    [availableLessons, selectedLesson],
  )

  const handleGradeSelect = (grade) => {
    if (selectedLessonData) return

    setActiveGrade(grade)
    setSelectedLesson('')
  }

  const handleSubjectSelect = (subject) => {
    if (selectedLessonData) return

    setSelectedSubject(subject)
    setSelectedLesson('')
  }

  const handleLessonSelect = (lesson) => {
    const lessonEntry = availableLessons.find((entry) => entry.title === lesson)

    setSelectedLesson(lesson)
    setSimplifyHelpStep(0)
    setShowExpandedFormHelp(false)
    setShowFractionPictureHelper(false)
    setSimplifyHelpStep(0)
    setFractionVerificationResponses((previous) => {
      const nextResponses = { ...previous }
      delete nextResponses[lesson]
      return nextResponses
    })

    if (!lessonEntry) return

    if (activeSubjectKey !== 'math') {
      if (lessonEntry.readingSkill) {
        setReadingQuestionMap((previous) => ({
          ...previous,
          [lesson]: getReadingQuestion(lessonEntry.readingSkill, lessonQuestionCounts[lesson] ?? 0),
        }))
      }
      return
    }

    setMathQuestionMap((previous) => {
      if (previous[lesson]) return previous

      return {
        ...previous,
        [lesson]: generateMathQuestion(lessonEntry, null, lessonScores[lesson] ?? lessonEntry.progress ?? 0),
      }
    })
  }

  const handleAnswerChange = (value) => {
    setLessonResponses((previous) => ({
      ...previous,
      [selectedLesson]: value,
    }))
    setShowSuccessOverlay(false)
  }

  const handleFractionPicturePieceToggle = (modelKey, pieceIndex) => {
    setFractionPictureAnswers((previous) => ({
      ...previous,
      [selectedLesson]: {
        ...previous[selectedLesson],
        [modelKey]: {
          selectedPieces: (previous[selectedLesson]?.[modelKey]?.selectedPieces ?? []).includes(pieceIndex)
            ? (previous[selectedLesson]?.[modelKey]?.selectedPieces ?? []).filter((index) => index !== pieceIndex)
            : [...(previous[selectedLesson]?.[modelKey]?.selectedPieces ?? []), pieceIndex],
        },
      },
    }))
  }

  const handleFractionVerificationChange = (field, value) => {
    setFractionVerificationResponses((previous) => ({
      ...previous,
      [selectedLesson]: {
        ...previous[selectedLesson],
        [field]: value,
      },
    }))
  }

  const handleExpandedFormHelpToggle = () => {
    setShowExpandedFormHelp((isVisible) => {
      if (!isVisible && selectedLessonData) {
        setLessonScores((previous) => {
          const currentScore = previous[selectedLesson] ?? selectedLessonData.progress ?? 0

          return {
            ...previous,
            [selectedLesson]: Math.max(0, currentScore - 1),
          }
        })
      }

      return !isVisible
    })
  }

  const handlePatternAnswerChange = (answerIndex, value) => {
    setLessonResponses((previous) => {
      const currentAnswers = Array.isArray(previous[selectedLesson])
        ? [...previous[selectedLesson]]
        : Array(3).fill('')
      currentAnswers[answerIndex] = value

      return {
        ...previous,
        [selectedLesson]: currentAnswers,
      }
    })
    setShowSuccessOverlay(false)
  }

  const handleSequenceAnswerChange = (answerIndex, value, answerCount) => {
    setLessonResponses((previous) => {
      const currentAnswers = Array.isArray(previous[selectedLesson])
        ? [...previous[selectedLesson]]
        : Array(answerCount).fill('')
      currentAnswers[answerIndex] = value

      return {
        ...previous,
        [selectedLesson]: currentAnswers,
      }
    })
    setShowSuccessOverlay(false)
  }

  const normalizeAnswer = (value) => String(value ?? '').trim().toLowerCase().replace(/\s+/g, '')

  const currentMathQuestion =
    selectedLessonData
      ? activeSubjectKey === 'math'
        ? (mathQuestionMap[selectedLesson] ?? null)
        : (readingQuestionMap[selectedLesson] ?? null)
      : null
  const selectedFractionAnswer = activeGrade === 5 &&
    selectedLessonData?.title === 'Identify equivalent fractions'
    ? parseFraction(lessonResponses[selectedLesson])
    : null
  const selectedSimplifiedFraction = (
    activeGrade === 4 && selectedLessonData?.title === 'Simplify fractions using common factors with pictures'
  ) || (
    activeGrade === 5 && selectedLessonData?.title === 'Simplify fractions'
  )
    ? parseFraction(lessonResponses[selectedLesson])
    : null
  const questionFraction = currentMathQuestion?.fractionPictureHelper?.base ??
    currentMathQuestion?.fractionVisual?.fractions?.[0] ??
    currentMathQuestion?.originalFraction

  const arrayGridKey = `${selectedLesson}:${currentMathQuestion?.prompt ?? ''}`
  const selectedArrayCells = arrayCellSelections[arrayGridKey] ?? []
  const hasArrayUndo = Object.prototype.hasOwnProperty.call(arrayCellUndoSelections, arrayGridKey)

  const toggleArrayCell = (cellKey) => {
    setArrayCellSelections((previous) => {
      const currentSelections = previous[arrayGridKey] ?? []
      const nextSelections = currentSelections.includes(cellKey)
        ? currentSelections.filter((selection) => selection !== cellKey)
        : [...currentSelections, cellKey]

      return {
        ...previous,
        [arrayGridKey]: nextSelections,
      }
    })
  }

  const clearArrayCells = () => {
    setArrayCellUndoSelections((previous) => ({
      ...previous,
      [arrayGridKey]: selectedArrayCells,
    }))
    setArrayCellSelections((previous) => ({
      ...previous,
      [arrayGridKey]: [],
    }))
  }

  const undoClearArrayCells = () => {
    if (!hasArrayUndo) return

    setArrayCellSelections((previous) => ({
      ...previous,
      [arrayGridKey]: arrayCellUndoSelections[arrayGridKey],
    }))
    setArrayCellUndoSelections((previous) => {
      const nextSelections = { ...previous }
      delete nextSelections[arrayGridKey]
      return nextSelections
    })
  }

  const handleRevealAnswer = () => {
    if (!selectedLessonData || !currentMathQuestion) return

    setLessonResponses((previous) => ({
      ...previous,
      [selectedLesson]: currentMathQuestion.type === 'fraction-entry'
        ? (() => {
            const value = getEquivalentFractionValue(computeMathAnswer(currentMathQuestion))
            const answer = computeMathAnswer(currentMathQuestion)
            const match = String(answer).match(/^(?:(\d+)\s+)?(\d+)\/(\d+)$/)
            return match
              ? { whole: match[1] ?? '', numerator: match[2], denominator: match[3] }
              : { whole: String(value ?? ''), numerator: '', denominator: '' }
          })()
        : currentMathQuestion.type === 'equivalent-fraction-builder'
        ? {
            selectedSlices: Array.from(
              { length: currentMathQuestion.fractionBuilder.answerNumerator },
              (_, index) => index,
            ),
            fractionText: computeMathAnswer(currentMathQuestion),
          }
        : computeMathAnswer(currentMathQuestion),
    }))
    setRevealedAnswers((previous) => ({
      ...previous,
      [selectedLesson]: true,
    }))
  }

  const handleFractionSliceToggle = (sliceIndex) => {
    setLessonResponses((previous) => {
      const currentResponse = previous[selectedLesson] ?? { selectedSlices: [], fractionText: '' }
      const selectedSlices = Array.isArray(currentResponse.selectedSlices)
        ? currentResponse.selectedSlices
        : []
      const nextSlices = selectedSlices.includes(sliceIndex)
        ? selectedSlices.filter((index) => index !== sliceIndex)
        : [...selectedSlices, sliceIndex]

      return {
        ...previous,
        [selectedLesson]: {
          ...currentResponse,
          selectedSlices: nextSlices,
        },
      }
    })
    setShowSuccessOverlay(false)
  }

  const handleFractionBuilderAnswerChange = (fractionText) => {
    setLessonResponses((previous) => {
      const currentResponse = previous[selectedLesson] ?? { selectedSlices: [], fractionText: '' }

      return {
        ...previous,
        [selectedLesson]: {
          ...currentResponse,
          fractionText,
        },
      }
    })
    setShowSuccessOverlay(false)
  }

  const handleRepeatedDivisionAnswer = (isCorrect) => {
    if (!selectedLessonData) return

    setLessonQuestionCounts((previous) => ({
      ...previous,
      [selectedLesson]: (previous[selectedLesson] ?? 0) + 1,
    }))
    setLessonAttempts((previous) => ({
      ...previous,
      [selectedLesson]: !isCorrect,
    }))
    setLessonScores((previous) => {
      const currentScore = previous[selectedLesson] ?? selectedLessonData.progress ?? 0
      const scoreChange = isCorrect ? getScoreIncrease(currentScore) : -getScoreDecrease(currentScore)
      const nextScore = Math.max(0, Math.min(100, currentScore + scoreChange))

      if (isCorrect && nextScore >= 100) {
        setLessonCompletionCounts((counts) => ({
          ...counts,
          [selectedLesson]: (counts[selectedLesson] ?? 0) + 1,
        }))
      }

      return {
        ...previous,
        [selectedLesson]: isCorrect && nextScore >= 100 ? 0 : nextScore,
      }
    })
  }

  const handleSubmitAnswer = () => {
    if (!selectedLessonData || !currentMathQuestion) return

    const question = currentMathQuestion ?? generateMathQuestion(selectedLessonData)

    if (revealedAnswers[selectedLesson]) {
      const currentScore = lessonScores[selectedLesson] ?? selectedLessonData.progress ?? 0
      const nextQuestion = { ...generateMathQuestion(selectedLessonData, question, currentScore), lessonKey: selectedLesson }
      setMathQuestionMap((previous) => ({
        ...previous,
        [selectedLesson]: nextQuestion,
      }))
      setLessonResponses((previous) => ({
        ...previous,
        [selectedLesson]: '',
      }))
      setShowExpandedFormHelp(false)
      setShowFractionPictureHelper(false)
      setFractionPictureAnswers((previous) => {
        const nextAnswers = { ...previous }
        delete nextAnswers[selectedLesson]
        return nextAnswers
      })
      setFractionVerificationResponses((previous) => {
        const nextResponses = { ...previous }
        delete nextResponses[selectedLesson]
        return nextResponses
      })
      setLessonAttempts((previous) => ({
        ...previous,
        [selectedLesson]: false,
      }))
      setRevealedAnswers((previous) => ({
        ...previous,
        [selectedLesson]: false,
      }))
      return
    }

    const answer = lessonResponses[selectedLesson] ?? ''
    const hasArrayAnswer = normalizeAnswer(answer) !== ''
    const hasArrayCircles = selectedArrayCells.length > 0
    const isBlankAnswer = question.type === 'fraction-entry'
      ? !answer || typeof answer !== 'object' ||
        (!answer.whole?.trim() && !answer.numerator?.trim() && !answer.denominator?.trim())
      : question.type === 'equivalent-fraction-builder'
      ? !answer || typeof answer !== 'object' || !answer.fractionText?.trim() ||
        !Array.isArray(answer.selectedSlices) || answer.selectedSlices.length === 0
      : question.type === 'division-remainder' || question.type === 'long-division'
      ? !answer || typeof answer !== 'object' || !answer.quotient?.trim() ||
        (question.type === 'division-remainder' && !answer.remainder?.trim()) ||
        (question.type === 'long-division' && Number(question.answer.remainder) > 0 && !answer.remainder?.trim())
      : question.type === 'factor-list'
        ? !Array.isArray(answer) || answer.length !== question.answer.length ||
          answer.some((factor) => normalizeAnswer(factor) === '')
      : question.type === 'multiple-list'
        ? !Array.isArray(answer) || answer.length !== question.answer.length ||
          answer.some((multiple) => normalizeAnswer(multiple) === '')
      : question.type === 'missing-multiple-pattern'
        ? !Array.isArray(answer) || answer.length !== question.answer.length ||
          answer.some((multiple) => normalizeAnswer(multiple) === '')
      : question.type === 'place-value-arrangement'
        ? !Array.isArray(answer) || answer.length !== question.answer.length ||
          answer.some((digit) => normalizeAnswer(digit) === '')
      : question.type === 'multiple-answer'
        ? normalizeAnswer(answer) === ''
      : question.arrayGrid
      ? !hasArrayCircles || !hasArrayAnswer
      : question.type === 'multiplication-pattern'
        ? !Array.isArray(answer) || answer.length < question.patternTable.missingCells.length ||
          question.patternTable.missingCells.some((_, index) => normalizeAnswer(answer[index]) === '')
      : Array.isArray(answer)
        ? answer.length === 0
        : normalizeAnswer(answer) === ''

    if (isBlankAnswer) {
      setIsAnswerCorrect(false)
      setIsBlankAnswer(true)
      const blankAnswerMessage = question.arrayGrid
        ? !hasArrayAnswer && !hasArrayCircles
          ? 'Oops! You forgot to solve this problem'
          : !hasArrayAnswer
            ? 'Oops! You forgot to type your answer'
            : 'Oops! You forgot to use the grid'
        : 'Oops! You forgot to type your answer'
      setSuccessMessage(blankAnswerMessage)
      setShowSuccessOverlay(true)
      window.clearTimeout(window.__parrotLessonSuccessTimer)
      window.__parrotLessonSuccessTimer = window.setTimeout(() => {
        setShowSuccessOverlay(false)
      }, 2000)
      return
    }

    const expectedAnswer = computeMathAnswer(question)

    if (!expectedAnswer) return

    setLessonQuestionCounts((previous) => ({
      ...previous,
      [selectedLesson]: (previous[selectedLesson] ?? 0) + 1,
    }))

    const showAnswerFeedback = (isCorrect) => {
      if (isCorrect) {
        const currentScore = lessonScores[selectedLesson] ?? selectedLessonData.progress ?? 0
        const nextScore = Math.min(100, currentScore + getScoreIncrease(currentScore))
        const hasCompleted = nextScore >= 100
        const scoreAfterAnswer = hasCompleted ? 0 : nextScore
        if (activeSubjectKey === 'math') {
          const nextQuestion = { ...generateMathQuestion(selectedLessonData, question, scoreAfterAnswer), lessonKey: selectedLesson }
          setMathQuestionMap((previous) => ({
            ...previous,
            [selectedLesson]: nextQuestion,
          }))
        } else {
          setReadingQuestionMap((previous) => ({
            ...previous,
            [selectedLesson]: getReadingQuestion(
              selectedLessonData.readingSkill,
              (currentMathQuestion.readingIndex ?? lessonQuestionCounts[selectedLesson] ?? 0) + 1,
            ),
          }))
        }
        setLessonAttempts((previous) => ({
          ...previous,
          [selectedLesson]: false,
        }))
        setRevealedAnswers((previous) => ({
          ...previous,
          [selectedLesson]: false,
        }))
        setLessonScores((previous) => {
          const currentScore = previous[selectedLesson] ?? selectedLessonData.progress ?? 0
          const nextScore = Math.min(100, currentScore + getScoreIncrease(currentScore))

          return {
            ...previous,
            [selectedLesson]: nextScore >= 100 ? 0 : nextScore,
          }
        })
        if (hasCompleted) {
          setLessonCompletionCounts((previous) => ({
            ...previous,
            [selectedLesson]: (previous[selectedLesson] ?? 0) + 1,
          }))
        }
        setLessonResponses((previous) => ({
          ...previous,
          [selectedLesson]: '',
        }))
        setShowExpandedFormHelp(false)
        setShowFractionPictureHelper(false)
        setFractionPictureAnswers((previous) => {
          const nextAnswers = { ...previous }
          delete nextAnswers[selectedLesson]
          return nextAnswers
        })
        setFractionVerificationResponses((previous) => {
          const nextResponses = { ...previous }
          delete nextResponses[selectedLesson]
          return nextResponses
        })
      } else {
        setLessonAttempts((previous) => ({
          ...previous,
          [selectedLesson]: true,
        }))
        setLessonScores((previous) => {
          const currentScore = previous[selectedLesson] ?? selectedLessonData.progress ?? 0
          const nextScore = Math.max(0, currentScore - getScoreDecrease(currentScore))

          return {
            ...previous,
            [selectedLesson]: nextScore,
          }
        })
      }

      const messages = isCorrect ? successMessages : incorrectMessages
      const nextMessage = messages[Math.floor(Math.random() * messages.length)]
      setIsAnswerCorrect(isCorrect)
      setIsBlankAnswer(false)
      setSuccessMessage(nextMessage)
      setShowSuccessOverlay(true)
      window.clearTimeout(window.__parrotLessonSuccessTimer)
      window.__parrotLessonSuccessTimer = window.setTimeout(() => {
        setShowSuccessOverlay(false)
      }, 2000)
    }

    if (selectedLesson === 'Write a number from its place values (to millions)') {
      const expectedNumber = normalizeAnswer(expectedAnswer)
      const submittedNumber = normalizeAnswer(answer)
      const digitsMatch = submittedNumber.replaceAll(',', '') === expectedNumber.replaceAll(',', '')
      const requiresComma = expectedNumber.includes(',')
      const hasCorrectComma = submittedNumber === expectedNumber

      if (digitsMatch && requiresComma && !submittedNumber.includes(',')) {
        setIsAnswerCorrect(false)
        setIsBlankAnswer(true)
        setSuccessMessage('Add a comma in the correct place')
        setShowSuccessOverlay(true)
        window.clearTimeout(window.__parrotLessonSuccessTimer)
        window.__parrotLessonSuccessTimer = window.setTimeout(() => {
          setShowSuccessOverlay(false)
        }, 2000)
        return
      }

      showAnswerFeedback(hasCorrectComma)
      return
    }

    if (question.arrayGrid) {
      const [firstFactor, secondFactor] = question.values
      const occupiedRows = new Set(selectedArrayCells.map((cell) => cell.split('-')[0])).size
      const occupiedColumns = new Set(selectedArrayCells.map((cell) => cell.split('-')[1])).size
      const isCorrect =
        (occupiedRows === firstFactor && occupiedColumns === secondFactor) ||
        (occupiedRows === secondFactor && occupiedColumns === firstFactor)

      showAnswerFeedback(isCorrect)
      return
    }

    if (question.type === 'multiplication-pattern') {
      const submittedAnswers = Array.isArray(answer) ? answer : []
      const expectedAnswers = Array.isArray(expectedAnswer) ? expectedAnswer : []
      const isCorrect =
        submittedAnswers.length === expectedAnswers.length &&
        expectedAnswers.every((expected, index) => normalizeAnswer(submittedAnswers[index]) === normalizeAnswer(expected))

      showAnswerFeedback(isCorrect)
      return
    }

    if (question.type === 'factor-list') {
      const submittedFactors = Array.isArray(answer) ? answer.map(normalizeAnswer).sort((a, b) => Number(a) - Number(b)) : []
      const expectedFactors = expectedAnswer.map(normalizeAnswer).sort((a, b) => Number(a) - Number(b))
      const isCorrect =
        submittedFactors.length === expectedFactors.length &&
        submittedFactors.every((factor, index) => factor === expectedFactors[index])

      showAnswerFeedback(isCorrect)
      return
    }

    if (question.type === 'multiple-list') {
      const submittedMultiples = Array.isArray(answer) ? answer.map(normalizeAnswer) : []
      const expectedMultiples = expectedAnswer.map(normalizeAnswer)
      const isCorrect =
        submittedMultiples.length === expectedMultiples.length &&
        submittedMultiples.every((multiple, index) => multiple === expectedMultiples[index])

      showAnswerFeedback(isCorrect)
      return
    }

    if (question.type === 'missing-multiple-pattern') {
      const submittedMultiples = Array.isArray(answer) ? answer.map(normalizeAnswer) : []
      const expectedMultiples = expectedAnswer.map(normalizeAnswer)
      const isCorrect =
        submittedMultiples.length === expectedMultiples.length &&
        submittedMultiples.every((multiple, index) => multiple === expectedMultiples[index])

      showAnswerFeedback(isCorrect)
      return
    }

    if (question.type === 'place-value-arrangement') {
      const submittedDigits = Array.isArray(answer) ? answer.map(normalizeAnswer) : []
      const expectedDigits = expectedAnswer.map(normalizeAnswer)
      const isCorrect =
        submittedDigits.length === expectedDigits.length &&
        submittedDigits.every((digit, index) => digit === expectedDigits[index])

      showAnswerFeedback(isCorrect)
      return
    }

    if (question.type === 'equivalent-fraction-builder') {
      const response = answer && typeof answer === 'object' ? answer : {}
      const fractionMatch = String(response.fractionText ?? '').match(/^\s*(\d+)\s*\/\s*(\d+)\s*$/)
      const selectedSlices = Array.isArray(response.selectedSlices) ? response.selectedSlices : []
      const isCorrect =
        Boolean(fractionMatch) &&
        Number(fractionMatch[1]) === question.fractionBuilder.answerNumerator &&
        Number(fractionMatch[2]) === question.fractionBuilder.answerDenominator &&
        selectedSlices.length === question.fractionBuilder.answerNumerator

      showAnswerFeedback(isCorrect)
      return
    }

    if (question.type === 'division-remainder' || question.type === 'long-division') {
      const submittedAnswer = answer && typeof answer === 'object' ? answer : {}
      const isCorrect =
        normalizeAnswer(submittedAnswer.quotient) === normalizeAnswer(expectedAnswer.quotient) &&
        normalizeAnswer(submittedAnswer.remainder || '0') === normalizeAnswer(expectedAnswer.remainder)

      showAnswerFeedback(isCorrect)
      return
    }

    if (question.type === 'multiple-answer') {
      const submittedNumber = Number(answer)
      const isCorrect =
        Number.isInteger(submittedNumber) &&
        submittedNumber > 0 &&
        submittedNumber % question.multipleOf === 0

      showAnswerFeedback(isCorrect)
      return
    }

    if (question.type === 'checkbox') {
      const currentAnswers = Array.isArray(answer) ? answer : []
      const expectedAnswers = Array.isArray(expectedAnswer) ? expectedAnswer : [expectedAnswer]
      const isCorrect =
        currentAnswers.length === expectedAnswers.length &&
        expectedAnswers.every((item) => currentAnswers.includes(item))

      showAnswerFeedback(isCorrect)
      return
    }

    if (question.type === 'radio') {
      const isCorrect = normalizeAnswer(answer) === normalizeAnswer(expectedAnswer)

      showAnswerFeedback(isCorrect)
      return
    }

    if (question.type === 'fraction-entry') {
      const submittedValue = getEquivalentFractionValue(answer)
      const expectedValue = getEquivalentFractionValue(expectedAnswer)
      const isCorrect =
        submittedValue !== null &&
        expectedValue !== null &&
        Math.abs(submittedValue - expectedValue) < 1e-9

      showAnswerFeedback(isCorrect)
      return
    }

    if (
      selectedLesson === 'Round to the nearest 10' ||
      selectedLesson === 'Round to the nearest 100' ||
      selectedLesson === 'Round the underlined digit (to millions)' ||
      selectedLesson === 'Find the missing number in expanded form (to millions)'
    ) {
      const submittedNumber = normalizeAnswer(answer).replaceAll(',', '')
      const expectedNumber = normalizeAnswer(expectedAnswer).replaceAll(',', '')

      showAnswerFeedback(submittedNumber === expectedNumber)
      return
    }

    const isCorrect = normalizeAnswer(answer) === normalizeAnswer(expectedAnswer)

    showAnswerFeedback(isCorrect)
  }

  const lessonProgress = (() => {
    const lessonProgressMap = {
      75: 1,
      90: 2,
      100: 3,
    }

    const currentValue = selectedLessonData
      ? lessonScores[selectedLesson] ?? selectedLessonData.progress ?? 0
      : 0
    const earnedStars = Object.entries(lessonProgressMap)
      .filter(([threshold]) => currentValue >= Number(threshold))
      .length

    return {
      value: currentValue,
      stars: Array.from({ length: 3 }, (_, index) => index < earnedStars),
    }
  })()

  const renderAnswerField = (lesson) => {
    const question =
      selectedLessonData && selectedLesson === lesson.title
        ? currentMathQuestion ?? lesson.question ?? {
            prompt: `Solve the problem: ${lesson.title}.`,
            type: 'text',
            options: [],
            label: '',
          }
        : lesson.question ?? {
            prompt: `Solve the problem: ${lesson.title}.`,
            type: 'text',
            options: [],
            label: '',
          }
    const resolvedLabel = question.label === 'sum' ? '' : (question.label ?? '')
    const currentValue = lessonResponses[lesson.title] ??
      (question.type === 'checkbox' || question.type === 'factor-list' || question.type === 'multiple-list' || question.type === 'missing-multiple-pattern' || question.type === 'place-value-arrangement'
        ? []
        : question.type === 'division-remainder' || question.type === 'long-division'
          ? {}
          : question.type === 'equivalent-fraction-builder'
            ? { selectedSlices: [], fractionText: '' }
            : '')
    const isCurrentMathLesson = activeSubjectKey === 'math' && selectedLesson === lesson.title
    const isAnswerRevealed = Boolean(revealedAnswers[lesson.title])
    const canRevealAnswer = isCurrentMathLesson && Boolean(lessonAttempts[lesson.title]) && !isAnswerRevealed

    if (question.type === 'multiplication-pattern') {
      return null
    }

    if (question.type === 'factor-list') {
      const answers = Array.isArray(currentValue) ? currentValue : []
      const factorFields = (
        <div className="factor-list-answer" role="group" aria-label="Enter each factor">
          {question.answer.map((_, index) => (
            <div className="factor-list-answer__item" key={index}>
              <input
                className="lesson-detail__field"
                type="text"
                inputMode="numeric"
                aria-label={`Factor ${index + 1}`}
                value={answers[index] ?? ''}
                onChange={(event) => handleSequenceAnswerChange(index, event.target.value, question.answer.length)}
                readOnly={isAnswerRevealed}
              />
              {index < question.answer.length - 1 ? <span aria-hidden="true">,</span> : null}
            </div>
          ))}
        </div>
      )

      if (!canRevealAnswer && !isAnswerRevealed) return factorFields

      return (
        <div className="lesson-detail__input-actions">
          {factorFields}
          {isAnswerRevealed ? (
            <span className="lesson-detail__revealed-status">
              <span className="lesson-detail__revealed-icon" aria-hidden="true">✓</span>
              Answer revealed
            </span>
          ) : (
            <button type="button" className="lesson-detail__reveal" onClick={handleRevealAnswer}>
              Reveal answer
            </button>
          )}
        </div>
      )
    }

    if (question.type === 'multiple-list') {
      const answers = Array.isArray(currentValue) ? currentValue : []
      const multipleFields = (
        <div className="factor-list-answer" role="group" aria-label="Enter the next multiples">
          <div className="factor-list-answer__item">
            <span>{question.startingNumber}</span>
            <span aria-hidden="true">,</span>
          </div>
          {question.answer.map((_, index) => (
            <div className="factor-list-answer__item" key={index}>
              <input
                className="lesson-detail__field"
                type="text"
                inputMode="numeric"
                aria-label={`Multiple ${index + 1}`}
                value={answers[index] ?? ''}
                onChange={(event) => handleSequenceAnswerChange(index, event.target.value, question.answer.length)}
                readOnly={isAnswerRevealed}
              />
              {index < question.answer.length - 1 ? <span aria-hidden="true">,</span> : null}
            </div>
          ))}
        </div>
      )

      if (!canRevealAnswer && !isAnswerRevealed) return multipleFields

      return (
        <div className="lesson-detail__input-actions">
          {multipleFields}
          {isAnswerRevealed ? (
            <span className="lesson-detail__revealed-status">
              <span className="lesson-detail__revealed-icon" aria-hidden="true">✓</span>
              Answer revealed
            </span>
          ) : (
            <button type="button" className="lesson-detail__reveal" onClick={handleRevealAnswer}>
              Reveal answer
            </button>
          )}
        </div>
      )
    }

    if (question.type === 'missing-multiple-pattern') {
      const answers = Array.isArray(currentValue) ? currentValue : []
      const missingIndexMap = new Map(question.missingIndices.map((sequenceIndex, answerIndex) => [sequenceIndex, answerIndex]))
      const multipleFields = (
        <div className="factor-list-answer" role="group" aria-label="Fill in the missing multiples">
          <div className="factor-list-answer__item">
            <span>{question.startingNumber}</span>
            <span aria-hidden="true">,</span>
          </div>
          {question.sequence.map((multiple, index) => {
            const answerIndex = missingIndexMap.get(index)

            return (
              <div className="factor-list-answer__item" key={index}>
                {answerIndex === undefined ? (
                  <span>{multiple}</span>
                ) : (
                  <input
                    className="lesson-detail__field"
                    type="text"
                    inputMode="numeric"
                    aria-label={`Missing multiple ${answerIndex + 1}`}
                    value={answers[answerIndex] ?? ''}
                    onChange={(event) => handleSequenceAnswerChange(answerIndex, event.target.value, question.answer.length)}
                    readOnly={isAnswerRevealed}
                  />
                )}
                {index < question.sequence.length - 1 ? <span aria-hidden="true">,</span> : null}
              </div>
            )
          })}
        </div>
      )

      if (!canRevealAnswer && !isAnswerRevealed) return multipleFields

      return (
        <div className="lesson-detail__input-actions">
          {multipleFields}
          {isAnswerRevealed ? (
            <span className="lesson-detail__revealed-status">
              <span className="lesson-detail__revealed-icon" aria-hidden="true">✓</span>
              Answer revealed
            </span>
          ) : (
            <button type="button" className="lesson-detail__reveal" onClick={handleRevealAnswer}>
              Reveal answer
            </button>
          )}
        </div>
      )
    }

    if (question.type === 'place-value-arrangement') {
      const answers = Array.isArray(currentValue) ? currentValue : []
      const arrangementTable = (
        <table className="place-value-arrangement" aria-label="Place value arrangement">
          <thead>
            <tr>
              {question.placeNames.map((placeName) => <th key={placeName} scope="col">{placeName}</th>)}
            </tr>
          </thead>
          <tbody>
            <tr>
              {question.placeNames.map((placeName, index) => (
                <td key={placeName}>
                  <input
                    className="lesson-detail__field"
                    type="text"
                    inputMode="numeric"
                    aria-label={`${placeName} digit`}
                    maxLength={1}
                    value={answers[index] ?? ''}
                    onChange={(event) => handleSequenceAnswerChange(index, event.target.value, question.answer.length)}
                    readOnly={isAnswerRevealed}
                  />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      )

      if (!canRevealAnswer && !isAnswerRevealed) return arrangementTable

      return (
        <div className="lesson-detail__input-actions">
          {arrangementTable}
          {isAnswerRevealed ? (
            <span className="lesson-detail__revealed-status">
              <span className="lesson-detail__revealed-icon" aria-hidden="true">✓</span>
              Answer revealed
            </span>
          ) : (
            <button type="button" className="lesson-detail__reveal" onClick={handleRevealAnswer}>
              Reveal answer
            </button>
          )}
        </div>
      )
    }

    if (question.type === 'equivalent-fraction-builder') {
      const fractionResponse = typeof currentValue === 'object' && currentValue !== null
        ? currentValue
        : { selectedSlices: [], fractionText: '' }
      const fractionEntry = (
        <input
          className="lesson-detail__field"
          type="text"
          inputMode="text"
          aria-label="Equivalent fraction"
          value={fractionResponse.fractionText ?? ''}
          onChange={(event) => handleFractionBuilderAnswerChange(event.target.value)}
          readOnly={isAnswerRevealed}
        />
      )

      if (!canRevealAnswer && !isAnswerRevealed) return fractionEntry

      return (
        <div className="lesson-detail__input-actions">
          {fractionEntry}
          {isAnswerRevealed ? (
            <span className="lesson-detail__revealed-status">
              <span className="lesson-detail__revealed-icon" aria-hidden="true">✓</span>
              Answer revealed
            </span>
          ) : (
            <button type="button" className="lesson-detail__reveal" onClick={handleRevealAnswer}>
              Reveal answer
            </button>
          )}
        </div>
      )
    }

    if (question.type === 'textarea') {
      return (
        <textarea
          className="lesson-detail__field lesson-detail__textarea"
          value={typeof currentValue === 'string' ? currentValue : ''}
          onChange={(event) => handleAnswerChange(event.target.value)}
          placeholder="Type your response here..."
        />
      )
    }

    if (question.type === 'radio') {
      return (
        <div
          className={`lesson-detail__options${question.fractionVisual?.optionFractions ? ' lesson-detail__options--fractions' : ''}${lesson.title === 'Choose the correct way to say a number' && activeGrade === 4 ? ' lesson-detail__options--number-words' : ''}${(lesson.title === 'Find equivalent fractions using pictures' || lesson.title === 'Simplify fractions using common factors with pictures') && activeGrade === 4 ? ' lesson-detail__options--picture-fractions' : ''}`}
          role="radiogroup"
          aria-label={question.prompt}
        >
          {question.options.map((option) => (
            <label
              key={option}
              className={`lesson-detail__option${question.fractionVisual?.optionFractions ? ' lesson-detail__option--fraction' : ''}`}
            >
              <input
                type="radio"
                name={lesson.title}
                checked={currentValue === option}
                onChange={() => handleAnswerChange(option)}
              />
              <span className="lesson-detail__option-content">
                <span><FractionText value={option} /></span>
                {question.fractionVisual?.optionFractions?.[option] &&
                !(activeGrade === 5 && lesson.title === 'Identify equivalent fractions') ? (
                  <FractionVisual
                    kind={question.fractionVisual.kind}
                    numerator={question.fractionVisual.optionFractions[option].numerator}
                    denominator={question.fractionVisual.optionFractions[option].denominator}
                    compact
                  />
                ) : null}
              </span>
            </label>
          ))}
        </div>
      )
    }

    if (question.type === 'checkbox') {
      const selectedOptions = Array.isArray(currentValue) ? currentValue : []

      return (
        <div className="lesson-detail__options">
          {question.options.map((option) => (
            <label key={option} className="lesson-detail__option">
              <input
                type="checkbox"
                checked={selectedOptions.includes(option)}
                onChange={(event) => {
                  const nextValue = event.target.checked
                    ? [...selectedOptions, option]
                    : selectedOptions.filter((item) => item !== option)

                  handleAnswerChange(nextValue)
                }}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      )
    }

    const hasAnswerLabel = Boolean(resolvedLabel)

    const field = question.type === 'fraction-entry' ? (
      <div className="fraction-entry-answer" aria-label="Enter your fraction answer">
        {!(activeGrade === 5 && lesson.title === 'Simplify fractions') ? (
          <input
            className="lesson-detail__field fraction-entry-answer__whole"
            type="text"
            inputMode="numeric"
            aria-label="Whole number"
            value={typeof currentValue === 'object' && currentValue !== null ? currentValue.whole ?? '' : ''}
            onChange={(event) => handleAnswerChange({
              ...(typeof currentValue === 'object' && currentValue !== null ? currentValue : {}),
              whole: event.target.value,
            })}
            readOnly={isAnswerRevealed}
          />
        ) : null}
        <span className="fraction-entry-answer__fraction">
          <input
            className="lesson-detail__field"
            type="text"
            inputMode="numeric"
            aria-label="Numerator"
            value={typeof currentValue === 'object' && currentValue !== null ? currentValue.numerator ?? '' : ''}
            onChange={(event) => handleAnswerChange({
              ...(typeof currentValue === 'object' && currentValue !== null ? currentValue : {}),
              numerator: event.target.value,
            })}
            readOnly={isAnswerRevealed}
          />
          <span className="fraction-entry-answer__bar" aria-hidden="true" />
          <input
            className="lesson-detail__field"
            type="text"
            inputMode="numeric"
            aria-label="Denominator"
            value={typeof currentValue === 'object' && currentValue !== null ? currentValue.denominator ?? '' : ''}
            onChange={(event) => handleAnswerChange({
              ...(typeof currentValue === 'object' && currentValue !== null ? currentValue : {}),
              denominator: event.target.value,
            })}
            readOnly={isAnswerRevealed}
          />
        </span>
      </div>
    ) : question.type === 'division-remainder' || question.type === 'long-division' ? (
      <div className="lesson-detail__remainder-row">
        <input
          className="lesson-detail__field"
          type="text"
          inputMode="numeric"
          aria-label="Quotient"
          value={typeof currentValue === 'object' && currentValue !== null ? currentValue.quotient ?? '' : ''}
          onChange={(event) => handleAnswerChange({
            ...(typeof currentValue === 'object' && currentValue !== null ? currentValue : {}),
            quotient: event.target.value,
          })}
          readOnly={isAnswerRevealed}
        />
        {question.type === 'division-remainder' || Number(question.answer.remainder) > 0 ? (
          <>
            <span className="lesson-detail__answer-label">R</span>
            <input
              className="lesson-detail__field lesson-detail__remainder-field"
              type="text"
              inputMode="numeric"
              aria-label="Remainder"
              value={typeof currentValue === 'object' && currentValue !== null ? currentValue.remainder ?? '' : ''}
              onChange={(event) => handleAnswerChange({
                ...(typeof currentValue === 'object' && currentValue !== null ? currentValue : {}),
                remainder: event.target.value,
              })}
              readOnly={isAnswerRevealed}
            />
          </>
        ) : null}
      </div>
    ) : (
      <input
        className={`lesson-detail__field${lesson.title === 'Write a number from its place values (to millions)' || lesson.title === 'Round the underlined digit (to millions)' || lesson.title === 'Find the missing number in expanded form (to millions)' ? ' lesson-detail__field--place-value-millions' : ''}`}
        type="text"
        value={typeof currentValue === 'string' ? currentValue : ''}
        onChange={(event) => handleAnswerChange(event.target.value)}
        placeholder=""
        readOnly={isAnswerRevealed}
      />
    )

    const answerField = hasAnswerLabel ? (
      <div className="lesson-detail__answer-row">
        {field}
        <span className="lesson-detail__answer-label">{resolvedLabel}</span>
      </div>
    ) : field

    if (!canRevealAnswer && !isAnswerRevealed) {
      return answerField
    }

    return (
      <div className="lesson-detail__input-actions">
        {answerField}
        {isAnswerRevealed ? (
          <span className="lesson-detail__revealed-status">
            <span className="lesson-detail__revealed-icon" aria-hidden="true">✓</span>
            Answer revealed
          </span>
        ) : (
          <button type="button" className="lesson-detail__reveal" onClick={handleRevealAnswer}>
            Reveal answer
          </button>
        )}
      </div>
    )
  }

  return (
    <>
      <header className="top-bar">
        <div className="top-bar__inner">
          <div className="top-bar__logo" aria-label="Parrot Learning logo">
            <img
              src="/src/assets/logo/logo-white-bkg.png"
              alt="Parrot Learning logo"
              className="top-bar__logo-image"
            />
          </div>

          <div className="top-bar__greeting">Hello, Kayla!</div>
        </div>
      </header>

      <div className="page-container">
        <div className="app-shell">
          {!selectedLessonData ? (
            <Sidebar
              grades={grades}
              activeGrade={activeGrade}
              onSelectGrade={handleGradeSelect}
            />
          ) : null}

          <main className={`main-panel ${selectedLessonData ? 'lesson-detail-page' : ''}`}>
            {!selectedLessonData ? (
              <>
                <header className="page-header">
                  <div className="page-header__content">
                    <div>
                      <p className="eyebrow">Grade Level</p>
                      <h2>{formatGradeLabel(activeGrade)}</h2>
                    </div>

                    <div
                      className="progress-pill"
                      aria-label={`${formatGradeLabel(activeGrade)} progress: ${progressValue}%`}
                    >
                      <svg className="progress-pill__ring" viewBox="0 0 64 64" aria-hidden="true">
                        <circle className="progress-pill__track" cx="32" cy="32" r={progressRadius} />
                        <circle
                          className="progress-pill__value"
                          cx="32"
                          cy="32"
                          r={progressRadius}
                          strokeDasharray={progressCircumference}
                          strokeDashoffset={progressOffset}
                        />
                      </svg>
                      <span className="progress-pill__percent">{progressValue}%</span>
                    </div>
                  </div>
                </header>

                <section className="subject-panel" aria-labelledby="subject-title">
                  <SubjectSelector
                    selectedSubject={activeSubjectKey}
                    onSelectSubject={handleSubjectSelect}
                  />
                </section>
              </>
            ) : null}

            {selectedLessonData ? (
              <section className="lesson-panel lesson-detail-panel" aria-live="polite">
                <div className="lesson-detail__layout">
                  <div className="lesson-detail__content">
                    <nav className="lesson-breadcrumbs" aria-label="Breadcrumb">
                      <button
                        type="button"
                        className="lesson-breadcrumbs__link"
                        onClick={() => {
                          setSelectedLesson('')
                        }}
                      >
                        {formatGradeLabel(activeGrade)}
                      </button>
                      <span className="lesson-breadcrumbs__separator">›</span>
                      <button
                        type="button"
                        className="lesson-breadcrumbs__link"
                        onClick={() => {
                          setSelectedLesson('')
                        }}
                      >
                        {activeSubject.title}
                      </button>
                      <span className="lesson-breadcrumbs__separator">›</span>
                      <span className="lesson-breadcrumbs__current">{selectedLessonData.title}</span>
                    </nav>

                    <div className="lesson-detail__card">
                      {activeSubjectKey === 'reading' && currentMathQuestion?.storyText ? (
                        <article className="reading-story" aria-label={`Story: ${currentMathQuestion.storyTitle}`}>
                          <h2 className="reading-story__title">{currentMathQuestion.storyTitle}</h2>
                          <p className="reading-story__text">{currentMathQuestion.storyText}</p>
                          {selectedLessonData.title === 'Compare main ideas in two passages' && currentMathQuestion.storyPassageTwo ? (
                            <div className="reading-story__passage">
                              <h3>Passage 2</h3>
                              <p>{currentMathQuestion.storyPassageTwo}</p>
                            </div>
                          ) : null}
                        </article>
                      ) : null}
                      {currentMathQuestion?.type !== 'repeated-subtraction-division' ? <p
                        key={activeSubjectKey === 'math' ? currentMathQuestion?.prompt : selectedLessonData.title}
                        className="lesson-detail__question"
                      >
                        {!currentMathQuestion?.fractionExpression && currentMathQuestion
                          ? currentMathQuestion.prompt
                          : !currentMathQuestion?.fractionExpression
                            ? (selectedLessonData.question?.prompt ?? `Solve the problem: ${selectedLessonData.title}.`)
                            : null}
                        {currentMathQuestion?.fractionExpression ? (
                          <FractionExpression {...currentMathQuestion.fractionExpression} />
                        ) : activeSubjectKey === 'math' &&
                        (selectedLessonData.title === 'Find the missing number in expanded form' ||
                          selectedLessonData.title === 'Find the missing number in expanded form (to millions)') ? (
                          <span className="expanded-form-help__inline">
                            <button
                              type="button"
                              className="expanded-form-help__toggle"
                              onClick={handleExpandedFormHelpToggle}
                            >
                              {showExpandedFormHelp ? 'Hide help' : 'I need help'}
                            </button>
                          </span>
                        ) : null}
                      </p> : null}
                      {selectedLessonData.title === 'Simplify fractions using common factors with pictures' ? (
                        <p className="lesson-detail__instruction">
                          Hint: Choose the equivalent fraction with the least number of pieces.
                        </p>
                      ) : null}
                      {activeSubjectKey === 'math' &&
                      (selectedLessonData.title === 'Find the missing number in expanded form' ||
                        selectedLessonData.title === 'Find the missing number in expanded form (to millions)') &&
                      currentMathQuestion?.placeValues &&
                      showExpandedFormHelp ? (
                        <table className="place-value-arrangement expanded-form-help__table" aria-label="Expanded form place value help">
                          <thead>
                            <tr>
                              {(selectedLessonData.title === 'Find the missing number in expanded form (to millions)'
                                ? ['Millions', 'Hundred thousands', 'Ten thousands', 'Thousands', 'Hundreds', 'Tens', 'Ones']
                                : ['Thousands', 'Hundreds', 'Tens', 'Ones']).map((placeName) => (
                                <th key={placeName} scope="col">{placeName}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              {(selectedLessonData.title === 'Find the missing number in expanded form (to millions)'
                                ? [0, 1, 2, 3, 4, 5, 6]
                                : [3, 2, 1, 0]).map((placeValueIndex) => (
                                <td key={placeValueIndex}>
                                  {placeValueIndex === currentMathQuestion.missingValueIndex
                                    ? '?'
                                    : selectedLessonData.title === 'Find the missing number in expanded form (to millions)'
                                      ? Math.floor(currentMathQuestion.placeValues[placeValueIndex] / (10 ** (6 - placeValueIndex))) % 10
                                      : Math.floor(currentMathQuestion.placeValues[placeValueIndex] / (10 ** placeValueIndex)) % 10}
                                </td>
                              ))}
                            </tr>
                          </tbody>
                        </table>
                      ) : null}
                                      {currentMathQuestion?.fractionBuilder ? (
                        <div className="fraction-builder">
                          <div className="fraction-builder__target">
                            <span className="fraction-builder__label">
                              <StackedFraction
                                numerator={currentMathQuestion.fractionBuilder.numerator}
                                denominator={currentMathQuestion.fractionBuilder.denominator}
                              />
                            </span>
                            <FractionVisual
                              kind="bar"
                              numerator={currentMathQuestion.fractionBuilder.numerator}
                              denominator={currentMathQuestion.fractionBuilder.denominator}
                            />
                          </div>
                          <div
                            className="fraction-builder__slices"
                            role="group"
                            aria-label={`Select ${currentMathQuestion.fractionBuilder.answerNumerator} of ${currentMathQuestion.fractionBuilder.answerDenominator} slices`}
                          >
                            <span className="fraction-builder__label">Click the slices to shade the same amount as the fraction above</span>
                            <div className="fraction-builder__bar">
                              {Array.from(
                                { length: currentMathQuestion.fractionBuilder.answerDenominator },
                                (_, index) => {
                                  const selectedSlices = Array.isArray(lessonResponses[selectedLesson]?.selectedSlices)
                                    ? lessonResponses[selectedLesson].selectedSlices
                                    : []
                                  const isSelected = selectedSlices.includes(index)

                                  return (
                                    <button
                                      className={`fraction-builder__slice${isSelected ? ' is-shaded' : ''}`}
                                      type="button"
                                      key={index}
                                      aria-label={`Slice ${index + 1} of ${currentMathQuestion.fractionBuilder.answerDenominator}`}
                                      aria-pressed={isSelected}
                                      disabled={Boolean(revealedAnswers[selectedLesson])}
                                      onClick={() => handleFractionSliceToggle(index)}
                                    />
                                  )
                                },
                              )}
                            </div>
                          </div>
                        </div>
                      ) : null}
                      {currentMathQuestion?.fractionVisual &&
                      !(activeGrade === 5 && selectedLessonData.title === 'Identify equivalent fractions') ? (
                        <div
                          className="fraction-visual fraction-visual--question"
                          role="img"
                          aria-label={`${currentMathQuestion.fractionVisual.kind === 'bar' ? 'Fraction bar' : 'Fraction number line'} model`}
                        >
                          {currentMathQuestion.fractionVisual.fractions.map(({ numerator, denominator }, index) => (
                            <div className="fraction-visual__item" key={`${numerator}-${denominator}-${index}`}>
                              <span className="fraction-visual__label">
                                {currentMathQuestion.fractionVisual.fractions.length > 1 ? `Fraction ${index + 1}: ` : 'Model: '}
                                <StackedFraction numerator={numerator} denominator={denominator} />
                              </span>
                              <FractionVisual
                                kind={currentMathQuestion.fractionVisual.kind}
                                numerator={numerator}
                                denominator={denominator}
                              />
                            </div>
                          ))}
                        </div>
                      ) : null}
                      {currentMathQuestion?.placeValueDisplay ? (
                        <p className="lesson-detail__place-value-display" aria-label="Number with an underlined digit">
                          {Array.from(currentMathQuestion.placeValueDisplay.number, (digit, index) => (
                            <Fragment key={index}>
                              {index > 0 && (currentMathQuestion.placeValueDisplay.number.length - index) % 3 === 0 ? ',' : null}
                              <span className={index === currentMathQuestion.placeValueDisplay.digitIndex ? 'is-underlined' : ''}>
                                {digit}
                              </span>
                            </Fragment>
                          ))}
                        </p>
                      ) : null}
                      {currentMathQuestion?.divisionPicture ? (
                        <p className="lesson-detail__instruction">
                          There are {currentMathQuestion.divisionPicture.total} total {currentMathQuestion.divisionPicture.shape}s in the picture.
                        </p>
                      ) : null}
                      {currentMathQuestion?.divisionPicture ? (
                        <div
                          className="division-picture"
                          role="img"
                          aria-label={`${currentMathQuestion.divisionPicture.total} ${currentMathQuestion.divisionPicture.shape}s arranged in ${currentMathQuestion.divisionPicture.groups} groups of ${currentMathQuestion.divisionPicture.amountPerGroup}`}
                        >
                          {Array.from({ length: currentMathQuestion.divisionPicture.groups }, (_, groupIndex) => (
                            <div className="division-picture__group" key={groupIndex}>
                              <div className="division-picture__shapes">
                                {Array.from({ length: currentMathQuestion.divisionPicture.amountPerGroup }, (_, shapeIndex) => (
                                  <span
                                    className={`division-picture__shape division-picture__shape--${currentMathQuestion.divisionPicture.shape}`}
                                    key={shapeIndex}
                                    aria-hidden="true"
                                  />
                                ))}
                              </div>
                              {<span className="division-picture__group-label">Group {groupIndex + 1}</span>}
                            </div>
                          ))}
                        </div>
                      ) : null}
                      {currentMathQuestion?.type === 'repeated-subtraction-division' ? (
                        <RepeatedSubtractionDivision onAnswerSubmit={handleRepeatedDivisionAnswer} />
                      ) : null}
                      {currentMathQuestion?.type === 'multiplication-pattern' && currentMathQuestion.patternTable ? (
                        <table className="multiplication-pattern" aria-label="Multiplication pattern table">
                          <tbody>
                            <tr>
                              <th scope="col">x</th>
                              {currentMathQuestion.patternTable.columnHeaders.map((header) => (
                                <th key={header} scope="col">{header}</th>
                              ))}
                            </tr>
                            {currentMathQuestion.patternTable.rowHeaders.map((rowHeader, rowIndex) => (
                              <tr key={rowHeader}>
                                <th scope="row">{rowHeader}</th>
                                {currentMathQuestion.patternTable.products[rowIndex].map((product, columnIndex) => {
                                  const missingCellIndex = currentMathQuestion.patternTable.missingCells.findIndex(
                                    (cell) => cell.rowIndex === rowIndex && cell.columnIndex === columnIndex,
                                  )

                                  return (
                                    <td key={`${rowHeader}-${columnIndex}`}>
                                      {missingCellIndex === -1 ? product : (
                                        <input
                                          className="multiplication-pattern__input"
                                          type="text"
                                          inputMode="numeric"
                                          aria-label={`Product of ${rowHeader} and ${currentMathQuestion.patternTable.columnHeaders[columnIndex]}`}
                                          value={Array.isArray(lessonResponses[selectedLesson])
                                            ? lessonResponses[selectedLesson][missingCellIndex] ?? ''
                                            : ''}
                                          onChange={(event) => handlePatternAnswerChange(missingCellIndex, event.target.value)}
                                          readOnly={Boolean(revealedAnswers[selectedLesson])}
                                        />
                                      )}
                                    </td>
                                  )
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : null}
                      {currentMathQuestion?.arrayGrid ? (
                        <div>
                          <p className="lesson-detail__instruction">
                            Click on the squares to solve the multiplication question.
                          </p>
                          <table className="multiplication-array" aria-label="12 by 12 multiplication array">
                            <tbody>
                              {Array.from({ length: 12 }, (_, rowIndex) => (
                                <tr key={rowIndex}>
                                  {Array.from({ length: 12 }, (_, columnIndex) => (
                                    <td key={columnIndex}>
                                      <button
                                        type="button"
                                        className={`multiplication-array__cell ${selectedArrayCells.includes(`${rowIndex}-${columnIndex}`) ? 'is-selected' : ''}`}
                                        aria-label={`Row ${rowIndex + 1}, column ${columnIndex + 1}`}
                                        aria-pressed={selectedArrayCells.includes(`${rowIndex}-${columnIndex}`)}
                                        onClick={() => toggleArrayCell(`${rowIndex}-${columnIndex}`)}
                                      />
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <div className="multiplication-array__actions">
                            {selectedArrayCells.length > 0 ? (
                              <button type="button" className="multiplication-array__clear" onClick={clearArrayCells}>
                                Clear
                              </button>
                            ) : null}
                            {hasArrayUndo ? (
                              <button type="button" className="multiplication-array__undo" onClick={undoClearArrayCells}>
                                Undo
                              </button>
                            ) : null}
                          </div>
                        </div>
                      ) : null}
                    </div>

                    {currentMathQuestion?.type === 'number-line' ? (
                      <p className="lesson-detail__instruction">
                        Fill in the blank spaces on the number line to solve the question
                      </p>
                    ) : null}

                    {currentMathQuestion?.type === 'number-line' && currentMathQuestion?.values ? (
                      <NumberLine 
                        firstNumber={currentMathQuestion.values[0]} 
                        secondNumber={currentMathQuestion.values[1]} 
                      />
                    ) : null}

                    {currentMathQuestion?.type === 'place-value-subtraction' && currentMathQuestion?.values ? (
                      <PlaceValueSubtraction
                        minuend={currentMathQuestion.values[0]}
                        subtrahend={currentMathQuestion.values[1]}
                      />
                    ) : null}

                    {currentMathQuestion?.type === 'number-line' ? (
                      <>
                        <p className="lesson-detail__question lesson-detail__question--final">
                          {currentMathQuestion.prompt}
                        </p>
                        <p className="lesson-detail__instruction lesson-detail__instruction--reminder">
                          Now enter your answer in the box below:
                        </p>
                      </>
                    ) : null}

                    {currentMathQuestion?.type === 'place-value-subtraction' ? (
                      <p className="lesson-detail__question lesson-detail__question--final">
                        {currentMathQuestion.prompt}
                      </p>
                    ) : null}

                    {currentMathQuestion?.type !== 'repeated-subtraction-division' ? (
                      <div className={`lesson-detail__answer-wrap${showExpandedFormHelp && (selectedLessonData.title === 'Find the missing number in expanded form' || selectedLessonData.title === 'Find the missing number in expanded form (to millions)') ? ' lesson-detail__answer-wrap--expanded-form-help' : ''}`}>
                        {renderAnswerField(selectedLessonData)}
                        {selectedFractionAnswer && questionFraction ? (
                          <div className="fraction-verification">
                            <strong className="fraction-verification__title">Verify</strong>
                            <div className="fraction-verification__equation" aria-label="Verify the equivalent fraction">
                              <StackedFraction
                                numerator={questionFraction.numerator}
                                denominator={questionFraction.denominator}
                              />
                              <div className="fraction-verification__multipliers">
                                <span className="fraction-verification__row">
                                  <span aria-hidden="true">×</span>
                                  <input
                                    className="lesson-detail__field fraction-verification__field"
                                    type="text"
                                    inputMode="numeric"
                                    aria-label="Numerator multiplier"
                                    value={fractionVerificationResponses[selectedLesson]?.numeratorMultiplier ?? ''}
                                    onChange={(event) => handleFractionVerificationChange('numeratorMultiplier', event.target.value)}
                                  />
                                  <span aria-hidden="true">=</span>
                                </span>
                                <span className="fraction-verification__row">
                                  <span aria-hidden="true">×</span>
                                  <input
                                    className="lesson-detail__field fraction-verification__field"
                                    type="text"
                                    inputMode="numeric"
                                    aria-label="Denominator multiplier"
                                    value={fractionVerificationResponses[selectedLesson]?.denominatorMultiplier ?? ''}
                                    onChange={(event) => handleFractionVerificationChange('denominatorMultiplier', event.target.value)}
                                  />
                                  <span aria-hidden="true">=</span>
                                </span>
                              </div>
                              <span className="fraction-verification__answer-fraction">
                                <input
                                  className="lesson-detail__field fraction-verification__answer-field"
                                  type="text"
                                  inputMode="numeric"
                                  aria-label="Equivalent fraction numerator"
                                  value={fractionVerificationResponses[selectedLesson]?.numerator ?? ''}
                                  onChange={(event) => handleFractionVerificationChange('numerator', event.target.value)}
                                />
                                <span className="fraction-verification__bar" aria-hidden="true" />
                                <span className="fraction-verification__denominator">{selectedFractionAnswer.denominator}</span>
                              </span>
                            </div>
                          </div>
                        ) : null}
                        {activeGrade === 4 && selectedSimplifiedFraction && questionFraction ? (
                          <div className="fraction-verification">
                            <strong className="fraction-verification__title">Verify</strong>
                            <div className="fraction-verification__equation" aria-label="Verify the simplified fraction">
                              <StackedFraction
                                numerator={questionFraction.numerator}
                                denominator={questionFraction.denominator}
                              />
                              <div className="fraction-verification__multipliers">
                                <span className="fraction-verification__row">
                                  <span aria-hidden="true">÷</span>
                                  <input
                                    className="lesson-detail__field fraction-verification__field"
                                    type="text"
                                    inputMode="numeric"
                                    aria-label="Numerator divisor"
                                    value={fractionVerificationResponses[selectedLesson]?.numeratorDivisor ?? ''}
                                    onChange={(event) => handleFractionVerificationChange('numeratorDivisor', event.target.value)}
                                  />
                                  <span aria-hidden="true">=</span>
                                </span>
                                <span className="fraction-verification__row">
                                  <span aria-hidden="true">÷</span>
                                  <input
                                    className="lesson-detail__field fraction-verification__field"
                                    type="text"
                                    inputMode="numeric"
                                    aria-label="Denominator divisor"
                                    value={fractionVerificationResponses[selectedLesson]?.denominatorDivisor ?? ''}
                                    onChange={(event) => handleFractionVerificationChange('denominatorDivisor', event.target.value)}
                                  />
                                  <span aria-hidden="true">=</span>
                                </span>
                              </div>
                              <span className="fraction-verification__answer-fraction">
                                <input
                                  className="lesson-detail__field fraction-verification__answer-field"
                                  type="text"
                                  inputMode="numeric"
                                  aria-label="Simplified fraction numerator"
                                  value={fractionVerificationResponses[selectedLesson]?.numerator ?? ''}
                                  onChange={(event) => handleFractionVerificationChange('numerator', event.target.value)}
                                />
                                <span className="fraction-verification__bar" aria-hidden="true" />
                                <span className="fraction-verification__denominator">{selectedSimplifiedFraction.denominator}</span>
                              </span>
                            </div>
                          </div>
                        ) : null}
                        <button type="button" className="lesson-detail__submit" onClick={handleSubmitAnswer}>
                          {revealedAnswers[selectedLesson] ? 'Next question' : 'Submit'}
                        </button>
                        {activeGrade === 5 && selectedLessonData.title === 'Simplify fractions' && questionFraction ? (
                          <div className="simplify-help">
                            {simplifyHelpStep === 0 ? (
                              <button
                                type="button"
                                className="fraction-picture-helper__link"
                                onClick={() => setSimplifyHelpStep(1)}
                              >
                                I need help
                              </button>
                            ) : null}
                            {simplifyHelpStep >= 1 ? (
                              <div className="simplify-help__step">
                                <span className="simplify-help__number">1</span>
                                <div>
                                  {[
                                    ['numerator', questionFraction.numerator],
                                    ['denominator', questionFraction.denominator],
                                  ].map(([part, number]) => {
                                    const factors = getFactors(number)
                                    const factorValues = fractionVerificationResponses[selectedLesson]?.[`${part}Factors`] ?? []

                                    return (
                                      <div className="simplify-help__factor-group" key={part}>
                                        <p>Write the factors of {number}.</p>
                                        <div className="simplify-help__factor-inputs">
                                          {factors.map((factor, index) => (
                                            <Fragment key={`${part}-${index}`}>
                                              <input
                                                className="lesson-detail__field"
                                                type="text"
                                                inputMode="numeric"
                                                aria-label={`${part} factor ${index + 1}`}
                                                value={factorValues[index] ?? ''}
                                                onChange={(event) => {
                                                  const nextValues = [...factorValues]
                                                  nextValues[index] = event.target.value
                                                  handleFractionVerificationChange(`${part}Factors`, nextValues)
                                                }}
                                              />
                                              {index < factors.length - 1 ? <span className="simplify-help__factor-comma" aria-hidden="true">,</span> : null}
                                            </Fragment>
                                          ))}
                                        </div>
                                      </div>
                                    )
                                  })}
                                  {simplifyHelpStep === 1 ? (
                                    <button
                                      type="button"
                                      className="fraction-picture-helper__link"
                                      onClick={() => setSimplifyHelpStep(2)}
                                    >
                                      Show next step
                                    </button>
                                  ) : null}
                                </div>
                              </div>
                            ) : null}
                            {simplifyHelpStep >= 2 ? (
                              <div className="simplify-help__step">
                                <span className="simplify-help__number">2</span>
                                <div>
                                  <p>What is the greatest common factor of {questionFraction.numerator} and {questionFraction.denominator}?</p>
                                  <input
                                    className="lesson-detail__field"
                                    type="text"
                                    inputMode="numeric"
                                    aria-label="Greatest common factor"
                                    value={fractionVerificationResponses[selectedLesson]?.gcf ?? ''}
                                    onChange={(event) => handleFractionVerificationChange('gcf', event.target.value)}
                                  />
                                  {simplifyHelpStep === 2 ? (
                                    <button
                                      type="button"
                                      className="fraction-picture-helper__link"
                                      onClick={() => setSimplifyHelpStep(3)}
                                    >
                                      Show next step
                                    </button>
                                  ) : null}
                                </div>
                              </div>
                            ) : null}
                            {simplifyHelpStep >= 3 ? (
                              <div className="simplify-help__step">
                                <span className="simplify-help__number">3</span>
                                <div>
                                  <p>Divide the numerator and denominator by the greatest common factor. The fraction you get after dividing is your answer.</p>
                                  <div className="fraction-verification__equation" aria-label="Complete the simplification">
                                  <StackedFraction
                                    numerator={questionFraction.numerator}
                                    denominator={questionFraction.denominator}
                                  />
                                  <div className="fraction-verification__multipliers">
                                    <span className="fraction-verification__row">
                                      <span aria-hidden="true">÷</span>
                                      <input
                                        className="lesson-detail__field fraction-verification__field"
                                        type="text"
                                        inputMode="numeric"
                                        aria-label="Numerator divisor"
                                        value={fractionVerificationResponses[selectedLesson]?.numeratorDivisor ?? ''}
                                        onChange={(event) => handleFractionVerificationChange('numeratorDivisor', event.target.value)}
                                      />
                                      <span aria-hidden="true">=</span>
                                    </span>
                                    <span className="fraction-verification__row">
                                      <span aria-hidden="true">÷</span>
                                      <input
                                        className="lesson-detail__field fraction-verification__field"
                                        type="text"
                                        inputMode="numeric"
                                        aria-label="Denominator divisor"
                                        value={fractionVerificationResponses[selectedLesson]?.denominatorDivisor ?? ''}
                                        onChange={(event) => handleFractionVerificationChange('denominatorDivisor', event.target.value)}
                                      />
                                      <span aria-hidden="true">=</span>
                                    </span>
                                  </div>
                                  <span className="fraction-verification__answer-fraction">
                                    <input
                                      className="lesson-detail__field fraction-verification__answer-field"
                                      type="text"
                                      inputMode="numeric"
                                      aria-label="Simplified fraction numerator"
                                      value={fractionVerificationResponses[selectedLesson]?.simplifiedNumerator ?? ''}
                                      onChange={(event) => handleFractionVerificationChange('simplifiedNumerator', event.target.value)}
                                    />
                                    <span className="fraction-verification__bar simplify-help__final-bar" aria-hidden="true" />
                                    <input
                                      className="lesson-detail__field fraction-verification__answer-field"
                                      type="text"
                                      inputMode="numeric"
                                      aria-label="Simplified fraction denominator"
                                      value={fractionVerificationResponses[selectedLesson]?.simplifiedDenominator ?? ''}
                                      onChange={(event) => handleFractionVerificationChange('simplifiedDenominator', event.target.value)}
                                    />
                                  </span>
                                  </div>
                                </div>
                              </div>
                            ) : null}
                          </div>
                        ) : null}
                        {currentMathQuestion?.fractionPictureHelper ? (
                          <button
                            type="button"
                            className="fraction-picture-helper__link"
                            onClick={() => setShowFractionPictureHelper((visible) => !visible)}
                          >
                            {showFractionPictureHelper ? 'Hide picture' : 'Use picture to solve'}
                          </button>
                        ) : null}
                      </div>
                    ) : null}
                    {showFractionPictureHelper && currentMathQuestion?.fractionPictureHelper?.models ? (
                      <div className="fraction-picture-helper">
                        {currentMathQuestion.fractionPictureHelper.models.map((model) => (
                          <div className="fraction-picture-helper__model" key={model.label}>
                            {currentMathQuestion.fractionPictureHelper.showModelLabels !== false ? (
                              <StackedFraction numerator={model.numerator} denominator={model.denominator} />
                            ) : null}
                            <div
                              className="fraction-picture-helper__clickable-bar"
                              role="group"
                              aria-label={`Select pieces for ${model.label}`}
                            >
                              {Array.from({ length: model.denominator }, (_, pieceIndex) => {
                                const selectedPieces = fractionPictureAnswers[selectedLesson]?.[model.label]?.selectedPieces ?? []

                                return (
                                  <button
                                    type="button"
                                    className={`fraction-picture-helper__piece${selectedPieces.includes(pieceIndex) ? ' is-selected' : ''}`}
                                    aria-label={`Piece ${pieceIndex + 1} of ${model.denominator} for ${model.label}`}
                                    aria-pressed={selectedPieces.includes(pieceIndex)}
                                    onClick={() => handleFractionPicturePieceToggle(model.label, pieceIndex)}
                                  />
                                )
                              })}
                            </div>
                          </div>
                        ))}
                        {currentMathQuestion.fractionPictureHelper.showHint ? (
                          <p className="fraction-picture-helper__hint">
                            <strong>Hint:</strong> How many bars are completely filled? That is the whole number.
                            <br />
                            <br />
                            How many pieces are filled in the second bar? That is the numerator. How many pieces are in each bar? That is the denominator.
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                    {showFractionPictureHelper && currentMathQuestion?.fractionPictureHelper?.base ? (
                      <div className="fraction-picture-helper">
                        {[
                          [
                            'base',
                            currentMathQuestion.fractionPictureHelper.base,
                            null,
                          ],
                          ...currentMathQuestion.fractionPictureHelper.options.map((fraction) => {
                          const [numerator, denominator] = fraction.split('/').map(Number)
                          return [fraction, { numerator, denominator }, null]
                          }),
                        ].map(([modelKey, fraction]) => {
                          const selectedPieces = fractionPictureAnswers[selectedLesson]?.[modelKey]?.selectedPieces ?? []

                          return (
                            <div className="fraction-picture-helper__model" key={modelKey}>
                              <StackedFraction numerator={fraction.numerator} denominator={fraction.denominator} />
                              <div
                                className="fraction-picture-helper__clickable-bar"
                                role="group"
                                aria-label={`Select pieces for ${fraction.numerator}/${fraction.denominator}`}
                              >
                                {Array.from({ length: fraction.denominator }, (_, pieceIndex) => (
                                  <button
                                    type="button"
                                    className={`fraction-picture-helper__piece${selectedPieces.includes(pieceIndex) ? ' is-selected' : ''}`}
                                    aria-label={`Piece ${pieceIndex + 1} of ${fraction.denominator} for ${fraction.numerator}/${fraction.denominator}`}
                                    aria-pressed={selectedPieces.includes(pieceIndex)}
                                    onClick={() => handleFractionPicturePieceToggle(modelKey, pieceIndex)}
                                  />
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : null}
                  </div>

                  {showSuccessOverlay ? (
                    <div className="lesson-detail__success-overlay" aria-live="polite">
                      <div className="lesson-detail__success-box">
                        <span className={`lesson-detail__success-icon ${isAnswerCorrect ? '' : 'is-incorrect'} ${isBlankAnswer ? 'is-blank' : ''}`} aria-hidden="true">
                          {isBlankAnswer ? '!' : isAnswerCorrect ? '✓' : '×'}
                        </span>
                        <span>{successMessage}</span>
                      </div>
                    </div>
                  ) : null}

                  <aside className="lesson-progress" aria-label="Lesson progress">
                    <div className="lesson-progress__stats">
                      <div className="lesson-progress__stat">
                        <span className="lesson-progress__label">Questions Answered</span>
                        <strong className="lesson-progress__number">{lessonQuestionCounts[selectedLesson] ?? 0}</strong>
                      </div>
                      <div className="lesson-progress__stat">
                        <span className="lesson-progress__label">Time</span>
                        <strong className="lesson-progress__number">
                          {formatElapsedTime(lessonTimes[selectedLesson] ?? 0)}
                        </strong>
                      </div>
                      <div className="lesson-progress__stat">
                        <span className="lesson-progress__label">Score</span>
                        <div className="lesson-progress__number lesson-progress__number--score">
                            <span
                              key={lessonProgress.value}
                              className="lesson-progress__score-value"
                            >
                              {lessonProgress.value}
                            </span>
                          <div className="lesson-progress__stars" aria-label="Lesson stars">
                            {lessonProgress.stars.map((filled, index) => (
                              <span
                                key={`${index}-${filled}`}
                                className={`lesson-progress__star ${filled ? 'is-filled' : ''}`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="lesson-progress__stat">
                          <span className="lesson-progress__label">Times Completed</span>
                          <strong className="lesson-progress__number lesson-progress__number--completions">
                            {(lessonCompletionCounts[selectedLesson] ?? 0) > 0 ? (
                              <span className="lesson-progress__completion-value">
                                <span className="lesson-progress__completion-star" aria-hidden="true">★</span>
                                {lessonCompletionCounts[selectedLesson]}
                              </span>
                            ) : '0'}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </aside>
                </div>
              </section>
            ) : (
              <section className="lesson-panel" aria-live="polite">
                <div className="section-heading lesson-heading">
                  <h3>
                    {formatGradeLabel(activeGrade)} {activeSubject.title}
                  </h3>
                </div>

                <div className="lesson-sections">
                  {activeSubject.sections.map((section) => (
                    <LessonGroup
                      key={section.title}
                      title={section.title}
                      className={activeGrade === 3 && activeSubjectKey === 'math' && section.title === 'Place Value'
                        ? 'lesson-group--grade3-place-value'
                        : activeGrade === 4 && activeSubjectKey === 'math' && section.title === 'Place Value'
                          ? 'lesson-group--grade4-place-value'
                          : section.title === 'Factors and Multiples'
                            ? 'lesson-group--factors'
                            : activeGrade === 4 && activeSubjectKey === 'math' && section.title === 'Fractions'
                              ? 'lesson-group--grade4-fractions'
                              : ''}
                      lessons={section.lessons}
                      lessonScores={lessonScores}
                      lessonCompletionCounts={lessonCompletionCounts}
                      selectedLesson={selectedLesson}
                      onSelectLesson={handleLessonSelect}
                    />
                  ))}
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </>
  )
}

export default App
