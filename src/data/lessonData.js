const makeQuestion = (prompt, type = 'text', options = [], label = '') => ({
  prompt,
  type,
  options,
  label,
})

const makeLesson = (title, progress = null, completed = false, question = null, variant = '', readingSkill = null) => ({
  title,
  progress,
  completed,
  variant,
  readingSkill,
  question: question ?? makeQuestion(`Solve the problem: ${title}.`, 'text'),
})

export const lessonData = [
  {
    grade: 3,
    subjects: {
      math: {
        title: 'Math',
        sections: [
          {
            title: 'Addition',
            lessons: [
              makeLesson('Add two numbers up to three digits', 14, false, makeQuestion('Solve: 245 + 132 = ?', 'text')),
              makeLesson('Add two numbers up to three digits: word problems', 28, false, makeQuestion('There are 148 stickers in one album and 256 in another. How many stickers are there altogether?', 'text', [], 'stickers')),
              makeLesson('Add three numbers together', 42, false, makeQuestion('Solve: 27 + 18 + 35 = ?', 'text')),
              makeLesson('Add with regrouping', 80, true, makeQuestion('Solve: 47 + 28 = ?', 'text')),
              makeLesson('Addition patterns and number facts', 66, false, makeQuestion('Which number sentence shows the same sum as 9 + 6?', 'radio', ['15', '14', '13', '12'])),
              makeLesson('Add using a number line', 0, false, makeQuestion('Use the number line to find 6 + 4. What is the total?', 'text')),
              makeLesson('Addition: fill in the missing digits', 18, false, makeQuestion('Fill in the missing digit: 38 + 5_ = 84', 'text')),
            ],
          },
          {
            title: 'Place Value',
            lessons: [
              makeLesson('Identify the place value of an underlined digit'),
              makeLesson('Write a number from its place values'),
              makeLesson('Choose the correct way to say a number'),
              makeLesson('Make the greatest or least number from given digits'),
              makeLesson('Round to the nearest 10'),
              makeLesson('Round to the nearest 100'),
              makeLesson('Compare similar three-digit numbers'),
              makeLesson('Find the missing number in expanded form'),
            ],
          },
          {
            title: 'Subtraction',
            lessons: [
              makeLesson('Subtract two numbers up to three digits', 12, false, makeQuestion('Solve: 482 - 214 = ?', 'text')),
              makeLesson('Subtract with regrouping', 34, false, makeQuestion('Solve: 63 - 29 = ?', 'text')),
              makeLesson('Subtract using place value', 76, false, makeQuestion('What is 540 - 200?', 'radio', ['340', '320', '240', '300'])),
              makeLesson('Subtraction word problems', 91, true, makeQuestion('A box had 72 crayons. 19 were used. How many crayons are left?', 'text')),
              makeLesson('Find the missing number in subtraction', 19, false, makeQuestion('Find the missing number: 56 - __ = 31', 'text')),
              makeLesson('Subtract across zeros', 0, false, makeQuestion('Solve: 400 - 268 = ?', 'text')),
            ],
          },
        ],
      },
      reading: {
        title: 'Reading Comprehension',
        sections: [
          {
            title: 'Story Details',
            lessons: [
              makeLesson('Identify facts in a story', 22, false, null, '', 'identify-facts'),
              makeLesson('Find key details in a paragraph', 47, false, null, '', 'key-details'),
              makeLesson('Use evidence from the text', 65, false, null, '', 'text-evidence'),
              makeLesson('Match a detail to the story', 90, true, null, '', 'match-detail'),
            ],
          },
          {
            title: 'Main Idea',
            lessons: [
              makeLesson('Find the main idea of a paragraph', 26, false, null, '', 'main-idea'),
              makeLesson('Choose the best summary sentence', 60, false, null, '', 'best-summary'),
              makeLesson('Support the main idea with details', 79, false, null, '', 'support-main-idea'),
              makeLesson('Compare main ideas in two passages', 0, false, null, '', 'compare-main-ideas'),
            ],
          },
        ],
      },
      writing: {
        title: 'Writing',
        sections: [
          {
            title: 'Sentence Building',
            lessons: [
              makeLesson('Build complete sentences', 15),
              makeLesson('Use capital letters and punctuation', 38),
              makeLesson('Combine simple sentences', 72),
              makeLesson('Fix sentence fragments', 100, true),
            ],
          },
          {
            title: 'Paragraphs',
            lessons: [
              makeLesson('Write a topic sentence', 18),
              makeLesson('Add supporting details', 54),
              makeLesson('Organize ideas into a paragraph', 86, true),
            ],
          },
        ],
      },
    },
  },
  {
    grade: 4,
    subjects: {
      math: {
        title: 'Math',
        sections: [
          {
            title: 'Place Value',
            lessons: [
              makeLesson('Identify the place value of an underlined digit (to millions)'),
              makeLesson('Write a number from its place values (to millions)'),
              makeLesson('Choose the correct way to say a number', null, false, null, 'millions'),
              makeLesson('Make the greatest or least number from given digits (to millions)'),
              makeLesson('Round the underlined digit (to millions)'),
              makeLesson('Compare similar numbers to the millions'),
              makeLesson('Find the missing number in expanded form (to millions)'),
            ],
          },
          {
            title: 'Multiplication',
            lessons: [
              makeLesson('Multiply by 2, 5, and 10', 20),
              makeLesson('Use arrays to solve multiplication facts', 61),
              makeLesson('Multiply two numbers with regrouping', 44),
              makeLesson('Solve multiplication word problems', 82, true),
              makeLesson('Multiply a one-digit number by a two-digit number', 25),
              makeLesson('Find patterns in multiplication tables'),
            ],
          },
          {
            title: 'Factors and Multiples',
            lessons: [
              makeLesson('Find all the factors of a number (1-30)'),
              makeLesson('Find all the factors of a number (1-60)'),
              makeLesson('Find all the factors of a number (1-100)'),
              makeLesson('Choose a factor of a number (1-50)'),
              makeLesson('Choose a factor of a number (1-100)'),
              makeLesson('Fill in the missing multiples of a number'),
              makeLesson('Write multiples of a number'),
              makeLesson('Choose a multiple of a number'),
            ],
          },
          {
            title: 'Fractions',
            lessons: [
              makeLesson('Find equivalent fractions using pictures'),
              makeLesson('Build an equivalent fraction with a picture'),
              makeLesson('Compare fractions with visual models and number lines'),
              makeLesson('Add and subtract fractions and mixed numbers with like denominators'),
              makeLesson('Simplify fractions using common factors with pictures'),
            ],
          },
          {
            title: 'Division',
            lessons: [
              makeLesson('Divide by sharing equally', 30),
              makeLesson('Use repeated subtraction to divide', 52),
              makeLesson('Solve simple division facts', 68),
              makeLesson('Divide with remainders'),
              makeLesson('Use long division'),
            ],
          },
        ],
      },
      reading: {
        title: 'Reading Comprehension',
        sections: [
          {
            title: 'Inference',
            lessons: [
              makeLesson('Use clues to infer character feelings', 31),
              makeLesson('Make an inference from the story', 65),
              makeLesson('Explain what the text suggests', 78),
              makeLesson('Infer the lesson in a fable', 95, true),
            ],
          },
          {
            title: 'Character Traits',
            lessons: [
              makeLesson('Describe a character using evidence', 24),
              makeLesson('Find words that show personality', 58),
              makeLesson('Compare two characters', 83, true),
            ],
          },
        ],
      },
      writing: {
        title: 'Writing',
        sections: [
          {
            title: 'Narrative Writing',
            lessons: [
              makeLesson('Write a beginning, middle, and end', 27),
              makeLesson('Add sensory details to a story', 49),
              makeLesson('Write dialogue in a narrative', 70),
              makeLesson('Revise a story for flow', 99, true),
            ],
          },
          {
            title: 'Informational Writing',
            lessons: [
              makeLesson('Write a simple fact paragraph', 16),
              makeLesson('Organize facts with headings', 63),
              makeLesson('Use transitions in informational writing', 88, true),
            ],
          },
        ],
      },
    },
  },
  {
    grade: 5,
    subjects: {
      math: {
        title: 'Math',
        sections: [
          {
            title: 'Fractions',
            lessons: [
              makeLesson('Identify equivalent fractions', 22),
              makeLesson('Compare fractions with unlike denominators', 46),
              makeLesson('Add fractions with like denominators', 71),
              makeLesson('Simplify fractions', 89, true),
              makeLesson('Model fractions on a number line', 33),
              makeLesson('Solve fraction word problems'),
            ],
          },
          {
            title: 'Decimals',
            lessons: [
              makeLesson('Read and write decimals to the hundredths', 18),
              makeLesson('Compare decimal values', 54),
              makeLesson('Add decimals to the hundredths', 67),
              makeLesson('Subtract decimals to the hundredths', 94, true),
              makeLesson('Convert fractions to decimals', 41),
            ],
          },
        ],
      },
      reading: {
        title: 'Reading Comprehension',
        sections: [
          {
            title: 'Text Structure',
            lessons: [
              makeLesson('Identify cause and effect in a passage', 28),
              makeLesson('Find sequence words in a text', 57),
              makeLesson('Recognize problem and solution structure', 73),
              makeLesson('Compare text structures across articles', 84, true),
            ],
          },
          {
            title: 'Theme',
            lessons: [
              makeLesson('Identify the theme of a story', 24),
              makeLesson('Explain how the author shows the theme', 62),
              makeLesson('Compare themes in two texts', 91, true),
            ],
          },
        ],
      },
      writing: {
        title: 'Writing',
        sections: [
          {
            title: 'Opinion Writing',
            lessons: [
              makeLesson('State an opinion clearly', 19),
              makeLesson('Support an opinion with reasons', 48),
              makeLesson('Add examples and evidence', 76),
              makeLesson('Write a strong conclusion', 93, true),
            ],
          },
          {
            title: 'Research Notes',
            lessons: [
              makeLesson('Record important facts from a source', 29),
              makeLesson('Organize notes by topic', 55),
              makeLesson('Turn notes into paragraph ideas', 88, true),
            ],
          },
        ],
      },
    },
  },
  {
    grade: 6,
    subjects: {
      math: {
        title: 'Math',
        sections: [
          {
            title: 'Place Value',
            lessons: [
              makeLesson('Read numbers to the millions', 26),
              makeLesson('Write numbers in expanded form', 50),
              makeLesson('Compare digits by place value', 64),
              makeLesson('Round numbers to the nearest ten or hundred', 77),
              makeLesson('Use place value to solve problems', 83),
              makeLesson('Order large numbers from least to greatest', 96, true),
              makeLesson('Find the value of a digit', 43),
              makeLesson('Write numbers in word form'),
            ],
          },
          {
            title: 'Addition',
            lessons: [
              makeLesson('Add multi-digit numbers accurately', 14),
              makeLesson('Add three numbers with regrouping', 39),
              makeLesson('Solve addition word problems', 72),
              makeLesson('Add using estimation to check work', 98, true),
            ],
          },
        ],
      },
      reading: {
        title: 'Reading Comprehension',
        sections: [
          {
            title: 'Argument Analysis',
            lessons: [
              makeLesson('Identify the author’s claim', 21),
              makeLesson('Find reasons in an argument text', 59),
              makeLesson('Evaluate evidence in a persuasive passage', 81),
              makeLesson('Distinguish fact from opinion', 92, true),
            ],
          },
          {
            title: 'Poetry',
            lessons: [
              makeLesson('Identify figurative language in poems', 33),
              makeLesson('Find imagery in a poem', 69),
              makeLesson('Explain the message of a poem', 88, true),
            ],
          },
        ],
      },
      writing: {
        title: 'Writing',
        sections: [
          {
            title: 'Persuasive Writing',
            lessons: [
              makeLesson('State a strong claim', 18),
              makeLesson('Use reasons to persuade a reader', 51),
              makeLesson('Add supporting evidence and examples', 74),
              makeLesson('Write a convincing conclusion', 95, true),
            ],
          },
          {
            title: 'Revision',
            lessons: [
              makeLesson('Improve clarity in a paragraph', 27),
              makeLesson('Replace weak words with stronger ones', 60),
              makeLesson('Edit for punctuation and grammar', 90, true),
            ],
          },
        ],
      },
    },
  },
]
