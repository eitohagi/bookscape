import type { World3DProps } from "./types";

export type CompleteWorldDNA =
  Required<
    Omit<
      World3DProps,
      "mix"
    >
  >;

export const defaultWorldDNA: CompleteWorldDNA = {
  quietness: 0.5,
  chaos: 0.5,
  solitude: 0.5,
  hope: 0.5,
  fantasy: 0.5,
  nature: 0.5,
  darkness: 0.5,
  speed: 0.5,
  warmth: 0.5,
  spaciousness: 0.5,
  tension: 0.5,
  fluidity: 0.5,
};

export function completeDNA(
  dna: World3DProps
): CompleteWorldDNA {
  return {
    quietness:
      dna.quietness ??
      defaultWorldDNA.quietness,

    chaos:
      dna.chaos ??
      defaultWorldDNA.chaos,

    solitude:
      dna.solitude ??
      defaultWorldDNA.solitude,

    hope:
      dna.hope ??
      defaultWorldDNA.hope,

    fantasy:
      dna.fantasy ??
      defaultWorldDNA.fantasy,

    nature:
      dna.nature ??
      defaultWorldDNA.nature,

    darkness:
      dna.darkness ??
      defaultWorldDNA.darkness,

    speed:
      dna.speed ??
      defaultWorldDNA.speed,

    warmth:
      dna.warmth ??
      defaultWorldDNA.warmth,

    spaciousness:
      dna.spaciousness ??
      defaultWorldDNA.spaciousness,

    tension:
      dna.tension ??
      defaultWorldDNA.tension,

    fluidity:
      dna.fluidity ??
      defaultWorldDNA.fluidity,
  };
}

export function damp(
  current: number,
  target: number,
  lambda: number,
  delta: number
) {
  return (
    current +
    (target - current) *
      (
        1 -
        Math.exp(
          -lambda *
          delta
        )
      )
  );
}