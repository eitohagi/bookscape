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
  getOrganismStrength,
} from "./strengths";

import {
  createSeededRandom,
} from "./random";


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
}: World3DProps) {
  const groupRef =
    useRef<THREE.Group>(null);

  const materialRef =
    useRef<THREE.ShaderMaterial>(null);

  const organismStrength =
    getOrganismStrength(
      nature,
      fluidity,
      fantasy
    )*mix;

  // =========================================================
  // FIXED BASE GEOMETRY
  // =========================================================

  const geometryData =
    useMemo(() => {
      const random =
        createSeededRandom(
          73129
        );

      const branches = 32;

      const segmentsPerBranch =
        55;

      /*
       * lineSegmentsなので
       *
       * 1 segment =
       * 2 vertices
       */
      const vertexCount =
        branches *
        segmentsPerBranch *
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

      const branchRandom =
        new Float32Array(
          vertexCount
        );

      let vertexIndex = 0;

      // =====================================================
      // BRANCH GENERATION
      // =====================================================

      for (
        let b = 0;
        b < branches;
        b++
      ) {
        const angle =
          random() *
          Math.PI *
          2;

        const verticalAngle =
          (
            random() -
            0.5
          ) *
          1.5;

        const branchLength =
          2.5 +
          random() * 5.5;

        const curveAmount =
          (
            random() -
            0.5
          ) *
          1.8;

        const branchPhase =
          random() *
          Math.PI *
          2;

        const branchSeed =
          random();

        // ===================================================
        // BASE DIRECTION
        // ===================================================

        const direction =
          new THREE.Vector3(
            Math.cos(angle),
            verticalAngle,
            Math.sin(angle)
          ).normalize();

        /*
         * 枝を少し曲げるための
         * perpendicular direction
         */
        const side =
          new THREE.Vector3(
            -direction.z,
            0,
            direction.x
          ).normalize();

        // ===================================================
        // CREATE SEGMENTS
        // ===================================================

        for (
          let s = 0;
          s <
          segmentsPerBranch;
          s++
        ) {
          const t1 =
            s /
            segmentsPerBranch;

          const t2 =
            (
              s + 1
            ) /
            segmentsPerBranch;

          const createPoint = (
            t: number
          ) => {
            /*
             * 中心から外側へ
             */
            const distance =
              branchLength *
              t;

            const p =
              direction
                .clone()
                .multiplyScalar(
                  distance
                );

            /*
             * 枝そのものの曲線
             */
            const curve =
              Math.sin(
                t *
                  Math.PI *
                  1.5 +
                  branchPhase
              ) *
              curveAmount *
              t;

            p.add(
              side
                .clone()
                .multiplyScalar(
                  curve
                )
            );

            /*
             * 成長するほど少し上へ
             */
            p.y +=
              Math.sin(
                t *
                  Math.PI
              ) *
              (
                0.3 +
                branchSeed *
                  1.2
              );

            return p;
          };

          const p1 =
            createPoint(
              t1
            );

          const p2 =
            createPoint(
              t2
            );

          // ===============================================
          // VERTEX 1
          // ===============================================

          positions[
            vertexIndex * 3
          ] = p1.x;

          positions[
            vertexIndex * 3 +
              1
          ] = p1.y;

          positions[
            vertexIndex * 3 +
              2
          ] = p1.z;

          phases[
            vertexIndex
          ] =
            branchPhase;

          life[
            vertexIndex
          ] =
            t1;

          branchRandom[
            vertexIndex
          ] =
            branchSeed;

          vertexIndex++;

          // ===============================================
          // VERTEX 2
          // ===============================================

          positions[
            vertexIndex * 3
          ] = p2.x;

          positions[
            vertexIndex * 3 +
              1
          ] = p2.y;

          positions[
            vertexIndex * 3 +
              2
          ] = p2.z;

          phases[
            vertexIndex
          ] =
            branchPhase;

          life[
            vertexIndex
          ] =
            t2;

          branchRandom[
            vertexIndex
          ] =
            branchSeed;

          vertexIndex++;
        }
      }

      return {
        positions,
        phases,
        life,
        branchRandom,
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
            value:
              organismStrength,
          },
        },

        // ===================================================
        // VERTEX SHADER
        // ===================================================

        vertexShader: `
          uniform float uTime;
          uniform float uNature;
          uniform float uFluidity;
          uniform float uFantasy;
          uniform float uSpeed;
          uniform float uChaos;
          uniform float uStrength;

          attribute float aPhase;
          attribute float aLife;
          attribute float aRandom;

          varying float vLife;
          varying float vPulse;
          varying float vRandom;

          void main() {
            vec3 pos =
              position;

            float time =
              uTime *
              (
                0.25 +
                uSpeed *
                0.8
              );

            // -----------------------------------------------
            // 呼吸
            // -----------------------------------------------

            float breath =
              sin(
                time +
                aPhase
              ) *
              (
                0.04 +
                uNature *
                0.12
              );

            pos *=
              1.0 +
              breath;

            // -----------------------------------------------
            // fluid movement
            // -----------------------------------------------

            float waveA =
              sin(
                time *
                1.2 +
                pos.y *
                0.7 +
                aPhase
              );

            float waveB =
              cos(
                time *
                0.8 +
                pos.x *
                0.6 +
                aPhase *
                1.7
              );

            pos.x +=
              waveA *
              (
                0.04 +
                uFluidity *
                0.32
              ) *
              aLife;

            pos.z +=
              waveB *
              (
                0.04 +
                uFluidity *
                0.28
              ) *
              aLife;

            // -----------------------------------------------
            // Fantasy deformation
            // -----------------------------------------------

            pos.y +=
              sin(
                pos.x *
                1.2 +
                time *
                1.4 +
                aRandom *
                8.0
              ) *
              uFantasy *
              0.18 *
              aLife;

            // -----------------------------------------------
            // Chaos
            // -----------------------------------------------

            float noiseLike =
              sin(
                pos.x *
                2.2 +
                pos.y *
                1.7 +
                pos.z *
                1.3 +
                time *
                2.0 +
                aRandom *
                20.0
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
              0.08 *
              aLife;

            // -----------------------------------------------
            // Growth / contraction
            // -----------------------------------------------

            float growth =
              0.75 +
              uNature *
              0.4;

            pos *= growth;

            vLife =
              aLife;

            vRandom =
              aRandom;

            vPulse =
              sin(
                time *
                2.0 -
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

        // ===================================================
        // FRAGMENT SHADER
        // ===================================================

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
                0.20,
                0.68,
                0.72
              );

            vec3 warm =
              vec3(
                0.95,
                0.48,
                0.30
              );

            vec3 color =
              mix(
                cold,
                warm,
                uWarmth
              );

            // -----------------------------------------------
            // Hope → 白へ
            // -----------------------------------------------

            color =
              mix(
                color,
                vec3(
                  1.0
                ),
                uHope *
                0.22
              );

            // -----------------------------------------------
            // 枝先を少し明るく
            // -----------------------------------------------

            float tipGlow =
              smoothstep(
                0.45,
                1.0,
                vLife
              );

            float brightness =
              0.35 +
              vPulse *
              0.25 +
              tipGlow *
              (
                0.2 +
                uFantasy *
                0.3
              );

            /*
             * Bloom暴走を防ぐため
             * Galaxyほど強くしない
             */
            vec3 finalColor =
              color *
              brightness;

            float alpha =
              (
                0.12 +
                uNature *
                0.28
              ) *
              (
                0.15 +
                uStrength *
                0.85
              );

            alpha *=
              0.6 +
              tipGlow *
              0.4;

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
          state.clock.elapsedTime;

        uniforms.uNature.value =
          nature;

        uniforms.uFluidity.value =
          fluidity;

        uniforms.uFantasy.value =
          fantasy;

        uniforms.uWarmth.value =
          warmth;

        uniforms.uHope.value =
          hope;

        uniforms.uSpeed.value =
          speed;

        uniforms.uChaos.value =
          chaos;

        uniforms.uStrength.value =
          organismStrength;
      }

      if (
        groupRef.current
      ) {
        /*
         * 全体を非常にゆっくり回転
         */
        groupRef.current
          .rotation.y +=
          delta *
          (
            0.004 +
            speed *
            0.012
          );

        groupRef.current
          .rotation.x =
          Math.sin(
            state.clock
              .elapsedTime *
              0.08
          ) *
          0.08;

        /*
         * spaciousness
         */
        const scale =
          0.65 +
          spaciousness *
            0.65;

        groupRef.current
          .scale
          .setScalar(
            scale
          );
      }
    }
  );

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <group
      ref={groupRef}
    >
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              geometryData.positions,
              3,
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
            attach="attributes-aLife"
            args={[
              geometryData.life,
              1,
            ]}
          />

          <bufferAttribute
            attach="attributes-aRandom"
            args={[
              geometryData.branchRandom,
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
        />
      </lineSegments>
    </group>
  );
}