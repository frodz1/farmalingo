/** Hardcoded payload behind the hidden "Szybki test" debug button. */
export const MOCK_LESSON_JSON = JSON.stringify(
  {
    title: 'Farmakologia — szybki test',
    subject: 'Farmakologia',
    flashcards: [
      { concept: 'Paracetamol', definition: 'Lek przeciwbólowy i przeciwgorączkowy działający ośrodkowo.' },
      { concept: 'Ibuprofen', definition: 'Niesteroidowy lek przeciwzapalny hamujący cyklooksygenazę.' },
      { concept: 'Amoksycylina', definition: 'Antybiotyk beta-laktamowy z grupy penicylin.' },
      { concept: 'Loratadyna', definition: 'Lek przeciwhistaminowy drugiej generacji stosowany w alergii.' },
      { concept: 'Metformina', definition: 'Doustny lek przeciwcukrzycowy z grupy biguanidów.' },
      { concept: 'Omeprazol', definition: 'Inhibitor pompy protonowej zmniejszający wydzielanie kwasu żołądkowego.' },
      { concept: 'Salbutamol', definition: 'Krótko działający agonista receptorów beta-2 rozszerzający oskrzela.' },
      { concept: 'Warfaryna', definition: 'Antagonista witaminy K hamujący krzepnięcie krwi.' },
    ],
    cloze: [
      { sentence: 'Ibuprofen hamuje enzym ___.', options: ['cyklooksygenazę', 'lipazę', 'amylazę'], answer: 'cyklooksygenazę' },
      { sentence: 'Metformina jest lekiem pierwszego wyboru w ___.', options: ['cukrzycy typu 2', 'astmie', 'nadciśnieniu'], answer: 'cukrzycy typu 2' },
      { sentence: 'Amoksycylina należy do grupy antybiotyków ___.', options: ['beta-laktamowych', 'tetracyklin', 'makrolidów'], answer: 'beta-laktamowych' },
      { sentence: 'Loratadyna działa jako antagonista receptorów ___.', options: ['H1', 'H2', 'D2'], answer: 'H1' },
      { sentence: 'Omeprazol blokuje pompę ___ w komórkach okładzinowych.', options: ['protonową', 'sodowo-potasową', 'wapniową'], answer: 'protonową' },
      { sentence: 'Salbutamol stosuje się wziewnie w napadzie ___.', options: ['astmy', 'migreny', 'arytmii'], answer: 'astmy' },
      { sentence: 'Działanie warfaryny monitoruje się wskaźnikiem ___.', options: ['INR', 'OB', 'GFR'], answer: 'INR' },
      { sentence: 'Paracetamol w przedawkowaniu uszkadza przede wszystkim ___.', options: ['wątrobę', 'nerki', 'płuca'], answer: 'wątrobę' },
    ],
    quiz: [
      {
        passage: 'Pacjent z gorączką 38,5°C i bólem głowy pyta o bezpieczny lek OTC. W wywiadzie choroba wrzodowa żołądka.',
        question: 'Który lek jest bezpieczny przy uszkodzeniu żołądka?',
        options: ['Paracetamol', 'Ibuprofen', 'Aspiryna', 'Ketoprofen'],
        answer: 'Paracetamol',
      },
      {
        passage: 'Chory na cukrzycę typu 2 z BMI 31 rozpoczyna terapię farmakologiczną.',
        question: 'Który lek jest zalecany jako pierwsza linia?',
        options: ['Metformina', 'Insulina', 'Glibenklamid', 'Akarboza'],
        answer: 'Metformina',
      },
      {
        passage: 'Sezonowa alergia z katarem i świądem oczu u kierowcy zawodowego.',
        question: 'Który lek nie powoduje senności?',
        options: ['Loratadyna', 'Difenhydramina', 'Klemastyna', 'Prometazyna'],
        answer: 'Loratadyna',
      },
    ],
  },
  null,
  2
)
