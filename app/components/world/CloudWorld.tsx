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
  getCloudStrength,
} from "./strengths";


// ============================================================
// CLOUD WORLD
// ============================================================

export default function CloudWorld({
  mix = 1,
  quietness = 0.5,
  spaciousness = 0.5,
  darkness = 0.5,
  fantasy = 0.5,
  warmth = 0.5,
  hope = 0.5,
  speed = 0.4,
  chaos = 0.5,
}: World3DProps) {
  const groupRef =
    useRef<THREE.Group>(null);

  const materialRef =
    useRef<THREE.ShaderMaterial>(null);

  const cloudStrength =
    getCloudStrength(
      quietness,
      spaciousness,
      darkness
    )*mix;

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

          uQuietness: {
            value: quietness,
          },

          uSpaciousness: {
            value: spaciousness,
          },

          uDarkness: {
            value: darkness,
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
            value: cloudStrength,
          },
        },

        // ===================================================
        // VERTEX SHADER
        // ===================================================

        vertexShader: `
          uniform float uTime;
          uniform float uQuietness;
          uniform float uSpaciousness;
          uniform float uFantasy;
          uniform float uSpeed;
          uniform float uChaos;

          varying vec2 vUv;
          varying vec3 vPosition;

          void main() {
            vUv = uv;

            vec3 pos =
              position;

            float t =
              uTime *
              (
                0.04 +
                uSpeed *
                0.12
              );

            /*
             * 静かなゆらぎ
             */
            float slowWave =
              sin(
                pos.x * 0.45 +
                t
              ) *
              cos(
                pos.y * 0.38 -
                t * 0.7
              );

            pos.z +=
              slowWave *
              (
                0.03 +
                uQuietness *
                0.15
              );

            /*
             * Fantasy
             * → 少し立体的に歪む
             */
            pos.z +=
              sin(
                pos.x * 1.1 +
                pos.y * 0.8 +
                t * 1.8
              ) *
              uFantasy *
              0.08;

            /*
             * Chaos
             * → 雲の表面に細かい揺らぎ
             */
            pos.x +=
              sin(
                pos.y * 2.2 +
                t * 2.0
              ) *
              uChaos *
              0.025;

            pos.y +=
              cos(
                pos.x * 1.8 -
                t * 1.5
              ) *
              uChaos *
              0.025;

            /*
             * Spaciousness
             */
            pos.xy *=
              0.8 +
              uSpaciousness *
              0.7;

            vPosition =
              pos;

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
          uniform float uTime;
          uniform float uQuietness;
          uniform float uDarkness;
          uniform float uFantasy;
          uniform float uWarmth;
          uniform float uHope;
          uniform float uChaos;
          uniform float uStrength;

          varying vec2 vUv;
          varying vec3 vPosition;


          // -----------------------------------------------
          // HASH
          // -----------------------------------------------

          float hash(
            vec2 p
          ) {
            return fract(
              sin(
                dot(
                  p,
                  vec2(
                    127.1,
                    311.7
                  )
                )
              ) *
              43758.5453123
            );
          }


          // -----------------------------------------------
          // VALUE NOISE
          // -----------------------------------------------

          float noise(
            vec2 p
          ) {
            vec2 i =
              floor(p);

            vec2 f =
              fract(p);

            f =
              f *
              f *
              (
                3.0 -
                2.0 * f
              );

            float a =
              hash(
                i
              );

            float b =
              hash(
                i +
                vec2(
                  1.0,
                  0.0
                )
              );

            float c =
              hash(
                i +
                vec2(
                  0.0,
                  1.0
                )
              );

            float d =
              hash(
                i +
                vec2(
                  1.0,
                  1.0
                )
              );

            return mix(
              mix(
                a,
                b,
                f.x
              ),
              mix(
                c,
                d,
                f.x
              ),
              f.y
            );
          }


          // -----------------------------------------------
          // FBM
          // -----------------------------------------------

          float fbm(
            vec2 p
          ) {
            float value =
              0.0;

            float amplitude =
              0.5;

            for (
              int i = 0;
              i < 5;
              i++
            ) {
              value +=
                noise(p) *
                amplitude;

              p *=
                2.03;

              amplitude *=
                0.5;
            }

            return value;
          }


          void main() {
            vec2 uv =
              vUv;

            /*
             * 中央基準へ
             */
            vec2 centered =
              uv -
              0.5;

            float t =
              uTime *
              (
                0.015 +
                0.035 *
                (
                  1.0 -
                  uQuietness
                )
              );

            /*
             * 1層目
             */
            vec2 p =
              centered *
              (
                2.5 +
                uFantasy *
                1.5
              );

            p.x +=
              t;

            p.y -=
              t * 0.6;

            float cloudA =
              fbm(
                p
              );

            /*
             * 2層目
             */
            float cloudB =
              fbm(
                p *
                2.2 +
                vec2(
                  t * 0.4,
                  -t * 0.3
                )
              );

            /*
             * 3層目
             */
            float cloudC =
              fbm(
                p *
                4.0 -
                vec2(
                  t * 0.25,
                  t * 0.15
                )
              );

            float cloud =
              cloudA *
              0.58 +
              cloudB *
              0.30 +
              cloudC *
              0.12;

            /*
             * Chaosで細かいノイズを増加
             */
            cloud +=
              noise(
                p *
                7.0
              ) *
              uChaos *
              0.12;

            /*
             * 周囲を消す
             */
            float radial =
              length(
                centered
              );

            float mask =
              1.0 -
              smoothstep(
                0.18,
                0.72,
                radial
              );

            /*
             * 雲の密度
             */
            float density =
              smoothstep(
                0.34,
                0.78,
                cloud
              );

            density *=
              mask;

            /*
             * Quietness
             * → 柔らかい霧
             */
            density *=
              0.55 +
              uQuietness *
              0.55;

            // -----------------------------------------------
            // COLOR
            // -----------------------------------------------

            vec3 cold =
              vec3(
                0.20,
                0.30,
                0.48
              );

            vec3 warm =
              vec3(
                0.56,
                0.31,
                0.24
              );

            vec3 color =
              mix(
                cold,
                warm,
                uWarmth
              );

            /*
             * Fantasy
             * → 紫・青方向へ
             */
            vec3 fantasyColor =
              vec3(
                0.35,
                0.23,
                0.62
              );

            color =
              mix(
                color,
                fantasyColor,
                uFantasy *
                0.4
              );

            /*
             * Hope
             * → 白っぽい中心光
             */
            float centerLight =
              1.0 -
              smoothstep(
                0.0,
                0.6,
                radial
              );

            color =
              mix(
                color,
                vec3(
                  0.82,
                  0.88,
                  1.0
                ),
                centerLight *
                uHope *
                0.28
              );

            /*
             * Darkness
             */
            color *=
              0.55 +
              (
                1.0 -
                uDarkness
              ) *
              0.35;

            /*
             * Bloom暴走防止
             * 1.0を大きく超えない
             */
            color *=
              0.55 +
              cloud *
              0.35;

            float alpha =
              density *
              (
                0.06 +
                uStrength *
                0.24
              );

            /*
             * Fantasyで少し星雲感
             */
            alpha *=
              0.8 +
              uFantasy *
              0.25;

            gl_FragColor =
              vec4(
                color,
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

        uniforms.uQuietness.value =
          quietness;

        uniforms.uSpaciousness.value =
          spaciousness;

        uniforms.uDarkness.value =
          darkness;

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
          cloudStrength;
      }

      if (
        groupRef.current
      ) {
        groupRef.current
          .rotation.z +=
          delta *
          (
            0.001 +
            speed *
            0.003
          );

        groupRef.current
          .rotation.y =
          Math.sin(
            state.clock
              .elapsedTime *
              0.04
          ) *
          0.08;

        const scale =
          0.9 +
          spaciousness *
            0.45;

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
      position={[
        0,
        0.3,
        -2.5,
      ]}
    >
      {/* Main Nebula */}

      <mesh>
        <planeGeometry
          args={[
            14,
            10,
            80,
            60,
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
          depthWrite={false}
          side={
            THREE.DoubleSide
          }
          blending={
            THREE.AdditiveBlending
          }
        />
      </mesh>
    </group>
  );
}