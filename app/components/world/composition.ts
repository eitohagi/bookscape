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
// EMPTY COMPOSITION
// ============================================================

function createEmptyComposition():
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
// SMOOTHSTEP
// ============================================================

function smoothstep(
  edge0: number,
  edge1: number,
  x: number
) {
  const t =
    clamp(
      (
        x -
        edge0
      ) /
        (
          edge1 -
          edge0
        ),
      0,
      1
    );

  return (
    t *
    t *
    (
      3 -
      2 * t
    )
  );
}


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


  // ==========================================================
  // CLOUD
  // ==========================================================

  const cloud =
    getCloudStrength(
      quietness,
      spaciousness,
      darkness
    );


  // ==========================================================
  // WAVE
  // ==========================================================

  const wave =
    getWaveStrength(
      fluidity,
      speed,
      fantasy
    );


  // ==========================================================
  // ORGANISM
  // ==========================================================

  const organism =
    getOrganismStrength(
      nature,
      fluidity,
      fantasy
    );


  // ==========================================================
  // CRYSTAL
  // ==========================================================

  const crystal =
    getCrystalStrength(
      tension,
      fantasy,
      chaos
    );


  // ==========================================================
  // RAIN
  // ==========================================================

  const rain =
    getRainStrength(
      speed,
      chaos,
      tension
    );


  // ==========================================================
  // VOID
  // ==========================================================

  const voidWorld =
    getVoidStrength(
      darkness,
      solitude
    );


  // ==========================================================
  // GALAXY
  // ==========================================================

  /*
   * Galaxyは単純な加算ではなく
   *
   * fantasy AND spaciousness
   * solitude AND spaciousness
   *
   * のような組み合わせを中心にする。
   *
   * これでGalaxyの常時支配を防ぐ。
   */

  const galaxy =
    clamp(
      0.08 +

      fantasy *
        spaciousness *
        0.46 +

      solitude *
        spaciousness *
        0.22 +

      quietness *
        spaciousness *
        0.12 +

      fantasy *
        hope *
        0.12 -

      nature *
        0.10 -

      tension *
        0.06,

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
    void:
      voidWorld,
  };
}


// ============================================================
// ACTIVATED SCORES
// ============================================================

function getActivatedScores(
  raw: WorldComposition
): WorldComposition {
  return {

    galaxy:
      smoothstep(
        0.24,
        0.72,
        raw.galaxy
      ),

    cloud:
      smoothstep(
        0.20,
        0.68,
        raw.cloud
      ),

    wave:
      smoothstep(
        0.22,
        0.70,
        raw.wave
      ),

    organism:
      smoothstep(
        0.24,
        0.72,
        raw.organism
      ),

    crystal:
      smoothstep(
        0.25,
        0.73,
        raw.crystal
      ),

    rain:
      smoothstep(
        0.27,
        0.75,
        raw.rain
      ),

    void:
      smoothstep(
        0.27,
        0.76,
        raw.void
      ),
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


  const activated =
    getActivatedScores(
      raw
    );


  const names =
    Object.keys(
      activated
    ) as WorldName[];


  // ==========================================================
  // 1. WORLD RANKING
  // ==========================================================

  /*
   * activatedで並べる。
   *
   * ただし全部ほぼ0だった場合は
   * raw scoreで主役を決める。
   */

  let ranked =
    names
      .map(
        (
          name
        ) => ({
          name,

          activated:
            activated[
              name
            ],

          raw:
            raw[
              name
            ],
        })
      )
      .sort(
        (
          a,
          b
        ) =>
          b.activated -
          a.activated
      );


  /*
   * 全部smoothstepの下にいる場合。
   *
   * 3枚目の
   * 「完全な黒画面」
   * を防ぐ。
   */

  if (
    ranked[0]
      .activated <
    0.03
  ) {

    ranked =
      names
        .map(
          (
            name
          ) => ({
            name,

            activated:
              activated[
                name
              ],

            raw:
              raw[
                name
              ],
          })
        )
        .sort(
          (
            a,
            b
          ) =>
            b.raw -
            a.raw
        );
  }


  const result =
    createEmptyComposition();


  const primary =
    ranked[0];


  const secondary =
    ranked[1];


  const atmosphere =
    ranked[2];


  // ==========================================================
  // 2. MAIN WORLD
  // ==========================================================

  /*
   * 必ず画面に主役を作る。
   *
   * World側でさらに
   *
   * getXXXStrength * mix
   *
   * しているので、
   * Composition側ではかなり強く渡す。
   */

  if (
    primary
  ) {

    const primaryEvidence =
      Math.max(
        primary.activated,
        primary.raw *
          0.75
      );


    result[
      primary.name
    ] =
      clamp(
        0.68 +
        primaryEvidence *
          0.32,

        0.68,
        1
      );
  }


  // ==========================================================
  // 3. SECONDARY WORLD
  // ==========================================================

  /*
   * 主役を邪魔しない程度。
   *
   * 以前のように
   * 0.6〜0.8のWorldが複数並ばない。
   */

  if (
    secondary
  ) {

    const secondaryEvidence =
      Math.max(
        secondary.activated,
        secondary.raw *
          0.55
      );


    result[
      secondary.name
    ] =
      clamp(
        secondaryEvidence *
          0.34,

        0,
        0.34
      );


    /*
     * ほとんど相性が無ければ
     * 無理に出さない。
     */

    if (
      secondaryEvidence <
      0.18
    ) {
      result[
        secondary.name
      ] =
        0;
    }
  }


  // ==========================================================
  // 4. ATMOSPHERE
  // ==========================================================

  /*
   * 3番目は構造物としてではなく
   * 「雰囲気」として薄く使う。
   */

  if (
    atmosphere
  ) {

    const atmosphereEvidence =
      Math.max(
        atmosphere.activated,
        atmosphere.raw *
          0.45
      );


    result[
      atmosphere.name
    ] =
      clamp(
        atmosphereEvidence *
          0.16,

        0,
        0.16
      );


    if (
      atmosphereEvidence <
      0.20
    ) {
      result[
        atmosphere.name
      ] =
        0;
    }
  }


  // ==========================================================
  // 5. SPECIAL ATMOSPHERE SUPPORT
  // ==========================================================

  /*
   * Cloudは背景担当なので、
   * RAW適性がそれなりにあれば
   * 主役でなくても薄く残してよい。
   */

  if (
    primary.name !==
      "cloud" &&
    secondary?.name !==
      "cloud" &&
    raw.cloud >
      0.38
  ) {

    result.cloud =
      Math.max(
        result.cloud,

        clamp(
          (
            raw.cloud -
            0.30
          ) *
            0.18,

          0,
          0.10
        )
      );
  }


  /*
   * Rainも「時間的アクセント」として
   * 少量だけ残せる。
   *
   * ただしchaosが高くても
   * 画面を埋め尽くさないよう最大0.08。
   */

  if (
    primary.name !==
      "rain" &&
    secondary?.name !==
      "rain" &&
    raw.rain >
      0.52
  ) {

    result.rain =
      Math.max(
        result.rain,

        clamp(
          (
            raw.rain -
            0.48
          ) *
            0.15,

          0,
          0.08
        )
      );
  }


  // ==========================================================
  // 6. QUIET / SOLITARY SPECIAL CASE
  // ==========================================================

  /*
   * 静寂・孤独の場合、
   * 主役まで消すのではなく
   *
   * 「主役を1つ残し、
   * その他をもっと消す」
   *
   * 方向にする。
   */

  const silence =
    clamp(
      dna.quietness *
        0.55 +
      dna.solitude *
        0.45,

      0,
      1
    );


  if (
    silence >
    0.70
  ) {

    names.forEach(
      (
        name
      ) => {

        if (
          name ===
          primary.name
        ) {
          return;
        }


        result[
          name
        ] *=
          0.65;
      }
    );


    /*
     * 静かな文章でも
     * 主役は最低0.72を維持。
     */

    result[
      primary.name
    ] =
      Math.max(
        result[
          primary.name
        ],
        0.72
      );
  }


  // ==========================================================
  // 7. CHAOTIC SCENE CONTROL
  // ==========================================================

  /*
   * chaosが高いからといって
   * 7World全部を出さない。
   *
   * chaosは各World内部の形態や動きに任せる。
   *
   * Composition自体の情報量は抑える。
   */

  const secondaryNames =
    names.filter(
      (
        name
      ) =>
        name !==
        primary.name
    );


  const secondaryEnergy =
    secondaryNames.reduce(
      (
        sum,
        name
      ) =>
        sum +
        result[
          name
        ],
      0
    );


  const MAX_SECONDARY_ENERGY =
    0.52;


  if (
    secondaryEnergy >
    MAX_SECONDARY_ENERGY
  ) {

    const scale =
      MAX_SECONDARY_ENERGY /
      secondaryEnergy;


    secondaryNames.forEach(
      (
        name
      ) => {

        result[
          name
        ] *=
          scale;
      }
    );
  }


  // ==========================================================
  // 8. CLEANUP
  // ==========================================================

  /*
   * 目に見えないほど小さいWorldを切る。
   */

  names.forEach(
    (
      name
    ) => {

      if (
        result[
          name
        ] <
        0.012
      ) {

        result[
          name
        ] =
          0;
      }


      result[
        name
      ] =
        clamp(
          result[
            name
          ],
          0,
          1
        );
    }
  );


  return result;
}