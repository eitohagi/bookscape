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
  getCloudStrength,
} from "./strengths";


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


function smoothstepValue(
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

  solitude = 0.5,
  tension = 0.5,
  fluidity = 0.5,

}: World3DProps) {

  // ==========================================================
  // REFS
  // ==========================================================

  const rootRef =
    useRef<THREE.Group>(
      null
    );


  const nebulaMaterialRef =
    useRef<THREE.ShaderMaterial>(
      null
    );


  const mistMaterialRef =
    useRef<THREE.ShaderMaterial>(
      null
    );


  const stormMaterialRef =
    useRef<THREE.ShaderMaterial>(
      null
    );


  const auroraMaterialRef =
    useRef<THREE.ShaderMaterial>(
      null
    );


  const nebulaRef =
    useRef<THREE.Group>(
      null
    );


  const mistRef =
    useRef<THREE.Group>(
      null
    );


  const stormRef =
    useRef<THREE.Group>(
      null
    );


  const auroraRef =
    useRef<THREE.Group>(
      null
    );


  // ==========================================================
  // BASE STRENGTH
  // ==========================================================

  const cloudStrength =
    clamp01(
      getCloudStrength(
        quietness,
        spaciousness,
        darkness
      ) *
      mix
    );


  // ==========================================================
  // MORPHOLOGY SCORES
  // ==========================================================

  /*
   * NEBULA
   *
   * fantasy + spaciousness
   */

  const rawNebula =
    clamp01(
      fantasy * 0.38 +
      spaciousness * 0.28 +
      darkness * 0.14 +
      solitude * 0.10 +
      hope * 0.10
    );


  /*
   * MIST
   *
   * quietness + fluidity
   */

  const rawMist =
    clamp01(
      quietness * 0.42 +
      fluidity * 0.24 +
      spaciousness * 0.16 +
      solitude * 0.10 +
      fantasy * 0.08
    );


  /*
   * STORM
   *
   * darkness + chaos + tension
   */

  const rawStorm =
    clamp01(
      darkness * 0.34 +
      chaos * 0.28 +
      tension * 0.22 +
      speed * 0.10 +
      fantasy * 0.06
    );


  /*
   * AURORA
   *
   * hope + fantasy + fluidity
   */

  const rawAurora =
    clamp01(
      hope * 0.32 +
      fantasy * 0.28 +
      fluidity * 0.20 +
      spaciousness * 0.12 +
      quietness * 0.08
    );


  // ==========================================================
  // ACTIVATION
  // ==========================================================

  const nebulaStrength =
    smoothstepValue(
      0.44,
      0.73,
      rawNebula
    );


  const mistStrength =
    smoothstepValue(
      0.44,
      0.72,
      rawMist
    );


  const stormStrength =
    smoothstepValue(
      0.49,
      0.77,
      rawStorm
    );


  const auroraStrength =
    smoothstepValue(
      0.46,
      0.74,
      rawAurora
    );


  // ==========================================================
  // PRIMARY MORPHOLOGY
  // ==========================================================

  const morphologyMax =
    Math.max(
      nebulaStrength,
      mistStrength,
      stormStrength,
      auroraStrength
    );


  const boost =
    0.18;


  const nebulaVisual =
    clamp01(
      nebulaStrength +
      (
        nebulaStrength ===
        morphologyMax
          ? boost
          : 0
      )
    );


  const mistVisual =
    clamp01(
      mistStrength +
      (
        mistStrength ===
        morphologyMax
          ? boost
          : 0
      )
    );


  const stormVisual =
    clamp01(
      stormStrength +
      (
        stormStrength ===
        morphologyMax
          ? boost
          : 0
      )
    );


  const auroraVisual =
    clamp01(
      auroraStrength +
      (
        auroraStrength ===
        morphologyMax
          ? boost
          : 0
      )
    );


  // ==========================================================
  // COMPOSITION
  // ==========================================================

  const subjectScale =
    0.94 +
    spaciousness * 0.34 -
    solitude * 0.08;


  const subjectX =
    (
      chaos -
      0.5
    ) *
    0.55;


  const subjectY =
    (
      hope -
      0.5
    ) *
    0.38;


  const subjectZ =
    -2.6 -
    darkness *
      0.85;


  // ==========================================================
  // COMMON GLSL NOISE
  // ==========================================================

  const noiseGLSL = `
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


    float noise(
      vec2 p
    ) {
      vec2 i =
        floor(
          p
        );

      vec2 f =
        fract(
          p
        );

      f =
        f *
        f *
        (
          3.0 -
          2.0 *
          f
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
          noise(
            p
          ) *
          amplitude;


        p =
          p *
          2.03 +
          vec2(
            0.17,
            -0.11
          );


        amplitude *=
          0.5;
      }


      return value;
    }
  `;


  // ==========================================================
  // NEBULA SHADER
  // ==========================================================

  const nebulaShader =
    useMemo(
      () => ({

        uniforms: {

          uTime: {
            value: 0,
          },

          uQuietness: {
            value:
              quietness,
          },

          uFantasy: {
            value:
              fantasy,
          },

          uDarkness: {
            value:
              darkness,
          },

          uWarmth: {
            value:
              warmth,
          },

          uHope: {
            value:
              hope,
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
          uniform float uChaos;

          varying vec2 vUv;
          varying vec3 vPosition;


          void main() {

            vUv =
              uv;


            vec3 pos =
              position;


            float t =
              uTime *
              0.035;


            pos.z +=
              sin(
                pos.x *
                  0.40 +
                pos.y *
                  0.34 +
                t
              ) *
              (
                0.04 +
                uFantasy *
                  0.16
              );


            pos.z +=
              sin(
                pos.x *
                  1.1 -
                pos.y *
                  0.8 +
                t *
                  2.0
              ) *
              uChaos *
              0.045;


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


        fragmentShader: `
          uniform float uTime;
          uniform float uQuietness;
          uniform float uFantasy;
          uniform float uDarkness;
          uniform float uWarmth;
          uniform float uHope;
          uniform float uChaos;
          uniform float uStrength;

          varying vec2 vUv;
          varying vec3 vPosition;

          ${noiseGLSL}


          void main() {

            vec2 centered =
              vUv -
              0.5;


            float radial =
              length(
                centered
              );


            float t =
              uTime *
              (
                0.012 +
                (
                  1.0 -
                  uQuietness
                ) *
                  0.028
              );


            vec2 p =
              centered *
              (
                2.4 +
                uFantasy *
                  2.0
              );


            /*
             * swirl
             */

            float angle =
              atan(
                centered.y,
                centered.x
              );


            float swirl =
              radial *
              (
                1.2 +
                uFantasy *
                  2.4
              );


            p.x +=
              cos(
                angle +
                swirl +
                t
              ) *
              0.22 *
              uFantasy;


            p.y +=
              sin(
                angle +
                swirl +
                t
              ) *
              0.22 *
              uFantasy;


            p.x +=
              t;

            p.y -=
              t *
              0.62;


            float a =
              fbm(
                p
              );


            float b =
              fbm(
                p *
                  2.1 +
                vec2(
                  t *
                    0.5,
                  -t *
                    0.35
                )
              );


            float c =
              fbm(
                p *
                  4.4 -
                vec2(
                  t *
                    0.22,
                  t *
                    0.18
                )
              );


            float cloud =
              a *
                0.56 +
              b *
                0.31 +
              c *
                0.13;


            cloud +=
              noise(
                p *
                  7.0
              ) *
              uChaos *
              0.11;


            float mask =
              1.0 -
              smoothstep(
                0.25,
                0.76,
                radial
              );


            float density =
              smoothstep(
                0.34,
                0.76,
                cloud
              ) *
              mask;


            vec3 blue =
              vec3(
                0.10,
                0.24,
                0.56
              );


            vec3 violet =
              vec3(
                0.46,
                0.20,
                0.72
              );


            vec3 cyan =
              vec3(
                0.20,
                0.64,
                0.84
              );


            vec3 warm =
              vec3(
                0.68,
                0.30,
                0.20
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
                cyan,
                uHope *
                  0.20
              );


            color =
              mix(
                color,
                warm,
                uWarmth *
                  0.34
              );


            float centerLight =
              1.0 -
              smoothstep(
                0.02,
                0.58,
                radial
              );


            color =
              mix(
                color,
                vec3(
                  0.90,
                  0.94,
                  1.0
                ),
                centerLight *
                uHope *
                0.20
              );


            color *=
              0.46 +
              (
                1.0 -
                uDarkness
              ) *
                0.34 +
              cloud *
                0.22;


            float alpha =
              density *
              uStrength *
              (
                0.10 +
                uFantasy *
                  0.12
              );


            gl_FragColor =
              vec4(
                color,
                alpha
              );
          }
        `,

      }),
      [noiseGLSL]
    );


  // ==========================================================
  // MIST SHADER
  // ==========================================================

  const mistShader =
    useMemo(
      () => ({

        uniforms: {

          uTime: {
            value: 0,
          },

          uQuietness: {
            value:
              quietness,
          },

          uFluidity: {
            value:
              fluidity,
          },

          uFantasy: {
            value:
              fantasy,
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
            value: 0,
          },

        },


        vertexShader: `
          uniform float uTime;
          uniform float uFluidity;

          varying vec2 vUv;


          void main() {

            vUv =
              uv;


            vec3 pos =
              position;


            pos.y +=
              sin(
                pos.x *
                  0.28 +
                uTime *
                  0.10
              ) *
              uFluidity *
              0.12;


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
          uniform float uQuietness;
          uniform float uFluidity;
          uniform float uFantasy;
          uniform float uWarmth;
          uniform float uHope;
          uniform float uStrength;

          varying vec2 vUv;

          ${noiseGLSL}


          void main() {

            vec2 centered =
              vUv -
              0.5;


            float radial =
              length(
                centered
              );


            float t =
              uTime *
              (
                0.008 +
                uFluidity *
                  0.018
              );


            vec2 p =
              centered *
              3.0;


            p.x +=
              t;

            p.y +=
              sin(
                p.x *
                  0.8 +
                t
              ) *
              0.20 *
              uFluidity;


            float cloud =
              fbm(
                p
              );


            cloud =
              cloud *
                0.68 +
              fbm(
                p *
                  2.4
              ) *
                0.32;


            /*
             * horizontal fog bands
             */

            float band =
              1.0 -
              abs(
                centered.y
              ) *
                1.65;


            band =
              smoothstep(
                0.0,
                1.0,
                band
              );


            float mask =
              1.0 -
              smoothstep(
                0.32,
                0.78,
                radial
              );


            float density =
              smoothstep(
                0.35,
                0.72,
                cloud
              );


            density *=
              band *
              mask;


            density *=
              0.74 +
              uQuietness *
                0.35;


            vec3 cool =
              vec3(
                0.30,
                0.42,
                0.56
              );


            vec3 pale =
              vec3(
                0.66,
                0.78,
                0.86
              );


            vec3 warm =
              vec3(
                0.66,
                0.52,
                0.42
              );


            vec3 color =
              mix(
                cool,
                pale,
                uHope *
                  0.26 +
                uFantasy *
                  0.10
              );


            color =
              mix(
                color,
                warm,
                uWarmth *
                  0.26
              );


            float alpha =
              density *
              uStrength *
              0.13;


            gl_FragColor =
              vec4(
                color *
                  (
                    0.42 +
                    cloud *
                      0.22
                  ),
                alpha
              );
          }
        `,

      }),
      [noiseGLSL]
    );


  // ==========================================================
  // STORM SHADER
  // ==========================================================

  const stormShader =
    useMemo(
      () => ({

        uniforms: {

          uTime: {
            value: 0,
          },

          uDarkness: {
            value:
              darkness,
          },

          uChaos: {
            value:
              chaos,
          },

          uTension: {
            value:
              tension,
          },

          uFantasy: {
            value:
              fantasy,
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
          uniform float uChaos;
          uniform float uTension;

          varying vec2 vUv;


          void main() {

            vUv =
              uv;


            vec3 pos =
              position;


            float t =
              uTime *
              (
                0.06 +
                uTension *
                  0.16
              );


            pos.z +=
              sin(
                pos.x *
                  0.75 +
                pos.y *
                  0.52 +
                t
              ) *
              (
                0.08 +
                uChaos *
                  0.22
              );


            pos.x +=
              sin(
                pos.y *
                  1.5 +
                t *
                  2.0
              ) *
              uChaos *
              0.05;


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
          uniform float uDarkness;
          uniform float uChaos;
          uniform float uTension;
          uniform float uFantasy;
          uniform float uWarmth;
          uniform float uStrength;

          varying vec2 vUv;

          ${noiseGLSL}


          void main() {

            vec2 centered =
              vUv -
              0.5;


            float radial =
              length(
                centered
              );


            float t =
              uTime *
              (
                0.025 +
                uTension *
                  0.07
              );


            vec2 p =
              centered *
              (
                3.1 +
                uChaos *
                  1.5
              );


            p.x +=
              t *
              (
                1.0 +
                uChaos
              );


            p.y +=
              sin(
                p.x *
                  0.8 +
                t *
                  2.0
              ) *
              uChaos *
              0.26;


            float a =
              fbm(
                p
              );


            float b =
              fbm(
                p *
                  2.8 +
                vec2(
                  -t,
                  t *
                    0.6
                )
              );


            float cloud =
              a *
                0.64 +
              b *
                0.36;


            float detail =
              noise(
                p *
                  9.0
              );


            cloud +=
              detail *
              uChaos *
              0.16;


            float mask =
              1.0 -
              smoothstep(
                0.30,
                0.80,
                radial
              );


            float density =
              smoothstep(
                0.31,
                0.70,
                cloud
              ) *
              mask;


            /*
             * lightning-like internal flashes
             */

            float flashTime =
              sin(
                uTime *
                  (
                    1.2 +
                    uTension *
                      3.0
                  )
              );


            float flash =
              smoothstep(
                0.92,
                1.0,
                flashTime
              );


            float lightningNoise =
              noise(
                vec2(
                  centered.x *
                    18.0,
                  centered.y *
                    5.0 +
                  uTime
                )
              );


            flash *=
              smoothstep(
                0.67,
                0.88,
                lightningNoise
              );


            vec3 darkBlue =
              vec3(
                0.06,
                0.10,
                0.20
              );


            vec3 purple =
              vec3(
                0.22,
                0.16,
                0.36
              );


            vec3 warmDark =
              vec3(
                0.30,
                0.13,
                0.10
              );


            vec3 color =
              mix(
                darkBlue,
                purple,
                uFantasy *
                  0.40
              );


            color =
              mix(
                color,
                warmDark,
                uWarmth *
                  0.25
              );


            color *=
              0.40 +
              (
                1.0 -
                uDarkness
              ) *
                0.24;


            color +=
              vec3(
                0.55,
                0.70,
                1.0
              ) *
              flash *
              (
                0.20 +
                uTension *
                  0.55
              );


            float alpha =
              density *
              uStrength *
              (
                0.12 +
                uDarkness *
                  0.12
              );


            alpha +=
              flash *
              density *
              uStrength *
              0.09;


            gl_FragColor =
              vec4(
                color,
                alpha
              );
          }
        `,

      }),
      [noiseGLSL]
    );


  // ==========================================================
  // AURORA SHADER
  // ==========================================================

  const auroraShader =
    useMemo(
      () => ({

        uniforms: {

          uTime: {
            value: 0,
          },

          uHope: {
            value:
              hope,
          },

          uFantasy: {
            value:
              fantasy,
          },

          uFluidity: {
            value:
              fluidity,
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
          uniform float uFluidity;
          uniform float uFantasy;

          varying vec2 vUv;
          varying float vWave;


          void main() {

            vUv =
              uv;


            vec3 pos =
              position;


            float wave =
              sin(
                pos.x *
                  0.60 +
                uTime *
                  0.20
              );


            wave +=
              sin(
                pos.x *
                  1.30 -
                uTime *
                  0.14
              ) *
              0.42;


            pos.y +=
              wave *
              (
                0.20 +
                uFluidity *
                  0.75
              );


            pos.z +=
              sin(
                pos.x *
                  0.42 +
                uTime *
                  0.12
              ) *
              uFantasy *
              0.26;


            vWave =
              wave;


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
          uniform float uHope;
          uniform float uFantasy;
          uniform float uWarmth;
          uniform float uStrength;

          varying vec2 vUv;
          varying float vWave;

          ${noiseGLSL}


          void main() {

            float vertical =
              1.0 -
              abs(
                vUv.y -
                0.5
              ) *
                2.0;


            vertical =
              pow(
                max(
                  vertical,
                  0.0
                ),
                1.8
              );


            float curtains =
              sin(
                vUv.x *
                  28.0 +
                uTime *
                  0.34 +
                vWave *
                  2.0
              ) *
              0.5 +
              0.5;


            curtains =
              pow(
                curtains,
                2.5
              );


            float n =
              fbm(
                vec2(
                  vUv.x *
                    5.0 +
                  uTime *
                    0.025,
                  vUv.y *
                    2.2
                )
              );


            vec3 cyan =
              vec3(
                0.18,
                0.86,
                0.90
              );


            vec3 blue =
              vec3(
                0.20,
                0.44,
                1.0
              );


            vec3 violet =
              vec3(
                0.62,
                0.32,
                1.0
              );


            vec3 warm =
              vec3(
                1.0,
                0.50,
                0.28
              );


            vec3 color =
              mix(
                cyan,
                blue,
                n
              );


            color =
              mix(
                color,
                violet,
                uFantasy *
                  0.42
              );


            color =
              mix(
                color,
                warm,
                uWarmth *
                  0.20
              );


            color =
              mix(
                color,
                vec3(
                  1.0
                ),
                uHope *
                  0.18
              );


            float alpha =
              vertical *
              (
                0.12 +
                curtains *
                  0.34
              ) *
              uStrength;


            alpha *=
              0.68 +
              n *
                0.40;


            gl_FragColor =
              vec4(
                color *
                  (
                    0.48 +
                    curtains *
                      0.70
                  ),
                alpha
              );
          }
        `,

      }),
      [noiseGLSL]
    );


  // ==========================================================
  // UPDATE
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
          subjectX;


        rootRef.current.position.y =
          subjectY +
          Math.sin(
            t *
              0.035
          ) *
          0.04;


        rootRef.current.position.z =
          subjectZ;


        const breathing =
          1 +
          Math.sin(
            t *
              0.035
          ) *
          0.015;


        rootRef.current.scale.setScalar(
          subjectScale *
          breathing
        );
      }


      // ======================================================
      // NEBULA
      // ======================================================

      if (
        nebulaMaterialRef.current
      ) {

        const u =
          nebulaMaterialRef.current
            .uniforms;


        u.uTime.value =
          t;

        u.uQuietness.value =
          quietness;

        u.uFantasy.value =
          fantasy;

        u.uDarkness.value =
          darkness;

        u.uWarmth.value =
          warmth;

        u.uHope.value =
          hope;

        u.uChaos.value =
          chaos;

        u.uStrength.value =
          cloudStrength *
          nebulaVisual;
      }


      if (
        nebulaRef.current
      ) {

        nebulaRef.current.rotation.z +=
          delta *
          (
            0.0008 +
            speed *
              0.0022
          );


        nebulaRef.current.rotation.y =
          Math.sin(
            t *
              0.025
          ) *
          0.06;
      }


      // ======================================================
      // MIST
      // ======================================================

      if (
        mistMaterialRef.current
      ) {

        const u =
          mistMaterialRef.current
            .uniforms;


        u.uTime.value =
          t;

        u.uQuietness.value =
          quietness;

        u.uFluidity.value =
          fluidity;

        u.uFantasy.value =
          fantasy;

        u.uWarmth.value =
          warmth;

        u.uHope.value =
          hope;

        u.uStrength.value =
          cloudStrength *
          mistVisual;
      }


      if (
        mistRef.current
      ) {

        mistRef.current.position.x =
          Math.sin(
            t *
              0.018
          ) *
          0.35;


        mistRef.current.position.y =
          -0.45 +
          Math.cos(
            t *
              0.023
          ) *
          0.12;
      }


      // ======================================================
      // STORM
      // ======================================================

      if (
        stormMaterialRef.current
      ) {

        const u =
          stormMaterialRef.current
            .uniforms;


        u.uTime.value =
          t;

        u.uDarkness.value =
          darkness;

        u.uChaos.value =
          chaos;

        u.uTension.value =
          tension;

        u.uFantasy.value =
          fantasy;

        u.uWarmth.value =
          warmth;

        u.uStrength.value =
          cloudStrength *
          stormVisual;
      }


      if (
        stormRef.current
      ) {

        stormRef.current.rotation.z =
          Math.sin(
            t *
              (
                0.035 +
                tension *
                  0.035
              )
          ) *
          chaos *
          0.08;


        stormRef.current.position.x =
          Math.sin(
            t *
              0.11
          ) *
          chaos *
          0.12;
      }


      // ======================================================
      // AURORA
      // ======================================================

      if (
        auroraMaterialRef.current
      ) {

        const u =
          auroraMaterialRef.current
            .uniforms;


        u.uTime.value =
          t;

        u.uHope.value =
          hope;

        u.uFantasy.value =
          fantasy;

        u.uFluidity.value =
          fluidity;

        u.uWarmth.value =
          warmth;

        u.uStrength.value =
          cloudStrength *
          auroraVisual;
      }


      if (
        auroraRef.current
      ) {

        auroraRef.current.rotation.z =
          Math.sin(
            t *
              0.025
          ) *
          0.04;


        auroraRef.current.position.y =
          0.55 +
          Math.sin(
            t *
              0.06
          ) *
          0.10;
      }
    }
  );


  // ==========================================================
  // HIDE
  // ==========================================================

  if (
    cloudStrength <=
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
      {/* NEBULA                                                */}
      {/* ===================================================== */}

      <group
        ref={nebulaRef}
      >

        <mesh>

          <planeGeometry
            args={[
              15,
              11,
              80,
              60,
            ]}
          />


          <shaderMaterial
            ref={
              nebulaMaterialRef
            }
            args={[
              nebulaShader,
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


        {/* second nebula depth layer */}

        <mesh
          position={[
            0.8,
            -0.4,
            -1.2,
          ]}
          rotation={[
            0,
            0,
            0.35,
          ]}
          scale={[
            1.28,
            0.86,
            1,
          ]}
        >

          <planeGeometry
            args={[
              14,
              10,
              60,
              50,
            ]}
          />


          <shaderMaterial
            args={[
              nebulaShader,
            ]}
            transparent
            opacity={
              cloudStrength *
              nebulaVisual *
              0.28
            }
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

      </group>


      {/* ===================================================== */}
      {/* MIST                                                  */}
      {/* ===================================================== */}

      <group
        ref={mistRef}
        position={[
          0,
          -0.45,
          -0.6,
        ]}
      >

        <mesh
          scale={[
            1.30,
            0.62,
            1,
          ]}
        >

          <planeGeometry
            args={[
              16,
              8,
              60,
              40,
            ]}
          />


          <shaderMaterial
            ref={
              mistMaterialRef
            }
            args={[
              mistShader,
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

      </group>


      {/* ===================================================== */}
      {/* STORM                                                 */}
      {/* ===================================================== */}

      <group
        ref={stormRef}
        position={[
          0,
          0.15,
          -0.3,
        ]}
      >

        <mesh
          rotation={[
            0.02,
            0.04,
            -0.10,
          ]}
        >

          <planeGeometry
            args={[
              15,
              10,
              90,
              65,
            ]}
          />


          <shaderMaterial
            ref={
              stormMaterialRef
            }
            args={[
              stormShader,
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

      </group>


      {/* ===================================================== */}
      {/* AURORA                                                */}
      {/* ===================================================== */}

      <group
        ref={auroraRef}
        position={[
          0,
          0.55,
          0.4,
        ]}
      >

        <mesh
          rotation={[
            -0.04,
            0.08,
            0,
          ]}
          scale={[
            1,
            1.15,
            1,
          ]}
        >

          <planeGeometry
            args={[
              14,
              5.5,
              180,
              35,
            ]}
          />


          <shaderMaterial
            ref={
              auroraMaterialRef
            }
            args={[
              auroraShader,
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

      </group>

    </group>
  );
}