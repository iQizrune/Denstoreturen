// src/engine/HelperPickupGate.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";

// Relative stier fra src/engine/
import { HELPER_SPAWNS } from "../data/helper_spawns";
import { getAll as getAllHelpers } from "../state/helpersStore";
import type { HelperKey } from "../types/helpers";

// components/… ligger én nivå opp fra src/
import HelperPickupPoster from "../../components/posters/HelperPickupPoster";

type Props = {
  /** Total effektive meter i gjeldende økt/etappe */
  totalMeters: number;
  /** Kalles når en plakat åpnes første gang (sett pause= true i parent) */
  onPause?: () => void;
  /** Kalles når plakaten lukkes/aksepteres (sett pause = false i parent) */
  onResume?: () => void;
};

/** Minimal, selvstendig type for trygg find()-bruk */
type SpawnEntry = { meters: number; helper: HelperKey };

export default function HelperPickupGate({ totalMeters, onPause, onResume }: Props) {
  const [open, setOpen] = useState(false);
  const [activeKey, setActiveKey] = useState<HelperKey | null>(null);

  // Hindre at samme hjelpemiddel vises flere ganger i samme økt
  const shownRef = useRef<Set<HelperKey>>(new Set());
  const pausedRef = useRef(false);

  // Snapshot av hva spilleren allerede har (helpersStore er master for “eierskap”)
  const ownedMap = useMemo(() => {
    // getAll(): Partial<Record<HelperKey, HelpStatus>>
    return getAllHelpers();
  }, [totalMeters]);

  useEffect(() => {
    if (open) return; // ikke evaluer mens plakat er åpen

    // Finn første spawn som er passert, ikke eies og ikke vist i denne økten
    const spawn = (HELPER_SPAWNS as SpawnEntry[]).find((sp) => {
      const alreadyOwned = !!ownedMap[sp.helper];
      const alreadyShown = shownRef.current.has(sp.helper);
      return totalMeters >= sp.meters && !alreadyOwned && !alreadyShown;
    });

    if (spawn) {
      shownRef.current.add(spawn.helper);
      setActiveKey(spawn.helper);
      setOpen(true);

      if (!pausedRef.current) {
        pausedRef.current = true;
        onPause?.(); // signaliser pause til parent
      }
    }
  }, [totalMeters, ownedMap, open, onPause]);

  const finish = () => {
    setOpen(false);
    setActiveKey(null);
    if (pausedRef.current) {
      pausedRef.current = false;
      onResume?.(); // signaliser resume til parent
    }
  };

  if (!open || !activeKey) return null;

  return (
    <HelperPickupPoster
      visible={open}
      helper={activeKey}
      onAccept={finish}
      onClose={finish}
    />
  );
}
