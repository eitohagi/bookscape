"use client";

import {
  useMemo,
  useRef,
} from "react";

import {
  useFrame,
} from "@react-three/fiber";

import * as THREE from "three";

import type { World3DProps } from "./types";
import {
  getCrystalStrength,
} from "./strengths";

import {
  createSeededRandom,
} from "./random";


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
}: World3DProps) {
  const groupRef =
    useRef<THREE.Group>(null);

  const crystalStrength =
    getCrystalStrength(
      tension,
      fantasy,
      chaos
    )*mix;

  // =========================================================
  // CRYSTAL DATA
  // =========================================================

  const crystals =
    useMemo(() => {
      const random =
        createSeededRandom(
          28491
        );

      const count = 28;

      return Array.from(
        {
          length: count,
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
            1.2 +
            random() *
            (
              3.5 +
              spaciousness *
              3.5
            );

          const y =
            (
              random() -
              0.5
            ) *
            4.5;

          const scale =
            0.25 +
            random() *
            0.65;

          const stretch =
            1.3 +
            random() *
            2.8;

          return {
            id: index,

            position: [
              Math.cos(angle) *
                radius,

              y,

              Math.sin(angle) *
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
    }, [
      spaciousness,
    ]);

  // =========================================================
  // WORLD ANIMATION
  // =========================================================

  useFrame(
    (
      state,
      delta
    ) => {
      if (
        !groupRef.current
      ) {
        return;
      }

      groupRef.current
        .rotation.y +=
        delta *
        (
          0.01 +
          speed *
          0.025
        );

      groupRef.current
        .rotation.x =
        Math.sin(
          state.clock
            .elapsedTime *
            0.1
        ) *
        0.08;

      const pulse =
        0.75 +
        spaciousness *
        0.45 +
        Math.sin(
          state.clock
            .elapsedTime *
            (
              0.15 +
              speed *
              0.3
            )
        ) *
          tension *
          0.015;

      groupRef.current
        .scale
        .setScalar(
          pulse
        );
    }
  );

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <group
      ref={groupRef}
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
              crystalStrength
            }
          />
        )
      )}

      <CentralCrystal
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
          crystalStrength
        }
      />
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

  // =========================================================
  // SHADER
  // =========================================================

  const shader =
    useMemo(() => {
      return {
        uniforms: {
          uTime: {
            value: 0,
          },

          uTension: {
            value: tension,
          },

          uFantasy: {
            value: fantasy,
          },

          uChaos: {
            value: chaos,
          },

          uWarmth: {
            value: warmth,
          },

          uHope: {
            value: hope,
          },

          uStrength: {
            value: strength,
          },

          uPhase: {
            value: phase,
          },

          uRandom: {
            value: random,
          },
        },

        // ===================================================
        // VERTEX SHADER
        // ===================================================

        vertexShader: `
          uniform float uTime;
          uniform float uTension;
          uniform float uFantasy;
          uniform float uChaos;
          uniform float uPhase;
          uniform float uRandom;

          varying vec3 vNormal;
          varying vec3 vPosition;
          varying float vPulse;

          void main() {
            vec3 pos =
              position;

            float t =
              uTime;

            // -----------------------------------------------
            // tension
            // 結晶を内外に脈動
            // -----------------------------------------------

            float pulse =
              sin(
                t *
                (
                  0.8 +
                  uTension *
                  2.5
                ) +
                uPhase
              );

            pos +=
              normal *
              pulse *
              uTension *
              0.04;

            // -----------------------------------------------
            // fantasy
            // 結晶表面の波打ち
            // -----------------------------------------------

            float fantasyWave =
              sin(
                pos.y *
                3.0 +
                pos.x *
                1.8 +
                t *
                1.4 +
                uPhase
              );

            pos +=
              normal *
              fantasyWave *
              uFantasy *
              0.025;

            // -----------------------------------------------
            // chaos
            // 不規則な表面歪み
            // -----------------------------------------------

            float chaosWave =
              sin(
                pos.x *
                7.0 +
                pos.y *
                5.0 +
                pos.z *
                4.0 +
                t *
                2.0 +
                uRandom *
                20.0
              );

            pos +=
              normal *
              chaosWave *
              uChaos *
              0.018;

            vNormal =
              normalize(
                normalMatrix *
                normal
              );

            vPosition =
              pos;

            vPulse =
              pulse *
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

        // ===================================================
        // FRAGMENT SHADER
        // ===================================================

        fragmentShader: `
          uniform float uTension;
          uniform float uFantasy;
          uniform float uWarmth;
          uniform float uHope;
          uniform float uStrength;
          uniform float uTime;
          uniform float uPhase;

          varying vec3 vNormal;
          varying vec3 vPosition;
          varying float vPulse;

          void main() {
            // -----------------------------------------------
            // Fresnel
            // -----------------------------------------------

            vec3 viewDirection =
              normalize(
                cameraPosition -
                vPosition
              );

            float fresnel =
              1.0 -
              abs(
                dot(
                  normalize(
                    vNormal
                  ),
                  viewDirection
                )
              );

            fresnel =
              pow(
                fresnel,
                2.2
              );

            // -----------------------------------------------
            // Color
            // -----------------------------------------------

            vec3 cold =
              vec3(
                0.30,
                0.48,
                0.95
              );

            vec3 warm =
              vec3(
                0.95,
                0.42,
                0.28
              );

            vec3 color =
              mix(
                cold,
                warm,
                uWarmth
              );

            // fantasy → 紫
            color =
              mix(
                color,
                vec3(
                  0.48,
                  0.25,
                  0.85
                ),
                uFantasy *
                0.25
              );

            // hope → 白
            color =
              mix(
                color,
                vec3(
                  0.95,
                  0.98,
                  1.0
                ),
                uHope *
                0.18
              );

            // -----------------------------------------------
            // internal pulse
            // -----------------------------------------------

            float internalPulse =
              sin(
                uTime *
                (
                  1.0 +
                  uTension *
                  2.5
                ) +
                uPhase
              ) *
              0.5 +
              0.5;

            // -----------------------------------------------
            // fake crack pattern
            // -----------------------------------------------

            float crack =
              sin(
                vPosition.y *
                11.0 +
                vPosition.x *
                7.0 +
                uTime *
                0.8
              );

            crack =
              smoothstep(
                0.78,
                1.0,
                crack
              );

            crack *=
              uTension *
              (
                0.2 +
                uFantasy *
                0.5
              );

            // -----------------------------------------------
            // Final brightness
            // -----------------------------------------------

            float brightness =
              0.16 +
              fresnel *
              0.48 +
              vPulse *
              0.12;

            brightness +=
              crack *
              0.3;

            brightness +=
              internalPulse *
              uHope *
              0.08;

            /*
             * Bloom暴走防止
             */
            vec3 finalColor =
              color *
              brightness;

            float alpha =
              (
                0.10 +
                fresnel *
                0.45
              ) *
              (
                0.15 +
                uStrength *
                0.85
              );

            alpha +=
              crack *
              0.12;

            gl_FragColor =
              vec4(
                finalColor,
                alpha
              );
          }
        `,
      };
    }, []);

  // =========================================================
  // ANIMATION
  // =========================================================

  useFrame(
    (
      state,
      delta
    ) => {
      if (
        materialRef.current
      ) {
        const uniforms =
          materialRef
            .current
            .uniforms;

        uniforms.uTime.value =
          state.clock
            .elapsedTime;

        uniforms.uTension.value =
          tension;

        uniforms.uFantasy.value =
          fantasy;

        uniforms.uChaos.value =
          chaos;

        uniforms.uWarmth.value =
          warmth;

        uniforms.uHope.value =
          hope;

        uniforms.uStrength.value =
          strength;
      }

      if (
        meshRef.current
      ) {
        meshRef.current
          .rotation.y +=
          delta *
          (
            0.03 +
            speed *
            0.1 +
            random *
            0.02
          );

        meshRef.current
          .rotation.x +=
          delta *
          (
            0.005 +
            chaos *
            0.02
          );
      }
    }
  );

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <mesh
      ref={
        meshRef
      }

      position={
        position
      }

      rotation={
        rotation
      }

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
        ref={
          materialRef
        }

        args={[
          shader,
        ]}

        transparent

        depthWrite={
          false
        }

        side={
          THREE.DoubleSide
        }

        blending={
          THREE.AdditiveBlending
        }
      />
    </mesh>
  );
}


// ============================================================
// CENTRAL CRYSTAL
// ============================================================

type CentralCrystalProps = {
  tension: number;
  fantasy: number;
  chaos: number;
  warmth: number;
  hope: number;
  speed: number;
  strength: number;
};


function CentralCrystal({
  tension,
  fantasy,
  chaos,
  warmth,
  hope,
  speed,
  strength,
}: CentralCrystalProps) {
  const meshRef =
    useRef<THREE.Mesh>(
      null
    );

  useFrame(
    (
      state,
      delta
    ) => {
      if (
        !meshRef.current
      ) {
        return;
      }

      meshRef.current
        .rotation.x +=
        delta *
        (
          0.02 +
          speed *
          0.06
        );

      meshRef.current
        .rotation.y -=
        delta *
        (
          0.03 +
          speed *
          0.08
        );

      const pulse =
        0.9 +
        Math.sin(
          state.clock
            .elapsedTime *
            (
              0.5 +
              tension *
              1.8
            )
        ) *
          (
            0.015 +
            tension *
              0.035
          );

      meshRef.current
        .scale
        .setScalar(
          pulse
        );
    }
  );

  const cold =
    new THREE.Color(
      "#5679ff"
    );

  const warm =
    new THREE.Color(
      "#ff7454"
    );

  const color =
    cold
      .clone()
      .lerp(
        warm,
        warmth
      )
      .lerp(
        new THREE.Color(
          "#ffffff"
        ),
        hope * 0.12
      );

  return (
    <mesh
      ref={
        meshRef
      }

      scale={
        1.2 +
        fantasy *
        0.5
      }
    >
      <icosahedronGeometry
        args={[
          1.15,
          2,
        ]}
      />

      <meshBasicMaterial
        color={
          color
        }

        wireframe

        transparent

        opacity={
          (
            0.08 +
            strength *
            0.16
          ) *
          (
            0.8 +
            chaos *
            0.2
          )
        }

        blending={
          THREE.AdditiveBlending
        }

        depthWrite={
          false
        }
      />
    </mesh>
  );
}