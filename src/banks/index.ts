// src/banks/index.ts

// Typer
export type { Q, QOption, Difficulty } from "./types";

// Felles verktøy (hvis du har util.ts)
export { shuffle } from "./util";

// Hovedbank(er) (hvis du har core.ts)
export { easyBank, mediumBank, hardBank, impossibleBank } from "./core";

// Bonus-banker (hvis du har bonus.ts)
export { bonusEasyBank, bonusMediumBank, bonusHardBank } from "./bonus";

// Trick-banker (hvis du har trick.ts)
export { trickBank } from "./trick";

// Extra life-banker (hvis du har extraLife.ts)
export { extraLifeBank } from "./extraLife";

// Flag-banker (hvis du har flags.ts)
export { flagEasy, flagMedium, flagHard, makeFlagQ } from "./flags";

// Reveal-banker (hvis du har reveal.ts)
export { revealEasy, revealMedium, revealHard } from "./reveal";

// By-quiz banker (hvis du har byer.ts)
export { byerBank, BYQUIZ_BANKS } from "./byer";

// Lightning-banken (den du nettopp sendte)
export { LIGHTNING_BANKS, lightningBank } from "./lightning";

// Adaptere (hold som no-ops hvis appen forventer dem)
export const onBonusTimeUpAdapter = () => {};
export const onExtraTimeUpAdapter = () => {};
export const onTrickTimeUpAdapter = () => {};
export const onLightningTimeUpAdapter = () => {};
export const onMainTimeUpAdapter = () => {};
