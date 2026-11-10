/* ==========================================================
   LES CLUBS — c'est ici que tu remplis les vraies données.
   Ordre d'affichage = ordre de ce tableau.
   Champs à compléter pour chaque club :
   - president : nom ; photo : fichier dans le dossier presidents/
   - jour / heure / lieu : informations de réunion
   - whatsapp (indicatif sans +, ex. 22901XXXXXXXX), telephone, email, facebook (lien complet)
   Un champ vide s'affiche « À venir » sur la page du club.
   Les demandes d'adhésion partent sur WhatsApp, sinon par e-mail.
   ========================================================== */
const CLUBS = [
  { slug: 'nautile-connect', nom: 'Club Rotaract Satellite de Cotonou le Nautile Connect',
    image: 'fanion-nautile-connect.webp', ville: 'Cotonou', info: '', description: 'Un club thématique centré sur le digital, ouvert aux jeunes qui travaillent dans le digital et la communication ou qui s’y intéressent.',
    president: 'Yeratel BOGNON', photo: 'presidents/nautile-connect.webp',
    jour: '2e et 4e lundi du mois', heure: '19 h 30', lieu: 'Sainte-Rita ou en ligne',
    reunion: { jourSemaine: 1, semaines: [2, 4] },
    whatsapp: '2290162617627', telephone: '01 62 61 76 27', email: '', facebook: '' },

  { slug: 'rive-gauche-cica', nom: 'Club Rotaract de Cotonou Rive Gauche Cica',
    image: 'fanion-rive-gauche-cica.webp', ville: 'Cotonou', info: '', description: '',
    president: 'Nelly KOUAKANOU', photo: 'presidents/rive-gauche-cica.webp',
    jour: '1er et 3e dimanche du mois', heure: '17 h 30', lieu: 'Horse SARL, Akpakpa',
    reunion: { jourSemaine: 0, semaines: [1, 3] },
    whatsapp: '2290161891713', telephone: '01 61 89 17 13', email: '', facebook: '' },

  { slug: 'abomey-calavi-plateau', nom: 'Club Rotaract d\u2019Abomey Calavi Plateau',
    image: 'fanion-4.webp', ville: 'Abomey-Calavi', info: 'District 9103 · Club N°215860',
    description: 'Club Rotaract d\u2019Abomey-Calavi Plateau, associé au CIFRED (UAC), centre de formation et de recherche en environnement pour le développement durable.',
    president: 'Jofrey TCHOBO', photo: 'presidents/abomey-calavi-plateau.webp',
    jour: '1er et 3e vendredi du mois', heure: '19 h 30',
    lieu: 'CIFRED, derrière l’hôpital de zone d’Abomey-Calavi',
    reunion: { jourSemaine: 5, semaines: [1, 3] },
    whatsapp: '2290167906659', telephone: '01 67 90 66 59', email: '', facebook: '' },

  { slug: 'cotonou-nautile', nom: 'Club Rotaract de Cotonou le Nautile',
    image: 'fanion-nautile.webp', ville: 'Cotonou', info: '', description: '',
    president: 'Géraud BOYA', photo: 'presidents/cotonou-nautile.webp',
    jour: '1er et 3e lundi du mois', heure: '19 h 30', lieu: 'J Réside, Gbèdjromèdé',
    reunion: { jourSemaine: 1, semaines: [1, 3] },
    whatsapp: '2290166238055', telephone: '01 66 23 80 55', email: '', facebook: '' },

  { slug: 'cotonou-haie-vive', nom: 'Club Rotaract de Cotonou Haie Vive',
    image: 'fanion-haie-vive.webp', ville: 'Cotonou', info: '', description: '',
    president: 'Sessi Aurelle BOGNON', photo: 'presidents/cotonou-haie-vive.webp',
    jour: '2e et 4e vendredi du mois', heure: '19 h 30', lieu: 'Mennontin',
    reunion: { jourSemaine: 5, semaines: [2, 4] },
    whatsapp: '2290162617626', telephone: '01 62 61 76 26', email: '', facebook: '' },

  { slug: 'cotonou-ife', nom: 'Club Rotaract de Cotonou Ifê',
    image: 'fanion-3.webp', ville: 'Cotonou', info: 'Depuis 2016',
    description: 'Discipline – Amitié – Leadership – Service.',
    president: 'Anne Marie MAHOULIKPONTO', photo: 'presidents/cotonou-ife.webp',
    jour: '1er et 3e lundi du mois', heure: '19 h 30', lieu: '',
    reunion: { jourSemaine: 1, semaines: [1, 3] },
    whatsapp: '2290169348401', telephone: '01 69 34 84 01', email: '', facebook: '' },

  { slug: 'cotonou-lagune', nom: 'Club Rotaract de Cotonou Lagune',
    image: 'fanion-1.webp', ville: 'Cotonou', info: 'District 9103',
    description: 'Un club engagé au service de la communauté de Cotonou, au bord de la lagune.',
    president: 'Ruddy WHANDENON', photo: 'presidents/cotonou-lagune.webp',
    jour: '2e et 4e mercredi du mois', heure: '19 h 30', lieu: 'Wologuèdè',
    reunion: { jourSemaine: 3, semaines: [2, 4] },
    whatsapp: '2290167717179', telephone: '01 67 71 71 79', email: '', facebook: '' },

  { slug: 'cotonou-etoile', nom: 'Club Rotaract de Cotonou Étoile',
    image: 'fanion-2.webp', ville: 'Cotonou', info: 'District 9103 · Club N°8824657',
    description: 'De jeunes leaders qui font briller l\u2019esprit de service, telle une étoile.',
    president: 'Hamdiatou MAMAN', photo: 'presidents/cotonou-etoile.webp',
    jour: '2e et 4e samedi du mois', heure: '18 h', lieu: 'Wologuèdè, espace Ifè',
    reunion: { jourSemaine: 6, semaines: [2, 4] },
    whatsapp: '2290167278645', telephone: '01 67 27 86 45', email: '', facebook: '' }
];

const VILLES = ['Cotonou', 'Abomey-Calavi'];

/* Images de remplacement (fanion ou photo absente) */
const PLACEHOLDER = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 120"><path d="M4 4h82v78L45 116 4 82z" fill="#fce4ec" stroke="#E91E63" stroke-width="3"/></svg>');
const AVATAR = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" fill="#fce4ec"/><circle cx="48" cy="38" r="16" fill="#E91E63"/><path d="M16 90c4-22 20-30 32-30s28 8 32 30z" fill="#E91E63"/></svg>');

function gererImageAbsente(img) {
  img.addEventListener('error', () => { img.src = PLACEHOLDER; }, { once: true });
}

/* Minuscules sans accents, pour la recherche */
function normaliser(t) {
  return t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function urlFicheClub(club) {
  return 'club-' + encodeURIComponent(club.slug) + '.html';
}

/* Carte cliquable vers la page du club */
function creerCarte(club, i, anime) {
  const li = document.createElement('li');
  li.className = anime ? 'item item--entree' : 'item';
  li.style.setProperty('--i', i);
  const a = document.createElement('a');
  a.className = 'carte';
  a.href = urlFicheClub(club);
  const img = document.createElement('img');
  img.className = 'carte__image';
  img.src = club.image;
  img.loading = 'lazy';
  img.decoding = 'async';
  img.fetchPriority = 'low';
  img.alt = 'Fanion du ' + club.nom;
  gererImageAbsente(img);
  const nom = document.createElement('span');
  nom.className = 'carte__nom';
  nom.textContent = club.nom;
  a.append(img, nom);
  li.appendChild(a);
  return li;
}
