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
  getVoidStrength,
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


function smoothstepValue(
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
// VOID WORLD
// ============================================================

export default function VoidWorld({
  mix = 1,

  darkness = 0.5,
  solitude = 0.5,

  fantasy = 0.5,
  spaciousness = 0.5,
  speed = 0.4,

  chaos = 0.5,
  tension = 0.5,
  hope = 0.5,
  warmth = 0.5,

  quietness = 0.5,
  fluidity = 0.5,

}: World3DProps) {

  // ==========================================================
  // REFS
  // ==========================================================

  const rootRef =
    useRef<THREE.Group>(
      null
    );


  const singularityRef =
    useRef<THREE.Group>(
      null
    );


  const diskRef =
    useRef<THREE.Mesh>(
      null
    );


  const outerDiskRef =
    useRef<THREE.Mesh>(
      null
    );


  const riftRef =
    useRef<THREE.Group>(
      null
    );


  const riftMaterialRef =
    useRef<THREE.ShaderMaterial>(
      null
    );


  const collapseRef =
    useRef<THREE.Points>(
      null
    );


  const collapseMaterialRef =
    useRef<THREE.ShaderMaterial>(
      null
    );


  const haloRef =
    useRef<THREE.Group>(
      null
    );


  // ==========================================================
  // BASE VOID STRENGTH
  // ==========================================================

  const voidStrength =
    clamp01(
      getVoidStrength(
        darkness,
        solitude
      ) *
      mix
    );


  // ==========================================================
  // MORPHOLOGY SCORES
  // ==========================================================

  /*
   * SINGULARITY
   *
   * darkness + tension
   */

  const rawSingularity =
    clamp01(
      darkness * 0.38 +
      tension * 0.26 +
      solitude * 0.20 +
      chaos * 0.10 +
      fantasy * 0.06
    );


  /*
   * RIFT
   *
   * fantasy + chaos
   * → 空間そのものの歪み
   */

  const rawRift =
    clamp01(
      fantasy * 0.32 +
      chaos * 0.28 +
      tension * 0.20 +
      darkness * 0.12 +
      spaciousness * 0.08
    );


  /*
   * COLLAPSE
   *
   * chaos + speed + darkness
   * → 物質崩壊
   */

  const rawCollapse =
    clamp01(
      chaos * 0.30 +
      speed * 0.24 +
      darkness * 0.22 +
      tension * 0.16 +
      fantasy * 0.08
    );


  /*
   * EMPTY HALO
   *
   * solitude + quietness + spaciousness
   *
   * 大きな空白そのもの
   */

  const rawHalo =
    clamp01(
      solitude * 0.36 +
      quietness * 0.28 +
      spaciousness * 0.20 +
      darkness * 0.10 +
      fantasy * 0.06
    );


  // ==========================================================
  // ACTIVATION
  // ==========================================================

  const singularityStrength =
    smoothstepValue(
      0.48,
      0.77,
      rawSingularity
    );


  const riftStrength =
    smoothstepValue(
      0.48,
      0.77,
      rawRift
    );


  const collapseStrength =
    smoothstepValue(
      0.50,
      0.79,
      rawCollapse
    );


  const haloStrength =
    smoothstepValue(
      0.44,
      0.73,
      rawHalo
    );


  // ==========================================================
  // PRIMARY MORPHOLOGY
  //
  // 今回は以前の
  //
  // strength === morphologyMax
  //
  // 方式を少し修正。
  //
  // 全部0だったとき全種類にboostが
  // 入ってしまうのを防ぐ。
  // ==========================================================

  const morphologyValues = [
    singularityStrength,
    riftStrength,
    collapseStrength,
    haloStrength,
  ];


  let primaryIndex =
    0;


  let morphologyMax =
    morphologyValues[0];


  for (
    let i = 1;
    i <
    morphologyValues.length;
    i++
  ) {

    if (
      morphologyValues[i] >
      morphologyMax
    ) {

      morphologyMax =
        morphologyValues[i];

      primaryIndex =
        i;
    }
  }


  const hasPrimary =
    morphologyMax >
    0.01;


  const boost =
    0.18;


  const singularityVisual =
    clamp01(
      singularityStrength +
      (
        hasPrimary &&
        primaryIndex === 0
          ? boost
          : 0
      )
    );


  const riftVisual =
    clamp01(
      riftStrength +
      (
        hasPrimary &&
        primaryIndex === 1
          ? boost
          : 0
      )
    );


  const collapseVisual =
    clamp01(
      collapseStrength +
      (
        hasPrimary &&
        primaryIndex === 2
          ? boost
          : 0
      )
    );


  const haloVisual =
    clamp01(
      haloStrength +
      (
        hasPrimary &&
        primaryIndex === 3
          ? boost
          : 0
      )
    );


  // ==========================================================
  // COMPOSITION
  // ==========================================================

  /*
   * solitudeが高いほど
   * 中央の物体自体は小さくする。
   *
   * 「孤独 = 全体を巨大化」
   * ではなく、
   *
   * 小さい対象
   * +
   * 大きな空白
   *
   * にする。
   */

  const subjectScale =
    0.92 -
    solitude * 0.22 +
    spaciousness * 0.12;


  const subjectX =
    (
      chaos -
      0.5
    ) *
    0.65;


  const subjectY =
    (
      hope -
      0.5
    ) *
    0.30;


  const subjectZ =
    (
      tension -
      0.5
    ) *
    -0.5;


  // ==========================================================
  // COLLAPSE PARTICLES
  // ==========================================================

  const collapseData =
    useMemo(
      () => {

        const random =
          createSeededRandom(
            95173
          );


        const count =
          4200;


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


          const angle =
            random() *
            Math.PI *
            2;


          const radius =
            1.6 +
            Math.pow(
              random(),
              0.58
            ) *
            12;


          const thickness =
            (
              random() -
              0.5
            ) *
            (
              0.35 +
              radius *
                0.12
            );


          positions[
            i3
          ] =
            Math.cos(
              angle
            ) *
            radius;


          positions[
            i3 + 1
          ] =
            thickness;


          positions[
            i3 + 2
          ] =
            Math.sin(
              angle
            ) *
            radius;


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
            0.25 +
            random() *
            1.45;
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
  // RIFT SHADER
  // ==========================================================

  const riftShader =
    useMemo(
      () => ({

        uniforms: {

          uTime: {
            value: 0,
          },

          uChaos: {
            value:
              chaos,
          },

          uTension: {
            value:
              tension,
          },

          uFantasy: {
            value:
              fantasy,
          },

          uDarkness: {
            value:
              darkness,
          },

          uHope: {
            value:
              hope,
          },

          uStrength: {
            value: 0,
          },

        },


        vertexShader: `
          uniform float uTime;
          uniform float uChaos;
          uniform float uTension;
          uniform float uFantasy;

          varying vec2 vUv;
          varying float vDistortion;


          void main() {

            vUv =
              uv;


            vec3 pos =
              position;


            float radius =
              length(
                pos.xy
              );


            float angle =
              atan(
                pos.y,
                pos.x
              );


            float t =
              uTime *
              (
                0.08 +
                uTension *
                  0.20
              );


            /*
             * spacetime ripple
             */

            float ripple =
              sin(
                radius *
                  (
                    2.3 +
                    uFantasy *
                      2.0
                  ) -
                t *
                  2.0
              );


            pos.z +=
              ripple *
              (
                0.06 +
                uTension *
                  0.22
              );


            /*
             * asymmetric tearing
             */

            float tear =
              sin(
                angle *
                  (
                    2.0 +
                    uChaos *
                      5.0
                  ) +
                radius *
                  1.5 +
                t
              );


            pos.z +=
              tear *
              uChaos *
              0.08;


            pos.x +=
              sin(
                pos.y *
                  1.1 +
                t
              ) *
              uFantasy *
              0.06;


            vDistortion =
              ripple +
              tear *
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
          uniform float uTime;
          uniform float uChaos;
          uniform float uTension;
          uniform float uFantasy;
          uniform float uDarkness;
          uniform float uHope;
          uniform float uStrength;

          varying vec2 vUv;
          varying float vDistortion;


          void main() {

            vec2 p =
              vUv -
              0.5;


            float r =
              length(
                p
              );


            float angle =
              atan(
                p.y,
                p.x
              );


            /*
             * multiple gravitational rings
             */

            float rings =
              sin(
                r *
                  (
                    72.0 +
                    uTension *
                      30.0
                  ) -
                uTime *
                  0.7 +
                vDistortion *
                  6.0
              );


            rings =
              abs(
                rings
              );


            rings =
              pow(
                1.0 -
                rings,
                5.0
              );


            /*
             * broken angular rift
             */

            float angular =
              sin(
                angle *
                  (
                    3.0 +
                    uChaos *
                      7.0
                  ) +
                r *
                  22.0
              );


            angular =
              smoothstep(
                0.55,
                1.0,
                angular
              );


            float innerMask =
              smoothstep(
                0.06,
                0.20,
                r
              );


            float outerMask =
              1.0 -
              smoothstep(
                0.30,
                0.72,
                r
              );


            float mask =
              innerMask *
              outerMask;


            vec3 deep =
              vec3(
                0.12,
                0.08,
                0.32
              );


            vec3 violet =
              vec3(
                0.48,
                0.30,
                1.0
              );


            vec3 blue =
              vec3(
                0.24,
                0.52,
                1.0
              );


            vec3 color =
              mix(
                deep,
                violet,
                uFantasy *
                  0.65
              );


            color =
              mix(
                color,
                blue,
                uHope *
                  0.16
              );


            color *=
              0.75 -
              uDarkness *
                0.22;


            float alpha =
              (
                rings *
                  0.34 +
                angular *
                  uChaos *
                  0.16
              ) *
              mask *
              uStrength;


            gl_FragColor =
              vec4(
                color *
                  (
                    0.45 +
                    rings *
                      1.0
                  ),
                alpha
              );
          }
        `,

      }),
      []
    );


  // ==========================================================
  // COLLAPSE SHADER
  // ==========================================================

  const collapseShader =
    useMemo(
      () => ({

        uniforms: {

          uTime: {
            value: 0,
          },

          uSpeed: {
            value:
              speed,
          },

          uChaos: {
            value:
              chaos,
          },

          uTension: {
            value:
              tension,
          },

          uFantasy: {
            value:
              fantasy,
          },

          uWarmth: {
            value:
              warmth,
          },

          uHope: {
            value:
              hope,
          },

          uSpaciousness: {
            value:
              spaciousness,
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
          uniform float uFantasy;
          uniform float uSpaciousness;

          attribute float aRandom;
          attribute float aPhase;
          attribute float aSpeed;

          varying float vRandom;
          varying float vRadius;
          varying float vPulse;


          void main() {

            vec3 pos =
              position;


            float originalRadius =
              length(
                pos.xz
              );


            float t =
              uTime *
              (
                0.10 +
                uSpeed *
                  0.38
              ) *
              aSpeed;


            /*
             * Collapse cycle
             *
             * 1 → 0へ縮んで
             * また外側へ戻る
             */

            float cycle =
              fract(
                t *
                  0.08 +
                aRandom
              );


            float radiusScale =
              1.0 -
              cycle;


            radiusScale =
              pow(
                radiusScale,
                0.55 +
                uTension *
                  0.40
              );


            pos.xz *=
              radiusScale;


            /*
             * rotational fall
             */

            float rotation =
              t *
              (
                0.12 +
                uChaos *
                  0.35
              ) *
              (
                1.0 +
                originalRadius *
                  0.04
              );


            float c =
              cos(
                rotation
              );


            float s =
              sin(
                rotation
              );


            mat2 rot =
              mat2(
                c,
                -s,
                s,
                c
              );


            pos.xz =
              rot *
              pos.xz;


            /*
             * vertical disturbance
             */

            pos.y +=
              sin(
                rotation +
                aPhase
              ) *
              uFantasy *
              0.25 *
              radiusScale;


            pos.y *=
              0.85 +
              uSpaciousness *
                0.40;


            vec4 mvPosition =
              modelViewMatrix *
              vec4(
                pos,
                1.0
              );


            float pulse =
              1.0 -
              cycle;


            vRandom =
              aRandom;


            vRadius =
              originalRadius;


            vPulse =
              pulse;


            gl_PointSize =
              (
                0.8 +
                aRandom *
                  1.8 +
                uTension *
                  1.4
              ) *
              (
                70.0 /
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
          uniform float uWarmth;
          uniform float uHope;
          uniform float uStrength;

          varying float vRandom;
          varying float vRadius;
          varying float vPulse;


          void main() {

            vec2 p =
              gl_PointCoord -
              0.5;


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


            vec3 violet =
              vec3(
                0.44,
                0.30,
                1.0
              );


            vec3 blue =
              vec3(
                0.24,
                0.58,
                1.0
              );


            vec3 warm =
              vec3(
                1.0,
                0.40,
                0.20
              );


            vec3 color =
              mix(
                blue,
                violet,
                uFantasy *
                  0.65
              );


            color =
              mix(
                color,
                warm,
                uWarmth *
                  0.36
              );


            color =
              mix(
                color,
                vec3(
                  1.0
                ),
                uHope *
                  0.12
              );


            float coreFlash =
              smoothstep(
                0.72,
                1.0,
                vPulse
              );


            float rare =
              smoothstep(
                0.94,
                1.0,
                vRandom
              );


            float alpha =
              glow *
              (
                0.06 +
                coreFlash *
                  0.26 +
                rare *
                  0.18
              ) *
              uStrength;


            gl_FragColor =
              vec4(
                color *
                  (
                    0.35 +
                    coreFlash *
                      1.05 +
                    rare *
                      0.7
                  ),
                alpha
              );
          }
        `,

      }),
      []
    );


  // ==========================================================
  // COLORS
  // ==========================================================

  const diskColor =
    useMemo(
      () => {

        const cold =
          new THREE.Color(
            "#604dff"
          );


        const warm =
          new THREE.Color(
            "#ff7850"
          );


        return cold
          .clone()
          .lerp(
            warm,
            warmth
          );
      },
      [
        warmth,
      ]
    );


  const brightDiskColor =
    useMemo(
      () => {

        return diskColor
          .clone()
          .lerp(
            new THREE.Color(
              "#ffffff"
            ),
            hope *
            0.12
          )
          .multiplyScalar(
            0.85 +
            fantasy *
              0.38
          );

      },
      [
        diskColor,
        hope,
        fantasy,
      ]
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
              0.025
          ) *
          0.025;


        rootRef.current.position.z =
          subjectZ;


        const breathing =
          1 +
          Math.sin(
            t *
              0.045
          ) *
          (
            0.004 +
            voidStrength *
              0.009
          );


        rootRef.current.scale.setScalar(
          subjectScale *
          breathing
        );
      }


      // ======================================================
      // SINGULARITY
      // ======================================================

      if (
        singularityRef.current
      ) {

        const pulse =
          1 +
          Math.sin(
            t *
            (
              0.18 +
              tension *
                0.40
            )
          ) *
          (
            0.006 +
            singularityVisual *
              0.018
          );


        singularityRef.current.scale
          .setScalar(
            pulse
          );


        singularityRef.current.rotation.y +=
          delta *
          (
            0.003 +
            chaos *
              0.008
          );
      }


      if (
        diskRef.current
      ) {

        diskRef.current.rotation.z +=
          delta *
          (
            0.035 +
            speed *
              0.12
          );
      }


      if (
        outerDiskRef.current
      ) {

        outerDiskRef.current.rotation.z -=
          delta *
          (
            0.012 +
            speed *
              0.045
          );
      }


      // ======================================================
      // RIFT
      // ======================================================

      if (
        riftMaterialRef.current
      ) {

        const u =
          riftMaterialRef.current
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


        u.uHope.value =
          hope;


        u.uStrength.value =
          voidStrength *
          riftVisual;
      }


      if (
        riftRef.current
      ) {

        riftRef.current.rotation.z +=
          delta *
          (
            0.002 +
            chaos *
              0.008
          );


        riftRef.current.rotation.x =
          Math.sin(
            t *
              0.035
          ) *
          tension *
          0.07;
      }


      // ======================================================
      // COLLAPSE FIELD
      // ======================================================

      if (
        collapseMaterialRef.current
      ) {

        const u =
          collapseMaterialRef.current
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


        u.uHope.value =
          hope;


        u.uSpaciousness.value =
          spaciousness;


        u.uStrength.value =
          voidStrength *
          collapseVisual;
      }


      if (
        collapseRef.current
      ) {

        collapseRef.current.rotation.y +=
          delta *
          (
            0.004 +
            speed *
              0.014
          );


        collapseRef.current.rotation.x =
          Math.sin(
            t *
              0.045
          ) *
          chaos *
          0.08;
      }


      // ======================================================
      // EMPTY HALO
      // ======================================================

      if (
        haloRef.current
      ) {

        haloRef.current.rotation.z +=
          delta *
          (
            0.0008 +
            speed *
              0.002
          );


        haloRef.current.rotation.x =
          -0.12 +
          Math.sin(
            t *
              0.025
          ) *
          0.04;
      }
    }
  );


  // ==========================================================
  // HIDE
  // ==========================================================

  if (
    voidStrength <=
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
      {/* SINGULARITY                                           */}
      {/* ===================================================== */}

      <group
        ref={singularityRef}
      >

        {/* BLACK CORE */}

        <mesh
          scale={
            0.78 +
            singularityVisual *
              0.48
          }
        >

          <sphereGeometry
            args={[
              1,
              64,
              64,
            ]}
          />


          <meshBasicMaterial
            color="#000000"
            transparent
            opacity={
              voidStrength *
              singularityVisual *
              0.98
            }
            depthWrite={false}
          />

        </mesh>


        {/* EVENT HORIZON */}

        <mesh
          scale={
            1.04 +
            singularityVisual *
              0.58
          }
        >

          <sphereGeometry
            args={[
              1,
              48,
              48,
            ]}
          />


          <meshBasicMaterial
            color="#5d4dff"
            transparent
            opacity={
              voidStrength *
              singularityVisual *
              0.085
            }
            side={
              THREE.BackSide
            }
            blending={
              THREE.AdditiveBlending
            }
            depthWrite={false}
            toneMapped={false}
          />

        </mesh>


        {/* INNER ACCRETION */}

        <mesh
          ref={diskRef}
          rotation={[
            Math.PI /
              2.7,
            0,
            0,
          ]}
          scale={
            0.82 +
            singularityVisual *
              0.55
          }
        >

          <ringGeometry
            args={[
              1.15,
              3.45,
              160,
            ]}
          />


          <meshBasicMaterial
            color={
              brightDiskColor
            }
            transparent
            opacity={
              voidStrength *
              singularityVisual *
              0.28
            }
            side={
              THREE.DoubleSide
            }
            blending={
              THREE.AdditiveBlending
            }
            depthWrite={false}
            toneMapped={false}
          />

        </mesh>


        {/* OUTER ACCRETION */}

        <mesh
          ref={
            outerDiskRef
          }
          rotation={[
            Math.PI /
              2.7,
            0,
            0,
          ]}
          scale={
            1.10 +
            singularityVisual *
              0.52
          }
        >

          <ringGeometry
            args={[
              1.5,
              3.7,
              160,
            ]}
          />


          <meshBasicMaterial
            color={
              diskColor
            }
            transparent
            opacity={
              voidStrength *
              singularityVisual *
              0.075
            }
            side={
              THREE.DoubleSide
            }
            blending={
              THREE.AdditiveBlending
            }
            depthWrite={false}
            toneMapped={false}
          />

        </mesh>

      </group>


      {/* ===================================================== */}
      {/* GRAVITATIONAL RIFT                                    */}
      {/* ===================================================== */}

      <group
        ref={riftRef}
        position={[
          0,
          0,
          -0.8,
        ]}
      >

        <mesh
          rotation={[
            -0.08,
            0.16,
            0,
          ]}
        >

          <planeGeometry
            args={[
              12 +
                spaciousness *
                  8,

              12 +
                spaciousness *
                  8,

              160,
              160,
            ]}
          />


          <shaderMaterial
            ref={
              riftMaterialRef
            }
            args={[
              riftShader,
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


      {/* ===================================================== */}
      {/* COLLAPSE FIELD                                        */}
      {/* ===================================================== */}

      <points
        ref={collapseRef}
        frustumCulled={false}
      >

        <bufferGeometry>

          <bufferAttribute
            attach="attributes-position"
            args={[
              collapseData.positions,
              3,
            ]}
          />


          <bufferAttribute
            attach="attributes-aRandom"
            args={[
              collapseData.randoms,
              1,
            ]}
          />


          <bufferAttribute
            attach="attributes-aPhase"
            args={[
              collapseData.phases,
              1,
            ]}
          />


          <bufferAttribute
            attach="attributes-aSpeed"
            args={[
              collapseData.speeds,
              1,
            ]}
          />

        </bufferGeometry>


        <shaderMaterial
          ref={
            collapseMaterialRef
          }
          args={[
            collapseShader,
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
      {/* EMPTY HALO                                            */}
      {/* ===================================================== */}

      <group
        ref={haloRef}
      >

        {/* main empty ring */}

        <mesh
          rotation={[
            Math.PI /
              2.25,
            0,
            0,
          ]}
          scale={
            1.8 +
            spaciousness *
              1.4
          }
        >

          <ringGeometry
            args={[
              1.9,
              2.05,
              180,
            ]}
          />


          <meshBasicMaterial
            color="#7568ff"
            transparent
            opacity={
              voidStrength *
              haloVisual *
              0.13
            }
            side={
              THREE.DoubleSide
            }
            blending={
              THREE.AdditiveBlending
            }
            depthWrite={false}
            toneMapped={false}
          />

        </mesh>


        {/* secondary halo */}

        <mesh
          rotation={[
            Math.PI /
              2.25 +
              0.13,
            0.08,
            0.18,
          ]}
          scale={
            2.15 +
            spaciousness *
              1.65
          }
        >

          <ringGeometry
            args={[
              1.9,
              1.97,
              180,
            ]}
          />


          <meshBasicMaterial
            color="#3f57bf"
            transparent
            opacity={
              voidStrength *
              haloVisual *
              0.052
            }
            side={
              THREE.DoubleSide
            }
            blending={
              THREE.AdditiveBlending
            }
            depthWrite={false}
            toneMapped={false}
          />

        </mesh>


        {/* almost invisible far halo */}

        <mesh
          rotation={[
            Math.PI /
              2.25 -
              0.10,
            -0.12,
            -0.15,
          ]}
          scale={
            2.70 +
            spaciousness *
              1.9
          }
        >

          <ringGeometry
            args={[
              1.93,
              1.98,
              160,
            ]}
          />


          <meshBasicMaterial
            color="#766aff"
            transparent
            opacity={
              voidStrength *
              haloVisual *
              0.020
            }
            side={
              THREE.DoubleSide
            }
            blending={
              THREE.AdditiveBlending
            }
            depthWrite={false}
            toneMapped={false}
          />

        </mesh>

      </group>

    </group>
  );
}