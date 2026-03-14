# Bike Tracker

Carte temps réel des vélos et trottinettes disponibles près de vous.
Supporte **Lime**, **Voi**, **Dott** et les stations **Vélib Métropole** (Paris).

## Fonctionnalités

- 🗺️ Carte interactive avec filtre par opérateur
- 🔋 Niveau de batterie, autonomie estimée, type de véhicule
- 🚶 Distance à pied + temps de marche estimé
- 📍 Géolocalisation GPS ou saisie manuelle (coordonnées, lien Google Maps)
- 🌙 Thème clair / sombre
- 🌐 Interface en français et en anglais
- 📱 Progressive Web App (installable, fonctionne offline)

## Architecture

```
front/   → Vue 3 + Vite + Tailwind CSS (PWA)
back/    → Express 5 proxy – agrège les flux GBFS et les données Vélib
```

Le proxy backend est nécessaire pour contourner les restrictions CORS des API tierces.
**Aucune donnée utilisateur n'est collectée ni stockée côté serveur.**

## Sources de données

- [Lime GBFS](https://data.lime.bike/api/partners/v2/gbfs/paris)
- [Voi GBFS](https://api.voiapp.io/gbfs/)
- [Dott GBFS](https://gbfs.api.ridedott.com/public/v2/paris)
- [Vélib Métropole Open Data](https://velib-metropole-opendata.smovengo.cloud/)

## Licence

Usage personnel et non commercial uniquement.
Les marques Lime, Voi, Dott et Vélib sont la propriété de leurs détenteurs respectifs.
