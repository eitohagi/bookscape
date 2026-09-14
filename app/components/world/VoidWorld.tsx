"use client";

import {
  useMemo,
  useRef,
} from "react";

import {
  useFrame,
} from "@react-three/fiber";

import {
  PointMaterial,
  Points,
} from "@react-three/drei";

import * as THREE from "three";

import type { World3DProps } from "./types";
import { getVoidStrength } from "./strengths";
import { createSeededRandom } from "./random";


// ============================================================
// VOID PARTICLES
// ============================================================

function VoidParticles({
  darkness = 0.5,
  solitude = 0.5,
  speed = 0.4,
  fantasy = 0.5,
  spaciousness = 0.5,
  mix =1,
}: World3DProps) {
  const pointsRef =
    useRef<THREE.Points>(null);

  const voidStrength =
    getVoidStrength(
      darkness,
      solitude
    )*mix;

  // =========================================================
  // PARTICLES
  // =========================================================

  const positions =
    useMemo(() => {
      const random =
        createSeededRandom(
          95173
        );

      const count = 3500;

      const array =
        new Float32Array(
          count * 3
        );

      const maxRadius =
        6 +
        spaciousness * 9;

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
          1.5 +
          Math.pow(
            random(),
            0.65
          ) *
            maxRadius;

        const flatten =
          0.08 +
          random() *
            0.3;

        array[i3] =
          Math.cos(angle) *
          radius;

        array[i3 + 1] =
          (
            random() -
            0.5
          ) *
          radius *
          flatten;

        array[i3 + 2] =
          Math.sin(angle) *
          radius;
      }

      return array;
    }, [
      spaciousness,
    ]);

  // =========================================================
  // ANIMATION
  // =========================================================

  useFrame(
    (state, delta) => {
      if (
        !pointsRef.current
      ) {
        return;
      }

      pointsRef.current
        .rotation.y +=
        delta *
        (
          0.015 +
          speed * 0.05
        );

      pointsRef.current
        .rotation.z +=
        delta * 0.002;

      const pulse =
        1 +
        Math.sin(
          state.clock
            .elapsedTime *
            0.25
        ) *
          (
            0.003 +
            voidStrength *
              0.008
          );

      pointsRef.current
        .scale.setScalar(
          pulse
        );
    }
  );

  if (
    voidStrength <= 0.02
  ) {
    return null;
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <Points
      ref={pointsRef}
      positions={positions}
      stride={3}
      frustumCulled={false}
    >
      <PointMaterial
        transparent
        color="#8b75ff"
        size={
          0.012 +
          fantasy * 0.025
        }
        opacity={
          0.06 +
          voidStrength * 0.32
        }
        sizeAttenuation
        depthWrite={false}
        blending={
          THREE.AdditiveBlending
        }
      />
    </Points>
  );
}


// ============================================================
// BLACK HOLE
// ============================================================

function BlackHole({
  darkness = 0.5,
  solitude = 0.5,
  warmth = 0.5,
  speed = 0.4,
  fantasy = 0.5,
  mix = 1,
}: World3DProps) {
  const groupRef =
    useRef<THREE.Group>(null);

  const diskRef =
    useRef<THREE.Mesh>(null);

  const outerDiskRef =
    useRef<THREE.Mesh>(null);

  const voidStrength =
    getVoidStrength(
      darkness,
      solitude
    )*mix;

  // =========================================================
  // ANIMATION
  // =========================================================

  useFrame(
    (state, delta) => {
      if (
        groupRef.current
      ) {
        groupRef.current
          .rotation.y +=
          delta * 0.015;

        const pulse =
          1 +
          Math.sin(
            state.clock
              .elapsedTime *
              0.6
          ) *
            (
              0.005 +
              fantasy *
                0.012
            );

        groupRef.current
          .scale.setScalar(
            (
              0.6 +
              voidStrength *
                0.8
            ) *
              pulse
          );
      }

      if (
        diskRef.current
      ) {
        diskRef.current
          .rotation.z +=
          delta *
          (
            0.08 +
            speed * 0.3
          );
      }

      if (
        outerDiskRef.current
      ) {
        outerDiskRef.current
          .rotation.z -=
          delta *
          (
            0.025 +
            speed * 0.08
          );
      }
    }
  );

  if (
    voidStrength <= 0.02
  ) {
    return null;
  }

  // =========================================================
  // COLOR
  // =========================================================

  const cold =
    new THREE.Color(
      "#6b54ff"
    );

  const warm =
    new THREE.Color(
      "#ff8e5d"
    );

  const diskColor =
    cold
      .clone()
      .lerp(
        warm,
        warmth
      );

  /*
   * Bloom用に
   * 内側の降着円盤をHDR的に明るくする
   */
  const emissiveDiskColor =
  diskColor
    .clone()
    .multiplyScalar(
      0.8 +
      fantasy * 0.45
    );

  const outerColor =
    diskColor
      .clone()
      .lerp(
        new THREE.Color(
          "#ffffff"
        ),
        fantasy * 0.15
      );

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <group ref={groupRef}>
      {/* Black Hole Core */}

      <mesh>
        <sphereGeometry
          args={[
            1.05,
            64,
            64,
          ]}
        />

        <meshBasicMaterial
          color="#000000"
        />
      </mesh>


      {/* Event Horizon Glow */}

      <mesh
        scale={1.35}
      >
        <sphereGeometry
          args={[
            1,
            48,
            48,
          ]}
        />

        <meshBasicMaterial
          color="#5d48ff"
          transparent
          opacity={
            0.06 +
            voidStrength *
              0.15
          }
          blending={
            THREE.AdditiveBlending
          }
          depthWrite={false}
          side={
            THREE.BackSide
          }
        />
      </mesh>


      {/* Inner Accretion Disk */}

      <mesh
        ref={diskRef}
        rotation={[
          Math.PI / 2.7,
          0,
          0,
        ]}
      >
        <ringGeometry
          args={[
            1.25,
            3.5,
            128,
          ]}
        />

        <meshBasicMaterial
          color={
            emissiveDiskColor
          }
          transparent
          opacity={
            0.1 +
            voidStrength *
              0.35
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


      {/* Outer Accretion Disk */}

      <mesh
        ref={
          outerDiskRef
        }
        rotation={[
          Math.PI / 2.7,
          0,
          0,
        ]}
        scale={1.35}
      >
        <ringGeometry
          args={[
            1.5,
            3.8,
            128,
          ]}
        />

        <meshBasicMaterial
          color={
            outerColor
          }
          transparent
          opacity={
            0.025 +
            voidStrength *
              0.08
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


      {/* Extra faint outer halo */}

      <mesh
        rotation={[
          Math.PI / 2.7,
          0,
          0,
        ]}
        scale={1.8}
      >
        <ringGeometry
          args={[
            1.8,
            3.2,
            128,
          ]}
        />

        <meshBasicMaterial
          color="#705cff"
          transparent
          opacity={
            voidStrength *
            0.025
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
  );
}


// ============================================================
// VOID WORLD
// ============================================================

export default function VoidWorld(
  props: World3DProps
) {
  return (
    <>
      <VoidParticles
        {...props}
      />

      <BlackHole
        {...props}
      />
    </>
  );
}