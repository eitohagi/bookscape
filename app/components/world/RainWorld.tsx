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
  getRainStrength,
} from "./strengths";

import {
  createSeededRandom,
} from "./random";


// ============================================================
// RAIN WORLD
// ============================================================

export default function RainWorld({
  mix =1,
  speed = 0.5,
  chaos = 0.5,
  tension = 0.5,
  fantasy = 0.5,
  warmth = 0.5,
  spaciousness = 0.5,
  hope = 0.5,
}: World3DProps) {
  const pointsRef =
    useRef<THREE.Points>(null);

  const materialRef =
    useRef<THREE.ShaderMaterial>(null);

  const rainStrength =
    getRainStrength(
      speed,
      chaos,
      tension
    )*mix;


  // =========================================================
  // FIXED PARTICLES
  // =========================================================

  const geometryData =
    useMemo(() => {
      const random =
        createSeededRandom(
          61931
        );

      const count = 4500;

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

        positions[i3] =
          (
            random() -
            0.5
          ) *
          18;

        positions[i3 + 1] =
          (
            random() -
            0.5
          ) *
          16;

        positions[i3 + 2] =
          (
            random() -
            0.5
          ) *
          16;

        randoms[i] =
          random();

        phases[i] =
          random() *
          Math.PI *
          2;

        speeds[i] =
          0.4 +
          random() *
          1.4;
      }

      return {
        positions,
        randoms,
        phases,
        speeds,
      };
    }, []);


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

          uHope: {
            value: hope,
          },

          uSpaciousness: {
            value: spaciousness,
          },

          uStrength: {
            value: rainStrength,
          },
        },


        // ===================================================
        // VERTEX
        // ===================================================

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
          varying float vVelocity;
          varying float vDepth;

          void main() {
            vec3 pos =
              position;

            float t =
              uTime *
              (
                0.35 +
                uSpeed *
                2.6
              ) *
              aSpeed;

            // -----------------------------------------------
            // Falling / meteor movement
            // -----------------------------------------------

            float rangeY =
              16.0;

            pos.y -=
              t *
              (
                1.2 +
                uSpeed *
                4.0
              );

            /*
             * wrap
             */
            pos.y =
              mod(
                pos.y +
                rangeY * 0.5,
                rangeY
              ) -
              rangeY * 0.5;


            // -----------------------------------------------
            // Wind
            // -----------------------------------------------

            float wind =
              sin(
                uTime *
                0.4 +
                aPhase
              );

            pos.x +=
              wind *
              (
                0.15 +
                uChaos *
                1.2
              );


            // -----------------------------------------------
            // Turbulence
            // -----------------------------------------------

            float turbulence =
              sin(
                pos.y *
                0.6 +
                uTime *
                1.4 +
                aPhase
              );

            pos.x +=
              turbulence *
              uChaos *
              0.32;

            pos.z +=
              cos(
                pos.y *
                0.4 -
                uTime *
                1.0 +
                aPhase
              ) *
              uChaos *
              0.22;


            // -----------------------------------------------
            // Tension
            // -----------------------------------------------

            pos.x +=
              sin(
                uTime *
                (
                  2.0 +
                  uTension *
                  5.0
                ) +
                aRandom *
                20.0
              ) *
              uTension *
              0.08;


            // -----------------------------------------------
            // Fantasy spiral
            // -----------------------------------------------

            float spiral =
              uFantasy *
              0.18;

            float angle =
              pos.y *
              0.05 +
              uTime *
              0.08;

            pos.x +=
              cos(angle) *
              spiral;

            pos.z +=
              sin(angle) *
              spiral;


            // -----------------------------------------------
            // Spaciousness
            // -----------------------------------------------

            pos.xz *=
              0.75 +
              uSpaciousness *
              0.75;


            vec4 mvPosition =
              modelViewMatrix *
              vec4(
                pos,
                1.0
              );


            // -----------------------------------------------
            // Speed → longer / brighter points
            // -----------------------------------------------

            float velocity =
              0.45 +
              uSpeed *
              0.9 +
              aSpeed *
              0.25;

            vVelocity =
              velocity;

            vRandom =
              aRandom;

            vDepth =
              clamp(
                -mvPosition.z /
                20.0,
                0.0,
                1.0
              );


            float size =
              1.4 +
              uSpeed *
              2.2 +
              uTension *
              0.8;

            size *=
              0.7 +
              aRandom *
              0.8;

            gl_PointSize =
              size *
              (
                65.0 /
                max(
                  -mvPosition.z,
                  1.0
                )
              );

            gl_Position =
              projectionMatrix *
              mvPosition;
          }
        `,


        // ===================================================
        // FRAGMENT
        // ===================================================

        fragmentShader: `
          uniform float uSpeed;
          uniform float uChaos;
          uniform float uTension;
          uniform float uFantasy;
          uniform float uWarmth;
          uniform float uHope;
          uniform float uStrength;

          varying float vRandom;
          varying float vVelocity;
          varying float vDepth;

          void main() {
            vec2 p =
              gl_PointCoord -
              vec2(
                0.5
              );

            /*
             * vertical streak
             */
            p.y *=
              0.35 +
              uSpeed *
              0.35;

            float dist =
              length(p);

            if (
              dist >
              0.5
            ) {
              discard;
            }


            float core =
              1.0 -
              smoothstep(
                0.0,
                0.18,
                dist
              );

            float glow =
              1.0 -
              smoothstep(
                0.05,
                0.5,
                dist
              );


            // -----------------------------------------------
            // Color
            // -----------------------------------------------

            vec3 cold =
              vec3(
                0.30,
                0.65,
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
                cold,
                warm,
                uWarmth
              );


            /*
             * fantasy → violet
             */
            color =
              mix(
                color,
                vec3(
                  0.55,
                  0.32,
                  0.92
                ),
                uFantasy *
                0.25
              );


            /*
             * hope → white
             */
            color =
              mix(
                color,
                vec3(
                  1.0
                ),
                uHope *
                0.18
              );


            /*
             * tension gives occasional bright particles
             */
            float flash =
              smoothstep(
                0.82,
                1.0,
                vRandom
              ) *
              uTension;


            float brightness =
              0.38 +
              core *
              0.35 +
              glow *
              0.18;

            brightness +=
              flash *
              0.18;

            brightness *=
              0.8 +
              vVelocity *
              0.18;


            /*
             * avoid Bloom explosion
             */
            vec3 finalColor =
              color *
              brightness;


            float alpha =
              (
                core *
                0.55 +
                glow *
                0.25
              ) *
              (
                0.08 +
                uStrength *
                0.45
              );


            /*
             * farther particles fade
             */
            alpha *=
              0.65 +
              (
                1.0 -
                vDepth
              ) *
              0.35;


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

        uniforms.uSpeed.value =
          speed;

        uniforms.uChaos.value =
          chaos;

        uniforms.uTension.value =
          tension;

        uniforms.uFantasy.value =
          fantasy;

        uniforms.uWarmth.value =
          warmth;

        uniforms.uHope.value =
          hope;

        uniforms.uSpaciousness.value =
          spaciousness;

        uniforms.uStrength.value =
          rainStrength;
      }


      if (
        pointsRef.current
      ) {
        pointsRef.current
          .rotation.y =
          Math.sin(
            state.clock
              .elapsedTime *
              0.05
          ) *
          chaos *
          0.12;

        pointsRef.current
          .rotation.z =
          (
            chaos -
            0.5
          ) *
          0.12;
      }
    }
  );


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <points
      ref={
        pointsRef
      }
      frustumCulled={
        false
      }
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
        blending={
          THREE.AdditiveBlending
        }
      />
    </points>
  );
}