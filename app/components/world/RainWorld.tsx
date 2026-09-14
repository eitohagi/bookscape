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

import {
  getRainStrength,
} from "./strengths";

import {
  createSeededRandom,
} from "./random";


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
// RAIN WORLD
// ============================================================

export default function RainWorld({
  mix = 1,

  speed = 0.5,
  chaos = 0.5,
  tension = 0.5,
  fantasy = 0.5,
  warmth = 0.5,
  spaciousness = 0.5,
  hope = 0.5,

  quietness = 0.5,
  darkness = 0.5,
  solitude = 0.5,
  fluidity = 0.5,

}: World3DProps) {

  // ==========================================================
  // REFS
  // ==========================================================

  const rootRef =
    useRef<THREE.Group>(
      null
    );


  const fallingRef =
    useRef<THREE.Points>(
      null
    );


  const meteorRef =
    useRef<THREE.Points>(
      null
    );


  const risingRef =
    useRef<THREE.Points>(
      null
    );


  const dataRef =
    useRef<THREE.Points>(
      null
    );


  const fallingMaterialRef =
    useRef<THREE.ShaderMaterial>(
      null
    );


  const meteorMaterialRef =
    useRef<THREE.ShaderMaterial>(
      null
    );


  const risingMaterialRef =
    useRef<THREE.ShaderMaterial>(
      null
    );


  const dataMaterialRef =
    useRef<THREE.ShaderMaterial>(
      null
    );


  // ==========================================================
  // BASE STRENGTH
  // ==========================================================

  const rainStrength =
    clamp01(
      getRainStrength(
        speed,
        chaos,
        tension
      ) *
      mix
    );


  // ==========================================================
  // MORPHOLOGY SCORES
  // ==========================================================

  /*
   * FALLING LIGHT
   *
   * 静けさのある光の雨
   */

  const rawFalling =
    clamp01(
      quietness * 0.30 +
      fluidity * 0.24 +
      fantasy * 0.18 +
      spaciousness * 0.14 +
      hope * 0.14
    );


  /*
   * METEOR SHOWER
   *
   * 高速・緊張・混沌
   */

  const rawMeteor =
    clamp01(
      speed * 0.36 +
      tension * 0.28 +
      chaos * 0.24 +
      fantasy * 0.12
    );


  /*
   * RISING DUST
   *
   * 希望・幻想・静寂
   */

  const rawRising =
    clamp01(
      hope * 0.34 +
      fantasy * 0.26 +
      quietness * 0.18 +
      fluidity * 0.14 +
      spaciousness * 0.08
    );


  /*
   * DATA STREAM
   *
   * 速度・秩序・情報流
   */

  const rawData =
    clamp01(
      speed * 0.28 +
      tension * 0.22 +
      fantasy * 0.18 +
      spaciousness * 0.16 +
      (
        1 -
        chaos
      ) * 0.16
    );


  // ==========================================================
  // ACTIVATION
  // ==========================================================

  const fallingStrength =
    smoothstep(
      0.43,
      0.72,
      rawFalling
    );


  const meteorStrength =
    smoothstep(
      0.49,
      0.77,
      rawMeteor
    );


  const risingStrength =
    smoothstep(
      0.45,
      0.74,
      rawRising
    );


  const dataStrength =
    smoothstep(
      0.47,
      0.75,
      rawData
    );


  // ==========================================================
  // PRIMARY MORPHOLOGY
  // ==========================================================

  const morphologyMax =
    Math.max(
      fallingStrength,
      meteorStrength,
      risingStrength,
      dataStrength
    );


  const boost =
    0.18;


  const fallingVisual =
    clamp01(
      fallingStrength +
      (
        fallingStrength ===
        morphologyMax
          ? boost
          : 0
      )
    );


  const meteorVisual =
    clamp01(
      meteorStrength +
      (
        meteorStrength ===
        morphologyMax
          ? boost
          : 0
      )
    );


  const risingVisual =
    clamp01(
      risingStrength +
      (
        risingStrength ===
        morphologyMax
          ? boost
          : 0
      )
    );


  const dataVisual =
    clamp01(
      dataStrength +
      (
        dataStrength ===
        morphologyMax
          ? boost
          : 0
      )
    );


  // ==========================================================
  // COMPOSITION
  // ==========================================================

  const subjectScale =
    0.88 +
    spaciousness * 0.34 -
    solitude * 0.10;


  const subjectX =
    (
      chaos -
      0.5
    ) *
    0.8;


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
    -0.55;


  // ==========================================================
  // PARTICLE DATA
  // ==========================================================

  const geometryData =
    useMemo(
      () => {

        const random =
          createSeededRandom(
            61931
          );


        const count =
          3600;


        const positions =
          new Float32Array(
            count * 3
          );


        const randoms =
          new Float32Array(
            count
          );


        const phases =
          new Float32Array(
            count
          );


        const speeds =
          new Float32Array(
            count
          );


        for (
          let i = 0;
          i < count;
          i++
        ) {

          const i3 =
            i * 3;


          positions[
            i3
          ] =
            (
              random() -
              0.5
            ) *
            20;


          positions[
            i3 + 1
          ] =
            (
              random() -
              0.5
            ) *
            18;


          positions[
            i3 + 2
          ] =
            (
              random() -
              0.5
            ) *
            18;


          randoms[
            i
          ] =
            random();


          phases[
            i
          ] =
            random() *
            Math.PI *
            2;


          speeds[
            i
          ] =
            0.35 +
            random() *
            1.55;
        }


        return {
          positions,
          randoms,
          phases,
          speeds,
        };
      },
      []
    );


  // ==========================================================
  // COMMON VERTEX HEADER
  // ==========================================================

  const commonAttributes = `
    attribute float aRandom;
    attribute float aPhase;
    attribute float aSpeed;

    varying float vRandom;
    varying float vSpeed;
    varying float vDepth;
  `;


  // ==========================================================
  // FALLING LIGHT SHADER
  // ==========================================================

  const fallingShader =
    useMemo(
      () => ({

        uniforms: {

          uTime: {
            value: 0,
          },

          uSpeed: {
            value: speed,
          },

          uChaos: {
            value: chaos,
          },

          uFantasy: {
            value: fantasy,
          },

          uWarmth: {
            value: warmth,
          },

          uHope: {
            value: hope,
          },

          uSpaciousness: {
            value: spaciousness,
          },

          uStrength: {
            value: 0,
          },

        },


        vertexShader: `
          uniform float uTime;
          uniform float uSpeed;
          uniform float uChaos;
          uniform float uFantasy;
          uniform float uSpaciousness;

          ${commonAttributes}


          void main() {

            vec3 pos =
              position;


            float t =
              uTime *
              (
                0.16 +
                uSpeed *
                  1.15
              ) *
              aSpeed;


            float rangeY =
              18.0;


            pos.y -=
              t *
              (
                0.65 +
                uSpeed *
                  1.7
              );


            pos.y =
              mod(
                pos.y +
                rangeY *
                  0.5,
                rangeY
              ) -
              rangeY *
                0.5;


            /*
             * soft wind
             */

            pos.x +=
              sin(
                uTime *
                  0.25 +
                aPhase
              ) *
              (
                0.08 +
                uChaos *
                  0.55
              );


            /*
             * slight fantasy curve
             */

            pos.z +=
              sin(
                pos.y *
                  0.25 +
                uTime *
                  0.18 +
                aPhase
              ) *
              uFantasy *
              0.18;


            pos.xz *=
              0.72 +
              uSpaciousness *
                0.78;


            vec4 mvPosition =
              modelViewMatrix *
              vec4(
                pos,
                1.0
              );


            vRandom =
              aRandom;


            vSpeed =
              aSpeed;


            vDepth =
              clamp(
                -mvPosition.z /
                  22.0,
                0.0,
                1.0
              );


            float size =
              1.2 +
              uSpeed *
                1.1 +
              aRandom *
                1.3;


            gl_PointSize =
              size *
              (
                67.0 /
                max(
                  1.0,
                  -mvPosition.z
                )
              );


            gl_Position =
              projectionMatrix *
              mvPosition;
          }
        `,


        fragmentShader: `
          uniform float uSpeed;
          uniform float uFantasy;
          uniform float uWarmth;
          uniform float uHope;
          uniform float uStrength;

          varying float vRandom;
          varying float vSpeed;
          varying float vDepth;


          void main() {

            vec2 p =
              gl_PointCoord -
              vec2(
                0.5
              );


            /*
             * vertical elongated particle
             */

            p.y *=
              0.40 +
              uSpeed *
                0.28;


            float d =
              length(
                p
              );


            if (
              d >
              0.5
            ) {
              discard;
            }


            float core =
              1.0 -
              smoothstep(
                0.0,
                0.16,
                d
              );


            float glow =
              1.0 -
              smoothstep(
                0.04,
                0.5,
                d
              );


            vec3 cold =
              vec3(
                0.24,
                0.62,
                1.0
              );


            vec3 violet =
              vec3(
                0.60,
                0.40,
                1.0
              );


            vec3 warm =
              vec3(
                1.0,
                0.56,
                0.30
              );


            vec3 color =
              mix(
                cold,
                violet,
                uFantasy *
                  0.34
              );


            color =
              mix(
                color,
                warm,
                uWarmth *
                  0.42
              );


            color =
              mix(
                color,
                vec3(
                  1.0
                ),
                uHope *
                  0.20
              );


            float alpha =
              (
                core *
                  0.50 +
                glow *
                  0.22
              ) *
              uStrength;


            alpha *=
              0.62 +
              (
                1.0 -
                vDepth
              ) *
                0.38;


            gl_FragColor =
              vec4(
                color *
                  (
                    0.38 +
                    core *
                      0.72
                  ),
                alpha
              );
          }
        `,

      }),
      [commonAttributes]
    );


  // ==========================================================
  // METEOR SHADER
  // ==========================================================

  const meteorShader =
    useMemo(
      () => ({

        uniforms: {

          uTime: {
            value: 0,
          },

          uSpeed: {
            value: speed,
          },

          uChaos: {
            value: chaos,
          },

          uTension: {
            value: tension,
          },

          uFantasy: {
            value: fantasy,
          },

          uWarmth: {
            value: warmth,
          },

          uStrength: {
            value: 0,
          },

        },


        vertexShader: `
          uniform float uTime;
          uniform float uSpeed;
          uniform float uChaos;
          uniform float uTension;

          ${commonAttributes}


          void main() {

            vec3 pos =
              position;


            float t =
              uTime *
              (
                0.38 +
                uSpeed *
                  2.3
              ) *
              aSpeed;


            float range =
              20.0;


            /*
             * diagonal meteor
             */

            pos.y -=
              t *
              (
                1.4 +
                uSpeed *
                  3.8
              );


            pos.x +=
              t *
              (
                0.38 +
                uChaos *
                  0.85
              );


            pos.z -=
              t *
              0.18;


            pos.y =
              mod(
                pos.y +
                range *
                  0.5,
                range
              ) -
              range *
                0.5;


            pos.x =
              mod(
                pos.x +
                range *
                  0.5,
                range
              ) -
              range *
                0.5;


            pos.x +=
              sin(
                uTime *
                  (
                    0.8 +
                    uTension
                  ) +
                aPhase
              ) *
              uChaos *
              0.20;


            vec4 mvPosition =
              modelViewMatrix *
              vec4(
                pos,
                1.0
              );


            vRandom =
              aRandom;


            vSpeed =
              aSpeed;


            vDepth =
              clamp(
                -mvPosition.z /
                  22.0,
                0.0,
                1.0
              );


            gl_PointSize =
              (
                2.0 +
                uSpeed *
                  3.8 +
                uTension *
                  1.5
              ) *
              (
                0.55 +
                aRandom *
                  0.9
              ) *
              (
                72.0 /
                max(
                  1.0,
                  -mvPosition.z
                )
              );


            gl_Position =
              projectionMatrix *
              mvPosition;
          }
        `,


        fragmentShader: `
          uniform float uSpeed;
          uniform float uTension;
          uniform float uFantasy;
          uniform float uWarmth;
          uniform float uStrength;

          varying float vRandom;
          varying float vSpeed;
          varying float vDepth;


          void main() {

            vec2 p =
              gl_PointCoord -
              vec2(
                0.5
              );


            /*
             * long streak
             */

            p.y *=
              0.13 +
              uSpeed *
                0.08;


            float d =
              length(
                p
              );


            if (
              d >
              0.5
            ) {
              discard;
            }


            float core =
              1.0 -
              smoothstep(
                0.0,
                0.12,
                d
              );


            float glow =
              1.0 -
              smoothstep(
                0.02,
                0.5,
                d
              );


            vec3 blue =
              vec3(
                0.34,
                0.68,
                1.0
              );


            vec3 violet =
              vec3(
                0.70,
                0.40,
                1.0
              );


            vec3 orange =
              vec3(
                1.0,
                0.48,
                0.20
              );


            vec3 color =
              mix(
                blue,
                violet,
                uFantasy *
                  0.30
              );


            color =
              mix(
                color,
                orange,
                uWarmth *
                  0.55
              );


            float flash =
              smoothstep(
                0.80,
                1.0,
                vRandom
              ) *
              uTension;


            float brightness =
              0.45 +
              core *
                0.85 +
              flash *
                0.65;


            float alpha =
              (
                core *
                  0.72 +
                glow *
                  0.28
              ) *
              uStrength;


            alpha *=
              0.65 +
              (
                1.0 -
                vDepth
              ) *
                0.35;


            gl_FragColor =
              vec4(
                color *
                  brightness,
                alpha
              );
          }
        `,

      }),
      [commonAttributes]
    );


  // ==========================================================
  // RISING DUST SHADER
  // ==========================================================

  const risingShader =
    useMemo(
      () => ({

        uniforms: {

          uTime: {
            value: 0,
          },

          uSpeed: {
            value: speed,
          },

          uFluidity: {
            value: fluidity,
          },

          uFantasy: {
            value: fantasy,
          },

          uChaos: {
            value: chaos,
          },

          uHope: {
            value: hope,
          },

          uWarmth: {
            value: warmth,
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

          ${commonAttributes}


          void main() {

            vec3 pos =
              position;


            float t =
              uTime *
              (
                0.10 +
                uSpeed *
                  0.45
              ) *
              aSpeed;


            float range =
              17.0;


            pos.y +=
              t *
              (
                0.40 +
                uFluidity *
                  1.0
              );


            pos.y =
              mod(
                pos.y +
                range *
                  0.5,
                range
              ) -
              range *
                0.5;


            /*
             * floating spiral
             */

            float angle =
              pos.y *
                0.12 +
              uTime *
                0.12 +
              aPhase;


            pos.x +=
              cos(
                angle
              ) *
              (
                0.10 +
                uFantasy *
                  0.32
              );


            pos.z +=
              sin(
                angle
              ) *
              (
                0.10 +
                uFantasy *
                  0.32
              );


            pos.x +=
              sin(
                uTime *
                  0.25 +
                aPhase
              ) *
              uChaos *
              0.16;


            vec4 mvPosition =
              modelViewMatrix *
              vec4(
                pos,
                1.0
              );


            vRandom =
              aRandom;


            vSpeed =
              aSpeed;


            vDepth =
              clamp(
                -mvPosition.z /
                  22.0,
                0.0,
                1.0
              );


            gl_PointSize =
              (
                0.9 +
                aRandom *
                  2.0 +
                uFantasy *
                  0.8
              ) *
              (
                72.0 /
                max(
                  1.0,
                  -mvPosition.z
                )
              );


            gl_Position =
              projectionMatrix *
              mvPosition;
          }
        `,


        fragmentShader: `
          uniform float uFantasy;
          uniform float uHope;
          uniform float uWarmth;
          uniform float uStrength;

          varying float vRandom;
          varying float vSpeed;
          varying float vDepth;


          void main() {

            vec2 p =
              gl_PointCoord -
              vec2(
                0.5
              );


            float d =
              length(
                p
              );


            if (
              d >
              0.5
            ) {
              discard;
            }


            float glow =
              1.0 -
              smoothstep(
                0.02,
                0.5,
                d
              );


            vec3 cyan =
              vec3(
                0.30,
                0.80,
                1.0
              );


            vec3 violet =
              vec3(
                0.66,
                0.46,
                1.0
              );


            vec3 warm =
              vec3(
                1.0,
                0.68,
                0.34
              );


            vec3 color =
              mix(
                cyan,
                violet,
                uFantasy *
                  0.48
              );


            color =
              mix(
                color,
                warm,
                uWarmth *
                  0.32
              );


            color =
              mix(
                color,
                vec3(
                  1.0
                ),
                uHope *
                  0.34
              );


            float rare =
              smoothstep(
                0.90,
                1.0,
                vRandom
              );


            float alpha =
              glow *
              (
                0.10 +
                rare *
                  0.28
              ) *
              uStrength;


            alpha *=
              0.65 +
              (
                1.0 -
                vDepth
              ) *
                0.35;


            gl_FragColor =
              vec4(
                color *
                  (
                    0.42 +
                    rare *
                      0.9
                  ),
                alpha
              );
          }
        `,

      }),
      [commonAttributes]
    );


  // ==========================================================
  // DATA STREAM SHADER
  // ==========================================================

  const dataShader =
    useMemo(
      () => ({

        uniforms: {

          uTime: {
            value: 0,
          },

          uSpeed: {
            value: speed,
          },

          uChaos: {
            value: chaos,
          },

          uTension: {
            value: tension,
          },

          uFantasy: {
            value: fantasy,
          },

          uHope: {
            value: hope,
          },

          uStrength: {
            value: 0,
          },

        },


        vertexShader: `
          uniform float uTime;
          uniform float uSpeed;
          uniform float uChaos;
          uniform float uTension;

          ${commonAttributes}


          void main() {

            vec3 pos =
              position;


            /*
             * quantized x position
             *
             * 粒子を縦の列に寄せる
             */

            float column =
              floor(
                pos.x *
                  0.55
              ) /
              0.55;


            pos.x =
              mix(
                pos.x,
                column,
                0.72
              );


            float t =
              uTime *
              (
                0.22 +
                uSpeed *
                  1.6
              ) *
              aSpeed;


            float range =
              18.0;


            pos.y -=
              t *
              (
                0.8 +
                uSpeed *
                  2.1
              );


            pos.y =
              mod(
                pos.y +
                range *
                  0.5,
                range
              ) -
              range *
                0.5;


            /*
             * mostly ordered,
             * chaos breaks columns
             */

            pos.x +=
              sin(
                pos.y *
                  0.9 +
                aPhase
              ) *
              uChaos *
              0.15;


            vec4 mvPosition =
              modelViewMatrix *
              vec4(
                pos,
                1.0
              );


            vRandom =
              aRandom;


            vSpeed =
              aSpeed;


            vDepth =
              clamp(
                -mvPosition.z /
                  22.0,
                0.0,
                1.0
              );


            gl_PointSize =
              (
                1.0 +
                uTension *
                  1.0 +
                aRandom *
                  1.2
              ) *
              (
                67.0 /
                max(
                  1.0,
                  -mvPosition.z
                )
              );


            gl_Position =
              projectionMatrix *
              mvPosition;
          }
        `,


        fragmentShader: `
          uniform float uFantasy;
          uniform float uHope;
          uniform float uStrength;

          varying float vRandom;
          varying float vSpeed;
          varying float vDepth;


          void main() {

            vec2 p =
              gl_PointCoord -
              vec2(
                0.5
              );


            p.y *=
              0.42;


            float d =
              length(
                p
              );


            if (
              d >
              0.5
            ) {
              discard;
            }


            float glow =
              1.0 -
              smoothstep(
                0.02,
                0.5,
                d
              );


            vec3 blue =
              vec3(
                0.18,
                0.56,
                1.0
              );


            vec3 cyan =
              vec3(
                0.20,
                0.92,
                1.0
              );


            vec3 color =
              mix(
                blue,
                cyan,
                uFantasy *
                  0.42 +
                uHope *
                  0.16
              );


            float bit =
              step(
                0.50,
                vRandom
              );


            float brightness =
              mix(
                0.40,
                1.0,
                bit
              );


            float alpha =
              glow *
              (
                0.10 +
                bit *
                  0.26
              ) *
              uStrength;


            alpha *=
              0.68 +
              (
                1.0 -
                vDepth
              ) *
                0.32;


            gl_FragColor =
              vec4(
                color *
                  brightness,
                alpha
              );
          }
        `,

      }),
      [commonAttributes]
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
          subjectX;


        rootRef.current.position.y =
          subjectY;


        rootRef.current.position.z =
          subjectZ;


        rootRef.current.scale.setScalar(
          subjectScale
        );


        rootRef.current.rotation.z =
          (
            chaos -
            0.5
          ) *
          0.12;
      }


      // ======================================================
      // FALLING
      // ======================================================

      if (
        fallingMaterialRef.current
      ) {

        const u =
          fallingMaterialRef.current
            .uniforms;


        u.uTime.value =
          t;


        u.uSpeed.value =
          speed;


        u.uChaos.value =
          chaos;


        u.uFantasy.value =
          fantasy;


        u.uWarmth.value =
          warmth;


        u.uHope.value =
          hope;


        u.uSpaciousness.value =
          spaciousness;


        u.uStrength.value =
          rainStrength *
          fallingVisual;
      }


      // ======================================================
      // METEOR
      // ======================================================

      if (
        meteorMaterialRef.current
      ) {

        const u =
          meteorMaterialRef.current
            .uniforms;


        u.uTime.value =
          t;


        u.uSpeed.value =
          speed;


        u.uChaos.value =
          chaos;


        u.uTension.value =
          tension;


        u.uFantasy.value =
          fantasy;


        u.uWarmth.value =
          warmth;


        u.uStrength.value =
          rainStrength *
          meteorVisual;
      }


      // ======================================================
      // RISING
      // ======================================================

      if (
        risingMaterialRef.current
      ) {

        const u =
          risingMaterialRef.current
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


        u.uHope.value =
          hope;


        u.uWarmth.value =
          warmth;


        u.uStrength.value =
          rainStrength *
          risingVisual;
      }


      // ======================================================
      // DATA
      // ======================================================

      if (
        dataMaterialRef.current
      ) {

        const u =
          dataMaterialRef.current
            .uniforms;


        u.uTime.value =
          t;


        u.uSpeed.value =
          speed;


        u.uChaos.value =
          chaos;


        u.uTension.value =
          tension;


        u.uFantasy.value =
          fantasy;


        u.uHope.value =
          hope;


        u.uStrength.value =
          rainStrength *
          dataVisual;
      }


      // ======================================================
      // EXTRA MOTION
      // ======================================================

      if (
        fallingRef.current
      ) {

        fallingRef.current.rotation.y =
          Math.sin(
            t *
              0.035
          ) *
          chaos *
          0.08;
      }


      if (
        meteorRef.current
      ) {

        meteorRef.current.rotation.z =
          -0.32 -
          chaos *
            0.18;


        meteorRef.current.rotation.y =
          Math.sin(
            t *
              0.05
          ) *
          0.06;
      }


      if (
        risingRef.current
      ) {

        risingRef.current.rotation.y +=
          delta *
          (
            0.001 +
            fluidity *
              0.004
          );
      }


      if (
        dataRef.current
      ) {

        dataRef.current.rotation.y =
          Math.sin(
            t *
              0.025
          ) *
          0.05;
      }
    }
  );


  // ==========================================================
  // HIDE
  // ==========================================================

  if (
    rainStrength <=
    0.015
  ) {
    return null;
  }


  // ==========================================================
  // COMMON GEOMETRY
  // ==========================================================

  const particleGeometry =
    (
      <>
        <bufferGeometry>

          <bufferAttribute
            attach="attributes-position"
            args={[
              geometryData.positions,
              3,
            ]}
          />


          <bufferAttribute
            attach="attributes-aRandom"
            args={[
              geometryData.randoms,
              1,
            ]}
          />


          <bufferAttribute
            attach="attributes-aPhase"
            args={[
              geometryData.phases,
              1,
            ]}
          />


          <bufferAttribute
            attach="attributes-aSpeed"
            args={[
              geometryData.speeds,
              1,
            ]}
          />

        </bufferGeometry>
      </>
    );


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <group
      ref={rootRef}
    >

      {/* ===================================================== */}
      {/* FALLING LIGHT                                         */}
      {/* ===================================================== */}

      <points
        ref={fallingRef}
        frustumCulled={false}
      >

        {particleGeometry}


        <shaderMaterial
          ref={
            fallingMaterialRef
          }
          args={[
            fallingShader,
          ]}
          transparent
          depthWrite={false}
          blending={
            THREE.AdditiveBlending
          }
          toneMapped={false}
        />

      </points>


      {/* ===================================================== */}
      {/* METEOR SHOWER                                         */}
      {/* ===================================================== */}

      <points
        ref={meteorRef}
        frustumCulled={false}
      >

        {particleGeometry}


        <shaderMaterial
          ref={
            meteorMaterialRef
          }
          args={[
            meteorShader,
          ]}
          transparent
          depthWrite={false}
          blending={
            THREE.AdditiveBlending
          }
          toneMapped={false}
        />

      </points>


      {/* ===================================================== */}
      {/* RISING DUST                                           */}
      {/* ===================================================== */}

      <points
        ref={risingRef}
        frustumCulled={false}
      >

        {particleGeometry}


        <shaderMaterial
          ref={
            risingMaterialRef
          }
          args={[
            risingShader,
          ]}
          transparent
          depthWrite={false}
          blending={
            THREE.AdditiveBlending
          }
          toneMapped={false}
        />

      </points>


      {/* ===================================================== */}
      {/* DATA STREAM                                           */}
      {/* ===================================================== */}

      <points
        ref={dataRef}
        frustumCulled={false}
      >

        {particleGeometry}


        <shaderMaterial
          ref={
            dataMaterialRef
          }
          args={[
            dataShader,
          ]}
          transparent
          depthWrite={false}
          blending={
            THREE.AdditiveBlending
          }
          toneMapped={false}
        />

      </points>

    </group>
  );
}