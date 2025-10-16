export type StopOption = { text: string; correct?: boolean };
export type StopTask = { q: string; options: StopOption[] };

export const LILLEHAMMER: StopTask[] = [
  {
    q: "Hvilken by er stoppet?",
    options: [
      { text: "Lillehammer", correct: true },
      { text: "Gjøvik" },
      { text: "Hamar" }
    ]
  },
  {
    q: "Hva er kjent i Lillehammer?",
    options: [
      { text: "Maihaugen", correct: true },
      { text: "Nidarosdomen" },
      { text: "Bryggen i Bergen" }
    ]
  }
];
