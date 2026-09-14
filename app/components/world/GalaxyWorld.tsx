"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import type { World3DProps } from "./types";
import {
  getOrganismStrength,
  getWaveStrength,
  getCrystalStrength,
} from "./strengths";
import { createSeededRandom } from "./random";

export default function GalaxyWorld({
  mix = 1,
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
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const pointsRef = useRef<THREE.Points>(null);

  const organismStrength = getOrganismStrength(
    nature,
    fluidity,
    fantasy
  );

  const waveStrength = getWaveStrength(
    fluidity,
    speed,
    fantasy
  );

  const crystalStrength = getCrystalStrength(
    tension,
    fantasy,
    chaos
  );

  const galaxyStrength = Math.max(
    0,
    1 -
      organismStrength * 0.25 -
      waveStrength * 0.18 -
      crystalStrength * 0.18
  )*mix;

  // =========================================================
  // BASE GEOMETRY
  // =========================================================

  const geometryData = useMemo(() => {
    const random = createSeededRandom(12457);

    const count = 9000;

    const positions = new Float32Array(count * 3);
    const randoms = new Float32Array(count);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      const arm = i % 5;

      const armAngle =
        (arm / 5) *
        Math.PI *
        2;

      const normalizedRadius = Math.pow(
        random(),
        0.72
      );

      const radius =
        normalizedRadius *
        12;

      const spiral =
        radius * 0.75;

      const jitter =
        (random() - 0.5) *
        1.2;

      const angle =
        armAngle +
        spiral +
        jitter;

      positions[i3] =
        Math.cos(angle) *
        radius;

      positions[i3 + 1] =
        (random() - 0.5) *
        (
          0.15 +
          radius * 0.035
        );

      positions[i3 + 2] =
        Math.sin(angle) *
        radius;

      randoms[i] = random();

      sizes[i] =
        0.6 +
        random() * 1.8;
    }

    return {
      positions,
      randoms,
      sizes,
    };
  }, []);

  // =========================================================
  // SHADER
  // =========================================================

  const shader = useMemo(() => {
    return {
      uniforms: {
        uTime: {
          value: 0,
        },

        uFantasy: {
          value: fantasy,
        },

        uSpaciousness: {
          value: spaciousness,
        },

        uSpeed: {
          value: speed,
        },

        uDarkness: {
          value: darkness,
        },

        uWarmth: {
          value: warmth,
        },

        uChaos: {
          value: chaos,
        },

        uSolitude: {
          value: solitude,
        },

        uHope: {
          value: hope,
        },

        uStrength: {
          value: galaxyStrength,
        },
      },

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
          vec3 pos = position;

          float radius =
            length(pos.xz);

          vRadius = radius;
          vRandom = aRandom;

          float time =
            uTime *
            (
              0.08 +
              uSpeed * 0.35
            );

          /*
           * 銀河全体の渦巻き
           */
          float rotation =
            time *
            (
              0.25 +
              radius * 0.018
            );

          float c =
            cos(rotation);

          float s =
            sin(rotation);

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
           * fantasy
           * → 空間のうねり
           */
          pos.y +=
            sin(
              radius * 0.8 +
              uTime * 0.7 +
              aRandom * 6.283
            ) *
            uFantasy *
            0.32;

          /*
           * chaos
           * → 星の軌道を乱す
           */
          pos.x +=
            sin(
              pos.z * 0.7 +
              uTime * 1.2 +
              aRandom * 10.0
            ) *
            uChaos *
            0.18;

          pos.z +=
            cos(
              pos.x * 0.6 +
              uTime * 0.9 +
              aRandom * 8.0
            ) *
            uChaos *
            0.18;

          /*
           * spaciousness
           * → 世界の広がり
           */
          float worldScale =
            0.65 +
            uSpaciousness * 0.9;

          pos.xz *=
            worldScale;

          /*
           * solitude
           * → 中心から離す
           */
          pos.xz *=
            0.85 +
            uSolitude * 0.45;

          /*
           * 星の瞬き
           */
          float twinkle =
            sin(
              uTime *
              (
                1.0 +
                aRandom * 3.0
              ) +
              aRandom * 30.0
            ) *
            0.5 +
            0.5;

          vBrightness =
            0.45 +
            twinkle *
            (
              0.35 +
              uFantasy * 0.45
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
              1.4 +
              uFantasy * 2.5 +
              uHope * 1.2
            );

          gl_PointSize =
            pointSize *
            (
              80.0 /
              -mvPosition.z
            );

          gl_Position =
            projectionMatrix *
            mvPosition;
        }
      `,

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
            vec2(0.5);

          float dist =
            length(uv);

          if (dist > 0.5) {
            discard;
          }

          float core =
            1.0 -
            smoothstep(
              0.0,
              0.5,
              dist
            );

          float glow =
            1.0 -
            smoothstep(
              0.05,
              0.5,
              dist
            );

          vec3 cold =
            vec3(
              0.32,
              0.58,
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
              cold,
              warm,
              uWarmth
            );

          color =
            mix(
              color,
              vec3(1.0),
              uHope * 0.35
            );

          /*
           * 中心に近い星ほど明るく
           */
          float centerGlow =
            1.0 /
            (
              1.0 +
              vRadius * 0.12
            );

          float brightness =
  vBrightness * 0.55 +
  centerGlow *
  (
    0.2 +
    uHope * 0.45
  );

          /*
           * Bloomで拾わせるため
           * 1.0を超える輝度も許可
           */
          vec3 finalColor =
  color *
  brightness *
  (
    0.35 +
    uFantasy * 0.25
  );

          float alpha =
            (
              core * 0.75 +
              glow * 0.35
            ) *
            (
              0.25 +
              uStrength * 0.75
            ) *
            (
              1.0 -
              uDarkness * 0.45
            );

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
  // UNIFORM UPDATE
  // =========================================================

  useFrame((state, delta) => {
    if (materialRef.current) {
      const uniforms =
        materialRef.current.uniforms;

      uniforms.uTime.value =
        state.clock.elapsedTime;

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
        galaxyStrength;
    }

    if (pointsRef.current) {
      pointsRef.current.rotation.z +=
        delta *
        (
          0.0005 +
          speed * 0.002
        );
    }
  });

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <points ref={pointsRef}>
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
        args={[shader]}
        transparent
        depthWrite={false}
        blending={
          THREE.AdditiveBlending
        }
        vertexColors={false}
        toneMapped={false}
      />
    </points>
  );
}