// Spørsmålsbank: Byer
// NB: Denne banken er ikke aktivert i spillet ennå.
// For å gjøre den tilgjengelig for import: legg til i src/banks/index.ts:
//   export { byerBank } from "./byer";

// Spørsmålsbank: Byer
// NB: type-only import for å unngå "Duplicate identifier 'Q'"
import type { Q, Difficulty } from "./types";
import { shuffle } from "./util";

export const byerBank: Q[] = shuffle([
  {
    id: "by-oslo",
    text: "Hvilket landemerke ligger i Bjørvika i Oslo?",
    kind: "text",
    options: [
      { id: "a", label: "Operahuset" },
      { id: "b", label: "Nidarosdomen" },
      { id: "c", label: "Bryggen" },
      { id: "d", label: "Ishavskatedralen" },
    ],
    correctId: "a",
    meta: { difficulty: "medium" },
  },
  {
    id: "by-bergen",
    text: "Hva heter fjellbanen som går fra Bergen sentrum?",
    kind: "text",
    options: [
      { id: "a", label: "Kolsåsbanen" },
      { id: "b", label: "Fløibanen" },
      { id: "c", label: "Gaustabanen" },
      { id: "d", label: "Ulriksbanen" },
    ],
    correctId: "b",
    meta: { difficulty: "medium" },
  },
  {
    id: "by-trondheim",
    text: "Hva heter katedralen i Trondheim sentrum?",
    kind: "text",
    options: [
      { id: "a", label: "Domkirkeodden" },
      { id: "b", label: "Nidarosdomen" },
      { id: "c", label: "Mariakirken" },
      { id: "d", label: "Vår Frue kirke" },
    ],
    correctId: "b",
    meta: { difficulty: "medium" },
  },
  {
    id: "by-stavanger",
    text: "Hvilket museum er spesielt kjent i Stavanger?",
    kind: "text",
    options: [
      { id: "a", label: "Vikingskipshuset" },
      { id: "b", label: "Frammuseet" },
      { id: "c", label: "Norsk Oljemuseum" },
      { id: "d", label: "Kon-Tiki Museet" },
    ],
    correctId: "c",
    meta: { difficulty: "medium" },
  },
  {
    id: "by-tromso",
    text: "Hva heter kirken med karakteristisk arkitektur i Tromsø?",
    kind: "text",
    options: [
      { id: "a", label: "Ishavskatedralen" },
      { id: "b", label: "Hamar domkirke" },
      { id: "c", label: "Borgund stavkirke" },
      { id: "d", label: "Lade kirke" },
    ],
    correctId: "a",
    meta: { difficulty: "medium" },
  },
  {
  id: "by-kristiansand-1",
  text: "Hva heter den store dyre- og fornøyelsesparken i Kristiansand?",
  kind: "text",
  options: [
    { id: "a", label: "Dyreparken i Kristiansand" },
    { id: "b", label: "Tusenfryd" },
    { id: "c", label: "Hunderfossen" },
    { id: "d", label: "Bø Sommarland" },
  ],
  correctId: "a",
  meta: { difficulty: "easy" as Difficulty },
},
{
  id: "by-kristiansand-2",
  text: "Hva heter den historiske trehusbebyggelsen nær sentrum av Kristiansand?",
  kind: "text",
  options: [
    { id: "a", label: "Bryggen" },
    { id: "b", label: "Posebyen" },
    { id: "c", label: "Bakklandet" },
    { id: "d", label: "Skansen" },
  ],
  correctId: "b",
  meta: { difficulty: "medium" as Difficulty },
},
{
  id: "by-kristiansand-3",
  text: "Hva heter festningen som ligger ved havna i Kristiansand?",
  kind: "text",
  options: [
    { id: "a", label: "Akershus festning" },
    { id: "b", label: "Kristiansten festning" },
    { id: "c", label: "Christiansholm festning" },
    { id: "d", label: "Varodd fort" },
  ],
  correctId: "c",
  meta: { difficulty: "medium" as Difficulty },
},
{
  id: "by-kristiansand-4",
  text: "Hva heter den store strandfestivalen som arrangeres på Bystranda i Kristiansand?",
  kind: "text",
  options: [
    { id: "a", label: "Palmesus" },
    { id: "b", label: "Moldejazz" },
    { id: "c", label: "Skalldyrfestivalen" },
    { id: "d", label: "Buktafestivalen" },
  ],
  correctId: "a",
  meta: { difficulty: "easy" as Difficulty },
},
{
  id: "by-kristiansand-5",
  text: "Hvilken elv renner ut i Kristiansand?",
  kind: "text",
  options: [
    { id: "a", label: "Otra" },
    { id: "b", label: "Numedalslågen" },
    { id: "c", label: "Glomma" },
    { id: "d", label: "Drammenselva" },
  ],
  correctId: "a",
  meta: { difficulty: "easy" as Difficulty },
},
{
  id: "by-kristiansand-6",
  text: "Hvilken ferjerute forbinder Kristiansand med Danmark?",
  kind: "text",
  options: [
    { id: "a", label: "Kristiansand–Hirtshals" },
    { id: "b", label: "Kristiansand–Frederikshavn" },
    { id: "c", label: "Kristiansand–Grenå" },
    { id: "d", label: "Kristiansand–Aarhus" },
  ],
  correctId: "a",
  meta: { difficulty: "medium" as Difficulty },
},
{
  id: "by-grimstad-1",
  text: "Hvilken norsk forfatter jobbet som apotekerlærling i Grimstad?",
  kind: "text",
  options: [
    { id: "a", label: "Knut Hamsun" },
    { id: "b", label: "Henrik Ibsen" },
    { id: "c", label: "Bjørnstjerne Bjørnson" },
    { id: "d", label: "Alexander Kielland" },
  ],
  correctId: "b",
  meta: { difficulty: "medium" as Difficulty },
},
{
  id: "by-grimstad-2",
  text: "Hvilket universitet har en campus i Grimstad?",
  kind: "text",
  options: [
    { id: "a", label: "NTNU" },
    { id: "b", label: "Universitetet i Oslo" },
    { id: "c", label: "Universitetet i Bergen" },
    { id: "d", label: "Universitetet i Agder" },
  ],
  correctId: "d",
  meta: { difficulty: "easy" as Difficulty },
},
{
  id: "by-grimstad-3",
  text: "Hva heter den årlige filmfestivalen som arrangeres i Grimstad?",
  kind: "text",
  options: [
    { id: "a", label: "Kortfilmfestivalen" },
    { id: "b", label: "Palmesus" },
    { id: "c", label: "By:Larm" },
    { id: "d", label: "TIFF" },
  ],
  correctId: "a",
  meta: { difficulty: "easy" as Difficulty },
},
{
  id: "by-grimstad-4",
  text: "Hva heter fyret i Grimstad kommune som er et populært turmål?",
  kind: "text",
  options: [
    { id: "a", label: "Lindesnes fyr" },
    { id: "b", label: "Lista fyr" },
    { id: "c", label: "Homborsund fyr" },
    { id: "d", label: "Torungen fyr" },
  ],
  correctId: "c",
  meta: { difficulty: "medium" as Difficulty },
},
{
  id: "by-grimstad-5",
  text: "Grimstad ligger i hvilket fylke?",
  kind: "text",
  options: [
    { id: "a", label: "Agder" },
    { id: "b", label: "Rogaland" },
    { id: "c", label: "Vestfold" },
    { id: "d", label: "Telemark" },
  ],
  correctId: "a",
  meta: { difficulty: "easy" as Difficulty },
},
{
  id: "by-grimstad-6",
  text: "Hvilken kyststripe er Grimstad en del av?",
  kind: "text",
  options: [
    { id: "a", label: "Sørlandskysten" },
    { id: "b", label: "Jærkysten" },
    { id: "c", label: "Helgelandskysten" },
    { id: "d", label: "Lofotkysten" },
  ],
  correctId: "a",
  meta: { difficulty: "easy" as Difficulty },
},
// --- Arendal (6) ---
{ id: "by-arendal-1", text: "Hvilken nasjonalpark ligger delvis i Arendal?", kind: "text",
  options: [
    { id: "a", label: "Raet nasjonalpark" },
    { id: "b", label: "Jomfruland nasjonalpark" },
    { id: "c", label: "Hardangervidda nasjonalpark" },
    { id: "d", label: "Rondane nasjonalpark" },
  ],
  correctId: "a", meta: { difficulty: "easy" as Difficulty } },

{ id: "by-arendal-2", text: "Hva heter den store øya utenfor Arendal der Hoveområdet ligger?", kind: "text",
  options: [
    { id: "a", label: "Tromøya" },
    { id: "b", label: "Hisøy" },
    { id: "c", label: "Flekkerøya" },
    { id: "d", label: "Kvaløya" },
  ],
  correctId: "a", meta: { difficulty: "easy" as Difficulty } },

{ id: "by-arendal-3", text: "Hva het musikkfestivalen som tidligere ble arrangert på Hove?", kind: "text",
  options: [
    { id: "a", label: "Hovefestivalen" },
    { id: "b", label: "Palmesus" },
    { id: "c", label: "Quartfestivalen" },
    { id: "d", label: "Måkeskrik" },
  ],
  correctId: "a", meta: { difficulty: "medium" as Difficulty } },

{ id: "by-arendal-4", text: "Hva heter havnebassenget i Arendal sentrum?", kind: "text",
  options: [
    { id: "a", label: "Pollen" },
    { id: "b", label: "Vågen" },
    { id: "c", label: "Lagunen" },
    { id: "d", label: "Nidelva" },
  ],
  correctId: "a", meta: { difficulty: "easy" as Difficulty } },

{ id: "by-arendal-5", text: "Hvilket lag spiller sine hjemmekamper på Norac Stadion i Arendal?", kind: "text",
  options: [
    { id: "a", label: "Arendal Fotball" },
    { id: "b", label: "Start" },
    { id: "c", label: "Jerv" },
    { id: "d", label: "Odd" },
  ],
  correctId: "a", meta: { difficulty: "medium" as Difficulty } },

{ id: "by-arendal-6", text: "Hvilket fylke ligger Arendal i?", kind: "text",
  options: [
    { id: "a", label: "Agder" },
    { id: "b", label: "Telemark" },
    { id: "c", label: "Vestfold" },
    { id: "d", label: "Rogaland" },
  ],
  correctId: "a", meta: { difficulty: "easy" as Difficulty } },

// --- Risør (6) ---
{ id: "by-risor-1", text: "Hva kalles Risør ofte på grunn av trehusbebyggelsen?", kind: "text",
  options: [
    { id: "a", label: "Den hvite by ved Skagerrak" },
    { id: "b", label: "Den blå byen" },
    { id: "c", label: "Den grønne byen" },
    { id: "d", label: "Den gule byen" },
  ],
  correctId: "a", meta: { difficulty: "easy" as Difficulty } },

{ id: "by-risor-2", text: "Hva heter den kjente festivalen som hyller tradisjonelle trebåter i Risør?", kind: "text",
  options: [
    { id: "a", label: "Risør Trebåtfestival" },
    { id: "b", label: "Tall Ships Races" },
    { id: "c", label: "Færderseilasen" },
    { id: "d", label: "Skudefestivalen" },
  ],
  correctId: "a", meta: { difficulty: "easy" as Difficulty } },

{ id: "by-risor-3", text: "Hva heter øya med fyr utenfor Risør sentrum?", kind: "text",
  options: [
    { id: "a", label: "Stangholmen" },
    { id: "b", label: "Jomfruland" },
    { id: "c", label: "Lindesnes" },
    { id: "d", label: "Oksøy" },
  ],
  correctId: "a", meta: { difficulty: "medium" as Difficulty } },

{ id: "by-risor-4", text: "Hvilket fylke ligger Risør i?", kind: "text",
  options: [
    { id: "a", label: "Agder" },
    { id: "b", label: "Telemark" },
    { id: "c", label: "Vestfold" },
    { id: "d", label: "Rogaland" },
  ],
  correctId: "a", meta: { difficulty: "easy" as Difficulty } },

{ id: "by-risor-5", text: "Hvilken kystby ligger øst for Risør langs Skagerrak?", kind: "text",
  options: [
    { id: "a", label: "Kragerø" },
    { id: "b", label: "Grimstad" },
    { id: "c", label: "Mandal" },
    { id: "d", label: "Haugesund" },
  ],
  correctId: "a", meta: { difficulty: "easy" as Difficulty } },

{ id: "by-risor-6", text: "Hva heter kammermusikkfestivalen i Risør?", kind: "text",
  options: [
    { id: "a", label: "Risør kammermusikkfest" },
    { id: "b", label: "Oslo Kammermusikkfestival" },
    { id: "c", label: "Kongsberg Jazzfestival" },
    { id: "d", label: "Ultima" },
  ],
  correctId: "a", meta: { difficulty: "medium" as Difficulty } },

// --- Skien (6) ---
{ id: "by-skien-1", text: "Hvem ble født i Skien og er Norges mest kjente dramatiker?", kind: "text",
  options: [
    { id: "a", label: "Henrik Ibsen" },
    { id: "b", label: "Knut Hamsun" },
    { id: "c", label: "Sigrid Undset" },
    { id: "d", label: "Johan Falkberget" },
  ],
  correctId: "a", meta: { difficulty: "easy" as Difficulty } },

{ id: "by-skien-2", text: "Hva heter elva som renner gjennom Skien?", kind: "text",
  options: [
    { id: "a", label: "Skienselva" },
    { id: "b", label: "Numedalslågen" },
    { id: "c", label: "Drammenselva" },
    { id: "d", label: "Glomma" },
  ],
  correctId: "a", meta: { difficulty: "easy" as Difficulty } },

{ id: "by-skien-3", text: "Hvilken vannvei har sitt utspring/sluttpunkt ved Skien?", kind: "text",
  options: [
    { id: "a", label: "Telemarkskanalen" },
    { id: "b", label: "Haldenkanalen" },
    { id: "c", label: "Trysilkanalen" },
    { id: "d", label: "Femsjøkanalen" },
  ],
  correctId: "a", meta: { difficulty: "medium" as Difficulty } },

{ id: "by-skien-4", text: "Hvilket fylke ligger Skien i (per i dag)?", kind: "text",
  options: [
    { id: "a", label: "Telemark" },
    { id: "b", label: "Vestfold" },
    { id: "c", label: "Agder" },
    { id: "d", label: "Buskerud" },
  ],
  correctId: "a", meta: { difficulty: "easy" as Difficulty } },

{ id: "by-skien-5", text: "Hva heter fotballklubben fra Skien i Eliteserien?", kind: "text",
  options: [
    { id: "a", label: "Odd" },
    { id: "b", label: "Viking" },
    { id: "c", label: "Brann" },
    { id: "d", label: "Start" },
  ],
  correctId: "a", meta: { difficulty: "easy" as Difficulty } },

{ id: "by-skien-6", text: "Hva heter kirken i Skien sentrum kjent for sine to tårn?", kind: "text",
  options: [
    { id: "a", label: "Skien kirke" },
    { id: "b", label: "Gjerpen kirke" },
    { id: "c", label: "Tønsberg domkirke" },
    { id: "d", label: "Fagerborg kirke" },
  ],
  correctId: "a", meta: { difficulty: "medium" as Difficulty } },

// --- Porsgrunn (6) ---
{ id: "by-porsgrunn-1", text: "Hva heter den tradisjonsrike porselensfabrikken i Porsgrunn?", kind: "text",
  options: [
    { id: "a", label: "Porsgrunds Porselænsfabrik" },
    { id: "b", label: "Figgjo" },
    { id: "c", label: "Hadeland Glassverk" },
    { id: "d", label: "Rörstrand" },
  ],
  correctId: "a", meta: { difficulty: "easy" as Difficulty } },

{ id: "by-porsgrunn-2", text: "Hva heter det store industriområdet i Porsgrunn?", kind: "text",
  options: [
    { id: "a", label: "Herøya" },
    { id: "b", label: "Kjeller" },
    { id: "c", label: "Mo industripark" },
    { id: "d", label: "Mongstad" },
  ],
  correctId: "a", meta: { difficulty: "easy" as Difficulty } },

{ id: "by-porsgrunn-3", text: "Hvilken region regnes Porsgrunn som en del av sammen med Skien?", kind: "text",
  options: [
    { id: "a", label: "Grenland" },
    { id: "b", label: "Romerike" },
    { id: "c", label: "Jæren" },
    { id: "d", label: "Helgeland" },
  ],
  correctId: "a", meta: { difficulty: "easy" as Difficulty } },

{ id: "by-porsgrunn-4", text: "Hvilket fylke ligger Porsgrunn i (per i dag)?", kind: "text",
  options: [
    { id: "a", label: "Telemark" },
    { id: "b", label: "Vestfold" },
    { id: "c", label: "Agder" },
    { id: "d", label: "Oslo" },
  ],
  correctId: "a", meta: { difficulty: "easy" as Difficulty } },

{ id: "by-porsgrunn-5", text: "Hva heter klaffebrua i sentrum av Porsgrunn?", kind: "text",
  options: [
    { id: "a", label: "Porsgrunnsbrua" },
    { id: "b", label: "Fredrikstadbrua" },
    { id: "c", label: "Skarnsundetbrua" },
    { id: "d", label: "Varoddbrua" },
  ],
  correctId: "a", meta: { difficulty: "medium" as Difficulty } },

{ id: "by-porsgrunn-6", text: "Hvilket universitet har campus i Porsgrunn?", kind: "text",
  options: [
    { id: "a", label: "Universitetet i Sørøst-Norge (USN)" },
    { id: "b", label: "Universitetet i Agder (UiA)" },
    { id: "c", label: "Norges miljø- og biovitenskapelige universitet (NMBU)" },
    { id: "d", label: "Universitetet i Stavanger (UiS)" },
  ],
  correctId: "a", meta: { difficulty: "easy" as Difficulty } },
  {
    id: "by-alesund",
    text: "Hvilken arkitektonisk stil preger Ålesund etter bybrannen i 1904?",
    kind: "text",
    options: [
      { id: "a", label: "Gotikk" },
      { id: "b", label: "Jugendstil" },
      { id: "c", label: "Barokk" },
      { id: "d", label: "Funksjonalisme" },
    ],
    correctId: "b",
    meta: { difficulty: "medium" },
  },
  {
    id: "by-bodo",
    text: "Hvilken naturattraksjon ligger like ved Bodø?",
    kind: "text",
    options: [
      { id: "a", label: "Saltstraumen" },
      { id: "b", label: "Trolltunga" },
      { id: "c", label: "Preikestolen" },
      { id: "d", label: "Kjeragbolten" },
    ],
    correctId: "a",
    meta: { difficulty: "medium" },
  },
  {
    id: "by-drammen",
    text: "Hva heter den spiralformede veien/attraksjonen i Drammen?",
    kind: "text",
    options: [
      { id: "a", label: "Spiralen" },
      { id: "b", label: "Hardangervidda" },
      { id: "c", label: "Atlanterhavsveien" },
      { id: "d", label: "Trollstigen" },
    ],
    correctId: "a",
    meta: { difficulty: "medium" },
  },
  {
    id: "by-fredrikstad",
    text: "Hva heter den godt bevarte festningsbyen i Fredrikstad?",
    kind: "text",
    options: [
      { id: "a", label: "Gamlebyen" },
      { id: "b", label: "Akershus festning" },
      { id: "c", label: "Bergenhus" },
      { id: "d", label: "Kristiansten festning" },
    ],
    correctId: "a",
    meta: { difficulty: "medium" },
  },
  // --- Mandal (6 stk) ------------------------------------------------
  {
    id: "by-mandal-1",
    text: "Hva heter den kjente badestranden i Mandal?",
    kind: "text",
    options: [
      { id: "a", label: "Sjøsanden" },
      { id: "b", label: "Bystranda" },
      { id: "c", label: "Hauklandstranda" },
      { id: "d", label: "Hellestøstranden" },
    ],
    correctId: "a",
    meta: { difficulty: "medium" as Difficulty },
  },
  {
    id: "by-mandal-2",
    text: "Hva heter elven som renner gjennom Mandal?",
    kind: "text",
    options: [
      { id: "a", label: "Numedalslågen" },
      { id: "b", label: "Otra" },
      { id: "c", label: "Mandalselva" },
      { id: "d", label: "Tovdalselva" },
    ],
    correctId: "c",
    meta: { difficulty: "medium" as Difficulty },
  },
  {
    id: "by-mandal-3",
    text: "Hvilket fyr ligger sørvest for Mandal og er Norges sørligste punkt?",
    kind: "text",
    options: [
      { id: "a", label: "Lindesnes fyr" },
      { id: "b", label: "Lista fyr" },
      { id: "c", label: "Torungen fyr" },
      { id: "d", label: "Utsira fyr" },
    ],
    correctId: "a",
    meta: { difficulty: "medium" as Difficulty },
  },
  {
    id: "by-mandal-4",
    text: "Hvilken festival arrangeres årlig i Mandal i august?",
    kind: "text",
    options: [
      { id: "a", label: "Skalldyrfestivalen" },
      { id: "b", label: "Gladmat" },
      { id: "c", label: "Palmesus" },
      { id: "d", label: "Moldejazz" },
    ],
    correctId: "a",
    meta: { difficulty: "medium" as Difficulty },
  },
  {
    id: "by-mandal-5",
    text: "Mandal er i dag en del av hvilken kommune (etter kommunesammenslåingen i 2020)?",
    kind: "text",
    options: [
      { id: "a", label: "Kristiansand" },
      { id: "b", label: "Lindesnes" },
      { id: "c", label: "Lyngdal" },
      { id: "d", label: "Farsund" },
    ],
    correctId: "b",
    meta: { difficulty: "medium" as Difficulty },
  },
  {
    id: "by-mandal-6",
    text: "Hvilken berømt kunstner ble født i Mandal og har museum/kunstminner knyttet til seg i byen?",
    kind: "text",
    options: [
      { id: "a", label: "Christian Krohg" },
      { id: "b", label: "Adolph Tidemand" },
      { id: "c", label: "Edvard Munch" },
      { id: "d", label: "Nikolai Astrup" },
    ],
    correctId: "b",
    meta: { difficulty: "medium" as Difficulty },
  },
]);
// --- ByQuiz pr. by (slug) -----------------------------
export const BYQUIZ_BANKS: Record<string, Q[]> = byerBank.reduce(
  (acc, q) => {
    // Ekstraher by-slug fra id, f.eks. "by-mandal-3" -> "mandal"
    const m = /^by-([a-z0-9]+)/i.exec(q.id ?? "");
    let key = (m?.[1] ?? (q as any)?.meta?.citySlug ?? "").toLowerCase();
    // Sikkerhet: fjern alt etter første bindestrek hvis noe snek seg med
    key = key.replace(/-.*$/, "");

    if (!key) return acc;
    (acc[key] ||= []).push(q);
    return acc;
  },
  {} as Record<string, Q[]>,
);
