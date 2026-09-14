"use client";
import World3D from "./components/world/World3D";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  analyzeText,
  type DNA,
} from "./lib/analyzer";

// ============================================================
// TYPES
// ============================================================

type WorldName =
  | "galaxy"
  | "cloud"
  | "wave"
  | "organism"
  | "void"
  | "crystal"
  | "rain";

type WorldScore = {
  name: WorldName;
  value: number;
};

// ============================================================
// INITIAL DNA
// ============================================================

const initialDNA: DNA = {
  quietness: 0.672,
  chaos: 0.65,
  solitude: 0.772,
  hope: 0.406,
  fantasy: 0.574,
  nature: 0.558,
  darkness: 0.552,
  speed: 0.396,
  warmth: 0.455,
  spaciousness: 0.626,
  tension: 0.409,
  fluidity: 0.299,
};

// ============================================================
// HELPERS
// ============================================================

const clamp = (
  value: number,
  min: number,
  max: number
) =>
  Math.max(
    min,
    Math.min(max, value)
  );

const lerp = (
  a: number,
  b: number,
  t: number
) =>
  a + (b - a) * t;

// ============================================================
// COMPONENT
// ============================================================

export default function Home() {
  const canvasRef =
    useRef<HTMLCanvasElement | null>(
      null
    );

  const [dna, setDna] =
    useState<DNA>(initialDNA);

  const dnaRef =
    useRef<DNA>(initialDNA);

  const transitionRef =
    useRef<number | null>(null);

  const generationEffectRef =
    useRef(1);

  const mouseRef =
    useRef({
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      inside: false,
    });

  const [text, setText] =
    useState(
      `少年は夜空を見上げた。
どこまでも続く星々の間を列車が静かに走っている。
彼は隣にいた友人を思い出しながら、
誰もいない宇宙を一人で進んでいった。`
    );

  const [
    isGenerating,
    setIsGenerating,
  ] = useState(false);

  // ============================================================
  // WORLD DESCRIPTION
  // ============================================================

  const describeWorld = (
    d: DNA
  ) => {
    const world: string[] = [];

    const atmosphere: string[] =
      [];

    if (d.solitude > 0.65) {
      world.push("SOLITARY");
    }

    if (d.nature > 0.62) {
      world.push("ORGANIC");
    }

    if (d.fantasy > 0.62) {
      world.push("DREAMLIKE");
    }

    if (d.chaos > 0.68) {
      world.push("CHAOTIC");
    }

    if (d.fluidity > 0.65) {
      world.push("FLUID");
    }

    if (
      d.darkness > 0.76 &&
      d.solitude > 0.58
    ) {
      world.push("VOID");
    }

    if (
      d.tension > 0.74 &&
      d.fantasy > 0.45
    ) {
      world.push(
        "CRYSTALLINE"
      );
    }

    if (
      d.speed > 0.74 &&
      d.tension > 0.5
    ) {
      world.push("KINETIC");
    }

    if (world.length === 0) {
      world.push("BALANCED");
    }

    if (d.quietness > 0.62) {
      atmosphere.push("QUIET");
    }

    if (d.darkness > 0.62) {
      atmosphere.push("DARK");
    }

    if (d.hope > 0.62) {
      atmosphere.push(
        "LUMINOUS"
      );
    }

    if (d.warmth > 0.62) {
      atmosphere.push("WARM");
    }

    if (d.warmth < 0.38) {
      atmosphere.push("COLD");
    }

    if (
      d.spaciousness > 0.68
    ) {
      atmosphere.push(
        "EXPANSIVE"
      );
    }

    if (d.tension > 0.68) {
      atmosphere.push("TENSE");
    }

    if (d.speed > 0.68) {
      atmosphere.push(
        "RESTLESS"
      );
    }

    if (
      atmosphere.length === 0
    ) {
      atmosphere.push("NEUTRAL");
    }

    return {
      world:
        world.slice(0, 3),

      atmosphere:
        atmosphere.slice(0, 3),
    };
  };

  // ============================================================
  // WORLD STATEMENT
  // ============================================================

  const createWorldStatement = (
    d: DNA
  ) => {
    const mood =
      d.darkness > 0.75
        ? "dark"
        : d.hope > 0.68
        ? "luminous"
        : d.fantasy > 0.7
        ? "dreamlike"
        : "subtle";

    const motion =
      d.speed > 0.72
        ? "restless"
        : d.fluidity > 0.68
        ? "flowing"
        : d.quietness > 0.68
        ? "quiet"
        : "slowly shifting";

    const space =
      d.spaciousness > 0.7
        ? "expansive space"
        : d.solitude > 0.7
        ? "isolated space"
        : "dense space";

    const structure =
      d.darkness > 0.8 &&
      d.solitude > 0.65
        ? "forms orbiting an empty center"
        : d.tension > 0.78 &&
          d.fantasy > 0.5
        ? "crystalline fragments"
        : d.speed > 0.78
        ? "falling streams of light"
        : d.nature > 0.68
        ? "living branching structures"
        : d.fluidity > 0.68
        ? "ribbons of flowing light"
        : d.chaos > 0.68
        ? "fragmented structures"
        : "delicate structures";

    const light =
      d.warmth > 0.65
        ? "warm light"
        : d.warmth < 0.4
        ? "cold light"
        : d.darkness > 0.72
        ? "fading light"
        : "soft light";

    return `A ${mood} and ${motion} world unfolds through ${space}, where ${structure} drift within ${light}.`;
  };

  // ============================================================
  // TITLE
  // ============================================================

  const createWorldTitle = (
    d: DNA
  ) => {
    if (
      d.darkness > 0.82 &&
      d.solitude > 0.68
    ) {
      return "THE SILENT VOID";
    }

    if (
      d.tension > 0.8 &&
      d.fantasy > 0.58
    ) {
      return "CRYSTALS OF LIGHT";
    }

    if (
      d.speed > 0.82 &&
      d.chaos > 0.55
    ) {
      return "FALLING THROUGH TIME";
    }

    if (
      d.nature > 0.76 &&
      d.fluidity > 0.55
    ) {
      return "THE LIVING CURRENT";
    }

    if (
      d.hope > 0.76 &&
      d.spaciousness > 0.62
    ) {
      return "BEYOND THE LIGHT";
    }

    if (
      d.quietness > 0.72 &&
      d.solitude > 0.65
    ) {
      return "THE SILENT ORBIT";
    }

    if (d.fantasy > 0.74) {
      return "BETWEEN THE STARS";
    }

    if (d.chaos > 0.74) {
      return "FRAGMENTS OF SPACE";
    }

    return "TRACES BETWEEN WORLDS";
  };

  // ============================================================
  // CANVAS
  // ============================================================

  useEffect(() => {
    const canvas =
      canvasRef.current;

    if (!canvas) return;

    const ctx =
      canvas.getContext("2d");

    if (!ctx) return;

    let animationId = 0;

    let viewWidth =
      window.innerWidth;

    let viewHeight =
      window.innerHeight;

    const panelWidth = 380;

    // ------------------------------------------------------------
    // RESIZE
    // ------------------------------------------------------------

    const resize = () => {
      viewWidth =
        window.innerWidth;

      viewHeight =
        window.innerHeight;

      const dpr =
        Math.min(
          window.devicePixelRatio ||
            1,
          1.5
        );

      canvas.width =
        viewWidth * dpr;

      canvas.height =
        viewHeight * dpr;

      canvas.style.width =
        `${viewWidth}px`;

      canvas.style.height =
        `${viewHeight}px`;

      ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
      );
    };

    resize();

    window.addEventListener(
      "resize",
      resize
    );

    // ------------------------------------------------------------
    // MOUSE
    // ------------------------------------------------------------

    const handleMouseMove = (
      event: MouseEvent
    ) => {
      const visibleCenterX =
        panelWidth +
        (
          viewWidth -
          panelWidth
        ) /
          2;

      const visibleCenterY =
        viewHeight / 2;

      mouseRef.current.targetX =
        event.clientX -
        visibleCenterX;

      mouseRef.current.targetY =
        event.clientY -
        visibleCenterY;

      mouseRef.current.inside =
        event.clientX >
        panelWidth;
    };

    const handleMouseLeave =
      () => {
        mouseRef.current.targetX =
          0;

        mouseRef.current.targetY =
          0;

        mouseRef.current.inside =
          false;
      };

    window.addEventListener(
      "mousemove",
      handleMouseMove
    );

    window.addEventListener(
      "mouseleave",
      handleMouseLeave
    );

    // ------------------------------------------------------------
    // PARTICLES
    // ------------------------------------------------------------

    const maxParticleCount =
      3600;

    const particles =
      Array.from(
        {
          length:
            maxParticleCount,
        },
        () => ({
          distance:
            Math.pow(
              Math.random(),
              0.65
            ),

          angleSeed:
            Math.random(),

          spread:
            Math.random() -
            0.5,

          size:
            0.25 +
            Math.random() *
              1.65,

          speed:
            0.0001 +
            Math.random() *
              0.00045,

          brightness:
            0.18 +
            Math.random() *
              0.82,

          offset:
            Math.random() *
            100,

          vertical:
            Math.random() -
            0.5,

          depth:
            0.15 +
            Math.random() *
              0.85,

          star:
            Math.random() <
            0.032,

          starStrength:
            0.5 +
            Math.random() *
              1.5,

          trail:
            Math.random(),

          branch:
            Math.random(),

          crystal:
            Math.random(),
        })
      );

    let time = 0;

    // ============================================================
    // WORLD SCORES
    // ============================================================

    const getWorldScores = (
      d: DNA
    ): WorldScore[] => {
      const scores:
        WorldScore[] = [
        {
          name: "galaxy",

          value:
            0.1 +
            d.solitude *
              0.95 +
            d.fantasy *
              0.35,
        },

        {
          name: "cloud",

          value:
            d.chaos *
              0.95 +
            d.spaciousness *
              0.4,
        },

        {
          name: "wave",

          value:
            d.fluidity *
              1.35 +
            d.quietness *
              0.22,
        },

        {
          name: "organism",

          value:
            d.nature *
              1.45 +
            d.fantasy *
              0.18,
        },

        {
          name: "void",

          value:
            Math.pow(
              d.darkness,
              2.3
            ) *
            (
              0.95 +
              d.solitude *
                0.7
            ),
        },

        {
          name: "crystal",

          value:
            Math.pow(
              d.tension,
              2.05
            ) *
            (
              0.8 +
              d.fantasy *
                0.75
            ),
        },

        {
          name: "rain",

          value:
            Math.pow(
              d.speed,
              2
            ) *
            (
              0.8 +
              d.chaos *
                0.55 +
              d.tension *
                0.4
            ),
        },
      ];

      return scores.sort(
        (a, b) =>
          b.value -
          a.value
      );
    };

    // ============================================================
    // COLOR
    // ============================================================

    const getColor = (
      d: DNA,
      offset: number
    ) => {
      const cold = {
        r: 100,
        g: 155,
        b: 255,
      };

      const warm = {
        r: 255,
        g: 180,
        b: 100,
      };

      let r =
        lerp(
          cold.r,
          warm.r,
          d.warmth
        );

      let g =
        lerp(
          cold.g,
          warm.g,
          d.warmth
        );

      let b =
        lerp(
          cold.b,
          warm.b,
          d.warmth
        );

      const hope =
        d.hope *
        0.45;

      r =
        lerp(
          r,
          255,
          hope
        );

      g =
        lerp(
          g,
          255,
          hope
        );

      b =
        lerp(
          b,
          255,
          hope
        );

      const dark =
        1 -
        d.darkness *
          0.48;

      r *= dark;
      g *= dark;
      b *= dark;

      r +=
        d.tension *
        65;

      g -=
        d.tension *
        30;

      b -=
        d.tension *
        20;

      const shift =
        Math.sin(
          offset +
          time *
            0.55
        ) *
        d.fantasy *
        38;

      r += shift * 0.45;

      b += shift;

      return {
        r:
          clamp(
            r,
            0,
            255
          ),

        g:
          clamp(
            g,
            0,
            255
          ),

        b:
          clamp(
            b,
            0,
            255
          ),
      };
    };

    // ============================================================
    // WAVE RIBBON
    // ============================================================

    const drawWave = (
      d: DNA,
      cx: number,
      cy: number,
      dominant: WorldName,
      secondary: WorldName
    ) => {
      if (
        dominant !== "wave" &&
        secondary !== "wave"
      ) {
        return;
      }

      const strength =
        dominant === "wave"
          ? 1
          : 0.28;

      const count =
        dominant === "wave"
          ? 7
          : 3;

      const visualWidth =
        viewWidth -
        panelWidth;

      ctx.save();

      ctx.globalCompositeOperation =
        "lighter";

      for (
        let r = 0;
        r < count;
        r++
      ) {
        const points:
          Array<{
            x: number;
            y: number;
          }> = [];

        const segments = 70;

        const phase =
          time *
            (
              0.3 +
              d.speed *
                0.9
            ) +
          r * 1.2;

        const offsetY =
          (
            r -
            (
              count -
              1
            ) /
              2
          ) *
          (
            24 +
            d.spaciousness *
              25
          );

        for (
          let i = 0;
          i <= segments;
          i++
        ) {
          const t =
            i /
            segments;

          const x =
            panelWidth +
            visualWidth *
              t;

          const y =
            cy +
            offsetY +
            Math.sin(
              t *
                (
                  8 +
                  d.fluidity *
                    12
                ) +
              phase
            ) *
              (
                20 +
                d.fluidity *
                  85
              ) +
            Math.sin(
              t *
                25 -
              phase
            ) *
              d.chaos *
              12;

          points.push({
            x,
            y,
          });
        }

        const color =
          getColor(
            d,
            r *
              3.2
          );

        const thickness =
          5 +
          d.fluidity *
            20;

        ctx.beginPath();

        ctx.moveTo(
          points[0].x,
          points[0].y -
            thickness
        );

        for (
          const point of points
        ) {
          ctx.lineTo(
            point.x,
            point.y -
              thickness
          );
        }

        for (
          let i =
            points.length -
            1;
          i >= 0;
          i--
        ) {
          ctx.lineTo(
            points[i].x,
            points[i].y +
              thickness
          );
        }

        ctx.closePath();

        const gradient =
          ctx.createLinearGradient(
            panelWidth,
            cy,
            viewWidth,
            cy
          );

        gradient.addColorStop(
          0,
          `rgba(${color.r},${color.g},${color.b},0)`
        );

        gradient.addColorStop(
          0.35,
          `rgba(${color.r},${color.g},${color.b},${
            0.025 *
            strength
          })`
        );

        gradient.addColorStop(
          0.55,
          `rgba(255,255,255,${
            0.055 *
            strength
          })`
        );

        gradient.addColorStop(
          0.75,
          `rgba(${color.r},${color.g},${color.b},${
            0.02 *
            strength
          })`
        );

        gradient.addColorStop(
          1,
          `rgba(${color.r},${color.g},${color.b},0)`
        );

        ctx.fillStyle =
          gradient;

        ctx.fill();

        ctx.beginPath();

        ctx.moveTo(
          points[0].x,
          points[0].y
        );

        for (
          const point of points
        ) {
          ctx.lineTo(
            point.x,
            point.y
          );
        }

        ctx.strokeStyle =
          `rgba(
            ${color.r},
            ${color.g},
            ${color.b},
            ${
              0.12 *
              strength
            }
          )`;

        ctx.lineWidth = 0.6;

        ctx.stroke();
      }

      ctx.restore();
    };

    // ============================================================
    // ORGANISM NETWORK
    // ============================================================

    const drawOrganism = (
      d: DNA,
      cx: number,
      cy: number,
      screenSize: number,
      dominant: WorldName,
      secondary: WorldName
    ) => {
      if (
        dominant !==
          "organism" &&
        secondary !==
          "organism"
      ) {
        return;
      }

      const strength =
        dominant ===
        "organism"
          ? 1
          : 0.3;

      const nodeCount =
        dominant ===
        "organism"
          ? 48
          : 24;

      const nodes:
        {
          x: number;
          y: number;
        }[] = [];

      const radius =
        screenSize *
        (
          0.18 +
          d.spaciousness *
            0.24
        );

      for (
        let i = 0;
        i <
        nodeCount;
        i++
      ) {
        const t =
          i /
          nodeCount;

        const angle =
          t *
            Math.PI *
            9 +
          Math.sin(
            i *
              3.7
          ) *
            1.2 +
          time *
            0.07;

        const branchRadius =
          radius *
          (
            0.1 +
            t *
              0.95
          );

        const pulse =
          1 +
          Math.sin(
            time *
              1.8 +
            i *
              0.65
          ) *
            0.05 *
            d.nature;

        nodes.push({
          x:
            cx +
            Math.cos(
              angle
            ) *
              branchRadius *
              pulse,

          y:
            cy +
            Math.sin(
              angle
            ) *
              branchRadius *
              0.72 *
              pulse,
        });
      }

      ctx.save();

      ctx.globalCompositeOperation =
        "lighter";

      for (
        let i = 0;
        i <
        nodes.length -
          1;
        i++
      ) {
        const a =
          nodes[i];

        const b =
          nodes[i + 1];

        const color =
          getColor(
            d,
            i
          );

        ctx.beginPath();

        ctx.moveTo(
          a.x,
          a.y
        );

        const mx =
          (
            a.x +
            b.x
          ) /
            2 +
          Math.sin(
            i +
            time
          ) *
            d.nature *
            15;

        const my =
          (
            a.y +
            b.y
          ) /
            2 +
          Math.cos(
            i *
              1.7 +
            time
          ) *
            d.nature *
            15;

        ctx.quadraticCurveTo(
          mx,
          my,
          b.x,
          b.y
        );

        ctx.strokeStyle =
          `rgba(
            ${color.r},
            ${color.g},
            ${color.b},
            ${
              0.08 *
              strength
            }
          )`;

        ctx.lineWidth =
          0.5 +
          d.nature *
            0.7;

        ctx.stroke();

        if (
          i % 4 === 0 &&
          i + 8 <
            nodes.length
        ) {
          const target =
            nodes[i + 8];

          ctx.beginPath();

          ctx.moveTo(
            a.x,
            a.y
          );

          ctx.lineTo(
            target.x,
            target.y
          );

          ctx.strokeStyle =
            `rgba(
              ${color.r},
              ${color.g},
              ${color.b},
              ${
                0.025 *
                strength
              }
            )`;

          ctx.lineWidth = 0.3;

          ctx.stroke();
        }
      }

      for (
        let i = 0;
        i <
        nodes.length;
        i++
      ) {
        const node =
          nodes[i];

        const color =
          getColor(
            d,
            i * 0.8
          );

        const pulse =
          1 +
          Math.sin(
            time *
              2 +
            i
          ) *
            0.25;

        const radius =
          (
            1.1 +
            d.nature *
              2
          ) *
          pulse;

        const gradient =
          ctx.createRadialGradient(
            node.x,
            node.y,
            0,
            node.x,
            node.y,
            radius * 5
          );

        gradient.addColorStop(
          0,
          `rgba(255,255,255,${
            0.3 *
            strength
          })`
        );

        gradient.addColorStop(
          0.25,
          `rgba(${color.r},${color.g},${color.b},${
            0.14 *
            strength
          })`
        );

        gradient.addColorStop(
          1,
          `rgba(${color.r},${color.g},${color.b},0)`
        );

        ctx.fillStyle =
          gradient;

        ctx.beginPath();

        ctx.arc(
          node.x,
          node.y,
          radius * 5,
          0,
          Math.PI * 2
        );

        ctx.fill();
      }

      ctx.restore();
    };

    // ============================================================
    // CRYSTAL
    // ============================================================

    const drawCrystal = (
      d: DNA,
      cx: number,
      cy: number,
      screenSize: number,
      dominant: WorldName,
      secondary: WorldName
    ) => {
      if (
        dominant !==
          "crystal" &&
        secondary !==
          "crystal"
      ) {
        return;
      }

      const strength =
        dominant ===
        "crystal"
          ? 1
          : 0.25;

      const layers =
        dominant ===
        "crystal"
          ? 7
          : 3;

      ctx.save();

      ctx.globalCompositeOperation =
        "lighter";

      for (
        let layer = 0;
        layer <
        layers;
        layer++
      ) {
        const sides =
          4 +
          (
            layer %
            5
          );

        const radius =
          screenSize *
          (
            0.08 +
            layer *
              0.035 +
            d.spaciousness *
              0.03
          );

        const rotation =
          time *
            (
              layer %
                2 ===
              0
                ? 0.04
                : -0.03
            ) +
          layer *
            0.55;

        const vertices:
          {
            x: number;
            y: number;
          }[] = [];

        for (
          let i = 0;
          i < sides;
          i++
        ) {
          const angle =
            rotation +
            (
              i /
              sides
            ) *
              Math.PI *
              2;

          const distortion =
            1 +
            Math.sin(
              i *
                2.4 +
              layer
            ) *
              d.chaos *
              0.12;

          vertices.push({
            x:
              cx +
              Math.cos(
                angle
              ) *
                radius *
                distortion,

            y:
              cy +
              Math.sin(
                angle
              ) *
                radius *
                distortion,
          });
        }

        const color =
          getColor(
            d,
            layer * 4
          );

        for (
          let i = 0;
          i < sides;
          i++
        ) {
          const a =
            vertices[i];

          const b =
            vertices[
              (
                i +
                1
              ) %
                sides
            ];

          ctx.beginPath();

          ctx.moveTo(cx, cy);

          ctx.lineTo(
            a.x,
            a.y
          );

          ctx.lineTo(
            b.x,
            b.y
          );

          ctx.closePath();

          const faceAlpha =
            (
              0.008 +
              (
                i %
                3
              ) *
                0.007
            ) *
            strength *
            (
              0.6 +
              d.fantasy
            );

          ctx.fillStyle =
            `rgba(
              ${color.r},
              ${color.g},
              ${color.b},
              ${faceAlpha}
            )`;

          ctx.fill();

          ctx.strokeStyle =
            `rgba(
              255,
              255,
              255,
              ${
                0.018 *
                strength
              }
            )`;

          ctx.lineWidth = 0.3;

          ctx.stroke();
        }

        ctx.beginPath();

        ctx.moveTo(
          vertices[0].x,
          vertices[0].y
        );

        for (
          let i = 1;
          i <
          vertices.length;
          i++
        ) {
          ctx.lineTo(
            vertices[i].x,
            vertices[i].y
          );
        }

        ctx.closePath();

        ctx.strokeStyle =
          `rgba(
            ${color.r},
            ${color.g},
            ${color.b},
            ${
              0.14 *
              strength
            }
          )`;

        ctx.lineWidth =
          0.6 +
          d.tension *
            0.8;

        ctx.stroke();
      }

      ctx.restore();
    };

    // ============================================================
    // VOID
    // ============================================================

    const drawVoid = (
      d: DNA,
      cx: number,
      cy: number,
      dominant: WorldName,
      secondary: WorldName
    ) => {
      if (
        dominant !== "void" &&
        secondary !== "void"
      ) {
        return;
      }

      const strength =
        dominant === "void"
          ? 1
          : 0.32;

      const holeRadius =
        (
          30 +
          d.darkness *
            58
        ) *
        (
          0.8 +
          strength *
            0.2
        );

      ctx.save();

      ctx.globalCompositeOperation =
        "lighter";

      for (
        let i = 0;
        i < 5;
        i++
      ) {
        const r =
          holeRadius *
          (
            1.35 +
            i *
              0.5
          );

        ctx.beginPath();

        ctx.ellipse(
          cx,
          cy,
          r * 1.5,
          r *
            (
              0.22 +
              i *
                0.025
            ),
          time *
            0.02 +
            i *
              0.2,
          0,
          Math.PI * 2
        );

        ctx.strokeStyle =
          `rgba(
            ${
              130 +
              d.warmth *
                100
            },
            ${
              90 +
              d.hope *
                100
            },
            255,
            ${
              (
                0.09 -
                i *
                  0.012
              ) *
              strength
            }
          )`;

        ctx.lineWidth = 0.7;

        ctx.stroke();
      }

      ctx.translate(
        cx,
        cy
      );

      ctx.rotate(
        time * 0.025
      );

      ctx.scale(
        1,
        0.24 +
          d.tension *
            0.11
      );

      const diskRadius =
        holeRadius * 3.6;

      const disk =
        ctx.createRadialGradient(
          0,
          0,
          holeRadius,
          0,
          0,
          diskRadius
        );

      disk.addColorStop(
        0,
        "rgba(255,255,255,0)"
      );

      disk.addColorStop(
        0.13,
        `rgba(
          255,
          245,
          225,
          ${
            0.42 *
            strength
          }
        )`
      );

      disk.addColorStop(
        0.3,
        `rgba(
          255,
          ${
            105 +
            d.warmth *
              100
          },
          ${
            155 +
            d.fantasy *
              90
          },
          ${
            0.25 *
            strength
          }
        )`
      );

      disk.addColorStop(
        0.65,
        `rgba(
          100,
          80,
          240,
          ${
            0.1 *
            strength
          }
        )`
      );

      disk.addColorStop(
        1,
        "rgba(0,0,0,0)"
      );

      ctx.fillStyle = disk;

      ctx.beginPath();

      ctx.arc(
        0,
        0,
        diskRadius,
        0,
        Math.PI * 2
      );

      ctx.fill();

      ctx.restore();

      const blackCore =
        ctx.createRadialGradient(
          cx,
          cy,
          0,
          cx,
          cy,
          holeRadius
        );

      blackCore.addColorStop(
        0,
        "rgba(0,0,0,1)"
      );

      blackCore.addColorStop(
        0.72,
        "rgba(0,0,0,1)"
      );

      blackCore.addColorStop(
        1,
        "rgba(0,0,0,0)"
      );

      ctx.fillStyle =
        blackCore;

      ctx.beginPath();

      ctx.arc(
        cx,
        cy,
        holeRadius,
        0,
        Math.PI * 2
      );

      ctx.fill();
    };

    // ============================================================
    // ANIMATION
    // ============================================================

    const animate = () => {
      const d =
        dnaRef.current;

      const mouse =
        mouseRef.current;

      mouse.x =
        lerp(
          mouse.x,
          mouse.targetX,
          0.045
        );

      mouse.y =
        lerp(
          mouse.y,
          mouse.targetY,
          0.045
        );

      const generationScale =
        generationEffectRef.current;

      const timeSpeed =
        0.003 +
        (
          1 -
          d.quietness
        ) *
          0.014 +
        d.speed *
          0.012;

      time += timeSpeed;

      // ----------------------------------------------------------
      // BACKGROUND
      // ----------------------------------------------------------

      const fade =
        0.055 +
        d.quietness *
          0.065 +
        d.darkness *
          0.038;

      ctx.fillStyle =
        `rgba(
          0,
          0,
          0,
          ${fade}
        )`;

      ctx.fillRect(
        0,
        0,
        viewWidth,
        viewHeight
      );

      const baseCx =
        panelWidth +
        (
          viewWidth -
          panelWidth
        ) /
          2;

      const baseCy =
        viewHeight / 2;

      // global parallax

      const cx =
        baseCx -
        mouse.x *
          0.025;

      const cy =
        baseCy -
        mouse.y *
          0.025;

      const screenSize =
        Math.min(
          viewWidth,
          viewHeight
        );

      const scores =
        getWorldScores(d);

      const dominantWorld =
        scores[0].name;

      const secondaryWorld =
        scores[1].name;

      // ----------------------------------------------------------
      // NEBULA
      // ----------------------------------------------------------

      const color =
        getColor(d, 0);

      const nebulaRadius =
        screenSize *
        (
          0.25 +
          d.spaciousness *
            0.35
        );

      const nebula =
        ctx.createRadialGradient(
          cx,
          cy,
          0,
          cx,
          cy,
          nebulaRadius
        );

      nebula.addColorStop(
        0,
        `rgba(
          ${color.r},
          ${color.g},
          ${color.b},
          ${
            0.02 +
            d.fantasy *
              0.055
          }
        )`
      );

      nebula.addColorStop(
        0.45,
        `rgba(
          ${color.r * 0.5},
          ${color.g * 0.5},
          ${color.b},
          ${
            0.01 +
            d.fantasy *
              0.025
          }
        )`
      );

      nebula.addColorStop(
        1,
        "rgba(0,0,0,0)"
      );

      ctx.fillStyle =
        nebula;

      ctx.fillRect(
        panelWidth,
        0,
        viewWidth -
          panelWidth,
        viewHeight
      );

      // ----------------------------------------------------------
      // CORE LIGHT
      // ----------------------------------------------------------

      if (
        dominantWorld !==
        "void"
      ) {
        const coreRadius =
          (
            18 +
            d.fantasy *
              45 +
            d.hope *
              75
          ) *
          (
            0.65 +
            generationScale *
              0.35
          );

        const core =
          ctx.createRadialGradient(
            cx,
            cy,
            0,
            cx,
            cy,
            coreRadius
          );

        core.addColorStop(
          0,
          `rgba(
            255,
            255,
            255,
            ${
              0.3 +
              d.hope *
                0.5
            }
          )`
        );

        core.addColorStop(
          0.28,
          `rgba(
            ${color.r},
            ${color.g},
            ${color.b},
            0.16
          )`
        );

        core.addColorStop(
          1,
          "rgba(0,0,0,0)"
        );

        ctx.fillStyle = core;

        ctx.beginPath();

        ctx.arc(
          cx,
          cy,
          coreRadius,
          0,
          Math.PI * 2
        );

        ctx.fill();
      }

      // ----------------------------------------------------------
      // LARGE WORLD STRUCTURES
      // ----------------------------------------------------------

      drawWave(
        d,
        cx,
        cy,
        dominantWorld,
        secondaryWorld
      );

      drawOrganism(
        d,
        cx,
        cy,
        screenSize,
        dominantWorld,
        secondaryWorld
      );

      drawCrystal(
        d,
        cx,
        cy,
        screenSize,
        dominantWorld,
        secondaryWorld
      );

      // ----------------------------------------------------------
      // SCORE MAP
      // ----------------------------------------------------------

      const scoreMap =
        new Map<
          WorldName,
          number
        >();

      for (
        const score of scores
      ) {
        scoreMap.set(
          score.name,
          score.value
        );
      }

      const boostWeight = (
        name: WorldName
      ) => {
        const base =
          scoreMap.get(
            name
          ) ?? 0;

        if (
          name ===
          dominantWorld
        ) {
          return base * 2.2;
        }

        if (
          name ===
          secondaryWorld
        ) {
          return base * 0.75;
        }

        return base * 0.035;
      };

      let galaxyWeight =
        boostWeight("galaxy");

      let cloudWeight =
        boostWeight("cloud");

      let waveWeight =
        boostWeight("wave");

      let organismWeight =
        boostWeight("organism");

      let voidWeight =
        boostWeight("void");

      let crystalWeight =
        boostWeight("crystal");

      let rainWeight =
        boostWeight("rain");

      const totalWeight =
        galaxyWeight +
        cloudWeight +
        waveWeight +
        organismWeight +
        voidWeight +
        crystalWeight +
        rainWeight || 1;

      galaxyWeight /=
        totalWeight;

      cloudWeight /=
        totalWeight;

      waveWeight /=
        totalWeight;

      organismWeight /=
        totalWeight;

      voidWeight /=
        totalWeight;

      crystalWeight /=
        totalWeight;

      rainWeight /=
        totalWeight;

      // ----------------------------------------------------------
      // PARTICLES
      // ----------------------------------------------------------

      const visibleCount =
        Math.min(
          maxParticleCount,
          Math.floor(
            1050 +
              d.fantasy *
                1300 +
              d.spaciousness *
                850
          )
        );

      for (
        let i = 0;
        i <
        visibleCount;
        i++
      ) {
        const p =
          particles[i];

        const distance =
          p.distance *
          screenSize *
          (
            0.2 +
            d.spaciousness *
              0.36
          );

        // --------------------------------------------------------
        // GALAXY
        // --------------------------------------------------------

        const armCount =
          2 +
          Math.floor(
            d.fantasy *
              3 +
            d.nature *
              2
          );

        const arm =
          Math.floor(
            p.angleSeed *
              armCount
          );

        const armOffset =
          (
            Math.PI *
            2 *
            arm
          ) /
          armCount;

        const angle =
          armOffset +
          distance *
            (
              0.006 +
              d.fluidity *
                0.018 +
              d.fantasy *
                0.012
            ) +
          p.spread *
            (
              0.1 +
              d.chaos *
                1.7
            ) +
          time *
            p.speed *
            (
              35 +
              d.speed *
                240
            );

        const radialNoise =
          Math.sin(
            p.offset +
            time *
              1.2
          ) *
            d.chaos *
            24 +
          Math.sin(
            distance *
              0.025 +
            p.offset
          ) *
            d.nature *
            10;

        const radius =
          distance +
          radialNoise;

        const galaxyX =
          cx +
          Math.cos(angle) *
            radius *
            (
              0.75 +
              d.solitude *
                0.85
            );

        const galaxyY =
          cy +
          Math.sin(angle) *
            radius *
            0.55 *
            (
              0.75 +
              d.solitude *
                0.85
            );

        // --------------------------------------------------------
        // CLOUD
        // --------------------------------------------------------

        const cloudAngle =
          p.offset *
            0.7 +
          time *
            0.07;

        const cloudRadius =
          distance *
          (
            0.65 +
            d.spaciousness *
              0.9
          );

        const cloudX =
          cx +
          Math.cos(
            cloudAngle
          ) *
            cloudRadius +
          p.spread *
            240 *
            d.chaos;

        const cloudY =
          cy +
          Math.sin(
            cloudAngle
          ) *
            cloudRadius *
            0.65 +
          p.vertical *
            170 *
            d.chaos;

        // --------------------------------------------------------
        // WAVE
        // --------------------------------------------------------

        const waveX =
          cx +
          (
            p.distance -
            0.5
          ) *
            screenSize *
            1.3;

        const waveY =
          cy +
          Math.sin(
            p.distance *
              15 +
            time *
              (
                0.5 +
                d.speed
              ) +
            p.offset
          ) *
            (
              30 +
              d.fluidity *
                180
            ) +
          p.vertical * 30;

        // --------------------------------------------------------
        // ORGANISM
        // --------------------------------------------------------

        const organismAngle =
          p.distance *
            Math.PI *
            8 +
          p.angleSeed *
            Math.PI *
            2 +
          time *
            0.11;

        const organismRadius =
          distance *
          (
            0.43 +
            0.31 *
              Math.sin(
                p.distance *
                  18 +
                p.offset +
                time
              )
          );

        const organismX =
          cx +
          Math.cos(
            organismAngle
          ) *
            organismRadius;

        const organismY =
          cy +
          Math.sin(
            organismAngle
          ) *
            organismRadius *
            (
              0.62 +
              d.nature *
                0.28
            );

        // --------------------------------------------------------
        // VOID
        // --------------------------------------------------------

        const voidHole =
          50 +
          d.darkness *
            105;

        const voidAngle =
          angle +
          Math.sin(
            p.offset +
            time * 0.35
          ) *
            0.16;

        const voidRadius =
          voidHole +
          radius *
            (
              0.7 +
              d.darkness *
                0.5
            );

        const voidX =
          cx +
          Math.cos(
            voidAngle
          ) *
            voidRadius;

        const voidY =
          cy +
          Math.sin(
            voidAngle
          ) *
            voidRadius *
            0.43;

        // --------------------------------------------------------
        // CRYSTAL
        // --------------------------------------------------------

        const sides =
          3 +
          Math.floor(
            d.fantasy *
              5
          );

        const step =
          (
            Math.PI *
            2
          ) /
          sides;

        const rawCrystalAngle =
          p.angleSeed *
            Math.PI *
            2 +
          time *
            0.025;

        const crystalAngle =
          Math.round(
            rawCrystalAngle /
              step
          ) *
          step;

        const crystalRadius =
          distance *
          (
            0.68 +
            d.tension *
              0.65
          );

        const crystalX =
          cx +
          Math.cos(
            crystalAngle
          ) *
            crystalRadius;

        const crystalY =
          cy +
          Math.sin(
            crystalAngle
          ) *
            crystalRadius;

        // --------------------------------------------------------
        // RAIN
        // --------------------------------------------------------

        const rainSpan =
          screenSize *
          (
            0.95 +
            d.spaciousness *
              0.8
          );

        const rainX =
          cx +
          p.spread *
            rainSpan;

        const rainLoop =
          viewHeight * 1.8;

        const rainY =
          cy +
          (
            (
              p.offset *
                100 +
              time *
                (
                  100 +
                  d.speed *
                    800
                )
            ) %
            rainLoop
          ) -
          rainLoop / 2;

        // --------------------------------------------------------
        // BLEND
        // --------------------------------------------------------

        let x =
          galaxyX *
            galaxyWeight +
          cloudX *
            cloudWeight +
          waveX *
            waveWeight +
          organismX *
            organismWeight +
          voidX *
            voidWeight +
          crystalX *
            crystalWeight +
          rainX *
            rainWeight;

        let y =
          galaxyY *
            galaxyWeight +
          cloudY *
            cloudWeight +
          waveY *
            waveWeight +
          organismY *
            organismWeight +
          voidY *
            voidWeight +
          crystalY *
            crystalWeight +
          rainY *
            rainWeight;

        // --------------------------------------------------------
        // GENERATE COLLAPSE
        // --------------------------------------------------------

        x =
          cx +
          (
            x -
            cx
          ) *
            generationScale;

        y =
          cy +
          (
            y -
            cy
          ) *
            generationScale;

        // --------------------------------------------------------
        // DEPTH PARALLAX
        // --------------------------------------------------------

        const parallaxStrength =
          (
            p.depth -
            0.5
          ) *
          0.12;

        x -=
          mouse.x *
          parallaxStrength;

        y -=
          mouse.y *
          parallaxStrength;

        // --------------------------------------------------------
        // MOUSE GRAVITY
        // --------------------------------------------------------

        if (
          mouse.inside
        ) {
          const mouseX =
            baseCx +
            mouse.targetX;

          const mouseY =
            baseCy +
            mouse.targetY;

          const dx =
            mouseX - x;

          const dy =
            mouseY - y;

          const distSq =
            dx * dx +
            dy * dy;

          const gravityRadius =
            180 +
            d.fantasy *
              80;

          const gravityRadiusSq =
            gravityRadius *
            gravityRadius;

          if (
            distSq <
            gravityRadiusSq
          ) {
            const distanceToMouse =
              Math.sqrt(
                distSq
              );

            const force =
              1 -
              distanceToMouse /
                gravityRadius;

            const gravity =
              force *
              force *
              (
                8 +
                d.tension *
                  15
              );

            x +=
              (
                dx /
                Math.max(
                  distanceToMouse,
                  1
                )
              ) *
              gravity;

            y +=
              (
                dy /
                Math.max(
                  distanceToMouse,
                  1
                )
              ) *
              gravity;
          }
        }

        // --------------------------------------------------------
        // CHARACTER
        // --------------------------------------------------------

        let sizeMultiplier =
          1;

        let alphaMultiplier =
          1;

        if (
          dominantWorld ===
          "cloud"
        ) {
          x +=
            Math.sin(
              p.offset +
              time *
                0.2
            ) *
            10;

          y +=
            Math.cos(
              p.offset +
              time *
                0.17
            ) *
            10;

          sizeMultiplier =
            1.5;

          alphaMultiplier =
            0.45;
        }

        if (
          dominantWorld ===
          "wave"
        ) {
          sizeMultiplier =
            0.7;

          alphaMultiplier =
            0.82;
        }

        if (
          dominantWorld ===
          "organism"
        ) {
          const breathe =
            1 +
            Math.sin(
              p.offset +
              time *
                1.8
            ) *
              0.1;

          x =
            cx +
            (
              x -
              cx
            ) *
              breathe;

          y =
            cy +
            (
              y -
              cy
            ) *
              breathe;

          sizeMultiplier =
            1.05;
        }

        if (
          dominantWorld ===
          "void"
        ) {
          sizeMultiplier =
            0.7;

          alphaMultiplier =
            0.68;
        }

        if (
          dominantWorld ===
          "crystal"
        ) {
          x =
            Math.round(
              x / 3
            ) * 3;

          y =
            Math.round(
              y / 3
            ) * 3;

          sizeMultiplier =
            0.65;

          alphaMultiplier =
            1.08;
        }

        if (
          dominantWorld ===
          "rain"
        ) {
          sizeMultiplier =
            0.55;

          alphaMultiplier =
            1.12;
        }

        // --------------------------------------------------------
        // PARTICLE COLOR
        // --------------------------------------------------------

        const particleColor =
          getColor(
            d,
            p.offset
          );

        const alpha =
          clamp(
            p.brightness *
              (
                0.16 +
                d.fantasy *
                  0.78
              ) *
              (
                1 -
                d.darkness *
                  0.52
              ) *
              (
                0.5 +
                p.depth *
                  0.65
              ) *
              alphaMultiplier,
            0,
            1
          );

        const size =
          p.size *
          (
            0.5 +
            d.fantasy
          ) *
          (
            0.5 +
            p.depth *
              0.95
          ) *
          sizeMultiplier;

        // --------------------------------------------------------
        // RAIN TRAIL
        // --------------------------------------------------------

        if (
          dominantWorld ===
            "rain" &&
          p.trail < 0.68
        ) {
          const trailLength =
            20 +
            d.speed *
              170 +
            p.depth *
              40;

          const tailX =
            x -
            d.chaos *
              18;

          const tailY =
            y -
            trailLength;

          const gradient =
            ctx.createLinearGradient(
              x,
              y,
              tailX,
              tailY
            );

          gradient.addColorStop(
            0,
            `rgba(
              ${particleColor.r},
              ${particleColor.g},
              ${particleColor.b},
              ${
                alpha *
                0.85
              }
            )`
          );

          gradient.addColorStop(
            1,
            `rgba(
              ${particleColor.r},
              ${particleColor.g},
              ${particleColor.b},
              0
            )`
          );

          ctx.strokeStyle =
            gradient;

          ctx.lineWidth =
            0.35 +
            p.depth *
              1.5;

          ctx.beginPath();

          ctx.moveTo(x, y);

          ctx.lineTo(
            tailX,
            tailY
          );

          ctx.stroke();
        }

        // --------------------------------------------------------
        // CRYSTAL MICRO LINES
        // --------------------------------------------------------

        if (
          dominantWorld ===
            "crystal" &&
          p.crystal < 0.12
        ) {
          const length =
            15 +
            d.tension *
              65;

          ctx.strokeStyle =
            `rgba(
              ${particleColor.r},
              ${particleColor.g},
              ${particleColor.b},
              ${
                alpha *
                0.5
              }
            )`;

          ctx.lineWidth =
            0.5;

          ctx.beginPath();

          ctx.moveTo(x, y);

          ctx.lineTo(
            x +
              Math.cos(
                crystalAngle
              ) *
                length,
            y +
              Math.sin(
                crystalAngle
              ) *
                length
          );

          ctx.stroke();
        }

        // --------------------------------------------------------
        // ORGANISM MICRO BRANCH
        // --------------------------------------------------------

        if (
          dominantWorld ===
            "organism" &&
          p.branch < 0.1
        ) {
          const branchLength =
            8 +
            d.nature *
              30;

          ctx.strokeStyle =
            `rgba(
              ${particleColor.r},
              ${particleColor.g},
              ${particleColor.b},
              ${
                alpha *
                0.18
              }
            )`;

          ctx.lineWidth =
            0.35;

          ctx.beginPath();

          ctx.moveTo(x, y);

          ctx.lineTo(
            x +
              Math.cos(
                organismAngle
              ) *
                branchLength,
            y +
              Math.sin(
                organismAngle
              ) *
                branchLength
          );

          ctx.stroke();
        }

        // --------------------------------------------------------
        // NORMAL PARTICLE
        // --------------------------------------------------------

        if (!p.star) {
          ctx.fillStyle =
            `rgba(
              ${particleColor.r},
              ${particleColor.g},
              ${particleColor.b},
              ${alpha}
            )`;

          ctx.beginPath();

          ctx.arc(
            x,
            y,
            Math.max(
              0.2,
              size
            ),
            0,
            Math.PI * 2
          );

          ctx.fill();
        }

        // --------------------------------------------------------
        // STAR
        // --------------------------------------------------------

        if (p.star) {
          const pulse =
            0.82 +
            Math.sin(
              time *
                (
                  2 +
                  p.starStrength
                ) +
              p.offset
            ) *
              0.18;

          const glow =
            Math.max(
              2,
              size *
                (
                  4 +
                  d.fantasy *
                    6
                ) *
                p.starStrength *
                pulse
            );

          const starGradient =
            ctx.createRadialGradient(
              x,
              y,
              0,
              x,
              y,
              glow
            );

          starGradient.addColorStop(
            0,
            `rgba(
              255,
              255,
              255,
              ${Math.min(
                1,
                alpha *
                  1.7
              )}
            )`
          );

          starGradient.addColorStop(
            0.18,
            `rgba(
              ${particleColor.r},
              ${particleColor.g},
              ${particleColor.b},
              ${alpha}
            )`
          );

          starGradient.addColorStop(
            1,
            `rgba(
              ${particleColor.r},
              ${particleColor.g},
              ${particleColor.b},
              0
            )`
          );

          ctx.fillStyle =
            starGradient;

          ctx.beginPath();

          ctx.arc(
            x,
            y,
            glow,
            0,
            Math.PI * 2
          );

          ctx.fill();

          ctx.fillStyle =
            `rgba(
              255,
              255,
              255,
              ${Math.min(
                1,
                alpha *
                  1.8
              )}
            )`;

          ctx.beginPath();

          ctx.arc(
            x,
            y,
            Math.max(
              0.5,
              size *
                0.6
            ),
            0,
            Math.PI * 2
          );

          ctx.fill();

          if (
            p.starStrength >
            1.35
          ) {
            const flare =
              glow * 1.7;

            ctx.strokeStyle =
              `rgba(
                255,
                255,
                255,
                ${
                  alpha *
                  0.25
                }
              )`;

            ctx.lineWidth =
              0.4;

            ctx.beginPath();

            ctx.moveTo(
              x - flare,
              y
            );

            ctx.lineTo(
              x + flare,
              y
            );

            ctx.moveTo(
              x,
              y - flare
            );

            ctx.lineTo(
              x,
              y + flare
            );

            ctx.stroke();
          }
        }
      }

      // Void is deliberately rendered last.
      drawVoid(
        d,
        cx,
        cy,
        dominantWorld,
        secondaryWorld
      );

      animationId =
        requestAnimationFrame(
          animate
        );
    };

    animate();

    // ------------------------------------------------------------
    // CLEANUP
    // ------------------------------------------------------------

    return () => {
      cancelAnimationFrame(
        animationId
      );

      window.removeEventListener(
        "resize",
        resize
      );

      window.removeEventListener(
        "mousemove",
        handleMouseMove
      );

      window.removeEventListener(
        "mouseleave",
        handleMouseLeave
      );
    };
  }, []);

  // ============================================================
  // SLIDER
  // ============================================================

  const handleChange = (
    key: keyof DNA,
    value: number
  ) => {
    const next: DNA = {
      ...dnaRef.current,
      [key]: value,
    };

    dnaRef.current = next;

    setDna(next);
  };

  // ============================================================
  // DNA TRANSITION
  // ============================================================

  const transitionToDNA = (
    target: DNA,
    duration = 3000
  ) => {
    if (
      transitionRef.current !==
      null
    ) {
      cancelAnimationFrame(
        transitionRef.current
      );
    }

    const start: DNA = {
      ...dnaRef.current,
    };

    const startTime =
      performance.now();

    const keys =
      Object.keys(
        target
      ) as Array<
        keyof DNA
      >;

    const animateTransition = (
      now: number
    ) => {
      const raw =
        Math.min(
          (
            now -
            startTime
          ) /
            duration,
          1
        );

      const progress =
        raw < 0.5
          ? 4 *
            raw *
            raw *
            raw
          : 1 -
            Math.pow(
              -2 *
                raw +
                2,
              3
            ) /
              2;

      const next =
        {} as DNA;

      for (
        const key of keys
      ) {
        next[key] =
          start[key] +
          (
            target[key] -
            start[key]
          ) *
            progress;
      }

      dnaRef.current = next;

      setDna(next);

      if (raw < 1) {
        transitionRef.current =
          requestAnimationFrame(
            animateTransition
          );
      } else {
        dnaRef.current =
          target;

        setDna(target);

        transitionRef.current =
          null;
      }
    };

    transitionRef.current =
      requestAnimationFrame(
        animateTransition
      );
  };

  // ============================================================
  // GENERATION EFFECT
  // ============================================================

  const playGenerationEffect =
    () => {
      const start =
        performance.now();

      const duration = 2200;

      const update = (
        now: number
      ) => {
        const t =
          Math.min(
            (
              now -
              start
            ) /
              duration,
            1
          );

        let scale = 1;

        if (t < 0.35) {
          const p =
            t / 0.35;

          scale =
            1 -
            0.78 *
              p *
              p;
        } else {
          const p =
            (
              t -
              0.35
            ) /
            0.65;

          const eased =
            1 -
            Math.pow(
              1 - p,
              3
            );

          scale =
            0.22 +
            0.78 *
              eased;
        }

        generationEffectRef.current =
          clamp(
            scale,
            0.05,
            1
          );

        if (t < 1) {
          requestAnimationFrame(
            update
          );
        } else {
          generationEffectRef.current =
            1;
        }
      };

      requestAnimationFrame(
        update
      );
    };

  // ============================================================
  // GENERATE
  // ============================================================

  const generateFromText =
    async () => {
      if (!text.trim()) {
        return;
      }

      try {
        setIsGenerating(
          true
        );

        const result =
          await analyzeText(
            text
          );

        console.log(
          "BOOKSCAPE Visual DNA:",
          result
        );

        playGenerationEffect();

        setTimeout(
          () => {
            transitionToDNA(
              result,
              3000
            );
          },
          500
        );
      } catch (error) {
        console.error(
          "Analysis failed:",
          error
        );

        alert(
          "文章の解析に失敗しました。"
        );
      } finally {
        setIsGenerating(
          false
        );
      }
    };

  // ============================================================
  // UI DATA
  // ============================================================

  const worldDescription =
    describeWorld(dna);

  const worldStatement =
    createWorldStatement(dna);

  const worldTitle =
    createWorldTitle(dna);

  // ============================================================
  // UI
  // ============================================================

  return (
    <main className="page">
     <World3D
  quietness={dna.quietness}
  chaos={dna.chaos}
  solitude={dna.solitude}
  hope={dna.hope}
  fantasy={dna.fantasy}
  nature={dna.nature}
  darkness={dna.darkness}
  speed={dna.speed}
  warmth={dna.warmth}
  spaciousness={dna.spaciousness}
  tension={dna.tension}
  fluidity={dna.fluidity}
/>

      <aside className="panel">
        <div className="brand">
          <h1>
            BOOKSCAPE
          </h1>

          <p>
            A STORY BECOMES A WORLD
          </p>
        </div>

        <div className="divider" />

        <section className="inputSection">
          <h2>
            INPUT
          </h2>

          <textarea
            value={text}
            onChange={(e) =>
              setText(
                e.target.value
              )
            }
            placeholder="物語や、印象に残った文章を入力してください。"
          />

          <button
            type="button"
            className="generateButton"
            onClick={
              generateFromText
            }
            disabled={
              isGenerating ||
              text
                .trim()
                .length === 0
            }
          >
            {isGenerating
              ? "ANALYZING..."
              : "GENERATE →"}
          </button>
        </section>

        <div className="divider" />

        <section className="worldSection">
          <h2>
            GENERATED WORLD
          </h2>

          <div className="generatedTitle">
            {worldTitle}
          </div>

          <div className="worldGroup">
            <span className="worldLabel">
              WORLD TYPE
            </span>

            <p className="worldWords">
              {worldDescription.world.join(
                " / "
              )}
            </p>
          </div>

          <div className="worldGroup">
            <span className="worldLabel">
              ATMOSPHERE
            </span>

            <p className="worldWords">
              {worldDescription.atmosphere.join(
                " / "
              )}
            </p>
          </div>

          <div className="worldGroup statementGroup">
            <span className="worldLabel">
              WORLD STATEMENT
            </span>

            <p className="worldStatement">
              {worldStatement}
            </p>
          </div>
        </section>

        <div className="divider" />

        <section>
          <h2>
            VISUAL DNA
          </h2>

          {Object.entries(
            dna
          ).map(
            ([
              key,
              value,
            ]) => (
              <div
                className="sliderRow"
                key={key}
              >
                <span className="label">
                  {key}
                </span>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.001"
                  value={value}
                  onChange={(e) =>
                    handleChange(
                      key as keyof DNA,
                      Number(
                        e.target
                          .value
                      )
                    )
                  }
                />

                <span className="value">
                  {value.toFixed(
                    3
                  )}
                </span>
              </div>
            )
          )}
        </section>

        <div className="footer">
          LANGUAGE → MEANING → PHYSICS → ART
        </div>
      </aside>
    </main>
  );
}