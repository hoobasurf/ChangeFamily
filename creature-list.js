// creature-list.js
// Librairie de créatures (Réaliste + Fantaisie).
// Ajoute ici d'autres URLs .glb publiques si tu en trouves.
// FORMAT : { name: "Nom", url: "https://.../model.glb", thumbnail: "https://.../thumb.jpg" }

export const realistic = [
  {
    name: "Renard (Fox)",
    url: "https://rawcdn.githack.com/KhronosGroup/glTF-Sample-Models/master/2.0/Fox/glTF-Binary/Fox.glb",
    thumbnail: ""
  },
  {
    name: "Canard (Duck) - exemple",
    url: "https://modelviewer.dev/shared-assets/models/Duck.glb",
    thumbnail: ""
  },
  {
    name: "Cheval (exemple) - placeholder",
    url: "", // ajoute une URL .glb publique ici
    thumbnail: ""
  },
  // ajoute d'autres réalistes ici...
];

export const fantasy = [
  {
    name: "RobotExpressive (exemple stylisé)",
    url: "https://modelviewer.dev/shared-assets/models/RobotExpressive.glb",
    thumbnail: ""
  },
  {
    name: "Dragon (placeholder)",
    url: "", // colle ici une URL .glb de dragon gratuite
    thumbnail: ""
  },
  {
    name: "Licorne (placeholder)",
    url: "", // colle ici une URL .glb de licorne gratuite
    thumbnail: ""
  },
  // ajoute d'autres fantaisie ici...
];

// Helper pour fusion si tu veux charger "toutes"
export const allCreatures = [...realistic, ...fantasy];
