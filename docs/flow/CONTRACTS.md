# Kontrakter (kritisk appflyt)

## Etappe-start
- StopModule må legge neste etappe i stageQueue før overlay lukkes.
- PlayScreen må konsumere stageQueue ved mount og når StopModule lukkes (stopVisible → false).

## Belønning
- Ved ≥4 riktige i StopModule legges korrekt coat (byslug) i Bag, kun én gang per by.

## Pause etter dette
- Når “Pause etter dette spørsmålet” aktiveres: +4 sek på spørsmålet.
- Etter besvarelse: vis pause-plakat (ikke auto–neste). “Gjenoppta” -> neste spørsmål, “Avslutt” -> /start.

## Kart
- “Åpne kart” er tilgjengelig både fra velkomst og i oppsummeringsplakat etter stopp.
