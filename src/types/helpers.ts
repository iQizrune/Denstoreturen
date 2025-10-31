// src/types/helpers.ts
// AUTO-GENERERT av tilnychat/scripts/apply-helper-names.mjs
// Rediger ikke for hånd; kjør scriptet på nytt når listen endres.

export type HelperKey =
  | "helleristning-pollenogsj-fart-atlanterveien-bryggen-besseggen-moskus-ypsilon-keramikk-listafyr-hollenderbyen-gamlebyen-gaustadtoppen-skiblander-ibsenoghamsun-fredrikstenfestning-vikingskipet-struvesmeridianbue-festspilleneinordnorge-haraldshaugen-togstajonifjellet-marinemuseet-h-nefossen-kinnaklova-grensemotrussland-s-lvgruvene-kongsvingerfestning-dyreparken-klippfisk-farris-lysg-rdbakken-lindesnesfyr-sj-sanden-polarsirkelsentret-rosensby-sj-gata-mossekr-ka-tr-nderrock-ofotbanenogkrigshistorie-nidaros-globus-norskindustriarv-porselen-denhvitebyvedskagerak-saltstraumen-sykkelbyen-borregaard-telemarkskanalen-saftogsyltet-y-prekestolen-leksikon-trollstigen-ishavskatedralen-slottsfjellet-luftskipmast-heksemonumentet-jugendstil";

export function isHelperKey(x: string): x is HelperKey {
  return HELPER_KEYS.includes(x as HelperKey);
}

export const HELPER_KEYS: HelperKey[] = [
  "helleristning-pollenogsj-fart-atlanterveien-bryggen-besseggen-moskus-ypsilon-keramikk-listafyr-hollenderbyen-gamlebyen-gaustadtoppen-skiblander-ibsenoghamsun-fredrikstenfestning-vikingskipet-struvesmeridianbue-festspilleneinordnorge-haraldshaugen-togstajonifjellet-marinemuseet-h-nefossen-kinnaklova-grensemotrussland-s-lvgruvene-kongsvingerfestning-dyreparken-klippfisk-farris-lysg-rdbakken-lindesnesfyr-sj-sanden-polarsirkelsentret-rosensby-sj-gata-mossekr-ka-tr-nderrock-ofotbanenogkrigshistorie-nidaros-globus-norskindustriarv-porselen-denhvitebyvedskagerak-saltstraumen-sykkelbyen-borregaard-telemarkskanalen-saftogsyltet-y-prekestolen-leksikon-trollstigen-ishavskatedralen-slottsfjellet-luftskipmast-heksemonumentet-jugendstil",
];
