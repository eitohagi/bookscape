import type {
  CompleteWorldDNA,
} from "./smooth";

import {
  clamp,
  getCloudStrength,
  getCrystalStrength,
  getOrganismStrength,
  getRainStrength,
  getVoidStrength,
  getWaveStrength,
} from "./strengths";


// ============================================================
// TYPES
// ============================================================

export type WorldName =
  | "galaxy"
  | "cloud"
  | "wave"
  | "organism"
  | "crystal"
  | "rain"
  | "void";


export type WorldComposition =
  Record<
    WorldName,
    number
  >;


// ============================================================
// RAW WORLD SCORES
// ============================================================

function getRawScores(
  dna: CompleteWorldDNA
): WorldComposition {
  const {
    quietness,
    chaos,
    solitude,
    hope,
    fantasy,
    nature,
    darkness,
    speed,
    spaciousness,
    tension,
    fluidity,
  } = dna;


  const cloud =
    getCloudStrength(
      quietness,
      spaciousness,
      darkness
    );


  const wave =
    getWaveStrength(
      fluidity,
      speed,
      fantasy
    );


  const organism =
    getOrganismStrength(
      nature,
      fluidity,
      fantasy
    );


  const crystal =
    getCrystalStrength(
      tension,
      fantasy,
      chaos
    );


  const rain =
    getRainStrength(
      speed,
      chaos,
      tension
    );


  const voidWorld =
    getVoidStrength(
      darkness,
      solitude
    );


  /*
   * Galaxyは
   * 「宇宙・幻想・広がり・孤独」
   * から作る
   */
  const galaxy =
    clamp(
      fantasy * 0.42 +
        spaciousness * 0.38 +
        solitude * 0.26 +
        hope * 0.12 +
        quietness * 0.08 -
        nature * 0.12 -
        tension * 0.06,
      0,
      1
    );


  return {
    galaxy,
    cloud,
    wave,
    organism,
    crystal,
    rain,
    void: voidWorld,
  };
}


// ============================================================
// COMPOSITION ENGINE
// ============================================================

export function getWorldComposition(
  dna: CompleteWorldDNA
): WorldComposition {
  const raw =
    getRawScores(
      dna
    );


  const entries =
    Object.entries(
      raw
    ) as [
      WorldName,
      number
    ][];


  /*
   * 強い順に並べる
   */
  const sorted =
    [...entries].sort(
      (
        a,
        b
      ) =>
        b[1] -
        a[1]
    );


  const result:
    WorldComposition = {
      galaxy: 0,
      cloud: 0,
      wave: 0,
      organism: 0,
      crystal: 0,
      rain: 0,
      void: 0,
    };


  // =========================================================
  // PRIMARY WORLD
  // =========================================================

  const primary =
    sorted[0];

  if (primary) {
    result[
      primary[0]
    ] =
      clamp(
        0.68 +
          primary[1] *
            0.32,
        0,
        1
      );
  }


  // =========================================================
  // SECONDARY WORLD
  // =========================================================

  const secondary =
    sorted[1];

  if (secondary) {
    result[
      secondary[0]
    ] =
      clamp(
        0.18 +
          secondary[1] *
            0.42,
        0,
        0.62
      );
  }


  // =========================================================
  // ACCENT WORLD
  // =========================================================

  const accent =
    sorted[2];

  if (accent) {
    result[
      accent[0]
    ] =
      clamp(
        0.04 +
          accent[1] *
            0.20,
        0,
        0.28
      );
  }


  /*
   * 4位以下も完全ゼロにはしない。
   *
   * DNAが変化したとき
   * 突然出現するのを少し防ぐ。
   */
  for (
    let i = 3;
    i < sorted.length;
    i++
  ) {
    const [
      name,
      score,
    ] =
      sorted[i];

    result[name] =
      clamp(
        score * 0.035,
        0,
        0.045
      );
  }


  return result;
}