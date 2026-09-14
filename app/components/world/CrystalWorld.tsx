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
// CRYSTAL WORLD
// ============================================================

export default function CrystalWorld({
  mix = 1,

  tension = 0.5,
  fantasy = 0.5,
  chaos = 0.5,
  warmth = 0.5,
  hope = 0.5,
  spaciousness = 0.5,
  speed = 0.4,

  quietness = 0.5,
  solitude = 0.5,
  darkness = 0.5,

}: World3DProps) {

  // ==========================================================
  // REFS
  // ==========================================================

  const rootRef =
    useRef<THREE.Group>(
      null
    );


  const shardGroupRef =
    useRef<THREE.Group>(
      null
    );


  const latticeRef =
    useRef<THREE.LineSegments>(
      null
    );


  const latticeMaterialRef =
    useRef<THREE.ShaderMaterial>(
      null
    );


  const monolithRef =
    useRef<THREE.Group>(
      null
    );


  const fieldRef =
    useRef<THREE.Points>(
      null
    );


  const fieldMaterialRef =
    useRef<THREE.ShaderMaterial>(
      null
    );


  // ==========================================================
  // BASE WORLD STRENGTH
  // ==========================================================

  const crystalStrength =
    clamp01(
      getCrystalStrength(
        tension,
        fantasy,
        chaos
      ) *
      mix
    );


  // ==========================================================
  // MORPHOLOGY SCORES
  // ==========================================================

  /*
   * SHARDS
   *
   * tension + chaos
   * → 割れた破片
   */

  const rawShard =
    clamp01(
      tension * 0.36 +
      chaos * 0.30 +
      fantasy * 0.20 +
      speed * 0.14
    );


  /*
   * LATTICE
   *
   * quietness + spaciousness
   * → 数学的な格子
   */

  const rawLattice =
    clamp01(
      quietness * 0.34 +
      spaciousness * 0.28 +
      fantasy * 0.18 +
      tension * 0.12 +
      hope * 0.08
    );


  /*
   * MONOLITH
   *
   * solitude + tension + darkness
   * → 巨大な単一構造
   */

  const rawMonolith =
    clamp01(
      solitude * 0.34 +
      tension * 0.26 +
      darkness * 0.22 +
      quietness * 0.10 +
      fantasy * 0.08
    );


  /*
   * GEOMETRIC FIELD
   *
   * fantasy + spaciousness
   * → 無数の幾何学粒子
   */

  const rawField =
    clamp01(
      fantasy * 0.34 +
      spaciousness * 0.28 +
      chaos * 0.18 +
      hope * 0.12 +
      speed * 0.08
    );


  // ==========================================================
  // ACTIVATION
  // ==========================================================

  const shardStrength =
    smoothstep(
      0.47,
      0.76,
      rawShard
    );


  const latticeStrength =
    smoothstep(
      0.44,
      0.73,
      rawLattice
    );


  const monolithStrength =
    smoothstep(
      0.48,
      0.77,
      rawMonolith
    );


  const fieldStrength =
    smoothstep(
      0.45,
      0.74,
      rawField
    );


  // ==========================================================
  // PRIMARY MORPHOLOGY
  // ==========================================================

  const morphologyMax =
    Math.max(
      shardStrength,
      latticeStrength,
      monolithStrength,
      fieldStrength
    );


  const boost =
    0.18;


  const shardVisual =
    clamp01(
      shardStrength +
      (
        shardStrength ===
        morphologyMax
          ? boost
          : 0
      )
    );


  const latticeVisual =
    clamp01(
      latticeStrength +
      (
        latticeStrength ===
        morphologyMax
          ? boost
          : 0
      )
    );


  const monolithVisual =
    clamp01(
      monolithStrength +
      (
        monolithStrength ===
        morphologyMax
          ? boost
          : 0
      )
    );


  const fieldVisual =
    clamp01(
      fieldStrength +
      (
        fieldStrength ===
        morphologyMax
          ? boost
          : 0
      )
    );


  // ==========================================================
  // COMPOSITION
  // ==========================================================

  const subjectScale =
    0.76 +
    spaciousness *
      0.44 -
    solitude *
      0.10;


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
    0.55;


  const subjectZ =
    (
      darkness -
      0.5
    ) *
    -0.45;


  // ==========================================================
  // SHARDS DATA
  // ==========================================================

  const crystals =
    useMemo(
      () => {

        const random =
          createSeededRandom(
            28491
          );


        const count =
          34;


        return Array.from(
          {
            length:
              count,
          },
          (
            _,
            index
          ) => {

            const angle =
              random() *
              Math.PI *
              2;


            const radius =
              1.0 +
              random() *
              5.5;


            const y =
              (
                random() -
                0.5
              ) *
              5.2;


            const scale =
              0.18 +
              random() *
              0.58;


            const stretch =
              1.4 +
              random() *
              3.2;


            return {

              id:
                index,


              position: [
                Math.cos(
                  angle
                ) *
                radius,

                y,

                Math.sin(
                  angle
                ) *
                radius,

              ] as [
                number,
                number,
                number
              ],


              rotation: [
                random() *
                  Math.PI,

                random() *
                  Math.PI,

                random() *
                  Math.PI,

              ] as [
                number,
                number,
                number
              ],


              scale,

              stretch,


              phase:
                random() *
                Math.PI *
                2,


              random:
                random(),

            };
          }
        );
      },
      []
    );


  // ==========================================================
  // LATTICE GEOMETRY
  // ==========================================================

  const latticeData =
    useMemo(
      () => {

        const size =
          4;


        const spacing =
          1.25;


        const points:
          number[] =
          [];


        /*
         * 3D grid edges
         */

        for (
          let x = -size;
          x <= size;
          x++
        ) {

          for (
            let y = -size;
            y <= size;
            y++
          ) {

            for (
              let z = -size;
              z <= size;
              z++
            ) {

              const px =
                x *
                spacing;

              const py =
                y *
                spacing;

              const pz =
                z *
                spacing;


              if (
                x <
                size
              ) {

                points.push(
                  px,
                  py,
                  pz,

                  px +
                    spacing,
                  py,
                  pz
                );
              }


              if (
                y <
                size
              ) {

                points.push(
                  px,
                  py,
                  pz,

                  px,
                  py +
                    spacing,
                  pz
                );
              }


              if (
                z <
                size
              ) {

                points.push(
                  px,
                  py,
                  pz,

                  px,
                  py,
                  pz +
                    spacing
                );
              }
            }
          }
        }


        return {
          positions:
            new Float32Array(
              points
            ),
        };
      },
      []
    );


  // ==========================================================
  // GEOMETRIC FIELD
  // ==========================================================

  const fieldData =
    useMemo(
      () => {

        const random =
          createSeededRandom(
            91027
          );


        const count =
          1600;


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


          const radius =
            Math.pow(
              random(),
              0.65
            ) *
            8;


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


          positions[
            i3
          ] =
            radius *
            Math.sin(
              phi
            ) *
            Math.cos(
              theta
            );


          positions[
            i3 + 1
          ] =
            radius *
            Math.cos(
              phi
            );


          positions[
            i3 + 2
          ] =
            radius *
            Math.sin(
              phi
            ) *
            Math.sin(
              theta
            );


          randoms[
            i
          ] =
            random();


          sizes[
            i
          ] =
            0.5 +
            random() *
            1.5;
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
  // LATTICE SHADER
  // ==========================================================

  const latticeShader =
    useMemo(
      () => ({

        uniforms: {

          uTime: {
            value: 0,
          },

          uFantasy: {
            value:
              fantasy,
          },

          uTension: {
            value:
              tension,
          },

          uChaos: {
            value:
              chaos,
          },

          uStrength: {
            value: 0,
          },

        },


        vertexShader: `
          uniform float uTime;
          uniform float uFantasy;
          uniform float uTension;
          uniform float uChaos;

          varying float vDistance;


          void main() {

            vec3 pos =
              position;


            float d =
              length(
                pos
              );


            float pulse =
              sin(
                d *
                  1.2 -
                uTime *
                  (
                    0.15 +
                    uTension *
                      0.45
                  )
              );


            pos +=
              normalize(
                pos +
                vec3(
                  0.001
                )
              ) *
              pulse *
              uFantasy *
              0.12;


            pos.x +=
              sin(
                pos.y *
                  0.8 +
                uTime *
                  0.25
              ) *
              uChaos *
              0.08;


            vDistance =
              d;


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
          uniform float uStrength;

          varying float vDistance;


          void main() {

            vec3 blue =
              vec3(
                0.18,
                0.46,
                1.0
              );


            vec3 violet =
              vec3(
                0.55,
                0.34,
                1.0
              );


            vec3 color =
              mix(
                blue,
                violet,
                uFantasy *
                  0.55
              );


            float fade =
              1.0 /
              (
                1.0 +
                vDistance *
                  0.10
              );


            float alpha =
              uStrength *
              fade *
              0.18;


            gl_FragColor =
              vec4(
                color *
                (
                  0.45 +
                  fade *
                    0.55
                ),
                alpha
              );
          }
        `,

      }),
      []
    );


  // ==========================================================
  // FIELD SHADER
  // ==========================================================

  const fieldShader =
    useMemo(
      () => ({

        uniforms: {

          uTime: {
            value: 0,
          },

          uFantasy: {
            value:
              fantasy,
          },

          uChaos: {
            value:
              chaos,
          },

          uSpeed: {
            value:
              speed,
          },

          uHope: {
            value:
              hope,
          },

          uWarmth: {
            value:
              warmth,
          },

          uStrength: {
            value: 0,
          },

        },


        vertexShader: `
          uniform float uTime;
          uniform float uFantasy;
          uniform float uChaos;
          uniform float uSpeed;

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
                0.12 +
                uSpeed *
                  0.55
              );


            float rotation =
              t *
              (
                0.05 +
                radius *
                  0.01
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


            pos +=
              normalize(
                pos +
                vec3(
                  0.001
                )
              ) *
              sin(
                t *
                  1.2 +
                aRandom *
                  20.0
              ) *
              uChaos *
              0.10;


            pos.y +=
              sin(
                pos.x *
                  0.9 +
                pos.z *
                  0.7 +
                t
              ) *
              uFantasy *
              0.14;


            float pulse =
              sin(
                t *
                  2.0 +
                aRandom *
                  16.0
              ) *
              0.5 +
              0.5;


            vec4 mvPosition =
              modelViewMatrix *
              vec4(
                pos,
                1.0
              );


            gl_PointSize =
              aSize *
              (
                1.0 +
                pulse *
                  2.4
              ) *
              (
                70.0 /
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
                0.28,
                0.54,
                1.0
              );


            vec3 violet =
              vec3(
                0.62,
                0.38,
                1.0
              );


            vec3 warm =
              vec3(
                1.0,
                0.55,
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
                  0.30
              );


            color =
              mix(
                color,
                vec3(
                  1.0
                ),
                uHope *
                  0.16
              );


            float flash =
              smoothstep(
                0.78,
                1.0,
                vPulse
              );


            float alpha =
              glow *
              (
                0.05 +
                flash *
                  0.55
              ) *
              uStrength;


            gl_FragColor =
              vec4(
                color *
                (
                  0.40 +
                  flash *
                    1.30
                ),
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
            0.07;


        rootRef.current.position.y =
          subjectY +
          Math.sin(
            t *
              0.055
          ) *
            0.05;


        rootRef.current.position.z =
          subjectZ;


        const pulse =
          1 +
          Math.sin(
            t *
              0.06
          ) *
          0.012;


        rootRef.current.scale.setScalar(
          subjectScale *
          pulse
        );
      }


      // ======================================================
      // SHARDS
      // ======================================================

      if (
        shardGroupRef.current
      ) {

        shardGroupRef.current.rotation.y +=
          delta *
          (
            0.008 +
            speed *
              0.020
          );


        shardGroupRef.current.rotation.x =
          Math.sin(
            t *
              0.07
          ) *
          0.07;
      }


      // ======================================================
      // LATTICE
      // ======================================================

      if (
        latticeMaterialRef.current
      ) {

        const u =
          latticeMaterialRef.current
            .uniforms;


        u.uTime.value =
          t;


        u.uFantasy.value =
          fantasy;


        u.uTension.value =
          tension;


        u.uChaos.value =
          chaos;


        u.uStrength.value =
          crystalStrength *
          latticeVisual;
      }


      if (
        latticeRef.current
      ) {

        latticeRef.current.rotation.y +=
          delta *
          (
            0.002 +
            speed *
              0.006
          );


        latticeRef.current.rotation.x =
          Math.sin(
            t *
              0.025
          ) *
          0.16;
      }


      // ======================================================
      // MONOLITH
      // ======================================================

      if (
        monolithRef.current
      ) {

        monolithRef.current.rotation.y =
          Math.sin(
            t *
              0.045
          ) *
          (
            0.08 +
            chaos *
              0.12
          );


        const monolithPulse =
          1 +
          Math.sin(
            t *
            (
              0.20 +
              tension *
                0.70
            )
          ) *
          (
            0.008 +
            tension *
              0.025
          );


        monolithRef.current.scale.setScalar(
          monolithPulse
        );
      }


      // ======================================================
      // FIELD
      // ======================================================

      if (
        fieldMaterialRef.current
      ) {

        const u =
          fieldMaterialRef.current
            .uniforms;


        u.uTime.value =
          t;


        u.uFantasy.value =
          fantasy;


        u.uChaos.value =
          chaos;


        u.uSpeed.value =
          speed;


        u.uHope.value =
          hope;


        u.uWarmth.value =
          warmth;


        u.uStrength.value =
          crystalStrength *
          fieldVisual;
      }


      if (
        fieldRef.current
      ) {

        fieldRef.current.rotation.y -=
          delta *
          (
            0.001 +
            speed *
              0.005
          );
      }
    }
  );


  // ==========================================================
  // HIDE
  // ==========================================================

  if (
    crystalStrength <=
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
      {/* SHARDS                                                */}
      {/* ===================================================== */}

      <group
        ref={shardGroupRef}
      >

        {crystals.map(
          (
            crystal
          ) => (

            <CrystalShard
              key={
                crystal.id
              }

              position={
                crystal.position
              }

              rotation={
                crystal.rotation
              }

              scale={
                crystal.scale
              }

              stretch={
                crystal.stretch
              }

              phase={
                crystal.phase
              }

              random={
                crystal.random
              }

              tension={
                tension
              }

              fantasy={
                fantasy
              }

              chaos={
                chaos
              }

              warmth={
                warmth
              }

              hope={
                hope
              }

              speed={
                speed
              }

              strength={
                crystalStrength *
                shardVisual
              }
            />

          )
        )}

      </group>


      {/* ===================================================== */}
      {/* LATTICE                                               */}
      {/* ===================================================== */}

      <lineSegments
        ref={latticeRef}
        scale={
          0.52 +
          spaciousness *
            0.30
        }
      >

        <bufferGeometry>

          <bufferAttribute
            attach="attributes-position"
            args={[
              latticeData.positions,
              3,
            ]}
          />

        </bufferGeometry>


        <shaderMaterial
          ref={
            latticeMaterialRef
          }
          args={[
            latticeShader,
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
      {/* MONOLITH                                              */}
      {/* ===================================================== */}

      <group
        ref={monolithRef}
      >

        <mesh
          scale={[
            0.52 +
              monolithVisual *
                0.24,

            1.5 +
              monolithVisual *
                2.5,

            0.52 +
              monolithVisual *
                0.24,
          ]}
        >

          <octahedronGeometry
            args={[
              1,
              1,
            ]}
          />


          <meshBasicMaterial
            color={
              new THREE.Color(
                0.05,
                0.10,
                0.22
              )
            }
            transparent
            opacity={
              crystalStrength *
              monolithVisual *
              0.34
            }
            depthWrite={false}
          />

        </mesh>


        {/* MONOLITH OUTLINE */}

        <mesh
          scale={[
            0.60 +
              monolithVisual *
                0.30,

            1.65 +
              monolithVisual *
                2.7,

            0.60 +
              monolithVisual *
                0.30,
          ]}
        >

          <octahedronGeometry
            args={[
              1,
              1,
            ]}
          />


          <meshBasicMaterial
            color={
              new THREE.Color(
                0.34,
                0.56,
                1.0
              )
            }
            wireframe
            transparent
            opacity={
              crystalStrength *
              monolithVisual *
              0.13
            }
            depthWrite={false}
            blending={
              THREE.AdditiveBlending
            }
            toneMapped={false}
          />

        </mesh>


        {/* ENERGY CORE */}

        <mesh
          scale={
            0.28 +
            monolithVisual *
              0.28
          }
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
                0.72,
                0.86,
                1.0
              )
            }
            transparent
            opacity={
              crystalStrength *
              monolithVisual *
              (
                0.08 +
                hope *
                  0.12
              )
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
      {/* GEOMETRIC FIELD                                       */}
      {/* ===================================================== */}

      <points
        ref={fieldRef}
      >

        <bufferGeometry>

          <bufferAttribute
            attach="attributes-position"
            args={[
              fieldData.positions,
              3,
            ]}
          />


          <bufferAttribute
            attach="attributes-aRandom"
            args={[
              fieldData.randoms,
              1,
            ]}
          />


          <bufferAttribute
            attach="attributes-aSize"
            args={[
              fieldData.sizes,
              1,
            ]}
          />

        </bufferGeometry>


        <shaderMaterial
          ref={
            fieldMaterialRef
          }
          args={[
            fieldShader,
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


// ============================================================
// CRYSTAL SHARD
// ============================================================

type CrystalShardProps = {

  position: [
    number,
    number,
    number
  ];

  rotation: [
    number,
    number,
    number
  ];

  scale: number;

  stretch: number;

  phase: number;

  random: number;

  tension: number;

  fantasy: number;

  chaos: number;

  warmth: number;

  hope: number;

  speed: number;

  strength: number;

};


// ============================================================
// SINGLE CRYSTAL SHARD
// ============================================================

function CrystalShard({
  position,
  rotation,
  scale,
  stretch,
  phase,
  random,
  tension,
  fantasy,
  chaos,
  warmth,
  hope,
  speed,
  strength,
}: CrystalShardProps) {

  const meshRef =
    useRef<THREE.Mesh>(
      null
    );


  const materialRef =
    useRef<THREE.ShaderMaterial>(
      null
    );


  // ==========================================================
  // SHADER
  // ==========================================================

  const shader =
    useMemo(
      () => ({

        uniforms: {

          uTime: {
            value: 0,
          },

          uTension: {
            value:
              tension,
          },

          uFantasy: {
            value:
              fantasy,
          },

          uChaos: {
            value:
              chaos,
          },

          uWarmth: {
            value:
              warmth,
          },

          uHope: {
            value:
              hope,
          },

          uStrength: {
            value:
              strength,
          },

          uPhase: {
            value:
              phase,
          },

          uRandom: {
            value:
              random,
          },

        },


        // ====================================================
        // VERTEX
        // ====================================================

        vertexShader: `
          uniform float uTime;
          uniform float uTension;
          uniform float uFantasy;
          uniform float uChaos;
          uniform float uPhase;
          uniform float uRandom;

          varying vec3 vNormal;
          varying vec3 vViewPosition;
          varying float vPulse;
          varying float vCrack;


          void main() {

            vec3 pos =
              position;


            float pulse =
              sin(
                uTime *
                (
                  0.45 +
                  uTension *
                    1.5
                ) +
                uPhase
              );


            pos +=
              normal *
              pulse *
              uTension *
              0.035;


            /*
             * fantasy surface
             */

            float fantasyWave =
              sin(
                pos.y *
                  3.0 +
                pos.x *
                  1.7 +
                uTime *
                  0.65 +
                uPhase
              );


            pos +=
              normal *
              fantasyWave *
              uFantasy *
              0.018;


            /*
             * chaos fracture
             */

            float crack =
              sin(
                pos.x *
                  7.0 +
                pos.y *
                  5.0 +
                pos.z *
                  4.0 +
                uTime *
                  0.8 +
                uRandom *
                  20.0
              );


            pos +=
              normal *
              crack *
              uChaos *
              0.014;


            vec4 mvPosition =
              modelViewMatrix *
              vec4(
                pos,
                1.0
              );


            vNormal =
              normalize(
                normalMatrix *
                normal
              );


            vViewPosition =
              -mvPosition.xyz;


            vPulse =
              pulse *
              0.5 +
              0.5;


            vCrack =
              crack;


            gl_Position =
              projectionMatrix *
              mvPosition;
          }
        `,


        // ====================================================
        // FRAGMENT
        // ====================================================

        fragmentShader: `
          uniform float uTension;
          uniform float uFantasy;
          uniform float uWarmth;
          uniform float uHope;
          uniform float uStrength;

          varying vec3 vNormal;
          varying vec3 vViewPosition;
          varying float vPulse;
          varying float vCrack;


          void main() {

            /*
             * Fresnel
             *
             * view-spaceで計算
             */

            vec3 viewDir =
              normalize(
                vViewPosition
              );


            float fresnel =
              1.0 -
              abs(
                dot(
                  normalize(
                    vNormal
                  ),
                  viewDir
                )
              );


            fresnel =
              pow(
                fresnel,
                2.4
              );


            vec3 cold =
              vec3(
                0.26,
                0.48,
                1.0
              );


            vec3 violet =
              vec3(
                0.58,
                0.32,
                1.0
              );


            vec3 warm =
              vec3(
                1.0,
                0.44,
                0.25
              );


            vec3 color =
              mix(
                cold,
                violet,
                uFantasy *
                  0.38
              );


            color =
              mix(
                color,
                warm,
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
                  0.16
              );


            float crack =
              smoothstep(
                0.72,
                1.0,
                vCrack
              );


            crack *=
              uTension *
              (
                0.25 +
                uFantasy *
                  0.40
              );


            float brightness =
              0.12 +
              fresnel *
                0.52 +
              vPulse *
                0.10 +
              crack *
                0.34;


            float alpha =
              (
                0.07 +
                fresnel *
                  0.42 +
                crack *
                  0.10
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
  // UPDATE
  // ==========================================================

  useFrame(
    (
      state,
      delta
    ) => {

      if (
        materialRef.current
      ) {

        const u =
          materialRef.current
            .uniforms;


        u.uTime.value =
          state.clock.elapsedTime;


        u.uTension.value =
          tension;


        u.uFantasy.value =
          fantasy;


        u.uChaos.value =
          chaos;


        u.uWarmth.value =
          warmth;


        u.uHope.value =
          hope;


        u.uStrength.value =
          strength;
      }


      if (
        meshRef.current
      ) {

        meshRef.current.rotation.y +=
          delta *
          (
            0.018 +
            speed *
              0.055 +
            random *
              0.010
          );


        meshRef.current.rotation.x +=
          delta *
          (
            0.003 +
            chaos *
              0.012
          );


        meshRef.current.position.y =
          position[1] +
          Math.sin(
            state.clock.elapsedTime *
              (
                0.15 +
                speed *
                  0.30
              ) +
            phase
          ) *
          (
            0.03 +
            fantasy *
              0.08
          );
      }
    }
  );


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <mesh
      ref={meshRef}

      position={position}

      rotation={rotation}

      scale={[
        scale,
        scale *
          stretch,
        scale,
      ]}
    >

      <octahedronGeometry
        args={[
          1,
          1,
        ]}
      />


      <shaderMaterial
        ref={materialRef}

        args={[
          shader,
        ]}

        transparent

        depthWrite={false}

        side={
          THREE.DoubleSide
        }

        blending={
          THREE.AdditiveBlending
        }

        toneMapped={false}
      />

    </mesh>
  );
}