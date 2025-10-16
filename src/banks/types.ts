export type AgeGroup = 'barn' | 'ung' | 'voksen';

export type QOption = {
  text?: string;
  label?: string;
  title?: string;
  name?: string;
  value?: string;
  correct?: boolean | string | number;
  isCorrect?: boolean | string | number;
  ok?: boolean | string | number;
  right?: boolean | string | number;
  a?: boolean | string | number;
  [k: string]: any;
};

export type Difficulty = 'easy' | 'medium' | 'hard' | number;

export type Q = {
  // vanlige spørsmålsfelt
  id?: string;               // <— lagt til (brukes i flere banker)
  image?: string;            // <— lagt til (brukes bl.a. i flags)
  q?: string;
  question?: string;
  prompt?: string;
  text?: string;

  // svar/valg i ulike formater
  options?: QOption[] | Record<string, QOption>;
  choices?: QOption[] | string | string[];
  answers?: QOption[] | Record<string, QOption>;
  alts?: QOption[] | Record<string, QOption>;

  // korrekt svar i ulike formater
  a?: string | number;
  answer?: string | number;
  correct?: string | number | boolean;
  correctIndex?: number;
  answerIndex?: number;
  correct_idx?: number;
  correctOption?: number;

  // filtrering/metadata
  minAge?: AgeGroup;
  maxAge?: AgeGroup;
  age?: AgeGroup;
  tags?: string[];
  difficulty?: Difficulty;

  // tillat ekstra felter uten klaging
  [k: string]: any;
};

export type RawOption = QOption;
export type RawQA = Q;

/* Normalisert form som adapteren/Play bruker */
export type QA = { q: string; a: string; choices: string[] };
