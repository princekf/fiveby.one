export interface UnitS {
  name: string;
  shortName: string;
  baseUnit: Unit;
  times: number;
  decimalPlaces: number;
  ancestors: string[];
}

export interface Unit extends UnitS {
  _id: string;
}
