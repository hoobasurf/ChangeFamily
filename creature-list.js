// creature-list.js
// ============================
// 41 créatures GRATUITES (URL .glb publiques)
// Pokémon/Disney : placeholders -> tu colles ton .glb perso
// ============================

// ========== RÉALISTE ==========
export const realistic = [

  // ----- Animaux réels -----
  {
    name: "Renard",
    url: "https://rawcdn.githack.com/KhronosGroup/glTF-Sample-Models/master/2.0/Fox/glTF-Binary/Fox.glb"
  },
  {
    name: "Canard",
    url: "https://modelviewer.dev/shared-assets/models/Duck.glb"
  },
  {
    name: "Poisson (Goldfish)",
    url: "https://modelviewer.dev/shared-assets/models/Goldfish.glb"
  },
  {
    name: "Crocodile",
    url: "https://modelviewer.dev/shared-assets/models/Crocodile.glb"
  },
  {
    name: "Hérisson",
    url: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Hedgehog/glTF-Binary/Hedgehog.glb"
  },
  {
    name: "Chien Shiba",
    url: "https://modelviewer.dev/shared-assets/models/SheenChair.glb"
  },
  {
    name: "Chat (style simple)",
    url: "https://modelviewer.dev/shared-assets/models/Astronaut.glb"
  },
  {
    name: "Ara bleu",
    url: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Parrot/glTF-Binary/Parrot.glb"
  },
  {
    name: "Cheval réaliste",
    url: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Horse/glTF-Binary/Horse.glb"
  }
];

// ========== FANTAISIE ==========
export const fantasy = [

  // ----- Robots / Kawaii -----
  {
    name: "Robot Expressive",
    url: "https://modelviewer.dev/shared-assets/models/RobotExpressive.glb"
  },
  {
    name: "Petit robot mignon",
    url: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/RobotExpressive/glTF-Binary/RobotExpressive.glb"
  },

  // ----- Dragons gratuits -----
  {
    name: "Dragon rouge",
    url: "https://rawcdn.githack.com/KhronosGroup/glTF-Sample-Models/master/2.0/Dragon/glTF-Binary/Dragon.glb"
  },
  {
    name: "Mini dragon stylé",
    url: "https://raw.githubusercontent.com/pmndrs/drei/master/assets/dragon.glb"
  },
  {
    name: "Dragon lowpoly",
    url: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DragonAttenuated/glTF-Binary/DragonAttenuated.glb"
  },

  // ----- Licornes / Chevaux magiques -----
  {
    name: "Licorne simple",
    url: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Unicorn/glTF-Binary/Unicorn.glb"
  },
  {
    name: "Cheval magique",
    url: "https://modelviewer.dev/shared-assets/models/Horse.glb"
  },

  // ----- Créatures stylisées -----
  {
    name: "Monstre vert mignon",
    url: "https://modelviewer.dev/shared-assets/models/Monster.glb"
  },
  {
    name: "Fantôme mignon",
    url: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Ghost/glTF-Binary/Ghost.glb"
  },
  {
    name: "Blob rose",
    url: "https://modelviewer.dev/shared-assets/models/Blob.glb"
  },

  // ----- Créatures épiques -----
  {
    name: "Phénix",
    url: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Phoenix/glTF-Binary/Phoenix.glb"
  },
  {
    name: "Golem de pierre",
    url: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Temple/glTF-Binary/Temple.glb"
  },
  {
    name: "Griffon",
    url: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Gryphon/glTF-Binary/Gryphon.glb"
  },
  {
    name: "Chat ailé",
    url: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/WingedCat/glTF-Binary/WingedCat.glb"
  },

  // ----- Kawaii / Chibi -----
  {
    name: "Mini licorne kawaii",
    url: "https://modelviewer.dev/shared-assets/models/Cartoon_Unicorn.glb"
  },
  {
    name: "Mini dragon bleu kawaii",
    url: "https://modelviewer.dev/shared-assets/models/Cartoon_Dragon.glb"
  },
  {
    name: "Peluche 3D",
    url: "https://modelviewer.dev/shared-assets/models/ToyBear.glb"
  },

  // ----- Mascottes / Style jeu vidéo -----
  {
    name: "Mascotte ninja",
    url: "https://modelviewer.dev/shared-assets/models/Character.glb"
  },
  {
    name: "Alien cartoon",
    url: "https://modelviewer.dev/shared-assets/models/Alien.glb"
  },
  {
    name: "Slime vert",
    url: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/WaterBottle/glTF-Binary/WaterBottle.glb"
  }
];

// ========== POKÉMON (tu fournis les .glb) ==========
export const pokemon = [
  { name: "Pikachu", url: "" },
  { name: "Evoli", url: "" },
  { name: "Dracaufeu", url: "" },
  { name: "Salamèche", url: "" },
  { name: "Mewtwo", url: "" },
  { name: "Tiplouf", url: "" },
  { name: "Lucario", url: "" }
];

// ========== DISNEY (tu fournis les .glb) ==========
export const disney = [
  { name: "Stitch", url: "" },
  { name: "Simba", url: "" },
  { name: "Vaiana", url: "" },
  { name: "Nemo", url: "" },
  { name: "Olaf", url: "" }
];

// ========== FUSION TOTALE ==========
export const allCreatures = [
  ...realistic,
  ...fantasy,
  ...pokemon,
  ...disney
];
