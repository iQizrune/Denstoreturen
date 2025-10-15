// app/lib/kartBus.ts
type ShowStage = {
  type: "show-stage";
  fromStopIndex: number;
  toStopIndex: number;
  startMeters: number;
  endMeters: number;
  currentMeters?: number;
  fromStopName?: string;
  toStopName?: string;
};

type ArrivedStop = {
  type: "arrived-stop";
  stopIndex: number;
  currentMeters?: number;
};

type AwardCoat = {
  type: "award-coat";
  stopId: string; // f.eks. "sandefjord"
  stopIndex?: number;
  perfect?: boolean; // true ved 6/6 riktig
};

export type KartCmd = ShowStage | ArrivedStop | AwardCoat;

type Listener = (cmd: KartCmd) => void;
const subs = new Set<Listener>();

export function publishKart(cmd: KartCmd) {
  subs.forEach((fn) => fn(cmd));
}

export function subscribeKart(fn: Listener): () => void {
  subs.add(fn);
  return () => {
    subs.delete(fn);
  }; // rett cleanup
}

// Små hjelpere:
export const publishShowStage = (args: ShowStage) => publishKart(args);
export const publishArrivedStop = (args: ArrivedStop) => publishKart(args);
export const publishAwardCoat = (args: AwardCoat) => publishKart(args);

export default function __route_stub__() {
  return null as any;
}
