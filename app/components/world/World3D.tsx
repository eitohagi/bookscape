"use client";

import {
  useRef,
  useState,
} from "react";

import {
  Canvas,
  useFrame,
} from "@react-three/fiber";

import {
  Bloom,
  EffectComposer,
} from "@react-three/postprocessing";

import * as THREE from "three";

import type {
  World3DProps,
} from "./types";

import {
  getVoidStrength,
} from "./strengths";

import {
  completeDNA,
  damp,
  type CompleteWorldDNA,
} from "./smooth";

import {
  getWorldComposition,
} from "./composition";

import type {
  WorldComposition,
} from "./composition";

import {
  dampComposition,
} from "./mixer";

import GalaxyWorld from "./GalaxyWorld";
import CloudWorld from "./CloudWorld";
import WaveWorld from "./WaveWorld";
import OrganismWorld from "./OrganismWorld";
import CrystalWorld from "./CrystalWorld";
import RainWorld from "./RainWorld";
import VoidWorld from "./VoidWorld";


// ============================================================
// DNA SMOOTHING
// ============================================================

function SmoothWorld({
  targetDNA,
}: {
  targetDNA: World3DProps;
}) {
  const currentDNARef =
    useRef<CompleteWorldDNA>(
      completeDNA(
        targetDNA
      )
    );

  const [
    smoothDNA,
    setSmoothDNA,
  ] =
    useState<CompleteWorldDNA>(
      () =>
        completeDNA(
          targetDNA
        )
    );

  const updateTimerRef =
    useRef(0);


  useFrame(
    (
      _state,
      delta
    ) => {
      const current =
        currentDNARef.current;

      const target =
        completeDNA(
          targetDNA
        );

      const smoothingSpeed =
        2.6;


      current.quietness =
        damp(
          current.quietness,
          target.quietness,
          smoothingSpeed,
          delta
        );

      current.chaos =
        damp(
          current.chaos,
          target.chaos,
          smoothingSpeed,
          delta
        );

      current.solitude =
        damp(
          current.solitude,
          target.solitude,
          smoothingSpeed,
          delta
        );

      current.hope =
        damp(
          current.hope,
          target.hope,
          smoothingSpeed,
          delta
        );

      current.fantasy =
        damp(
          current.fantasy,
          target.fantasy,
          smoothingSpeed,
          delta
        );

      current.nature =
        damp(
          current.nature,
          target.nature,
          smoothingSpeed,
          delta
        );

      current.darkness =
        damp(
          current.darkness,
          target.darkness,
          smoothingSpeed,
          delta
        );

      current.speed =
        damp(
          current.speed,
          target.speed,
          smoothingSpeed,
          delta
        );

      current.warmth =
        damp(
          current.warmth,
          target.warmth,
          smoothingSpeed,
          delta
        );

      current.spaciousness =
        damp(
          current.spaciousness,
          target.spaciousness,
          smoothingSpeed,
          delta
        );

      current.tension =
        damp(
          current.tension,
          target.tension,
          smoothingSpeed,
          delta
        );

      current.fluidity =
        damp(
          current.fluidity,
          target.fluidity,
          smoothingSpeed,
          delta
        );


      /*
       * Reactへの反映は約30fps
       */
      updateTimerRef.current +=
        delta;

      if (
        updateTimerRef.current <
        1 / 30
      ) {
        return;
      }

      updateTimerRef.current =
        0;

      setSmoothDNA({
        ...current,
      });
    }
  );


  return (
    <Scene
      {...smoothDNA}
    />
  );
}


// ============================================================
// CENTER LIGHT
// ============================================================

function CenterLight({
  hope = 0.5,
  darkness = 0.5,
  warmth = 0.5,
  solitude = 0.5,
}: World3DProps) {
  const lightRef =
    useRef<THREE.Mesh>(
      null
    );


  useFrame(
    (state) => {
      if (
        !lightRef.current
      ) {
        return;
      }

      const pulse =
        1 +
        Math.sin(
          state.clock
            .elapsedTime *
            1.4
        ) *
          (
            0.03 +
            hope *
              0.08
          );

      lightRef.current
        .scale
        .setScalar(
          pulse
        );
    }
  );


  const cold =
    new THREE.Color(
      "#8aa8ff"
    );

  const warm =
    new THREE.Color(
      "#ffd2a3"
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
        hope *
          0.45
      );


  const opacity =
    Math.max(
      0,
      hope *
        0.5 -
        darkness *
          0.2 -
        solitude *
          0.08
    );


  if (
    opacity <= 0.01
  ) {
    return null;
  }


  return (
    <group>
      <mesh
        ref={
          lightRef
        }
      >
        <sphereGeometry
          args={[
            0.18,
            32,
            32,
          ]}
        />

        <meshBasicMaterial
          color={
            color
          }
          transparent
          opacity={
            0.35 +
            hope *
              0.45
          }
          blending={
            THREE.AdditiveBlending
          }
          depthWrite={
            false
          }
        />
      </mesh>


      <mesh
        scale={
          2
        }
      >
        <sphereGeometry
          args={[
            0.2,
            32,
            32,
          ]}
        />

        <meshBasicMaterial
          color={
            color
          }
          transparent
          opacity={
            opacity *
            0.3
          }
          blending={
            THREE.AdditiveBlending
          }
          depthWrite={
            false
          }
          side={
            THREE.BackSide
          }
        />
      </mesh>


      <mesh
        scale={
          4
        }
      >
        <sphereGeometry
          args={[
            0.2,
            32,
            32,
          ]}
        />

        <meshBasicMaterial
          color={
            color
          }
          transparent
          opacity={
            opacity *
            0.08
          }
          blending={
            THREE.AdditiveBlending
          }
          depthWrite={
            false
          }
          side={
            THREE.BackSide
          }
        />
      </mesh>


      <pointLight
        color={
          color
        }
        intensity={
          1 +
          hope *
            6
        }
        distance={
          18
        }
        decay={
          2
        }
      />
    </group>
  );
}


// ============================================================
// CAMERA
// ============================================================

function CameraMotion({
  tension = 0.5,
  quietness = 0.5,
  darkness = 0.5,
  solitude = 0.5,
  spaciousness = 0.5,
}: World3DProps) {
  useFrame(
    (
      state,
      delta
    ) => {
      const camera =
        state.camera;

      const pointer =
        state.pointer;


      const voidStrength =
        getVoidStrength(
          darkness,
          solitude
        );


      const sensitivity =
        (
          0.25 +
          tension *
            0.35
        ) *
        (
          1 -
          quietness *
            0.5
        );


      const targetX =
        pointer.x *
        sensitivity *
        2;

      const targetY =
        pointer.y *
        sensitivity *
        1.2;

      const targetZ =
        11 +
        spaciousness *
          3 -
        voidStrength *
          2.5;


      const smooth =
        1 -
        Math.exp(
          -delta *
            (
              1.5 +
              quietness *
                2
            )
        );


      camera.position.x =
        THREE.MathUtils.lerp(
          camera.position.x,
          targetX,
          smooth
        );

      camera.position.y =
        THREE.MathUtils.lerp(
          camera.position.y,
          1.2 +
            targetY,
          smooth
        );

      camera.position.z =
        THREE.MathUtils.lerp(
          camera.position.z,
          targetZ,
          smooth
        );


      camera.lookAt(
        0,
        0,
        0
      );
    }
  );


  return null;
}


// ============================================================
// SCENE
// ============================================================

function Scene(
  props: CompleteWorldDNA
) {
  const {
    darkness,
    warmth,
    hope,
  } =
    props;


  // =========================================================
  // WORLD COMPOSITION MIXER
  // =========================================================

  /*
   * Sceneが最初に表示された時点の
   * Compositionを初期値にする。
   *
   * これで最初に0からフェードインする
   * 不自然さを防ぐ。
   */
  const compositionRef =
    useRef<WorldComposition>(
      getWorldComposition(
        props
      )
    );


  const [
    composition,
    setComposition,
  ] =
    useState<WorldComposition>(
      () =>
        getWorldComposition(
          props
        )
    );


  const compositionTimerRef =
    useRef(0);


  useFrame(
    (
      _state,
      delta
    ) => {
      /*
       * 現在のDNAから
       * 目標Compositionを作る
       */
      const targetComposition =
        getWorldComposition(
          props
        );


      /*
       * Compositionの変化速度
       *
       * 0.8
       * → かなりゆっくり
       *
       * 1.4
       * → 幻想的
       *
       * 2.5
       * → 普通
       *
       * 4以上
       * → 素早い
       */
      const compositionSpeed =
        1.4;


      const nextComposition =
        dampComposition(
          compositionRef.current,
          targetComposition,
          compositionSpeed,
          delta
        );


      compositionRef.current =
        nextComposition;


      /*
       * React描画は約30fps
       */
      compositionTimerRef.current +=
        delta;


      if (
        compositionTimerRef.current <
        1 / 30
      ) {
        return;
      }


      compositionTimerRef.current =
        0;


      setComposition({
        ...nextComposition,
      });
    }
  );


  // =========================================================
  // LIGHT COLOR
  // =========================================================

  const coldLight =
    new THREE.Color(
      "#718bff"
    );

  const warmLight =
    new THREE.Color(
      "#ffc090"
    );


  const mainLight =
    coldLight
      .clone()
      .lerp(
        warmLight,
        warmth
      );


  // =========================================================
  // FOG
  // =========================================================

  const fogColor =
    new THREE.Color(
      0.003 +
        (
          1 -
          darkness
        ) *
          0.006,

      0.003 +
        (
          1 -
          darkness
        ) *
          0.007,

      0.008 +
        (
          1 -
          darkness
        ) *
          0.012
    );


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <>
      {/* BACKGROUND */}

      <color
        attach="background"
        args={[
          "#000000",
        ]}
      />


      {/* FOG */}

      <fog
        attach="fog"
        args={[
          fogColor,
          12,
          38,
        ]}
      />


      {/* LIGHTS */}

      <ambientLight
        intensity={
          0.08 +
          (
            1 -
            darkness
          ) *
            0.18
        }
      />


      <pointLight
        position={[
          0,
          1,
          4,
        ]}
        color={
          mainLight
        }
        intensity={
          4 +
          hope *
            7
        }
        distance={
          30
        }
        decay={
          2
        }
      />


      <pointLight
        position={[
          -5,
          3,
          -6,
        ]}
        color="#526dff"
        intensity={
          1.5 +
          hope *
            2
        }
        distance={
          25
        }
        decay={
          2
        }
      />


      {/* ================================================== */}
      {/* WORLDS */}
      {/* ================================================== */}

      <GalaxyWorld
        {...props}
        mix={
          composition.galaxy
        }
      />


      <CloudWorld
        {...props}
        mix={
          composition.cloud
        }
      />


      <WaveWorld
        {...props}
        mix={
          composition.wave
        }
      />


      <OrganismWorld
        {...props}
        mix={
          composition.organism
        }
      />


      <CrystalWorld
        {...props}
        mix={
          composition.crystal
        }
      />


      <RainWorld
        {...props}
        mix={
          composition.rain
        }
      />


      <VoidWorld
        {...props}
        mix={
          composition.void
        }
      />


      {/* CENTER LIGHT */}

      <CenterLight
        {...props}
      />


      {/* CAMERA */}

      <CameraMotion
        {...props}
      />


      {/* POST PROCESS */}

      <EffectComposer>
        <Bloom
          intensity={
            0.15
          }
          luminanceThreshold={
            0.9
          }
          luminanceSmoothing={
            0.15
          }
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}


// ============================================================
// WORLD 3D
// ============================================================

export default function World3D(
  props: World3DProps
) {
  return (
    <div
      style={{
        position:
          "fixed",

        top:
          0,

        left:
          380,

        right:
          0,

        bottom:
          0,

        background:
          "#000000",

        zIndex:
          0,

        overflow:
          "hidden",
      }}
    >
      <Canvas
        camera={{
          position: [
            0,
            1.2,
            12,
          ],

          fov:
            55,

          near:
            0.1,

          far:
            100,
        }}

        dpr={[
          1,
          1.5,
        ]}

        gl={{
          antialias:
            true,

          alpha:
            false,

          powerPreference:
            "high-performance",
        }}

        onCreated={({
          gl,
        }) => {
          gl.setClearColor(
            "#000000"
          );

          gl.outputColorSpace =
            THREE.SRGBColorSpace;

          gl.toneMapping =
            THREE.ACESFilmicToneMapping;

          gl.toneMappingExposure =
            0.75;
        }}
      >
        <SmoothWorld
          targetDNA={
            props
          }
        />
      </Canvas>
    </div>
  );
}