import type {
  WorldComposition,
} from "./composition";


// ============================================================
// MIXER
// ============================================================

export function dampValue(
  current: number,
  target: number,
  lambda: number,
  delta: number
) {
  return (
    current +
    (
      target -
      current
    ) *
      (
        1 -
        Math.exp(
          -lambda *
            delta
        )
      )
  );
}


// ============================================================
// CREATE DEFAULT COMPOSITION
// ============================================================

export function createEmptyComposition():
  WorldComposition {
  return {
    galaxy: 0,
    cloud: 0,
    wave: 0,
    organism: 0,
    crystal: 0,
    rain: 0,
    void: 0,
  };
}


// ============================================================
// DAMP WHOLE COMPOSITION
// ============================================================

export function dampComposition(
  current: WorldComposition,
  target: WorldComposition,
  lambda: number,
  delta: number
): WorldComposition {
  return {
    galaxy:
      dampValue(
        current.galaxy,
        target.galaxy,
        lambda,
        delta
      ),

    cloud:
      dampValue(
        current.cloud,
        target.cloud,
        lambda,
        delta
      ),

    wave:
      dampValue(
        current.wave,
        target.wave,
        lambda,
        delta
      ),

    organism:
      dampValue(
        current.organism,
        target.organism,
        lambda,
        delta
      ),

    crystal:
      dampValue(
        current.crystal,
        target.crystal,
        lambda,
        delta
      ),

    rain:
      dampValue(
        current.rain,
        target.rain,
        lambda,
        delta
      ),

    void:
      dampValue(
        current.void,
        target.void,
        lambda,
        delta
      ),
  };
}