"use client";

import {
  useMemo,
  useRef,
} from "react";

import {
  useFrame,
} from "@react-three/fiber";

import * as THREE from "three";

import type {
  World3DProps,
} from "./types";


// ============================================================
// HELPERS
// ============================================================

function clamp01(
  value: number
) {
  return Math.min(
    1,
    Math.max(
      0,
      value
    )
  );
}


function smoothstep(
  edge0: number,
  edge1: number,
  x: number
) {
  const t =
    clamp01(
      (x - edge0) /
      (edge1 - edge0)
    );

  return (
    t *
    t *
    (3 - 2 * t)
  );
}


// ============================================================
// WAVE WORLD
// ============================================================

export default function WaveWorld({
  mix = 1,

  fluidity = 0.5,
  fantasy = 0.5,
  warmth = 0.5,
  hope = 0.5,
  speed = 0.4,
  chaos = 0.5,
  spaciousness = 0.5,

  quietness = 0.5,
  darkness = 0.5,
  solitude = 0.5,
  tension = 0.5,

}: World3DProps) {

  // ==========================================================
  // REFS
  // ==========================================================

  const rootRef =
    useRef<THREE.Group>(null);

  const oceanMaterialRef =
    useRef<THREE.ShaderMaterial>(null);

  const rippleMaterialRef =
    useRef<THREE.ShaderMaterial>(null);

  const filamentMaterialRef =
    useRef<THREE.ShaderMaterial>(null);

  const gravityMaterialRef =
    useRef<THREE.ShaderMaterial>(null);

  const rippleGroupRef =
    useRef<THREE.Group>(null);

  const filamentGroupRef =
    useRef<THREE.Group>(null);

  const gravityGroupRef =
    useRef<THREE.Group>(null);


  // ==========================================================
  // WORLD STRENGTH
  // ==========================================================

  /*
   * composition.ts が
   * Waveを出す量をすでに決めているので、
   * ここではもうgetWaveStrengthを掛けない。
   *
   * これで
   *
   * composition.ts
   * = World選択
   *
   * WaveWorld.tsx
   * = Wave内部の形態選択
   *
   * と役割を分離。
   */

  const waveStrength =
    clamp01(
      mix
    );


  // ==========================================================
  // RAW MORPHOLOGY
  // ==========================================================

  const rawOcean =
    clamp01(
      fluidity * 0.42 +
      spaciousness * 0.28 +
      quietness * 0.20 +
      fantasy * 0.10
    );


  const rawRipple =
    clamp01(
      quietness * 0.32 +
      fluidity * 0.28 +
      solitude * 0.20 +
      hope * 0.12 +
      fantasy * 0.08
    );


  const rawFilament =
    clamp01(
      fantasy * 0.32 +
      fluidity * 0.28 +
      hope * 0.16 +
      speed * 0.14 +
      chaos * 0.10
    );


  const rawGravity =
    clamp01(
      tension * 0.34 +
      darkness * 0.26 +
      chaos * 0.20 +
      spaciousness * 0.12 +
      fantasy * 0.08
    );


  // ==========================================================
  // ACTIVATION
  // ==========================================================

  const morphologyStrengths = [
    smoothstep(
      0.42,
      0.72,
      rawOcean
    ),

    smoothstep(
      0.44,
      0.74,
      rawRipple
    ),

    smoothstep(
      0.44,
      0.74,
      rawFilament
    ),

    smoothstep(
      0.48,
      0.78,
      rawGravity
    ),
  ];


  // ==========================================================
  // PRIMARY / SECONDARY MORPHOLOGY
  // ==========================================================

  const rankedMorphologies =
    morphologyStrengths
      .map(
        (
          strength,
          index
        ) => ({
          index,
          strength,
        })
      )
      .sort(
        (
          a,
          b
        ) =>
          b.strength -
          a.strength
      );


  const primary =
    rankedMorphologies[0];

  const secondary =
    rankedMorphologies[1];


  /*
   * 主役はしっかり表示。
   * 副役は最大0.30程度。
   * その他は0にする。
   */

  const visuals = [
    0,
    0,
    0,
    0,
  ];


  if (
    primary &&
    primary.strength >
    0.01
  ) {
    visuals[
      primary.index
    ] =
      clamp01(
        0.70 +
        primary.strength *
        0.30
      );
  }


  if (
    secondary &&
    secondary.strength >
    0.22
  ) {
    visuals[
      secondary.index
    ] =
      clamp01(
        secondary.strength *
        0.30
      );
  }


  const [
    oceanVisual,
    rippleVisual,
    filamentVisual,
    gravityVisual,
  ] =
    visuals;


  // ==========================================================
  // COMPOSITION
  // ==========================================================

  const subjectScale =
    0.92 +
    spaciousness * 0.28 -
    solitude * 0.12;


  const subjectX =
    (
      chaos -
      0.5
    ) *
    0.55;


  const subjectY =
    (
      hope -
      0.5
    ) *
    0.45;


  const subjectZ =
    (
      darkness -
      0.5
    ) *
    -0.35;


  // ==========================================================
  // OCEAN SHADER
  // ==========================================================

  const oceanShader =
    useMemo(
      () => ({

        uniforms: {
          uTime: {
            value: 0,
          },

          uFluidity: {
            value: 0.5,
          },

          uFantasy: {
            value: 0.5,
          },

          uChaos: {
            value: 0.5,
          },

          uSpeed: {
            value: 0.4,
          },

          uWarmth: {
            value: 0.5,
          },

          uHope: {
            value: 0.5,
          },

          uStrength: {
            value: 0,
          },
        },


        vertexShader: `
          uniform float uTime;
          uniform float uFluidity;
          uniform float uFantasy;
          uniform float uChaos;
          uniform float uSpeed;
          uniform float uStrength;

          varying vec2 vUv;
          varying float vWave;
          varying float vHeight;


          void main() {

            vUv = uv;

            vec3 pos =
              position;


            float t =
              uTime *
              (
                0.13 +
                uSpeed *
                0.55
              );


            float waveA =
              sin(
                pos.x *
                0.38 +
                pos.y *
                0.12 +
                t
              );


            float waveB =
              sin(
                pos.x *
                0.85 -
                pos.y *
                0.44 -
                t *
                0.72
              );


            float waveC =
              cos(
                pos.x *
                0.22 +
                pos.y *
                1.15 +
                t *
                0.42
              );


            /*
             * chaosで局所的に波長を壊す
             */

            float irregular =
              sin(
                pos.x *
                1.9 +
                sin(
                  pos.y *
                  0.7
                ) *
                2.0 +
                t *
                0.9
              );


            float total =
              waveA *
                0.48 +
              waveB *
                0.28 +
              waveC *
                0.16 +
              irregular *
                uChaos *
                0.14;


            float amplitude =
              (
                0.14 +
                uFluidity *
                0.72 +
                uFantasy *
                0.20
              ) *
              (
                0.25 +
                uStrength *
                0.75
              );


            pos.z +=
              total *
              amplitude;


            pos.y +=
              waveB *
              uFluidity *
              0.06;


            vWave =
              total;

            vHeight =
              pos.z;


            gl_Position =
              projectionMatrix *
              modelViewMatrix *
              vec4(
                pos,
                1.0
              );
          }
        `,


        fragmentShader: `
          uniform float uTime;
          uniform float uFluidity;
          uniform float uFantasy;
          uniform float uWarmth;
          uniform float uHope;
          uniform float uStrength;

          varying vec2 vUv;
          varying float vWave;
          varying float vHeight;


          void main() {

            float center =
              1.0 -
              abs(
                vUv.y -
                0.5
              ) *
              2.0;


            center =
              smoothstep(
                0.0,
                1.0,
                center
              );


            float flow =
              sin(
                vUv.x *
                18.0 +
                vUv.y *
                4.0 -
                uTime *
                (
                  0.24 +
                  uFluidity *
                  0.8
                ) +
                vWave *
                2.2
              ) *
              0.5 +
              0.5;


            vec3 blue =
              vec3(
                0.12,
                0.34,
                0.90
              );


            vec3 cyan =
              vec3(
                0.28,
                0.76,
                1.0
              );


            vec3 warm =
              vec3(
                1.0,
                0.48,
                0.20
              );


            vec3 color =
              mix(
                blue,
                cyan,
                uFantasy *
                0.48
              );


            color =
              mix(
                color,
                warm,
                uWarmth *
                0.35
              );


            color =
              mix(
                color,
                vec3(
                  1.0
                ),
                uHope *
                0.14
              );


            float alpha =
              (
                0.012 +
                center *
                0.085 +
                flow *
                0.018
              ) *
              uStrength;


            gl_FragColor =
              vec4(
                color *
                (
                  0.26 +
                  flow *
                  0.50 +
                  max(
                    vHeight,
                    0.0
                  ) *
                  0.10
                ),
                alpha
              );
          }
        `,
      }),
      []
    );


  // ==========================================================
  // RIPPLE SHADER
  //
  // 最大の変更点。
  //
  // 1つの中心から同心円
  // ↓
  // 3つの波源が干渉する
  // ==========================================================

  const rippleShader =
    useMemo(
      () => ({

        uniforms: {
          uTime: {
            value: 0,
          },

          uSpeed: {
            value: 0.4,
          },

          uFluidity: {
            value: 0.5,
          },

          uFantasy: {
            value: 0.5,
          },

          uChaos: {
            value: 0.5,
          },

          uWarmth: {
            value: 0.5,
          },

          uHope: {
            value: 0.5,
          },

          uStrength: {
            value: 0,
          },
        },


        vertexShader: `
          uniform float uTime;
          uniform float uSpeed;
          uniform float uFluidity;
          uniform float uChaos;
          uniform float uStrength;

          varying vec2 vUv;
          varying float vWave;


          void main() {

            vUv =
              uv;


            vec3 pos =
              position;


            float t =
              uTime *
              (
                0.08 +
                uSpeed *
                0.30
              );


            vec2 p =
              pos.xy;


            vec2 sourceA =
              vec2(
                -2.6,
                0.9
              );


            vec2 sourceB =
              vec2(
                2.2,
                -1.1
              );


            vec2 sourceC =
              vec2(
                0.5,
                2.4
              );


            float dA =
              length(
                p -
                sourceA
              );


            float dB =
              length(
                p -
                sourceB
              );


            float dC =
              length(
                p -
                sourceC
              );


            float waveA =
              sin(
                dA *
                2.4 -
                t *
                2.0
              );


            float waveB =
              sin(
                dB *
                2.9 -
                t *
                1.6 +
                1.7
              );


            float waveC =
              sin(
                dC *
                2.1 -
                t *
                2.4 +
                3.1
              );


            float interference =
              (
                waveA +
                waveB *
                0.75 +
                waveC *
                0.58
              ) /
              2.33;


            /*
             * 完全な円形を崩す
             */

            interference +=
              sin(
                p.x *
                0.75 +
                p.y *
                0.52 +
                t
              ) *
              uChaos *
              0.22;


            pos.z +=
              interference *
              (
                0.04 +
                uFluidity *
                0.18
              ) *
              uStrength;


            vWave =
              interference;


            gl_Position =
              projectionMatrix *
              modelViewMatrix *
              vec4(
                pos,
                1.0
              );
          }
        `,


        fragmentShader: `
          uniform float uTime;
          uniform float uFantasy;
          uniform float uChaos;
          uniform float uWarmth;
          uniform float uHope;
          uniform float uStrength;

          varying vec2 vUv;
          varying float vWave;


          void main() {

            vec2 p =
              (
                vUv -
                0.5
              ) *
              2.0;


            /*
             * 波源を3箇所にする
             */

            vec2 a =
              vec2(
                -0.42,
                0.10
              );


            vec2 b =
              vec2(
                0.34,
                -0.22
              );


            vec2 c =
              vec2(
                0.10,
                0.38
              );


            float dA =
              length(
                p -
                a
              );


            float dB =
              length(
                p -
                b
              );


            float dC =
              length(
                p -
                c
              );


            float waveA =
              sin(
                dA *
                34.0 -
                uTime *
                0.90
              );


            float waveB =
              sin(
                dB *
                29.0 -
                uTime *
                0.72 +
                1.8
              );


            float waveC =
              sin(
                dC *
                23.0 -
                uTime *
                1.05 +
                3.0
              );


            float interference =
              waveA *
                0.48 +
              waveB *
                0.34 +
              waveC *
                0.25;


            interference +=
              sin(
                p.x *
                15.0 +
                p.y *
                7.0 +
                uTime *
                0.18
              ) *
              uChaos *
              0.18;


            /*
             * 細い線だけ抽出
             */

            float lines =
              smoothstep(
                0.58,
                0.92,
                interference
              );


            /*
             * 画面全体ではなく
             * 局所的な領域へ
             */

            float maskA =
              1.0 -
              smoothstep(
                0.25,
                1.12,
                dA
              );


            float maskB =
              1.0 -
              smoothstep(
                0.18,
                1.05,
                dB
              );


            float maskC =
              1.0 -
              smoothstep(
                0.20,
                0.90,
                dC
              );


            float mask =
              max(
                maskA,
                max(
                  maskB *
                  0.75,
                  maskC *
                  0.58
                )
              );


            vec3 blue =
              vec3(
                0.24,
                0.48,
                1.0
              );


            vec3 cyan =
              vec3(
                0.44,
                0.82,
                1.0
              );


            vec3 violet =
              vec3(
                0.62,
                0.42,
                1.0
              );


            vec3 warm =
              vec3(
                1.0,
                0.50,
                0.24
              );


            vec3 color =
              mix(
                blue,
                cyan,
                uFantasy *
                0.34
              );


            color =
              mix(
                color,
                violet,
                uFantasy *
                0.16
              );


            color =
              mix(
                color,
                warm,
                uWarmth *
                0.25
              );


            color =
              mix(
                color,
                vec3(
                  1.0
                ),
                uHope *
                0.14
              );


            float alpha =
              lines *
              mask *
              uStrength *
              0.22;


            gl_FragColor =
              vec4(
                color *
                (
                  0.42 +
                  lines *
                  0.82
                ),
                alpha
              );
          }
        `,
      }),
      []
    );


  // ==========================================================
  // FILAMENT SHADER
  // ==========================================================

  const filamentShader =
    useMemo(
      () => ({

        uniforms: {
          uTime: {
            value: 0,
          },

          uSpeed: {
            value: 0.4,
          },

          uFluidity: {
            value: 0.5,
          },

          uFantasy: {
            value: 0.5,
          },

          uChaos: {
            value: 0.5,
          },

          uWarmth: {
            value: 0.5,
          },

          uHope: {
            value: 0.5,
          },

          uStrength: {
            value: 0,
          },
        },


        vertexShader: `
          uniform float uTime;
          uniform float uSpeed;
          uniform float uFluidity;
          uniform float uFantasy;
          uniform float uChaos;

          varying vec2 vUv;
          varying float vBend;


          void main() {

            vUv =
              uv;


            vec3 pos =
              position;


            float t =
              uTime *
              (
                0.10 +
                uSpeed *
                0.52
              );


            float bendA =
              sin(
                pos.x *
                0.48 +
                t
              );


            float bendB =
              sin(
                pos.x *
                1.30 -
                t *
                0.58 +
                1.8
              );


            float bendC =
              sin(
                pos.x *
                2.8 +
                t *
                0.33
              );


            float bend =
              bendA *
                0.52 +
              bendB *
                0.28 +
              bendC *
                uChaos *
                0.14;


            pos.y +=
              bend *
              (
                0.22 +
                uFluidity *
                0.65
              );


            pos.z +=
              cos(
                pos.x *
                0.38 +
                t
              ) *
              uFantasy *
              0.20;


            vBend =
              bend;


            gl_Position =
              projectionMatrix *
              modelViewMatrix *
              vec4(
                pos,
                1.0
              );
          }
        `,


        fragmentShader: `
          uniform float uTime;
          uniform float uFantasy;
          uniform float uWarmth;
          uniform float uHope;
          uniform float uStrength;

          varying vec2 vUv;
          varying float vBend;


          void main() {

            float distanceToLine =
              abs(
                vUv.y -
                0.5
              );


            float line =
              1.0 -
              smoothstep(
                0.015,
                0.30,
                distanceToLine
              );


            line =
              pow(
                line,
                2.2
              );


            float pulse =
              sin(
                vUv.x *
                18.0 -
                uTime *
                0.65 +
                vBend *
                2.0
              ) *
              0.5 +
              0.5;


            vec3 blue =
              vec3(
                0.24,
                0.56,
                1.0
              );


            vec3 violet =
              vec3(
                0.62,
                0.42,
                1.0
              );


            vec3 warm =
              vec3(
                1.0,
                0.58,
                0.28
              );


            vec3 color =
              mix(
                blue,
                violet,
                uFantasy *
                0.42
              );


            color =
              mix(
                color,
                warm,
                uWarmth *
                0.28
              );


            color =
              mix(
                color,
                vec3(
                  1.0
                ),
                uHope *
                0.15
              );


            float alpha =
              line *
              (
                0.22 +
                pulse *
                0.38
              ) *
              uStrength;


            gl_FragColor =
              vec4(
                color *
                (
                  0.42 +
                  pulse *
                  0.90
                ),
                alpha
              );
          }
        `,
      }),
      []
    );


  // ==========================================================
  // GRAVITY SHADER
  // ==========================================================

  const gravityShader =
    useMemo(
      () => ({

        uniforms: {
          uTime: {
            value: 0,
          },

          uChaos: {
            value: 0.5,
          },

          uTension: {
            value: 0.5,
          },

          uFantasy: {
            value: 0.5,
          },

          uDarkness: {
            value: 0.5,
          },

          uStrength: {
            value: 0,
          },
        },


        vertexShader: `
          uniform float uTime;
          uniform float uChaos;
          uniform float uTension;
          uniform float uStrength;

          varying vec2 vUv;
          varying float vDistortion;


          void main() {

            vUv =
              uv;


            vec3 pos =
              position;


            vec2 shifted =
              pos.xy;


            shifted.x +=
              sin(
                pos.y *
                0.42 +
                uTime *
                0.12
              ) *
              uChaos *
              0.8;


            shifted.y +=
              sin(
                pos.x *
                0.31 -
                uTime *
                0.08
              ) *
              uChaos *
              0.5;


            float radius =
              length(
                shifted
              );


            float distortion =
              sin(
                radius *
                (
                  1.35 +
                  uTension *
                  1.5
                ) -
                uTime *
                (
                  0.18 +
                  uTension *
                  0.40
                )
              );


            distortion +=
              sin(
                pos.x *
                0.9 +
                pos.y *
                1.5 +
                uTime *
                0.20
              ) *
              uChaos *
              0.25;


            pos.z +=
              distortion *
              (
                0.06 +
                uTension *
                0.20
              ) *
              uStrength;


            vDistortion =
              distortion;


            gl_Position =
              projectionMatrix *
              modelViewMatrix *
              vec4(
                pos,
                1.0
              );
          }
        `,


        fragmentShader: `
          uniform float uTime;
          uniform float uChaos;
          uniform float uTension;
          uniform float uFantasy;
          uniform float uDarkness;
          uniform float uStrength;

          varying vec2 vUv;
          varying float vDistortion;


          void main() {

            vec2 p =
              (
                vUv -
                0.5
              ) *
              2.0;


            /*
             * 中心そのものを動かす
             */

            vec2 center =
              vec2(
                sin(
                  uTime *
                  0.05
                ) *
                0.12,

                cos(
                  uTime *
                  0.04
                ) *
                0.08
              );


            vec2 warped =
              p -
              center;


            warped.x +=
              sin(
                warped.y *
                3.0 +
                uTime *
                0.14
              ) *
              uChaos *
              0.09;


            warped.y +=
              sin(
                warped.x *
                2.1 -
                uTime *
                0.10
              ) *
              uChaos *
              0.06;


            float r =
              length(
                warped
              );


            float angle =
              atan(
                warped.y,
                warped.x
              );


            /*
             * 周波数を一定にしない
             */

            float localFrequency =
              24.0 +
              sin(
                angle *
                3.0
              ) *
              5.0 +
              sin(
                angle *
                7.0 +
                uTime *
                0.12
              ) *
              uChaos *
              7.0;


            float field =
              sin(
                r *
                localFrequency -
                uTime *
                0.55 +
                vDistortion *
                4.0
              );


            field +=
              sin(
                r *
                13.0 +
                angle *
                4.0 +
                uTime *
                0.22
              ) *
              0.32;


            float lines =
              smoothstep(
                0.60,
                0.95,
                field
              );


            /*
             * 全画面をリングで埋めない
             */

            float inner =
              smoothstep(
                0.05,
                0.16,
                r
              );


            float outer =
              1.0 -
              smoothstep(
                0.38,
                1.05,
                r
              );


            /*
             * 一部を欠落させる
             */

            float broken =
              sin(
                angle *
                5.0 +
                r *
                8.0
              ) *
              0.5 +
              0.5;


            broken =
              mix(
                1.0,
                broken,
                0.22 +
                uChaos *
                0.38
              );


            vec3 deep =
              vec3(
                0.08,
                0.14,
                0.48
              );


            vec3 light =
              vec3(
                0.46,
                0.68,
                1.0
              );


            vec3 violet =
              vec3(
                0.55,
                0.38,
                0.90
              );


            vec3 color =
              mix(
                deep,
                light,
                uFantasy *
                0.60
              );


            color =
              mix(
                color,
                violet,
                uFantasy *
                0.22
              );


            color *=
              0.82 -
              uDarkness *
                0.22;


            float alpha =
              lines *
              inner *
              outer *
              broken *
              uStrength *
              0.18;


            gl_FragColor =
              vec4(
                color *
                (
                  0.46 +
                  lines *
                  0.80
                ),
                alpha
              );
          }
        `,
      }),
      []
    );


  // ==========================================================
  // UPDATE
  // ==========================================================

  useFrame(
    (
      state,
      delta
    ) => {

      const t =
        state.clock.elapsedTime;


      // ======================================================
      // ROOT
      // ======================================================

      if (
        rootRef.current
      ) {

        rootRef.current.position.x =
          subjectX +
          Math.sin(
            t *
            0.035
          ) *
          chaos *
          0.05;


        rootRef.current.position.y =
          subjectY +
          Math.sin(
            t *
            0.045
          ) *
          fluidity *
          0.05;


        rootRef.current.position.z =
          subjectZ;


        rootRef.current.scale.setScalar(
          subjectScale *
          (
            1 +
            Math.sin(
              t *
              0.045
            ) *
            0.008
          )
        );
      }


      // ======================================================
      // OCEAN
      // ======================================================

      if (
        oceanMaterialRef.current
      ) {

        const u =
          oceanMaterialRef.current
            .uniforms;


        u.uTime.value =
          t;

        u.uFluidity.value =
          fluidity;

        u.uFantasy.value =
          fantasy;

        u.uChaos.value =
          chaos;

        u.uSpeed.value =
          speed;

        u.uWarmth.value =
          warmth;

        u.uHope.value =
          hope;

        u.uStrength.value =
          waveStrength *
          oceanVisual;
      }


      // ======================================================
      // RIPPLE
      // ======================================================

      if (
        rippleMaterialRef.current
      ) {

        const u =
          rippleMaterialRef.current
            .uniforms;


        u.uTime.value =
          t;

        u.uSpeed.value =
          speed;

        u.uFluidity.value =
          fluidity;

        u.uFantasy.value =
          fantasy;

        u.uChaos.value =
          chaos;

        u.uWarmth.value =
          warmth;

        u.uHope.value =
          hope;

        u.uStrength.value =
          waveStrength *
          rippleVisual;
      }


      // ======================================================
      // FILAMENT
      // ======================================================

      if (
        filamentMaterialRef.current
      ) {

        const u =
          filamentMaterialRef.current
            .uniforms;


        u.uTime.value =
          t;

        u.uSpeed.value =
          speed;

        u.uFluidity.value =
          fluidity;

        u.uFantasy.value =
          fantasy;

        u.uChaos.value =
          chaos;

        u.uWarmth.value =
          warmth;

        u.uHope.value =
          hope;

        u.uStrength.value =
          waveStrength *
          filamentVisual;
      }


      // ======================================================
      // GRAVITY
      // ======================================================

      if (
        gravityMaterialRef.current
      ) {

        const u =
          gravityMaterialRef.current
            .uniforms;


        u.uTime.value =
          t;

        u.uChaos.value =
          chaos;

        u.uTension.value =
          tension;

        u.uFantasy.value =
          fantasy;

        u.uDarkness.value =
          darkness;

        u.uStrength.value =
          waveStrength *
          gravityVisual;
      }


      // ======================================================
      // GROUP MOTION
      // ======================================================

      if (
        rippleGroupRef.current
      ) {

        rippleGroupRef.current.rotation.z +=
          delta *
          (
            0.0008 +
            speed *
            0.002
          );


        rippleGroupRef.current.rotation.x =
          -0.42 +
          Math.sin(
            t *
            0.035
          ) *
          0.035;
      }


      if (
        filamentGroupRef.current
      ) {

        filamentGroupRef.current.rotation.z =
          Math.sin(
            t *
            0.04
          ) *
          (
            0.025 +
            chaos *
            0.04
          );


        filamentGroupRef.current.position.y =
          0.35 +
          Math.sin(
            t *
            0.06
          ) *
          0.10;
      }


      if (
        gravityGroupRef.current
      ) {

        gravityGroupRef.current.rotation.z +=
          delta *
          (
            0.0005 +
            tension *
            0.0015
          );


        gravityGroupRef.current.scale.setScalar(
          1 +
          Math.sin(
            t *
            (
              0.06 +
              tension *
              0.10
            )
          ) *
          0.012
        );
      }
    }
  );


  // ==========================================================
  // HIDE
  // ==========================================================

  if (
    waveStrength <=
    0.01
  ) {
    return null;
  }


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <group
      ref={rootRef}
    >

      {/* OCEAN */}

      <mesh
        rotation={[
          -0.34,
          0,
          -0.04,
        ]}
        position={[
          0,
          -0.25,
          -1.1,
        ]}
      >

        <planeGeometry
          args={[
            15 +
            spaciousness *
            9,

            5 +
            spaciousness *
            3,

            150,
            50,
          ]}
        />


        <shaderMaterial
          ref={
            oceanMaterialRef
          }
          args={[
            oceanShader,
          ]}
          transparent
          side={
            THREE.DoubleSide
          }
          depthWrite={false}
          blending={
            THREE.AdditiveBlending
          }
          toneMapped={false}
        />

      </mesh>


      {/* RIPPLE */}

      <group
        ref={
          rippleGroupRef
        }
        position={[
          0,
          0.05,
          -0.10,
        ]}
      >

        <mesh
          rotation={[
            -0.18,
            0.08,
            0,
          ]}
        >

          <planeGeometry
            args={[
              11 +
              spaciousness *
              7,

              8 +
              spaciousness *
              5,

              115,
              90,
            ]}
          />


          <shaderMaterial
            ref={
              rippleMaterialRef
            }
            args={[
              rippleShader,
            ]}
            transparent
            side={
              THREE.DoubleSide
            }
            depthWrite={false}
            blending={
              THREE.AdditiveBlending
            }
            toneMapped={false}
          />

        </mesh>

      </group>


      {/* FILAMENT */}

      <group
        ref={
          filamentGroupRef
        }
      >

        <mesh
          rotation={[
            0.03,
            0.04,
            0.08,
          ]}
        >

          <planeGeometry
            args={[
              13 +
              spaciousness *
              6,

              1.1,

              180,
              8,
            ]}
          />


          <shaderMaterial
            ref={
              filamentMaterialRef
            }
            args={[
              filamentShader,
            ]}
            transparent
            side={
              THREE.DoubleSide
            }
            depthWrite={false}
            blending={
              THREE.AdditiveBlending
            }
            toneMapped={false}
          />

        </mesh>

      </group>


      {/* GRAVITY */}

      <group
        ref={
          gravityGroupRef
        }
        position={[
          0,
          0,
          -0.75,
        ]}
      >

        <mesh
          rotation={[
            -0.07,
            0.14,
            0.04,
          ]}
        >

          <planeGeometry
            args={[
              12 +
              spaciousness *
              7,

              10 +
              spaciousness *
              6,

              110,
              100,
            ]}
          />


          <shaderMaterial
            ref={
              gravityMaterialRef
            }
            args={[
              gravityShader,
            ]}
            transparent
            side={
              THREE.DoubleSide
            }
            depthWrite={false}
            blending={
              THREE.AdditiveBlending
            }
            toneMapped={false}
          />

        </mesh>

      </group>

    </group>
  );
}