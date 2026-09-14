"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import type { World3DProps } from "./types";
import { getWaveStrength } from "./strengths";

export default function WaveWorld({
  mix = 1,
  fluidity = 0.5,
  fantasy = 0.5,
  warmth = 0.5,
  hope = 0.5,
  speed = 0.4,
  chaos = 0.5,
  spaciousness = 0.5,
}: World3DProps) {
  const materialRef =
    useRef<THREE.ShaderMaterial>(null);

  const groupRef =
    useRef<THREE.Group>(null);

  const waveStrength =
    getWaveStrength(
      fluidity,
      speed,
      fantasy
    )*mix;

  // =========================================================
  // SHADER
  // =========================================================

  const shader = useMemo(() => {
    return {
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

        uChaos: {
          value: chaos,
        },

        uSpeed: {
          value: speed,
        },

        uWarmth: {
          value: warmth,
        },

        uHope: {
          value: hope,
        },

        uStrength: {
          value: waveStrength,
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
        varying float vDistortion;

        void main() {
          vUv = uv;

          vec3 pos = position;

          float t =
            uTime *
            (
              0.25 +
              uSpeed * 1.2
            );

          float wave1 =
            sin(
              pos.x * 0.65 +
              t * 1.3
            );

          float wave2 =
            sin(
              pos.x * 1.8 -
              t * 0.75
            );

          float wave3 =
            cos(
              pos.x * 0.28 +
              pos.y * 1.7 +
              t * 0.55
            );

          float chaosWave =
            sin(
              pos.x * 3.0 +
              pos.y * 4.0 +
              t * 1.7
            );

          float amplitude =
            (
              0.25 +
              uFluidity * 1.4 +
              uFantasy * 0.5
            ) *
            (
              0.25 +
              uStrength * 0.75
            );

          float totalWave =
            wave1 * 0.55 +
            wave2 * 0.25 +
            wave3 * 0.2;

          pos.z +=
            totalWave *
            amplitude;

          pos.y +=
            wave2 *
            (
              0.08 +
              uFluidity * 0.35
            );

          pos.z +=
            chaosWave *
            uChaos *
            0.18;

          pos.x +=
            sin(
              pos.y * 2.0 +
              t
            ) *
            uFantasy *
            0.08;

          vWave =
            totalWave;

          vDistortion =
            chaosWave;

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
        uniform float uChaos;
        uniform float uWarmth;
        uniform float uHope;
        uniform float uStrength;

        varying vec2 vUv;
        varying float vWave;
        varying float vDistortion;

        vec3 coldColor =
          vec3(
            0.22,
            0.55,
            1.0
          );

        vec3 warmColor =
          vec3(
            1.0,
            0.48,
            0.18
          );

        void main() {
          float edge =
            abs(
              vUv.y - 0.5
            ) *
            2.0;

          float centerGlow =
            1.0 -
            smoothstep(
              0.0,
              1.0,
              edge
            );

          float flow =
            sin(
              vUv.x * 18.0 -
              uTime *
              (
                0.8 +
                uFluidity * 2.5
              ) +
              vWave * 2.5
            );

          flow =
            flow * 0.5 +
            0.5;

          vec3 color =
            mix(
              coldColor,
              warmColor,
              uWarmth
            );

          color =
            mix(
              color,
              vec3(1.0),
              uHope * 0.28
            );

          color *=
            0.55 +
            flow * 0.8;

          color +=
            vec3(
              0.18,
              0.08,
              0.35
            ) *
            uFantasy *
            (
              0.5 +
              vDistortion * 0.5
            );

          float alpha =
            (
              0.025 +
              centerGlow *
              0.22
            ) *
            (
              0.2 +
              uStrength * 0.8
            );

          alpha *=
            (
              0.6 +
              flow * 0.65
            );

          float emission =
  0.55 +
  uHope * 0.35 +
  uFantasy * 0.2;

vec3 finalColor =
  color * emission;

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
  // UPDATE UNIFORMS
  // =========================================================

  useFrame(
    (state, delta) => {
      if (materialRef.current) {
        const uniforms =
          materialRef.current.uniforms;

        uniforms.uTime.value =
          state.clock.elapsedTime;

        uniforms.uFluidity.value =
          fluidity;

        uniforms.uFantasy.value =
          fantasy;

        uniforms.uChaos.value =
          chaos;

        uniforms.uSpeed.value =
          speed;

        uniforms.uWarmth.value =
          warmth;

        uniforms.uHope.value =
          hope;

        uniforms.uStrength.value =
          waveStrength;
      }

      if (groupRef.current) {
        groupRef.current.rotation.y +=
          delta *
          (
            0.003 +
            speed * 0.012
          );

        groupRef.current.rotation.z =
          Math.sin(
            state.clock.elapsedTime *
              0.18
          ) *
          fluidity *
          0.05;
      }
    }
  );

  if (
    waveStrength <= 0.02
  ) {
    return null;
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <group
      ref={groupRef}
      scale={
        0.8 +
        waveStrength * 0.45
      }
    >
      {/* main wave */}

      <mesh
        rotation={[
          -0.25,
          0,
          0,
        ]}
      >
        <planeGeometry
          args={[
            14 +
              spaciousness * 10,
            4 +
              spaciousness * 3,
            180,
            50,
          ]}
        />

        <shaderMaterial
          ref={materialRef}
          args={[shader]}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={
            THREE.AdditiveBlending
          }
        />
      </mesh>

      {/* second faint wave */}

      <mesh
        position={[
          0,
          -0.7,
          -1.5,
        ]}
        rotation={[
          -0.18,
          0.15,
          0.04,
        ]}
        scale={[
          1.15,
          0.8,
          1,
        ]}
      >
        <planeGeometry
          args={[
            13 +
              spaciousness * 9,
            3 +
              spaciousness * 2,
            140,
            40,
          ]}
        />

        <shaderMaterial
          args={[shader]}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
opacity={0.35}
        />
      </mesh>
    </group>
  );
}