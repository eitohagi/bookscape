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
  getWaveStrength,
  getCrystalStrength,
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
// GALAXY WORLD
// ============================================================

export default function GalaxyWorld({
  mix = 1,

  quietness = 0.6,
  fantasy = 0.6,
  spaciousness = 0.6,
  speed = 0.4,
  darkness = 0.4,
  warmth = 0.5,
  chaos = 0.5,
  solitude = 0.5,
  hope = 0.5,
  nature = 0.5,
  fluidity = 0.5,
  tension = 0.5,

}: World3DProps) {

  // ==========================================================
  // REFS
  // ==========================================================

  const rootRef =
    useRef<THREE.Group>(
      null
    );


  const materialRef =
    useRef<THREE.ShaderMaterial>(
      null
    );


  const spiralRef =
    useRef<THREE.Points>(
      null
    );


  const deepStarsRef =
    useRef<THREE.Points>(
      null
    );


  const foregroundStarsRef =
    useRef<THREE.Points>(
      null
    );


  const orbitalGroupRef =
    useRef<THREE.Group>(
      null
    );


  const singularityRef =
    useRef<THREE.Group>(
      null
    );


  // ==========================================================
  // WORLD STRENGTH
  // ==========================================================

  const organismStrength =
    getOrganismStrength(
      nature,
      fluidity,
      fantasy
    );


  const waveStrength =
    getWaveStrength(
      fluidity,
      speed,
      fantasy
    );


  const crystalStrength =
    getCrystalStrength(
      tension,
      fantasy,
      chaos
    );


  const galaxyStrength =
    clamp01(
      (
        1 -
        organismStrength *
          0.22 -
        waveStrength *
          0.16 -
        crystalStrength *
          0.16
      ) *
      mix
    );


  // ==========================================================
  // RAW MORPHOLOGY
  // ==========================================================

  /*
   * Spiral
   *
   * 幻想
   * 混沌
   * 運動
   */

  const rawSpiral =
    clamp01(
      fantasy *
        0.38 +
      chaos *
        0.34 +
      speed *
        0.18 +
      spaciousness *
        0.10
    );


  /*
   * Orbital
   *
   * 静けさ
   * 孤独
   * 幻想
   */

  const rawOrbital =
    clamp01(
      quietness *
        0.40 +
      solitude *
        0.30 +
      fantasy *
        0.22 +
      hope *
        0.08 -
      chaos *
        0.30
    );


  /*
   * Star Field
   *
   * 広大
   * 静寂
   * 孤独
   */

  const rawStarField =
    clamp01(
      spaciousness *
        0.48 +
      quietness *
        0.28 +
      solitude *
        0.16 +
      fantasy *
        0.08
    );


  /*
   * Singularity
   *
   * 暗闇
   * 緊張
   * 混沌
   */

  const rawSingularity =
    clamp01(
      darkness *
        0.48 +
      tension *
        0.28 +
      chaos *
        0.16 +
      solitude *
        0.08
    );


  // ==========================================================
  // MORPHOLOGY ACTIVATION
  // ==========================================================

  /*
   * 中間値をかなり削り、
   * DNAによる見た目の差を強くする。
   */

  const spiralStrength =
    smoothstep(
      0.48,
      0.77,
      rawSpiral
    );


  const orbitalStrength =
    smoothstep(
      0.47,
      0.74,
      rawOrbital
    );


  const starFieldStrength =
    smoothstep(
      0.40,
      0.70,
      rawStarField
    );


  const singularityStrength =
    smoothstep(
      0.51,
      0.78,
      rawSingularity
    );


  // ==========================================================
  // PRIMARY MORPHOLOGY
  // ==========================================================

  /*
   * 一番強い形態を少し強調する。
   *
   * 「全部同じくらい見える」
   * 状態を避ける。
   */

  const morphologyMax =
    Math.max(
      spiralStrength,
      orbitalStrength,
      starFieldStrength,
      singularityStrength
    );


  const primaryBoost = 0.20;


  const spiralVisual =
    clamp01(
      spiralStrength +
      (
        spiralStrength ===
        morphologyMax
          ? primaryBoost
          : 0
      )
    );


  const orbitalVisual =
    clamp01(
      orbitalStrength +
      (
        orbitalStrength ===
        morphologyMax
          ? primaryBoost
          : 0
      )
    );


  const starFieldVisual =
    clamp01(
      starFieldStrength +
      (
        starFieldStrength ===
        morphologyMax
          ? primaryBoost
          : 0
      )
    );


  const singularityVisual =
    clamp01(
      singularityStrength +
      (
        singularityStrength ===
        morphologyMax
          ? primaryBoost
          : 0
      )
    );


  // ==========================================================
  // COMPOSITION
  // ==========================================================

  /*
   * solitude
   * → 主役を小さくする
   * → 大きな余白
   */

  const subjectScale =
    1.08 -
    solitude *
      0.30 +
    spaciousness *
      0.10;


  /*
   * hope
   * → 上方向へ
   */

  const subjectY =
    (
      hope -
      0.5
    ) *
    0.72;


  /*
   * chaos
   * → 中央から外す
   */

  const subjectX =
    (
      chaos -
      0.5
    ) *
    0.95;


  /*
   * tension
   * → 少し奥へ
   */

  const subjectZ =
    (
      tension -
      0.5
    ) *
    -0.5;


  // ==========================================================
  // SPIRAL GEOMETRY
  // ==========================================================

  const geometryData =
    useMemo(
      () => {

        const random =
          createSeededRandom(
            12457
          );


        const count =
          8500;


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

          const i3 =
            i * 3;


          /*
           * 4-arm spiral
           *
           * 5本より少し
           * 自然な銀河形状へ変更
           */

          const arm =
            i % 4;


          const armAngle =
            (
              arm /
              4
            ) *
            Math.PI *
            2;


          const normalizedRadius =
            Math.pow(
              random(),
              0.72
            );


          const radius =
            normalizedRadius *
            11.5;


          const spiral =
            radius *
            0.82;


          /*
           * 外側ほど広げる
           */

          const spread =
            0.35 +
            radius *
              0.075;


          const jitter =
            (
              random() -
              0.5
            ) *
            spread;


          const angle =
            armAngle +
            spiral +
            jitter;


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
            (
              random() -
              0.5
            ) *
            (
              0.12 +
              radius *
                0.04
            );


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


          /*
           * 大部分は小粒
           * 一部だけ大きくする
           */

          const bright =
            random();


          sizes[
            i
          ] =
            bright >
            0.96
              ? 2.2 +
                random() *
                  1.8
              : 0.45 +
                random() *
                  1.25;
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
  // DEEP STAR FIELD
  // ==========================================================

  const starFieldData =
    useMemo(
      () => {

        const random =
          createSeededRandom(
            92831
          );


        const count =
          1800;


        const positions =
          new Float32Array(
            count * 3
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
            38;


          positions[
            i3 + 1
          ] =
            (
              random() -
              0.5
            ) *
            22;


          positions[
            i3 + 2
          ] =
            -5 -
            random() *
              30;
        }


        return {
          positions,
        };
      },
      []
    );


  // ==========================================================
  // FOREGROUND STARS
  // ==========================================================

  const foregroundStars =
    useMemo(
      () => {

        const random =
          createSeededRandom(
            38291
          );


        const count =
          180;


        const positions =
          new Float32Array(
            count * 3
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
            12;


          positions[
            i3 + 2
          ] =
            2 -
            random() *
              9;
        }


        return {
          positions,
        };
      },
      []
    );


  // ==========================================================
  // GALAXY SHADER
  // ==========================================================

  const shader =
    useMemo(
      () => ({
        uniforms: {

          uTime: {
            value: 0,
          },

          uFantasy: {
            value: fantasy,
          },

          uSpaciousness: {
            value:
              spaciousness,
          },

          uSpeed: {
            value: speed,
          },

          uDarkness: {
            value:
              darkness,
          },

          uWarmth: {
            value: warmth,
          },

          uChaos: {
            value: chaos,
          },

          uSolitude: {
            value:
              solitude,
          },

          uHope: {
            value: hope,
          },

          uStrength: {
            value: 0,
          },
        },


        // ====================================================
        // VERTEX SHADER
        // ====================================================

        vertexShader: `
          uniform float uTime;
          uniform float uFantasy;
          uniform float uSpaciousness;
          uniform float uSpeed;
          uniform float uChaos;
          uniform float uSolitude;
          uniform float uHope;

          attribute float aRandom;
          attribute float aSize;

          varying float vRandom;
          varying float vBrightness;
          varying float vRadius;


          void main() {

            vec3 pos =
              position;


            float radius =
              length(
                pos.xz
              );


            vRadius =
              radius;

            vRandom =
              aRandom;


            /*
             * Differential rotation
             */

            float time =
              uTime *
              (
                0.035 +
                uSpeed *
                  0.19
              );


            float rotation =
              time *
              (
                0.15 +
                radius *
                  0.017
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
             * Vertical breathing
             */

            pos.y +=
              sin(
                radius *
                  0.65 +
                uTime *
                  0.30 +
                aRandom *
                  6.283
              ) *
              uFantasy *
              0.26;


            /*
             * Chaos deformation
             */

            pos.x +=
              sin(
                pos.z *
                  0.55 +
                uTime *
                  0.48 +
                aRandom *
                  9.0
              ) *
              uChaos *
              0.16;


            pos.z +=
              cos(
                pos.x *
                  0.50 +
                uTime *
                  0.42 +
                aRandom *
                  7.0
              ) *
              uChaos *
              0.16;


            /*
             * Scale
             */

            float worldScale =
              0.60 +
              uSpaciousness *
                0.88;


            pos.xz *=
              worldScale;


            /*
             * Solitude
             * slight radial expansion
             */

            pos.xz *=
              0.88 +
              uSolitude *
                0.30;


            /*
             * Twinkle
             */

            float twinkle =
              sin(
                uTime *
                  (
                    0.55 +
                    aRandom *
                      1.6
                  ) +
                aRandom *
                  27.0
              ) *
              0.5 +
              0.5;


            vBrightness =
              0.40 +
              twinkle *
                (
                  0.24 +
                  uFantasy *
                    0.32
                );


            vec4 mvPosition =
              modelViewMatrix *
              vec4(
                pos,
                1.0
              );


            float pointSize =
              aSize *
              (
                1.15 +
                uFantasy *
                  1.65 +
                uHope *
                  0.55
              );


            gl_PointSize =
              pointSize *
              (
                80.0 /
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


        // ====================================================
        // FRAGMENT SHADER
        // ====================================================

        fragmentShader: `
          uniform float uDarkness;
          uniform float uWarmth;
          uniform float uHope;
          uniform float uFantasy;
          uniform float uStrength;

          varying float vRandom;
          varying float vBrightness;
          varying float vRadius;


          void main() {

            vec2 uv =
              gl_PointCoord -
              vec2(
                0.5
              );


            float dist =
              length(
                uv
              );


            if (
              dist >
              0.5
            ) {
              discard;
            }


            /*
             * soft star
             */

            float core =
              1.0 -
              smoothstep(
                0.0,
                0.22,
                dist
              );


            float glow =
              1.0 -
              smoothstep(
                0.04,
                0.5,
                dist
              );


            /*
             * palette
             */

            vec3 deepBlue =
              vec3(
                0.18,
                0.36,
                0.92
              );


            vec3 iceBlue =
              vec3(
                0.42,
                0.80,
                1.0
              );


            vec3 warmColor =
              vec3(
                1.0,
                0.58,
                0.30
              );


            vec3 color =
              mix(
                deepBlue,
                iceBlue,
                uFantasy *
                  0.58
              );


            color =
              mix(
                color,
                warmColor,
                uWarmth *
                  0.48
              );


            color =
              mix(
                color,
                vec3(
                  1.0
                ),
                uHope *
                  0.22
              );


            /*
             * core luminosity
             */

            float centerGlow =
              1.0 /
              (
                1.0 +
                vRadius *
                  0.11
              );


            float brightness =
              vBrightness *
                0.56 +
              centerGlow *
                (
                  0.18 +
                  uHope *
                    0.26
                );


            /*
             * rare stars
             */

            float rareStar =
              smoothstep(
                0.965,
                1.0,
                vRandom
              );


            brightness +=
              rareStar *
              1.25;


            /*
             * HDR for Bloom
             */

            vec3 finalColor =
              color *
              brightness *
              (
                0.42 +
                uFantasy *
                  0.34
              );


            float alpha =
              (
                core *
                  0.78 +
                glow *
                  0.24
              ) *
              uStrength *
              (
                1.0 -
                uDarkness *
                  0.30
              );


            gl_FragColor =
              vec4(
                finalColor,
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


      // ======================================================
      // ROOT / COMPOSITION
      // ======================================================

      if (
        rootRef.current
      ) {

        /*
         * 呼吸するような
         * ごく弱い浮遊
         */

        rootRef.current.position.y =
          subjectY +
          Math.sin(
            t *
              0.08
          ) *
            0.035;


        rootRef.current.position.x =
          subjectX +
          Math.sin(
            t *
              0.045
          ) *
            chaos *
            0.08;


        rootRef.current.position.z =
          subjectZ;


        const breathing =
          1 +
          Math.sin(
            t *
              0.06
          ) *
            0.015;


        rootRef.current.scale.setScalar(
          subjectScale *
          breathing
        );
      }


      // ======================================================
      // SHADER
      // ======================================================

      if (
        materialRef.current
      ) {

        const uniforms =
          materialRef.current
            .uniforms;


        uniforms.uTime.value =
          t;


        uniforms.uFantasy.value =
          fantasy;


        uniforms.uSpaciousness.value =
          spaciousness;


        uniforms.uSpeed.value =
          speed;


        uniforms.uDarkness.value =
          darkness;


        uniforms.uWarmth.value =
          warmth;


        uniforms.uChaos.value =
          chaos;


        uniforms.uSolitude.value =
          solitude;


        uniforms.uHope.value =
          hope;


        uniforms.uStrength.value =
          galaxyStrength *
          spiralVisual;
      }


      // ======================================================
      // SPIRAL
      // ======================================================

      if (
        spiralRef.current
      ) {

        spiralRef.current.rotation.y +=
          delta *
          (
            0.001 +
            speed *
              0.004
          );


        spiralRef.current.rotation.z =
          Math.sin(
            t *
              0.018
          ) *
          (
            0.015 +
            chaos *
              0.035
          );
      }


      // ======================================================
      // DEEP STARS
      // ======================================================

      if (
        deepStarsRef.current
      ) {

        deepStarsRef.current.rotation.y =
          Math.sin(
            t *
              0.012
          ) *
          0.018;


        deepStarsRef.current.position.x =
          Math.sin(
            t *
              0.02
          ) *
          0.10;
      }


      // ======================================================
      // FOREGROUND PARALLAX
      // ======================================================

      if (
        foregroundStarsRef.current
      ) {

        foregroundStarsRef.current.position.x =
          Math.sin(
            t *
              0.035
          ) *
          0.16;


        foregroundStarsRef.current.position.y =
          Math.cos(
            t *
              0.026
          ) *
          0.08;
      }


      // ======================================================
      // ORBITALS
      // ======================================================

      if (
        orbitalGroupRef.current
      ) {

        orbitalGroupRef.current.rotation.y +=
          delta *
          (
            0.008 +
            speed *
              0.018
          );


        orbitalGroupRef.current.rotation.x =
          0.60 +
          Math.sin(
            t *
              0.07
          ) *
          0.075;
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
                0.28 +
                tension *
                  0.55
              )
          ) *
          (
            0.012 +
            tension *
              0.025
          );


        singularityRef.current.scale.setScalar(
          pulse
        );


        singularityRef.current.rotation.z +=
          delta *
          (
            0.006 +
            chaos *
              0.015
          );
      }
    }
  );


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <group
      ref={rootRef}
    >

      {/* ===================================================== */}
      {/* DEEP STAR FIELD                                       */}
      {/* ===================================================== */}

      <points
        ref={deepStarsRef}
      >

        <bufferGeometry>

          <bufferAttribute
            attach="attributes-position"
            args={[
              starFieldData.positions,
              3,
            ]}
          />

        </bufferGeometry>


        <pointsMaterial
          size={
            0.018 +
            fantasy *
              0.013
          }
          transparent
          opacity={
            galaxyStrength *
            starFieldVisual *
            0.46
          }
          depthWrite={false}
          blending={
            THREE.AdditiveBlending
          }
          color={
            new THREE.Color(
              0.34,
              0.56,
              1.0
            )
          }
          toneMapped={false}
          sizeAttenuation
        />

      </points>


      {/* ===================================================== */}
      {/* FOREGROUND STARS                                      */}
      {/* ===================================================== */}

      <points
        ref={
          foregroundStarsRef
        }
      >

        <bufferGeometry>

          <bufferAttribute
            attach="attributes-position"
            args={[
              foregroundStars.positions,
              3,
            ]}
          />

        </bufferGeometry>


        <pointsMaterial
          size={
            0.028 +
            fantasy *
              0.018
          }
          transparent
          opacity={
            galaxyStrength *
            starFieldVisual *
            0.20
          }
          depthWrite={false}
          blending={
            THREE.AdditiveBlending
          }
          color={
            new THREE.Color(
              0.70,
              0.84,
              1.0
            )
          }
          toneMapped={false}
          sizeAttenuation
        />

      </points>


      {/* ===================================================== */}
      {/* SPIRAL GALAXY                                         */}
      {/* ===================================================== */}

      <points
        ref={spiralRef}
        rotation={[
          0.18,
          0,
          -0.12,
        ]}
      >

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
            attach="attributes-aSize"
            args={[
              geometryData.sizes,
              1,
            ]}
          />

        </bufferGeometry>


        <shaderMaterial
          ref={materialRef}
          args={[
            shader,
          ]}
          transparent
          depthWrite={false}
          blending={
            THREE.AdditiveBlending
          }
          vertexColors={false}
          toneMapped={false}
        />

      </points>


      {/* ===================================================== */}
      {/* ORBITAL SYSTEM                                        */}
      {/* ===================================================== */}

      <group
        ref={orbitalGroupRef}
        scale={
          0.64 +
          spaciousness *
            0.72
        }
      >

        {/* PRIMARY ORBIT */}

        <mesh
          rotation={[
            Math.PI *
              0.5,
            0,
            0,
          ]}
        >

          <ringGeometry
            args={[
              2.55,
              2.575,
              256,
            ]}
          />


          <meshBasicMaterial
            transparent
            opacity={
              galaxyStrength *
              orbitalVisual *
              0.30
            }
            depthWrite={false}
            blending={
              THREE.AdditiveBlending
            }
            color={
              new THREE.Color(
                0.26,
                0.54,
                1.0
              )
            }
            side={
              THREE.DoubleSide
            }
            toneMapped={false}
          />

        </mesh>


        {/* SECOND ORBIT */}

        <mesh
          rotation={[
            Math.PI *
              0.36,
            0.70,
            0.52,
          ]}
          scale={1.30}
        >

          <ringGeometry
            args={[
              2.55,
              2.568,
              256,
            ]}
          />


          <meshBasicMaterial
            transparent
            opacity={
              galaxyStrength *
              orbitalVisual *
              0.13
            }
            depthWrite={false}
            blending={
              THREE.AdditiveBlending
            }
            color={
              new THREE.Color(
                0.44,
                0.70,
                1.0
              )
            }
            side={
              THREE.DoubleSide
            }
            toneMapped={false}
          />

        </mesh>


        {/* THIRD ORBIT */}

        <mesh
          rotation={[
            Math.PI *
              0.64,
            -0.62,
            -0.42,
          ]}
          scale={0.77}
        >

          <ringGeometry
            args={[
              2.55,
              2.565,
              256,
            ]}
          />


          <meshBasicMaterial
            transparent
            opacity={
              galaxyStrength *
              orbitalVisual *
              0.085
            }
            depthWrite={false}
            blending={
              THREE.AdditiveBlending
            }
            color={
              new THREE.Color(
                0.70,
                0.84,
                1.0
              )
            }
            side={
              THREE.DoubleSide
            }
            toneMapped={false}
          />

        </mesh>

      </group>


      {/* ===================================================== */}
      {/* SINGULARITY                                           */}
      {/* ===================================================== */}

      <group
        ref={
          singularityRef
        }
      >

        {/* BLACK CORE */}

        <mesh
          scale={
            0.34 +
            singularityVisual *
              0.46
          }
        >

          <sphereGeometry
            args={[
              0.68,
              48,
              48,
            ]}
          />


          <meshBasicMaterial
            color={
              new THREE.Color(
                0.001,
                0.002,
                0.008
              )
            }
            transparent
            opacity={
              galaxyStrength *
              singularityVisual *
              0.96
            }
            depthWrite
          />

        </mesh>


        {/* INNER HALO */}

        <mesh
          scale={
            0.60 +
            singularityVisual *
              0.74
          }
        >

          <sphereGeometry
            args={[
              0.74,
              48,
              48,
            ]}
          />


          <meshBasicMaterial
            color={
              new THREE.Color(
                0.10,
                0.30,
                1.0
              )
            }
            transparent
            opacity={
              galaxyStrength *
              singularityVisual *
              0.065
            }
            depthWrite={false}
            blending={
              THREE.AdditiveBlending
            }
            side={
              THREE.BackSide
            }
            toneMapped={false}
          />

        </mesh>


        {/* ACCRETION DISK 1 */}

        <mesh
          rotation={[
            Math.PI *
              0.52,
            0,
            chaos *
              0.38,
          ]}
          scale={
            0.42 +
            singularityVisual *
              0.86
          }
        >

          <ringGeometry
            args={[
              0.90,
              1.08,
              192,
            ]}
          />


          <meshBasicMaterial
            transparent
            opacity={
              galaxyStrength *
              singularityVisual *
              0.25
            }
            depthWrite={false}
            blending={
              THREE.AdditiveBlending
            }
            color={
              new THREE.Color(
                0.30,
                0.56,
                1.0
              )
            }
            side={
              THREE.DoubleSide
            }
            toneMapped={false}
          />

        </mesh>


        {/* ACCRETION DISK 2 */}

        <mesh
          rotation={[
            Math.PI *
              0.49,
            0.08,
            -0.18,
          ]}
          scale={
            0.52 +
            singularityVisual *
              1.05
          }
        >

          <ringGeometry
            args={[
              0.95,
              1.00,
              192,
            ]}
          />


          <meshBasicMaterial
            transparent
            opacity={
              galaxyStrength *
              singularityVisual *
              0.11
            }
            depthWrite={false}
            blending={
              THREE.AdditiveBlending
            }
            color={
              new THREE.Color(
                0.62,
                0.78,
                1.0
              )
            }
            side={
              THREE.DoubleSide
            }
            toneMapped={false}
          />

        </mesh>

      </group>

    </group>
  );
}