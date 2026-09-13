"use client";

import { useEffect, useRef, useState } from "react";

import {
  analyzeText,
  type DNA,
} from "./lib/analyzer";

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

export default function Home() {
  const canvasRef =
    useRef<HTMLCanvasElement | null>(null);

  const [dna, setDna] =
    useState<DNA>(initialDNA);

  const dnaRef =
    useRef<DNA>(initialDNA);

  const transitionRef =
    useRef<number | null>(null);

  const generationEffectRef =
    useRef(1);

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

  // =====================================
  // 銀河描画
  // =====================================

  useEffect(() => {
    const canvas =
      canvasRef.current;

    if (!canvas) return;

    const ctx =
      canvas.getContext("2d");

    if (!ctx) return;

    let animationId = 0;

    const resize = () => {
      canvas.width =
        window.innerWidth;

      canvas.height =
        window.innerHeight;
    };

    resize();

    window.addEventListener(
      "resize",
      resize
    );

    const panelWidth = 380;
    const armCount = 4;

    const maxParticleCount =
      4000;

    const particles =
      Array.from(
        {
          length:
            maxParticleCount,
        },
        (_, index) => {
          const normalizedDistance =
            Math.random();

          const baseDistance =
            Math.pow(
              normalizedDistance,
              0.65
            );

          const armIndex =
            index % armCount;

          const armOffset =
            (
              Math.PI *
              2 *
              armIndex
            ) /
            armCount;

          return {
            baseDistance,

            armOffset,

            randomSpread:
              Math.random() -
              0.5,

            baseSize:
              0.3 +
              Math.random() * 2,

            baseSpeed:
              0.0001 +
              Math.random() *
                0.0004,

            brightness:
              0.2 +
              Math.random() *
                0.8,

            offset:
              Math.random() *
              100,

            verticalRandom:
              Math.random() -
              0.5,
          };
        }
      );

    let time = 0;

    const animate = () => {
      time += 0.01;

      const d =
        dnaRef.current;

      const generationScale =
        generationEffectRef.current;

      // -------------------------
      // 背景フェード
      // -------------------------

      const fade =
        0.07 +
        d.quietness * 0.07 +
        d.darkness * 0.04;

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
        canvas.width,
        canvas.height
      );

      // -------------------------
      // 銀河中心座標
      // -------------------------

      const cx =
        panelWidth +
        (
          canvas.width -
          panelWidth
        ) /
          2;

      const cy =
        canvas.height / 2;

      // -------------------------
      // 銀河中心の光
      // -------------------------

      const rawCoreRadius =
  (
    30 +
    d.fantasy * 55
  ) *
  (
    0.65 +
    generationScale * 0.35
  );

const coreRadius =
  Math.max(
    1,
    Math.abs(rawCoreRadius)
  );

      const gradient =
        ctx.createRadialGradient(
          cx,
          cy,
          0,
          cx,
          cy,
          coreRadius
        );

      gradient.addColorStop(
        0,
        `rgba(
          255,
          255,
          255,
          ${
            0.35 +
            d.hope * 0.55
          }
        )`
      );

      gradient.addColorStop(
        0.25,
        `rgba(
          ${
            210 +
            d.warmth * 40
          },
          ${
            220 +
            d.hope * 20
          },
          255,
          0.22
        )`
      );

      gradient.addColorStop(
        1,
        "rgba(0,0,0,0)"
      );

      ctx.fillStyle =
        gradient;

      ctx.beginPath();

      ctx.arc(
        cx,
        cy,
        coreRadius,
        0,
        Math.PI * 2
      );

      ctx.fill();

      // -------------------------
      // 表示する粒子数
      // -------------------------

      const visibleCount =
        Math.min(
          maxParticleCount,
          Math.floor(
            1000 +
              d.fantasy *
                1500 +
              d.spaciousness *
                900
          )
        );

      // -------------------------
      // 粒子描画
      // -------------------------

      for (
        let i = 0;
        i < visibleCount;
        i++
      ) {
        const p =
          particles[i];

        const distance =
          p.baseDistance *
          Math.min(
            canvas.width,
            canvas.height
          ) *
          (
            0.22 +
            d.spaciousness *
              0.34
          );

        // chaos
        const spread =
          p.randomSpread *
          (
            0.12 +
            d.chaos * 0.9
          );

        // fluidity
        const spiralStrength =
          0.012 +
          d.fluidity *
            0.018;

        // speed
        const rotationSpeed =
          p.baseSpeed *
          (
            0.3 +
            d.speed * 2.5
          );

        const rotation =
          time *
          rotationSpeed *
          100;

        // tension
        const tensionNoise =
          Math.sin(
            time * 5 +
              p.offset
          ) *
          d.tension *
          5;

        const angle =
          p.armOffset +
          distance *
            spiralStrength +
          spread +
          rotation +
          tensionNoise *
            0.002;

        // chaos
        const chaosNoise =
          Math.sin(
            time * 1.4 +
              p.offset
          ) *
          d.chaos *
          18;

        // nature
        const natureNoise =
          Math.sin(
            distance *
              0.025 +
              time +
              p.offset
          ) *
          d.nature *
          10;

        // fluidity
        const fluidNoise =
          Math.sin(
            angle * 3 -
              time * 0.7 +
              p.offset
          ) *
          d.fluidity *
          14;

        const radius =
          distance +
          chaosNoise +
          natureNoise +
          fluidNoise;

        // solitude
        const solitudeSpread =
          0.75 +
          d.solitude *
            0.5;

        const verticalOffset =
          p.verticalRandom *
          (
            6 +
            d.chaos * 24
          );

        // 生成演出による収縮・拡張
        const x =
          cx +
          Math.cos(angle) *
            radius *
            solitudeSpread *
            generationScale;

        const y =
          cy +
          (
            Math.sin(angle) *
              radius *
              0.58 +
            verticalOffset
          ) *
            generationScale;

        // fantasy
        const alpha =
          p.brightness *
          (
            0.2 +
            d.fantasy *
              0.75
          );

        const particleSize =
          p.baseSize *
          (
            0.65 +
            d.fantasy
          );

        ctx.beginPath();

        ctx.arc(
          x,
          y,
          particleSize,
          0,
          Math.PI * 2
        );

        // warmth
        const red =
          180 +
          d.warmth * 70;

        // hope
        const green =
          195 +
          d.hope * 45;

        ctx.fillStyle =
          `rgba(
            ${red},
            ${green},
            255,
            ${alpha}
          )`;

        ctx.fill();
      }

      animationId =
        requestAnimationFrame(
          animate
        );
    };

    animate();

    return () => {
      cancelAnimationFrame(
        animationId
      );

      window.removeEventListener(
        "resize",
        resize
      );
    };
  }, []);

  // =====================================
  // スライダー操作
  // =====================================

  const handleChange = (
    key: keyof DNA,
    value: number
  ) => {
    const next: DNA = {
      ...dnaRef.current,
      [key]: value,
    };

    dnaRef.current =
      next;

    setDna(next);
  };

  // =====================================
  // DNAを滑らかに変化させる
  // =====================================

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
      ) as Array<keyof DNA>;

    const animateTransition = (
      now: number
    ) => {
      const rawProgress =
        Math.min(
          (
            now -
            startTime
          ) /
            duration,
          1
        );

      // easeInOutCubic
      const progress =
        rawProgress < 0.5
          ? 4 *
            rawProgress *
            rawProgress *
            rawProgress
          : 1 -
            Math.pow(
              -2 *
                rawProgress +
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

      dnaRef.current =
        next;

      setDna(next);

      if (
        rawProgress < 1
      ) {
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

  // =====================================
  // 銀河生成演出
  // =====================================

  const playGenerationEffect =
    () => {
      const startTime =
        performance.now();

      const duration = 2200;

      const animateEffect = (
        now: number
      ) => {
        const t =
          Math.min(
            (
              now -
              startTime
            ) /
              duration,
            1
          );

        let scale = 1;

        if (t < 0.35) {
          // 中心へ収縮
          const p =
            t / 0.35;

          scale =
            1 -
            0.78 *
              p *
              p;
        } else {
          // 外側へ広がる
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
  Math.max(
    0.05,
    Math.min(1, scale)
  );

        if (t < 1) {
          requestAnimationFrame(
            animateEffect
          );
        } else {
          generationEffectRef.current =
            1;
        }
      };

      requestAnimationFrame(
        animateEffect
      );
    };

  // =====================================
  // AI文章解析
  // =====================================

  const generateFromText =
    async () => {
      if (
        !text.trim()
      ) {
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

        // まず銀河を収縮
        playGenerationEffect();

        // 少し遅れて
        // Visual DNA変形開始
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

  // =====================================
  // UI
  // =====================================

  return (
    <main className="page">
      <canvas
        ref={canvasRef}
        className="canvas"
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
            onChange={(
              e
            ) =>
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
              text.trim()
                .length === 0
            }
          >
            {isGenerating
              ? "ANALYZING..."
              : "GENERATE →"}
          </button>
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
                  onChange={(
                    e
                  ) =>
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