export interface Appliance {
  id: string;
  manufacturer: string;
  productFamily: string;
  model: string;
  /** Volledige naam zoals op de toestelpagina. */
  name: string;
  /** Korte naam voor compacte headers. */
  shortName: string;
  /** Extra zoektermen (alleen schrijfwijzen van de naam, geen technische claims). */
  searchTerms: string[];
}
