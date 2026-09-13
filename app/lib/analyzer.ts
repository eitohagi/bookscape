import { pipeline } from "@huggingface/transformers";

export type DNA = {
  quietness: number;
  chaos: number;
  solitude: number;
  hope: number;
  fantasy: number;
  nature: number;
  darkness: number;
  speed: number;
  warmth: number;
  spaciousness: number;
  tension: number;
  fluidity: number;
};

const axes = {
  quietness: {
    low: [
      "騒がしく人々の声や物音に満ちた世界",
      "にぎやかで落ち着かない場所",
      "大きな音が鳴り続けている空間",
    ],
    high: [
      "静かで音のない世界",
      "静寂に包まれた穏やかな場所",
      "誰も話さず物音もしない空間",
    ],
  },

  chaos: {
    low: [
      "秩序正しく安定した世界",
      "規則的で整然とした場所",
      "すべてが予測可能で調和している",
    ],
    high: [
      "混乱して無秩序な世界",
      "予測不能で激しく乱れている",
      "崩壊し混沌としている場所",
    ],
  },

  solitude: {
    low: [
      "多くの人とつながっている",
      "友情や共同体を感じる世界",
      "仲間と共に過ごしている",
    ],
    high: [
      "孤独で一人きりの世界",
      "誰もいない場所で一人で過ごす",
      "社会から隔絶された空間",
    ],
  },

  hope: {
    low: [
      "希望がなく絶望している",
      "未来が閉ざされた世界",
      "悲観的で救いのない状況",
    ],
    high: [
      "未来への希望を感じる",
      "明るい可能性に満ちている",
      "前向きで希望に満ちた世界",
    ],
  },

  fantasy: {
    low: [
      "現実的で日常的な世界",
      "普通の生活が続く現実",
      "現実世界と同じ日常",
    ],
    high: [
      "幻想的で夢のような世界",
      "魔法や奇跡の存在する世界",
      "現実を超えた不思議な空間",
    ],
  },

  nature: {
    low: [
      "人工物と建築物に囲まれた都市",
      "機械とコンクリートの世界",
      "人工的な都市空間",
    ],
    high: [
      "森や植物に囲まれた自然",
      "海や山や風を感じる世界",
      "生命と自然に満ちた場所",
    ],
  },

  darkness: {
    low: [
      "明るい光に満ちた世界",
      "昼の光が降り注ぐ場所",
      "明るく輝いている空間",
    ],
    high: [
      "暗闇に包まれた世界",
      "夜と影に覆われた場所",
      "光のほとんどない暗い空間",
    ],
  },

  speed: {
    low: [
      "ゆっくり時間が流れている",
      "ほとんど動かない静かな世界",
      "穏やかでゆっくりした動き",
    ],
    high: [
      "高速で動き続けている",
      "激しく素早い動き",
      "猛烈な速度で進んでいる",
    ],
  },

  warmth: {
    low: [
      "冷たく無機質な世界",
      "寒く冷たい空間",
      "感情のない冷たい雰囲気",
    ],
    high: [
      "暖かく優しい世界",
      "温もりと愛情を感じる",
      "包み込まれるような暖かさ",
    ],
  },

  spaciousness: {
    low: [
      "狭く閉ざされた空間",
      "圧迫感のある小さな場所",
      "閉じ込められた狭い世界",
    ],
    high: [
      "果てしなく広大な空間",
      "宇宙のようにどこまでも広い",
      "開放的で壮大な世界",
    ],
  },

  tension: {
    low: [
      "安全で穏やかな世界",
      "安心して過ごせる場所",
      "緊張する必要のない状況",
    ],
    high: [
      "危険と不安に満ちている",
      "強い緊張感のある世界",
      "何が起こるかわからない恐怖",
    ],
  },

  fluidity: {
    low: [
      "硬く固定されて動かない",
      "形が変わらない静的な世界",
      "固体のように安定している",
    ],
    high: [
      "水や煙のように流れている",
      "形を変えながら漂っている",
      "滑らかに流動し続ける世界",
    ],
  },
} satisfies Record<
  keyof DNA,
  {
    low: string[];
    high: string[];
  }
>;

let extractorPromise: ReturnType<typeof pipeline> | null = null;

async function getExtractor() {
  if (!extractorPromise) {
    extractorPromise = pipeline(
      "feature-extraction",
      "Xenova/paraphrase-multilingual-MiniLM-L12-v2"
    );
  }

  return extractorPromise;
}

function dot(a: number[], b: number[]) {
  let sum = 0;

  for (let i = 0; i < a.length; i++) {
    sum += a[i] * b[i];
  }

  return sum;
}

async function embed(
  extractor: any,
  text: string
) {
  const result = await extractor(text, {
    pooling: "mean",
    normalize: true,
  });

  return Array.from(result.data) as number[];
}

async function averageEmbedding(
  extractor: any,
  texts: string[]
) {
  const embeddings = await Promise.all(
    texts.map((text) => embed(extractor, text))
  );

  const dimensions = embeddings[0].length;
  const average = new Array(dimensions).fill(0);

  for (const embedding of embeddings) {
    for (let i = 0; i < dimensions; i++) {
      average[i] += embedding[i] / embeddings.length;
    }
  }

  const norm = Math.sqrt(
    average.reduce((sum, value) => sum + value * value, 0)
  );

  return average.map((value) =>
    norm === 0 ? 0 : value / norm
  );
}

function scoreAxis(
  input: number[],
  low: number[],
  high: number[]
) {
  const lowSimilarity = dot(input, low);
  const highSimilarity = dot(input, high);

  const difference = highSimilarity - lowSimilarity;

  const score =
    1 / (1 + Math.exp(-difference * 8));

  return Math.max(0, Math.min(1, score));
}

export async function analyzeText(
  text: string
): Promise<DNA> {
  const extractor = await getExtractor();

  const inputEmbedding = await embed(
    extractor,
    text
  );

  const result = {} as DNA;

  for (const key of Object.keys(
    axes
  ) as Array<keyof DNA>) {
    const axis = axes[key];

    const lowEmbedding =
      await averageEmbedding(
        extractor,
        axis.low
      );

    const highEmbedding =
      await averageEmbedding(
        extractor,
        axis.high
      );

    result[key] = Number(
      scoreAxis(
        inputEmbedding,
        lowEmbedding,
        highEmbedding
      ).toFixed(3)
    );
  }

  return result;
}