/**
 * Institutional partner strip, modelled on the reference museum's sponsor
 * lockups: a single row of compact white marks, docked bottom-right of the
 * hero.
 *
 * Marks are the official emblems of each institution (KNUST, GMMB),
 * reversed to white and shipped from /images/logos so they sit cleanly on the
 * hero photograph.
 */

export const InstitutionLogos = (): JSX.Element => (
  <div className="flex max-w-[92vw] flex-wrap items-end justify-end gap-x-6 gap-y-4 md:gap-x-8">
    <img
      src="/images/logos/knust-white.png"
      alt="Kwame Nkrumah University of Science and Technology"
      className="h-12 w-auto object-contain md:h-16"
    />
    <img
      src="/images/logos/gmmb-white.png"
      alt="Ghana Museums and Monuments Board"
      className="h-14 w-auto object-contain md:h-[72px]"
    />
  </div>
);
