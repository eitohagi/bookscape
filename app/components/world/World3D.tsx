"use client";

import {
  useMemo,
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
    useRef(
      0
    );


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


      /*
       * 以前より少し遅め。
       *
       * テキスト変更時に
       * 世界が呼吸しながら変わる感じ。
       */

      const smoothingSpeed =
        2.0;


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


      updateTimerRef.current +=
        delta;


      /*
       * React側は30fps程度に制限。
       *
       * Shader animation自体は
       * useFrameで毎フレーム動くので問題なし。
       */

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
  tension = 0.5,
  fantasy = 0.5,
}: World3DProps) {

  const lightRef =
    useRef<THREE.Mesh>(
      null
    );


  useFrame(
    (
      state
    ) => {

      if (
        !lightRef.current
      ) {
        return;
      }


      const t =
        state.clock.elapsedTime;


      const pulseSpeed =
        0.45 +
        tension *
          0.9;


      const pulse =
        1 +
        Math.sin(
          t *
          pulseSpeed
        ) *
        (
          0.015 +
          hope *
            0.055 +
          fantasy *
            0.012
        );


      lightRef.current
        .scale
        .setScalar(
          pulse
        );
    }
  );


  const color =
    useMemo(
      () => {

        const cold =
          new THREE.Color(
            "#718cff"
          );


        const warm =
          new THREE.Color(
            "#ffd0a0"
          );


        return cold
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
              0.34
          );
      },
      [
        warmth,
        hope,
      ]
    );


  /*
   * solitudeが高い場合、
   * 中心の光を小さく弱く。
   */

  const lightStrength =
    clamp01(
      hope *
        0.72 +
      fantasy *
        0.16 -
      darkness *
        0.26 -
      solitude *
        0.16
    );


  if (
    lightStrength <=
    0.015
  ) {
    return null;
  }


  return (
    <group>

      {/* CORE */}

      <mesh
        ref={lightRef}
        scale={
          0.72 +
          hope *
            0.42 -
          solitude *
            0.14
        }
      >

        <sphereGeometry
          args={[
            0.16,
            28,
            28,
          ]}
        />


        <meshBasicMaterial
          color={
            color
          }
          transparent
          opacity={
            lightStrength *
            0.62
          }
          blending={
            THREE.AdditiveBlending
          }
          depthWrite={false}
          toneMapped={false}
        />

      </mesh>


      {/* INNER HALO */}

      <mesh
        scale={
          1.5 +
          fantasy *
            0.45
        }
      >

        <sphereGeometry
          args={[
            0.25,
            28,
            28,
          ]}
        />


        <meshBasicMaterial
          color={
            color
          }
          transparent
          opacity={
            lightStrength *
            0.10
          }
          blending={
            THREE.AdditiveBlending
          }
          depthWrite={false}
          side={
            THREE.BackSide
          }
          toneMapped={false}
        />

      </mesh>


      {/* FAR HALO */}

      <mesh
        scale={
          3 +
          fantasy *
            1.3
        }
      >

        <sphereGeometry
          args={[
            0.22,
            24,
            24,
          ]}
        />


        <meshBasicMaterial
          color={
            color
          }
          transparent
          opacity={
            lightStrength *
            0.025
          }
          blending={
            THREE.AdditiveBlending
          }
          depthWrite={false}
          side={
            THREE.BackSide
          }
          toneMapped={false}
        />

      </mesh>


      <pointLight
        color={
          color
        }
        intensity={
          0.6 +
          lightStrength *
            4.2
        }
        distance={
          15 +
          hope *
            8
        }
        decay={2}
      />

    </group>
  );
}


// ============================================================
// GLOBAL WORLD TRANSFORM
// ============================================================

function WorldStage({
  children,
  chaos = 0.5,
  solitude = 0.5,
  hope = 0.5,
  tension = 0.5,
  spaciousness = 0.5,
  fluidity = 0.5,
}: World3DProps & {
  children:
    React.ReactNode;
}) {

  const groupRef =
    useRef<THREE.Group>(
      null
    );


  useFrame(
    (
      state
    ) => {

      if (
        !groupRef.current
      ) {
        return;
      }


      const t =
        state.clock.elapsedTime;


      /*
       * 全Worldを完全に原点固定しない。
       *
       * DNAに応じて
       * 絵の重心自体を少し移動。
       */

      const baseX =
        (
          chaos -
          0.5
        ) *
        0.48;


      const baseY =
        (
          hope -
          0.5
        ) *
        0.30;


      groupRef.current.position.x =
        baseX +
        Math.sin(
          t *
            0.025
        ) *
        fluidity *
        0.08;


      groupRef.current.position.y =
        baseY +
        Math.cos(
          t *
            0.020
        ) *
        0.05;


      groupRef.current.position.z =
        (
          tension -
          0.5
        ) *
        -0.28;


      /*
       * solitudeが高い
       * → 小さい対象 + 余白
       *
       * spaciousnessが高い
       * → 少し広げる
       */

      const scale =
        1 -
        solitude *
          0.12 +
        spaciousness *
          0.08;


      groupRef.current
        .scale
        .setScalar(
          scale
        );


      /*
       * chaosによる
       * ごく小さい傾き
       */

      groupRef.current.rotation.z =
        Math.sin(
          t *
            0.018
        ) *
        chaos *
        0.025;
    }
  );


  return (
    <group
      ref={groupRef}
    >
      {children}
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
  speed = 0.4,
  hope = 0.5,
  chaos = 0.5,
  fluidity = 0.5,
}: World3DProps) {

  const lookTarget =
    useRef(
      new THREE.Vector3(
        0,
        0,
        0
      )
    );


  useFrame(
    (
      state,
      delta
    ) => {

      const camera =
        state.camera;


      const pointer =
        state.pointer;


      const t =
        state.clock.elapsedTime;


      // ======================================================
      // POINTER PARALLAX
      // ======================================================

      const pointerSensitivity =
        (
          0.14 +
          tension *
            0.20 +
          chaos *
            0.08
        ) *
        (
          1 -
          quietness *
            0.55
        );


      const pointerX =
        pointer.x *
        pointerSensitivity *
        1.8;


      const pointerY =
        pointer.y *
        pointerSensitivity *
        1.0;


      // ======================================================
      // CAMERA DISTANCE
      // ======================================================

      /*
       * spaciousness
       * → 少し引く
       *
       * solitude
       * → さらに引いて余白
       *
       * tension
       * → 少し寄る
       */

      const targetZ =
        10.2 +
        spaciousness *
          2.8 +
        solitude *
          1.5 -
        tension *
          1.1;


      // ======================================================
      // CINEMATIC DRIFT
      // ======================================================

      const driftAmount =
        0.10 +
        fluidity *
          0.22;


      const driftX =
        Math.sin(
          t *
          (
            0.018 +
            speed *
              0.012
          )
        ) *
        driftAmount;


      const driftY =
        Math.sin(
          t *
            0.014 +
          1.2
        ) *
        driftAmount *
        0.55;


      const targetX =
        pointerX +
        driftX;


      const targetY =
        0.75 +
        pointerY +
        driftY;


      /*
       * quietness高い
       * → カメラ移動をゆっくり
       */

      const responseSpeed =
        1.25 +
        (
          1 -
          quietness
        ) *
          1.1 +
        tension *
          0.40;


      const smoothing =
        1 -
        Math.exp(
          -delta *
          responseSpeed
        );


      camera.position.x =
        THREE.MathUtils.lerp(
          camera.position.x,
          targetX,
          smoothing
        );


      camera.position.y =
        THREE.MathUtils.lerp(
          camera.position.y,
          targetY,
          smoothing
        );


      camera.position.z =
        THREE.MathUtils.lerp(
          camera.position.z,
          targetZ,
          smoothing
        );


      // ======================================================
      // LOOK TARGET
      // ======================================================

      /*
       * 常に(0,0,0)を見るのではなく
       * 絵の重心へ微妙に追従。
       */

      const targetLookX =
        (
          chaos -
          0.5
        ) *
        0.28;


      const targetLookY =
        (
          hope -
          0.5
        ) *
        0.24;


      lookTarget.current.x =
        THREE.MathUtils.lerp(
          lookTarget.current.x,
          targetLookX,
          smoothing *
            0.55
        );


      lookTarget.current.y =
        THREE.MathUtils.lerp(
          lookTarget.current.y,
          targetLookY,
          smoothing *
            0.55
        );


      lookTarget.current.z =
        THREE.MathUtils.lerp(
          lookTarget.current.z,
          0,
          smoothing *
            0.5
        );


      camera.lookAt(
        lookTarget.current
      );


      // ======================================================
      // FOV
      // ======================================================

      if (
        camera instanceof
        THREE.PerspectiveCamera
      ) {

        const targetFov =
          53 +
          spaciousness *
            5 +
          chaos *
            2 -
          solitude *
            2;


        camera.fov =
          THREE.MathUtils.lerp(
            camera.fov,
            targetFov,
            smoothing *
              0.3
          );


        camera.updateProjectionMatrix();
      }
    }
  );


  return null;
}


// ============================================================
// POST PROCESS
// ============================================================

function PostProcessing({
  hope = 0.5,
  fantasy = 0.5,
  darkness = 0.5,
  tension = 0.5,
}: World3DProps) {

  /*
   * DNAによってBloomも変える。
   *
   * 常に同じBloomにしない。
   */

  const bloomIntensity =
    0.10 +
    hope *
      0.12 +
    fantasy *
      0.09 +
    tension *
      0.025;


  const bloomThreshold =
    THREE.MathUtils.lerp(
      1.05,
      0.78,
      clamp01(
        hope *
          0.45 +
        fantasy *
          0.35 +
        (
          1 -
          darkness
        ) *
          0.20
      )
    );


  return (
    <EffectComposer>

      <Bloom
        intensity={
          bloomIntensity
        }
        luminanceThreshold={
          bloomThreshold
        }
        luminanceSmoothing={
          0.22
        }
        mipmapBlur
      />

    </EffectComposer>
  );
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
    fantasy,
    spaciousness,
  } =
    props;


  // ==========================================================
  // WORLD COMPOSITION
  // ==========================================================

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
    useRef(
      0
    );


  useFrame(
    (
      _state,
      delta
    ) => {

      const targetComposition =
        getWorldComposition(
          props
        );


      /*
       * DNAより少し遅くすることで
       *
       * DNAが変化
       * ↓
       * 世界が後から追いつく
       *
       * という有機的な変化にする。
       */

      const compositionSpeed =
        1.05;


      const nextComposition =
        dampComposition(
          compositionRef.current,
          targetComposition,
          compositionSpeed,
          delta
        );


      compositionRef.current =
        nextComposition;


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


  // ==========================================================
  // LIGHTING PALETTE
  // ==========================================================

  const mainLight =
    useMemo(
      () => {

        const cold =
          new THREE.Color(
            "#627bff"
          );


        const warm =
          new THREE.Color(
            "#ffb982"
          );


        const fantasyColor =
          new THREE.Color(
            "#8a62ff"
          );


        const color =
          cold
            .clone()
            .lerp(
              warm,
              warmth
            );


        color.lerp(
          fantasyColor,
          fantasy *
            0.16
        );


        return color;
      },
      [
        warmth,
        fantasy,
      ]
    );


  // ==========================================================
  // FOG
  // ==========================================================

  const fogColor =
    useMemo(
      () => {

        const base =
          new THREE.Color(
            0.0015,
            0.002,
            0.006
          );


        const light =
          new THREE.Color(
            0.010,
            0.014,
            0.028
          );


        return base
          .clone()
          .lerp(
            light,
            (
              1 -
              darkness
            ) *
            0.55 +
            fantasy *
              0.08
          );
      },
      [
        darkness,
        fantasy,
      ]
    );


  const fogNear =
    10 +
    spaciousness *
      3;


  const fogFar =
    30 +
    spaciousness *
      16;


  // ==========================================================
  // GLOBAL COMPOSITION ENERGY
  // ==========================================================

  const worldEnergy =
    Object.values(
      composition
    ).reduce(
      (
        sum,
        value
      ) =>
        sum +
        value,
      0
    );


  /*
   * worldEnergyが高いほど
   * ambientをむしろ少し抑える。
   *
   * 全部光って白くなるのを防ぐ。
   */

  const ambientIntensity =
    Math.max(
      0.035,
      0.11 +
      (
        1 -
        darkness
      ) *
        0.10 -
      worldEnergy *
        0.018
    );


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <>
      {/* ===================================================== */}
      {/* BACKGROUND                                            */}
      {/* ===================================================== */}

      <color
        attach="background"
        args={[
          "#000000",
        ]}
      />


      {/* ===================================================== */}
      {/* FOG                                                   */}
      {/* ===================================================== */}

      <fog
        attach="fog"
        args={[
          fogColor,
          fogNear,
          fogFar,
        ]}
      />


      {/* ===================================================== */}
      {/* LIGHTING                                              */}
      {/* ===================================================== */}

      <ambientLight
        intensity={
          ambientIntensity
        }
      />


      <pointLight
        position={[
          2.5,
          3.5,
          5,
        ]}
        color={
          mainLight
        }
        intensity={
          1.8 +
          hope *
            3.2
        }
        distance={
          26 +
          spaciousness *
            8
        }
        decay={2}
      />


      <pointLight
        position={[
          -6,
          2.5,
          -5,
        ]}
        color="#455dcb"
        intensity={
          0.45 +
          fantasy *
            1.15
        }
        distance={25}
        decay={2}
      />


      {/* ===================================================== */}
      {/* GLOBAL WORLD STAGE                                    */}
      {/* ===================================================== */}

      <WorldStage
        {...props}
      >

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


        <CenterLight
          {...props}
        />

      </WorldStage>


      {/* ===================================================== */}
      {/* CAMERA                                                */}
      {/* ===================================================== */}

      <CameraMotion
        {...props}
      />


      {/* ===================================================== */}
      {/* POST PROCESS                                          */}
      {/* ===================================================== */}

      <PostProcessing
        {...props}
      />

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
            0.75,
            11.5,
          ],

          fov:
            54,

          near:
            0.1,

          far:
            120,
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


          /*
           * 前より少し暗め。
           *
           * 光っている部分と
           * 空白の差を出す。
           */

          gl.toneMappingExposure =
            0.68;
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