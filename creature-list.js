// creature-list.js
// ============================
// TES CRÉATURES UNIQUEMENT
// ============================

export const realistic = [
  { name: "Stitch", url: "./stitch.glb" },
  { name: "Simba", url: "./simba.glb" },
  { name: "Vaiana", url: "./vaiana.glb" }
];

export const fantasy = [
  { name: "Pikachu", url: "./pikachu.glb" },
  { name: "Mira", url: "./mira.glb" },
  { name: "Zoe", url: "./zoe.glb" },
  { name: "Rumi", url: "./rumi.glb" }
];

// Fusion totale (si besoin)
export const allCreatures = [...realistic, ...fantasy];
