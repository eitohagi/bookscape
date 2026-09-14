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
  getOrganismStrength,
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
// ORGANISM WORLD
// ============================================================

export default function OrganismWorld({
  mix = 1,

  nature = 0.5,
  fluidity = 0.5,
  fantasy = 0.5,

  warmth = 0.5,
  hope = 0.5,

  speed = 0.4,
  spaciousness = 0.5,
  chaos = 0.5,

  quietness = 0.5,
  darkness = 0.5,
  solitude = 0.5,
  tension = 0.5,

}: World3DProps) {

  // ==========================================================
  // REFS
  // ==========================================================

  const rootRef =
    useRef<THREE.Group>(
      null
    );


  const branchRef =
    useRef<THREE.LineSegments>(
      null
    );


  const branchMaterialRef =
    useRef<THREE.ShaderMaterial>(
      null
    );


  const neuronRef =
    useRef<THREE.Points>(
      null
    );


  const neuronMaterialRef =
    useRef<THREE.ShaderMaterial>(
      null
    );


  const myceliumRef =
    useRef<THREE.LineSegments>(
      null
    );


  const myceliumMaterialRef =
    useRef<THREE.ShaderMaterial>(
      null
    );


  const coreRef =
    useRef<THREE.Group>(
      null
    );


  // ==========================================================
  // BASE STRENGTH
  // ==========================================================

  const organismStrength =
    clamp01(
      getOrganismStrength(
        nature,
        fluidity,
        fantasy
      ) *
      mix
    );


  // ==========================================================
  // MORPHOLOGY SCORES
  // ==========================================================

  /*
   * Branch
   * 植物 / 木 / 根
   */

  const rawBranch =
    clamp01(
      nature * 0.48 +
      hope * 0.18 +
      fluidity * 0.16 +
      quietness * 0.12 +
      fantasy * 0.06
    );


  /*
   * Neuron
   * 神経 / 電気 / 思考
   */

  const rawNeuron =
    clamp01(
      fantasy * 0.30 +
      chaos * 0.26 +
      speed * 0.20 +
      tension * 0.14 +
      nature * 0.10
    );


  /*
   * Mycelium
   * 菌糸 / 地下ネットワーク
   */

  const rawMycelium =
    clamp01(
      nature * 0.32 +
      fluidity * 0.24 +
      darkness * 0.18 +
      quietness * 0.14 +
      solitude * 0.12
    );


  /*
   * Core
   * 心臓 / 細胞核 / 胚
   */

  const rawCore =
    clamp01(
      tension * 0.28 +
      darkness * 0.24 +
      hope * 0.18 +
      fantasy * 0.16 +
      solitude * 0.14
    );


  // ==========================================================
  // ACTIVATION
  // ==========================================================

  const branchStrength =
    smoothstep(
      0.44,
      0.73,
      rawBranch
    );


  const neuronStrength =
    smoothstep(
      0.48,
      0.76,
      rawNeuron
    );


  const myceliumStrength =
    smoothstep(
      0.46,
      0.74,
      rawMycelium
    );


  const coreStrength =
    smoothstep(
      0.50,
      0.78,
      rawCore
    );


  // ==========================================================
  // PRIMARY MORPHOLOGY
  // ==========================================================

  const morphologyMax =
    Math.max(
      branchStrength,
      neuronStrength,
      myceliumStrength,
      coreStrength
    );


  const boost =
    0.18;


  const branchVisual =
    clamp01(
      branchStrength +
      (
        branchStrength ===
        morphologyMax
          ? boost
          : 0
      )
    );


  const neuronVisual =
    clamp01(
      neuronStrength +
      (
        neuronStrength ===
        morphologyMax
          ? boost
          : 0
      )
    );


  const myceliumVisual =
    clamp01(
      myceliumStrength +
      (
        myceliumStrength ===
        morphologyMax
          ? boost
          : 0
      )
    );


  const coreVisual =
    clamp01(
      coreStrength +
      (
        coreStrength ===
        morphologyMax
          ? boost
          : 0
      )
    );


  // ==========================================================
  // COMPOSITION
  // ==========================================================

  const subjectScale =
    0.72 +
    spaciousness * 0.46 -
    solitude * 0.14;


  const subjectX =
    (
      chaos -
      0.5
    ) *
    0.75;


  const subjectY =
    (
      hope -
      0.5
    ) *
    0.65;


  const subjectZ =
    (
      darkness -
      0.5
    ) *
    -0.45;


  // ==========================================================
  // BRANCH GEOMETRY
  // ==========================================================

  const branchGeometry =
    useMemo(
      () => {

        const random =
          createSeededRandom(
            73129
          );


        const branches =
          34;


        const segments =
          52;


        const vertexCount =
          branches *
          segments *
          2;


        const positions =
          new Float32Array(
            vertexCount * 3
          );


        const phases =
          new Float32Array(
            vertexCount
          );


        const life =
          new Float32Array(
            vertexCount
          );


        const randoms =
          new Float32Array(
            vertexCount
          );


        let index = 0;


        for (
          let b = 0;
          b < branches;
          b++
        ) {

          const angle =
            random() *
            Math.PI *
            2;


          const vertical =
            (
              random() -
              0.5
            ) *
            1.5;


          const length =
            2.5 +
            random() *
            5.0;


          const curvature =
            (
              random() -
              0.5
            ) *
            1.9;


          const phase =
            random() *
            Math.PI *
            2;


          const branchSeed =
            random();


          const direction =
            new THREE.Vector3(
              Math.cos(
                angle
              ),
              vertical,
              Math.sin(
                angle
              )
            ).normalize();


          const side =
            new THREE.Vector3(
              -direction.z,
              0,
              direction.x
            ).normalize();


          const createPoint =
            (
              t: number
            ) => {

              const p =
                direction
                  .clone()
                  .multiplyScalar(
                    length *
                    t
                  );


              const curve =
                Math.sin(
                  t *
                  Math.PI *
                  1.7 +
                  phase
                ) *
                curvature *
                t;


              p.add(
                side
                  .clone()
                  .multiplyScalar(
                    curve
                  )
              );


              p.y +=
                Math.sin(
                  t *
                  Math.PI
                ) *
                (
                  0.25 +
                  branchSeed *
                  1.15
                );


              return p;
            };


          for (
            let s = 0;
            s < segments;
            s++
          ) {

            const t1 =
              s /
              segments;


            const t2 =
              (
                s + 1
              ) /
              segments;


            const p1 =
              createPoint(
                t1
              );


            const p2 =
              createPoint(
                t2
              );


            positions[
              index * 3
            ] =
              p1.x;

            positions[
              index * 3 + 1
            ] =
              p1.y;

            positions[
              index * 3 + 2
            ] =
              p1.z;

            phases[index] =
              phase;

            life[index] =
              t1;

            randoms[index] =
              branchSeed;

            index++;


            positions[
              index * 3
            ] =
              p2.x;

            positions[
              index * 3 + 1
            ] =
              p2.y;

            positions[
              index * 3 + 2
            ] =
              p2.z;

            phases[index] =
              phase;

            life[index] =
              t2;

            randoms[index] =
              branchSeed;

            index++;
          }
        }


        return {
          positions,
          phases,
          life,
          randoms,
        };
      },
      []
    );


  // ==========================================================
  // NEURON PARTICLES
  // ==========================================================

  const neuronGeometry =
    useMemo(
      () => {

        const random =
          createSeededRandom(
            82147
          );


        const count =
          1300;


        const positions =
          new Float32Array(
            count * 3
          );


        const randoms =
          new Float32Array(
            count
          );


        const sizes =
          new Float32Array(
            count
          );


        for (
          let i = 0;
          i < count;
          i++
        ) {

          const radius =
            Math.pow(
              random(),
              0.70
            ) *
            6.0;


          const theta =
            random() *
            Math.PI *
            2;


          const phi =
            Math.acos(
              2 *
              random() -
              1
            );


          const i3 =
            i * 3;


          positions[i3] =
            radius *
            Math.sin(
              phi
            ) *
            Math.cos(
              theta
            );


          positions[i3 + 1] =
            radius *
            Math.cos(
              phi
            );


          positions[i3 + 2] =
            radius *
            Math.sin(
              phi
            ) *
            Math.sin(
              theta
            );


          randoms[i] =
            random();


          sizes[i] =
            0.5 +
            random() *
            1.7;
        }


        return {
          positions,
          randoms,
          sizes,
        };
      },
      []
    );


  // ==========================================================
  // MYCELIUM GEOMETRY
  // ==========================================================

  const myceliumGeometry =
    useMemo(
      () => {

        const random =
          createSeededRandom(
            95121
          );


        const strands =
          52;


        const segments =
          30;


        const count =
          strands *
          segments *
          2;


        const positions =
          new Float32Array(
            count * 3
          );


        const randoms =
          new Float32Array(
            count
          );


        let index =
          0;


        for (
          let i = 0;
          i < strands;
          i++
        ) {

          let current =
            new THREE.Vector3(
              (
                random() -
                0.5
              ) *
                2.0,
              (
                random() -
                0.5
              ) *
                1.0,
              (
                random() -
                0.5
              ) *
                2.0
            );


          const direction =
            new THREE.Vector3(
              random() -
                0.5,
              (
                random() -
                0.5
              ) *
                0.55,
              random() -
                0.5
            ).normalize();


          const seed =
            random();


          for (
            let s = 0;
            s < segments;
            s++
          ) {

            const next =
              current
                .clone();


            direction.x +=
              (
                random() -
                0.5
              ) *
              0.20;


            direction.y +=
              (
                random() -
                0.5
              ) *
              0.10;


            direction.z +=
              (
                random() -
                0.5
              ) *
              0.20;


            direction.normalize();


            next.add(
              direction
                .clone()
                .multiplyScalar(
                  0.13 +
                  random() *
                    0.18
                )
            );


            positions[
              index * 3
            ] =
              current.x;

            positions[
              index * 3 + 1
            ] =
              current.y;

            positions[
              index * 3 + 2
            ] =
              current.z;

            randoms[index] =
              seed;

            index++;


            positions[
              index * 3
            ] =
              next.x;

            positions[
              index * 3 + 1
            ] =
              next.y;

            positions[
              index * 3 + 2
            ] =
              next.z;

            randoms[index] =
              seed;

            index++;


            current =
              next;
          }
        }


        return {
          positions,
          randoms,
        };
      },
      []
    );


  // ==========================================================
  // BRANCH SHADER
  // ==========================================================

  const branchShader =
    useMemo(
      () => ({
        uniforms: {

          uTime: {
            value: 0,
          },

          uNature: {
            value: nature,
          },

          uFluidity: {
            value: fluidity,
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

          uSpeed: {
            value: speed,
          },

          uChaos: {
            value: chaos,
          },

          uStrength: {
            value: 0,
          },

        },


        vertexShader: `
          uniform float uTime;
          uniform float uNature;
          uniform float uFluidity;
          uniform float uFantasy;
          uniform float uSpeed;
          uniform float uChaos;

          attribute float aPhase;
          attribute float aLife;
          attribute float aRandom;

          varying float vLife;
          varying float vPulse;
          varying float vRandom;


          void main() {

            vec3 pos =
              position;


            float t =
              uTime *
              (
                0.16 +
                uSpeed *
                  0.52
              );


            float breath =
              sin(
                t +
                aPhase
              ) *
              (
                0.025 +
                uNature *
                  0.075
              );


            pos *=
              1.0 +
              breath;


            float flowA =
              sin(
                t *
                  1.1 +
                pos.y *
                  0.65 +
                aPhase
              );


            float flowB =
              cos(
                t *
                  0.72 +
                pos.x *
                  0.56 +
                aPhase *
                  1.6
              );


            pos.x +=
              flowA *
              (
                0.025 +
                uFluidity *
                  0.22
              ) *
              aLife;


            pos.z +=
              flowB *
              (
                0.025 +
                uFluidity *
                  0.20
              ) *
              aLife;


            pos.y +=
              sin(
                pos.x *
                  1.1 +
                t *
                  1.25 +
                aRandom *
                  7.0
              ) *
              uFantasy *
              0.13 *
              aLife;


            float noiseLike =
              sin(
                pos.x *
                  2.2 +
                pos.y *
                  1.6 +
                pos.z *
                  1.3 +
                t *
                  1.6 +
                aRandom *
                  18.0
              );


            pos +=
              normalize(
                pos +
                vec3(
                  0.001
                )
              ) *
              noiseLike *
              uChaos *
              0.055 *
              aLife;


            pos *=
              0.78 +
              uNature *
                0.34;


            vLife =
              aLife;


            vRandom =
              aRandom;


            vPulse =
              sin(
                t *
                  1.7 -
                aLife *
                  8.0 +
                aPhase
              ) *
              0.5 +
              0.5;


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
          uniform float uWarmth;
          uniform float uHope;
          uniform float uFantasy;
          uniform float uNature;
          uniform float uStrength;

          varying float vLife;
          varying float vPulse;
          varying float vRandom;


          void main() {

            vec3 cold =
              vec3(
                0.12,
                0.60,
                0.58
              );


            vec3 vivid =
              vec3(
                0.26,
                0.88,
                0.68
              );


            vec3 warm =
              vec3(
                1.0,
                0.46,
                0.26
              );


            vec3 color =
              mix(
                cold,
                vivid,
                uNature *
                  0.55
              );


            color =
              mix(
                color,
                warm,
                uWarmth *
                  0.50
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


            float tip =
              smoothstep(
                0.55,
                1.0,
                vLife
              );


            float brightness =
              0.32 +
              vPulse *
                0.24 +
              tip *
                (
                  0.18 +
                  uFantasy *
                    0.30
                );


            float alpha =
              (
                0.10 +
                uNature *
                  0.22
              ) *
              uStrength;


            alpha *=
              0.65 +
              tip *
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
      []
    );


  // ==========================================================
  // NEURON SHADER
  // ==========================================================

  const neuronShader =
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
          uniform float uChaos;
          uniform float uFantasy;

          attribute float aRandom;
          attribute float aSize;

          varying float vPulse;
          varying float vRandom;


          void main() {

            vec3 pos =
              position;


            float radius =
              length(
                pos
              );


            float t =
              uTime *
              (
                0.4 +
                uSpeed *
                  1.1
              );


            float pulse =
              sin(
                t *
                  (
                    1.0 +
                    aRandom *
                      2.0
                  ) -
                radius *
                  1.8 +
                aRandom *
                  10.0
              ) *
              0.5 +
              0.5;


            pos +=
              normalize(
                pos +
                vec3(
                  0.001
                )
              ) *
              sin(
                t +
                aRandom *
                  20.0
              ) *
              uChaos *
              0.10;


            pos.y +=
              sin(
                pos.x *
                  1.4 +
                t *
                  0.65 +
                aRandom *
                  8.0
              ) *
              uFantasy *
              0.10;


            vec4 mvPosition =
              modelViewMatrix *
              vec4(
                pos,
                1.0
              );


            gl_PointSize =
              aSize *
              (
                1.1 +
                pulse *
                  3.0
              ) *
              (
                65.0 /
                max(
                  1.0,
                  -mvPosition.z
                )
              );


            vPulse =
              pulse;


            vRandom =
              aRandom;


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

          varying float vPulse;
          varying float vRandom;


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
                0.03,
                0.5,
                d
              );


            vec3 blue =
              vec3(
                0.24,
                0.56,
                1.0
              );


            vec3 violet =
              vec3(
                0.70,
                0.40,
                1.0
              );


            vec3 warm =
              vec3(
                1.0,
                0.50,
                0.28
              );


            vec3 color =
              mix(
                blue,
                violet,
                uFantasy *
                  0.60
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
                  0.18
              );


            float flash =
              smoothstep(
                0.72,
                1.0,
                vPulse
              );


            float alpha =
              glow *
              (
                0.08 +
                flash *
                  0.72
              ) *
              uStrength;


            gl_FragColor =
              vec4(
                color *
                  (
                    0.45 +
                    flash *
                      1.4
                  ),
                alpha
              );
          }
        `,
      }),
      []
    );


  // ==========================================================
  // MYCELIUM SHADER
  // ==========================================================

  const myceliumShader =
    useMemo(
      () => ({
        uniforms: {

          uTime: {
            value: 0,
          },

          uFluidity: {
            value: fluidity,
          },

          uFantasy: {
            value: fantasy,
          },

          uDarkness: {
            value: darkness,
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
          uniform float uFluidity;
          uniform float uFantasy;

          attribute float aRandom;

          varying float vPulse;
          varying float vRandom;


          void main() {

            vec3 pos =
              position;


            float t =
              uTime *
              0.18;


            pos.x +=
              sin(
                pos.z *
                  2.0 +
                t +
                aRandom *
                  6.0
              ) *
              uFluidity *
              0.08;


            pos.z +=
              cos(
                pos.x *
                  1.8 -
                t +
                aRandom *
                  5.0
              ) *
              uFluidity *
              0.08;


            pos.y +=
              sin(
                pos.x *
                  2.4 +
                pos.z *
                  1.7 +
                t *
                  1.5
              ) *
              uFantasy *
              0.045;


            vPulse =
              sin(
                t *
                  2.0 +
                aRandom *
                  15.0
              ) *
              0.5 +
              0.5;


            vRandom =
              aRandom;


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
          uniform float uFantasy;
          uniform float uDarkness;
          uniform float uWarmth;
          uniform float uStrength;

          varying float vPulse;
          varying float vRandom;


          void main() {

            vec3 green =
              vec3(
                0.16,
                0.56,
                0.44
              );


            vec3 cyan =
              vec3(
                0.26,
                0.76,
                0.82
              );


            vec3 warm =
              vec3(
                0.94,
                0.46,
                0.26
              );


            vec3 color =
              mix(
                green,
                cyan,
                uFantasy *
                  0.45
              );


            color =
              mix(
                color,
                warm,
                uWarmth *
                  0.24
              );


            float brightness =
              0.26 +
              vPulse *
                0.32;


            brightness *=
              1.0 -
              uDarkness *
                0.20;


            float alpha =
              (
                0.10 +
                vPulse *
                  0.12
              ) *
              uStrength;


            gl_FragColor =
              vec4(
                color *
                  brightness,
                alpha
              );
          }
        `,
      }),
      []
    );


  // ==========================================================
  // ANIMATION
  // ==========================================================

  useFrame(
    (
      state,
      delta
    ) => {

      const t =
        state.clock.elapsedTime;


      // ROOT

      if (
        rootRef.current
      ) {

        rootRef.current.position.x =
          subjectX +
          Math.sin(
            t *
              0.045
          ) *
            chaos *
            0.08;


        rootRef.current.position.y =
          subjectY +
          Math.sin(
            t *
              0.07
          ) *
            fluidity *
            0.06;


        rootRef.current.position.z =
          subjectZ;


        const breath =
          1 +
          Math.sin(
            t *
              0.11
          ) *
          (
            0.01 +
            nature *
              0.025
          );


        rootRef.current.scale.setScalar(
          subjectScale *
          breath
        );
      }


      // BRANCH

      if (
        branchMaterialRef.current
      ) {

        const u =
          branchMaterialRef.current
            .uniforms;


        u.uTime.value =
          t;

        u.uNature.value =
          nature;

        u.uFluidity.value =
          fluidity;

        u.uFantasy.value =
          fantasy;

        u.uWarmth.value =
          warmth;

        u.uHope.value =
          hope;

        u.uSpeed.value =
          speed;

        u.uChaos.value =
          chaos;

        u.uStrength.value =
          organismStrength *
          branchVisual;
      }


      // NEURON

      if (
        neuronMaterialRef.current
      ) {

        const u =
          neuronMaterialRef.current
            .uniforms;


        u.uTime.value =
          t;

        u.uSpeed.value =
          speed;

        u.uChaos.value =
          chaos;

        u.uFantasy.value =
          fantasy;

        u.uHope.value =
          hope;

        u.uWarmth.value =
          warmth;

        u.uStrength.value =
          organismStrength *
          neuronVisual;
      }


      // MYCELIUM

      if (
        myceliumMaterialRef.current
      ) {

        const u =
          myceliumMaterialRef.current
            .uniforms;


        u.uTime.value =
          t;

        u.uFluidity.value =
          fluidity;

        u.uFantasy.value =
          fantasy;

        u.uDarkness.value =
          darkness;

        u.uWarmth.value =
          warmth;

        u.uStrength.value =
          organismStrength *
          myceliumVisual;
      }


      // BRANCH ROTATION

      if (
        branchRef.current
      ) {

        branchRef.current.rotation.y +=
          delta *
          (
            0.003 +
            speed *
              0.008
          );
      }


      // NEURON ROTATION

      if (
        neuronRef.current
      ) {

        neuronRef.current.rotation.y -=
          delta *
          (
            0.002 +
            speed *
              0.006
          );


        neuronRef.current.rotation.x =
          Math.sin(
            t *
              0.06
          ) *
          0.08;
      }


      // MYCELIUM MOTION

      if (
        myceliumRef.current
      ) {

        myceliumRef.current.rotation.y =
          Math.sin(
            t *
              0.035
          ) *
          0.15;


        myceliumRef.current.position.y =
          -0.7 -
          darkness *
            0.25;
      }


      // CORE

      if (
        coreRef.current
      ) {

        const pulse =
          1 +
          Math.sin(
            t *
            (
              0.45 +
              tension *
                1.0 +
              speed *
                0.4
            )
          ) *
          (
            0.035 +
            coreVisual *
              0.055
          );


        coreRef.current.scale.setScalar(
          pulse
        );


        coreRef.current.rotation.y +=
          delta *
          (
            0.01 +
            chaos *
              0.025
          );
      }
    }
  );


  // ==========================================================
  // HIDE
  // ==========================================================

  if (
    organismStrength <=
    0.015
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

      {/* ===================================================== */}
      {/* BRANCHING ORGANISM                                    */}
      {/* ===================================================== */}

      <lineSegments
        ref={branchRef}
      >

        <bufferGeometry>

          <bufferAttribute
            attach="attributes-position"
            args={[
              branchGeometry.positions,
              3,
            ]}
          />


          <bufferAttribute
            attach="attributes-aPhase"
            args={[
              branchGeometry.phases,
              1,
            ]}
          />


          <bufferAttribute
            attach="attributes-aLife"
            args={[
              branchGeometry.life,
              1,
            ]}
          />


          <bufferAttribute
            attach="attributes-aRandom"
            args={[
              branchGeometry.randoms,
              1,
            ]}
          />

        </bufferGeometry>


        <shaderMaterial
          ref={
            branchMaterialRef
          }
          args={[
            branchShader,
          ]}
          transparent
          depthWrite={false}
          blending={
            THREE.AdditiveBlending
          }
          toneMapped={false}
        />

      </lineSegments>


      {/* ===================================================== */}
      {/* NEURAL NETWORK                                        */}
      {/* ===================================================== */}

      <points
        ref={neuronRef}
      >

        <bufferGeometry>

          <bufferAttribute
            attach="attributes-position"
            args={[
              neuronGeometry.positions,
              3,
            ]}
          />


          <bufferAttribute
            attach="attributes-aRandom"
            args={[
              neuronGeometry.randoms,
              1,
            ]}
          />


          <bufferAttribute
            attach="attributes-aSize"
            args={[
              neuronGeometry.sizes,
              1,
            ]}
          />

        </bufferGeometry>


        <shaderMaterial
          ref={
            neuronMaterialRef
          }
          args={[
            neuronShader,
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
      {/* MYCELIUM                                              */}
      {/* ===================================================== */}

      <lineSegments
        ref={myceliumRef}
        scale={[
          2.1,
          1.1,
          2.1,
        ]}
      >

        <bufferGeometry>

          <bufferAttribute
            attach="attributes-position"
            args={[
              myceliumGeometry.positions,
              3,
            ]}
          />


          <bufferAttribute
            attach="attributes-aRandom"
            args={[
              myceliumGeometry.randoms,
              1,
            ]}
          />

        </bufferGeometry>


        <shaderMaterial
          ref={
            myceliumMaterialRef
          }
          args={[
            myceliumShader,
          ]}
          transparent
          depthWrite={false}
          blending={
            THREE.AdditiveBlending
          }
          toneMapped={false}
        />

      </lineSegments>


      {/* ===================================================== */}
      {/* ORGANIC CORE                                          */}
      {/* ===================================================== */}

      <group
        ref={coreRef}
      >

        {/* DARK INNER CORE */}

        <mesh
          scale={
            0.30 +
            coreVisual *
              0.42
          }
        >

          <icosahedronGeometry
            args={[
              1,
              4,
            ]}
          />


          <meshBasicMaterial
            color={
              new THREE.Color(
                0.01,
                0.025,
                0.025
              )
            }
            transparent
            opacity={
              organismStrength *
              coreVisual *
              0.82
            }
            depthWrite={false}
          />

        </mesh>


        {/* BIOLOGICAL HALO */}

        <mesh
          scale={
            0.45 +
            coreVisual *
              0.62
          }
        >

          <icosahedronGeometry
            args={[
              1,
              3,
            ]}
          />


          <meshBasicMaterial
            color={
              new THREE.Color(
                0.18,
                0.72,
                0.62
              )
            }
            transparent
            opacity={
              organismStrength *
              coreVisual *
              0.085
            }
            wireframe
            depthWrite={false}
            blending={
              THREE.AdditiveBlending
            }
            toneMapped={false}
          />

        </mesh>


        {/* SECOND MEMBRANE */}

        <mesh
          scale={
            0.66 +
            coreVisual *
              0.76
          }
          rotation={[
            0.4,
            0.2,
            0.7,
          ]}
        >

          <icosahedronGeometry
            args={[
              1,
              2,
            ]}
          />


          <meshBasicMaterial
            color={
              new THREE.Color(
                0.40,
                0.90,
                0.72
              )
            }
            transparent
            opacity={
              organismStrength *
              coreVisual *
              0.045
            }
            wireframe
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