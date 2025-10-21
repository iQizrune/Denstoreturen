export type RoutePoint = [number, number]; // [lat, lng]
export type RouteLeg = {
  fromName: string;
  toName: string;
  distanceMeters: number;
  path: RoutePoint[];
};
