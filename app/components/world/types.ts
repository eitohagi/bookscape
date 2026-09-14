export type World3DProps = {
  quietness?: number;
  chaos?: number;
  solitude?: number;
  hope?: number;
  fantasy?: number;
  nature?: number;
  darkness?: number;
  speed?: number;
  warmth?: number;
  spaciousness?: number;
  tension?: number;
  fluidity?: number;

  /*
   * Composition Engine用
   *
   * 0 = 非表示
   * 1 = 最大
   */
  mix?: number;
};