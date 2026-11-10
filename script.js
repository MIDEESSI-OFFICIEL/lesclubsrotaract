/* Accueil : loader, recherche + filtre, grille */
const racine = document.documentElement;
const loader = document.getElementById('loader');
const orbite = document.getElementById('loader-orbit');
const grille = document.getElementById('grille');
const recherche = document.getElementById('recherche');
const compte = document.getElementById('compte');
const vide = document.getElementById('vide');
const btnFiltre = document.getElementById('filtre-btn');
const menu = document.getElementById('filtre-menu');
const reunionsProches = document.getElementById('reunions-proches');

const villeChoisie = () => document.querySelector('input[name="ville"]:checked').value;
let premierAffichage = true; // l'animation d'arrivée ne joue qu'une fois
const fuseauBenin = 'Africa/Porto-Novo';
const formatterDateBenin = new Intl.DateTimeFormat('fr-FR', {
  timeZone: fuseauBenin, weekday: 'short', day: 'numeric', month: 'short'
});

function trouverReunionsProches(maintenant = new Date()) {
  const parties = new Intl.DateTimeFormat('en-US', {
    timeZone: fuseauBenin, year: 'numeric', month: 'numeric', day: 'numeric'
  }).formatToParts(maintenant);
  const dateBenin = Object.fromEntries(parties.map(p => [p.type, Number(p.value)]));
  const debut = Date.UTC(dateBenin.year, dateBenin.month - 1, dateBenin.day);
  const reunions = [];

  CLUBS.forEach(club => {
    if (!club.reunion || !club.heure) return;
    const heure = club.heure.match(/^(\d{1,2})\s*h(?:\s*(\d{2}))?$/i);
    if (!heure) return;
    const heureLocale = Number(heure[1]);
    const minuteLocale = Number(heure[2] || 0);

    for (let decalage = 0; decalage <= 3; decalage++) {
      const date = new Date(debut + decalage * 86400000);
      const semaine = Math.floor((date.getUTCDate() - 1) / 7) + 1;
      if (date.getUTCDay() !== club.reunion.jourSemaine || !club.reunion.semaines.includes(semaine)) continue;

      // Le Bénin reste à UTC+1 : convertir l'heure locale du rendez-vous en instant UTC.
      const instant = new Date(Date.UTC(
        date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), heureLocale, minuteLocale
      ) - 3600000);
      if (instant >= maintenant) reunions.push({ club, instant });
      break;
    }
  });

  return reunions.sort((a, b) => a.instant - b.instant);
}

function afficherReunionsProches() {
  const reunion = trouverReunionsProches()[0];
  reunionsProches.replaceChildren();
  reunionsProches.hidden = !reunion;
  if (!reunion) return;

  const { club, instant } = reunion;
  const alerte = document.createElement('article');
  alerte.className = 'alerte-reunion';

  const cloche = document.createElement('div');
  cloche.className = 'alerte-reunion__cloche';
  cloche.setAttribute('aria-hidden', 'true');
  const clocheSecours = document.createElement('span');
  clocheSecours.className = 'alerte-reunion__cloche-secours';
  clocheSecours.textContent = '🔔';
  const animationCloche = document.createElement('div');
  animationCloche.className = 'alerte-reunion__animation';
  cloche.append(clocheSecours, animationCloche);

  const fanion = document.createElement('img');
  fanion.className = 'alerte-reunion__fanion';
  fanion.src = club.image;
  fanion.alt = 'Fanion du ' + club.nom;
  gererImageAbsente(fanion);

  const message = document.createElement('p');
  message.className = 'alerte-reunion__message';
  const lien = document.createElement('a');
  lien.href = 'club.html?club=' + encodeURIComponent(club.slug);
  const nomCourt = club.nom.replace(/^Club Rotaract(?: Satellite)?(?: de)? /, '');
  lien.textContent = nomCourt;
  message.append('Réunion : ', lien, ' · ', formatterDateBenin.format(instant), ' à ', club.heure);
  alerte.append(cloche, fanion, message);
  reunionsProches.appendChild(alerte);

  if (window.lottie && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const lecture = window.lottie.loadAnimation({
      container: animationCloche, renderer: 'svg', loop: 2, autoplay: true,
      path: 'animation-reunion.json'
    });
    lecture.addEventListener('DOMLoaded', () => cloche.classList.add('is-ready'));
    lecture.addEventListener('data_failed', () => cloche.classList.remove('is-ready'));
  }
}

function afficher() {
  const q = normaliser(recherche.value.trim());
  const v = villeChoisie();
  const liste = CLUBS.filter(c => {
    const okVille = v === 'tous' || (v === 'Autre' ? !VILLES.includes(c.ville) : c.ville === v);
    return okVille && normaliser(c.nom + ' ' + c.info + ' ' + c.ville).includes(q);
  });
  grille.replaceChildren(...liste.map((c, i) => creerCarte(c, i, premierAffichage)));
  premierAffichage = false;
  compte.textContent = liste.length + (liste.length > 1 ? ' clubs' : ' club') + (v !== 'tous' ? ' · ' + v : '');
  btnFiltre.classList.toggle('is-actif', v !== 'tous');
  vide.hidden = liste.length > 0;
}

/* Menu du filtre (icône dans la barre de recherche) */
function ouvrirMenu(ouvert) {
  menu.hidden = !ouvert;
  btnFiltre.setAttribute('aria-expanded', String(ouvert));
}
btnFiltre.addEventListener('click', () => ouvrirMenu(menu.hidden));
menu.addEventListener('change', () => { afficher(); ouvrirMenu(false); });
document.addEventListener('click', (e) => {
  if (!menu.hidden && !menu.contains(e.target) && !btnFiltre.contains(e.target)) ouvrirMenu(false);
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !menu.hidden) { ouvrirMenu(false); btnFiltre.focus(); }
});

recherche.addEventListener('input', afficher);
document.getElementById('reset').addEventListener('click', () => {
  recherche.value = '';
  document.querySelector('input[name="ville"][value="tous"]').checked = true;
  afficher();
});

const assistantLauncher = document.getElementById('assistant-launcher');
const assistantPanel = document.getElementById('assistant-panel');
const assistantMessages = document.getElementById('assistant-messages');
const assistantForm = document.getElementById('assistant-form');
const assistantInput = document.getElementById('assistant-input');
let assistantStarted = false;
let preferencesAssistant = { interest: null, city: null, schedule: null };
let classementAssistant = [];

function ajouterMessageAssistant(texte, utilisateur = false) {
  const message = document.createElement('p');
  message.className = 'assistant__message' + (utilisateur ? ' assistant__message--user' : '');
  message.textContent = texte;
  assistantMessages.appendChild(message);
  assistantMessages.scrollTop = assistantMessages.scrollHeight;
  return message;
}

function reflechirAssistant(reponse) {
  const attente = ajouterMessageAssistant('Je réfléchis à ce qui pourrait te correspondre…');
  attente.classList.add('assistant__message--reflexion');
  setTimeout(() => {
    attente.remove();
    reponse();
  }, 550);
}

function ajouterOptionsAssistant(options) {
  const groupe = document.createElement('div');
  groupe.className = 'assistant__options';
  options.forEach(({ texte, action }) => {
    const bouton = document.createElement('button');
    bouton.type = 'button';
    bouton.className = 'assistant__option';
    bouton.textContent = texte;
    bouton.addEventListener('click', () => {
      groupe.querySelectorAll('button').forEach(option => { option.disabled = true; });
      ajouterMessageAssistant(texte, true);
      action();
    });
    groupe.appendChild(bouton);
  });
  assistantMessages.appendChild(groupe);
  assistantMessages.scrollTop = assistantMessages.scrollHeight;
}

function optionsInteretsAssistant() {
  ajouterOptionsAssistant([
    { texte: 'Digital et communication', action: () => choisirInteretAssistant('digital', 'le digital et la communication') },
    { texte: 'Environnement', action: () => choisirInteretAssistant('environment', 'l’environnement') },
    { texte: 'Leadership et service', action: () => choisirInteretAssistant('service', 'le leadership et le service') },
    { texte: 'Rencontres et convivialité', action: () => choisirInteretAssistant('community', 'les rencontres et la convivialité') },
    { texte: 'Je suis ouvert(e)', action: () => choisirInteretAssistant('any', 'plusieurs possibilités') }
  ]);
}

function choisirInteretAssistant(interet, libelle) {
  preferencesAssistant.interest = interet;
  reflechirAssistant(() => {
    ajouterMessageAssistant('Très bon point de départ : ' + libelle + '. Pour trouver quelque chose de pratique, quelle ville te conviendrait ?');
    optionsVilleAssistant();
  });
}

function optionsVilleAssistant() {
  ajouterOptionsAssistant([
    { texte: 'Cotonou', action: () => choisirVilleAssistant('Cotonou') },
    { texte: 'Abomey-Calavi', action: () => choisirVilleAssistant('Abomey-Calavi') },
    { texte: 'Peu importe', action: () => choisirVilleAssistant('any') }
  ]);
}

function choisirVilleAssistant(ville) {
  preferencesAssistant.city = ville;
  const reponse = ville === 'any'
    ? 'D’accord, je garde la ville ouverte.'
    : 'Parfait, je privilégie ' + ville + '.';
  reflechirAssistant(() => {
    ajouterMessageAssistant(reponse + ' Et côté disponibilités, les réunions du week-end ou celles en semaine te conviennent mieux ?');
    optionsDisponibiliteAssistant();
  });
}

function optionsDisponibiliteAssistant() {
  ajouterOptionsAssistant([
    { texte: 'En semaine', action: () => choisirDisponibiliteAssistant('weekday') },
    { texte: 'Le week-end', action: () => choisirDisponibiliteAssistant('weekend') },
    { texte: 'Les deux me vont', action: () => choisirDisponibiliteAssistant('any') }
  ]);
}

function choisirDisponibiliteAssistant(disponibilite) {
  preferencesAssistant.schedule = disponibilite;
  reflechirAssistant(afficherRecommandationsAssistant);
}

function carteRecommandationAssistant(club) {
  const carte = document.createElement('article');
  carte.className = 'assistant__recommandation';
  const image = document.createElement('img');
  image.src = club.image;
  image.alt = '';
  gererImageAbsente(image);
  const details = document.createElement('div');
  const lien = document.createElement('a');
  lien.href = 'club.html?club=' + encodeURIComponent(club.slug);
  lien.textContent = club.nom;
  details.appendChild(lien);
  const reunion = document.createElement('p');
  reunion.textContent = club.jour && club.heure
    ? club.jour + ' · ' + club.heure + (club.lieu ? ' · ' + club.lieu : '')
    : 'Horaires à confirmer · découvre sa fiche';
  details.appendChild(reunion);
  carte.append(image, details);
  assistantMessages.appendChild(carte);
}

function choisirDisponibiliteAssistant(disponibilite) {
  preferencesAssistant.schedule = disponibilite;
  reflechirAssistant(afficherRecommandationsAssistant);
}

function scoreInteretAssistant(club) {
  const texte = normaliser(club.nom + ' ' + club.description);
  switch (preferencesAssistant.interest) {
    case 'digital':
      return club.slug === 'nautile-connect' ? 10 : /digital|communication/.test(texte) ? 7 : 0;
    case 'environment':
      return club.slug === 'abomey-calavi-plateau' ? 10 : /environnement|durable|ecologie/.test(texte) ? 7 : 0;
    case 'service':
      return club.slug === 'cotonou-ife' ? 8 : /leadership|service/.test(texte) ? 5 : 2;
    case 'community':
      return club.slug === 'cotonou-ife' ? 5 : 3;
    default:
      return 2;
  }
}

function evaluerClubAssistant(club) {
  let score = scoreInteretAssistant(club);
  const raisons = [];
  if (preferencesAssistant.interest === 'digital' && club.slug === 'nautile-connect') {
    raisons.push('club thématique centré sur le digital et la communication');
  } else if (preferencesAssistant.interest === 'environment' && club.slug === 'abomey-calavi-plateau') {
    raisons.push('lien avec le CIFRED et le développement durable');
  } else if (preferencesAssistant.interest === 'service' && club.slug === 'cotonou-ife') {
    raisons.push('valeurs affichées de leadership et de service');
  } else if (preferencesAssistant.interest === 'community' && club.slug === 'cotonou-ife') {
    raisons.push('présentation axée sur l’amitié et le leadership');
  }

  if (preferencesAssistant.city && preferencesAssistant.city !== 'any') {
    if (club.ville === preferencesAssistant.city) {
      score += 6;
      raisons.push('situé à ' + club.ville);
    } else {
      score -= 4;
    }
  }

  if (preferencesAssistant.schedule === 'weekday' || preferencesAssistant.schedule === 'weekend') {
    if (!club.reunion) {
      score -= 2;
    } else {
      const weekEnd = club.reunion.jourSemaine === 0 || club.reunion.jourSemaine === 6;
      const convient = preferencesAssistant.schedule === 'weekend' ? weekEnd : !weekEnd;
      if (convient) {
        score += 4;
        raisons.push(weekEnd ? 'réunion le week-end' : 'réunion en semaine');
      } else {
        score -= 3;
      }
    }
  }

  if (!club.reunion) score -= 1;
  return { club, score, raisons };
}

function afficherAutresSuggestionsAssistant() {
  classementAssistant.slice(1).forEach(({ club }) => carteRecommandationAssistant(club));
  ajouterOptionsAssistant([
    { texte: 'Recommencer avec d’autres critères', action: recommencerAssistant },
    { texte: 'Voir les huit clubs', action: afficherTousLesClubsAssistant }
  ]);
}

function afficherRecommandationsAssistant() {
  classementAssistant = CLUBS.map(evaluerClubAssistant)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const meilleur = classementAssistant[0];
  if (!meilleur) {
    ajouterMessageAssistant('Je n’ai pas encore assez d’informations sur les clubs pour te conseiller.');
    return;
  }

  const raisons = meilleur.raisons.length
    ? 'Je le place en tête parce que ' + meilleur.raisons.join(' et ') + '.'
    : 'Les informations disponibles en font une bonne piste pour commencer.';
  ajouterMessageAssistant('Merci, je croise tes envies, la ville et les jours de réunion. ' + raisons);
  carteRecommandationAssistant(meilleur.club);
  ajouterMessageAssistant('C’est une suggestion, pas un choix définitif : regarde la fiche et vois si l’ambiance et le rythme te parlent.');
  ajouterOptionsAssistant([
    { texte: 'Voir d’autres suggestions', action: afficherAutresSuggestionsAssistant },
    { texte: 'Affiner mes critères', action: recommencerAssistant },
    { texte: 'Voir tous les clubs', action: afficherTousLesClubsAssistant }
  ]);
}

function recommencerAssistant() {
  preferencesAssistant = { interest: null, city: null, schedule: null };
  ajouterMessageAssistant('Bien sûr, on reprend tranquillement. Qu’est-ce qui t’attire le plus ?');
  optionsInteretsAssistant();
}

function poursuivreTexteAssistant() {
  if (!preferencesAssistant.interest) {
    ajouterMessageAssistant('Pour mieux te guider, qu’est-ce qui t’attire le plus ?');
    optionsInteretsAssistant();
  } else if (!preferencesAssistant.city) {
    ajouterMessageAssistant('Et quelle ville te conviendrait ?');
    optionsVilleAssistant();
  } else if (!preferencesAssistant.schedule) {
    ajouterMessageAssistant('Dernier point pratique : plutôt en semaine ou le week-end ?');
    optionsDisponibiliteAssistant();
  } else {
    afficherRecommandationsAssistant();
  }
}

function choisirDisponibiliteDepuisTexteAssistant(disponibilite, libelle) {
  preferencesAssistant.schedule = disponibilite;
  ajouterMessageAssistant('Je note : ' + libelle + '.');
}

function traiterMessageAssistant(texte) {
  const message = normaliser(texte);
  let compris = false;
  if (/digital|communication|informatique|numerique|reseaux sociaux|com\b/.test(message)) {
    preferencesAssistant.interest = 'digital';
    compris = true;
  } else if (/environnement|ecologie|ecologique|durable|nature|cifred/.test(message)) {
    preferencesAssistant.interest = 'environment';
    compris = true;
  } else if (/leadership|service|amitie|benevolat|servir/.test(message)) {
    preferencesAssistant.interest = 'service';
    compris = true;
  } else if (/rencontrer|rencontres|convivial|amis|amities|social/.test(message)) {
    preferencesAssistant.interest = 'community';
    compris = true;
  }

  if (/abomey|calavi/.test(message)) {
    preferencesAssistant.city = 'Abomey-Calavi';
    compris = true;
  } else if (/cotonou/.test(message)) {
    preferencesAssistant.city = 'Cotonou';
    compris = true;
  } else if (/peu importe la ville|toutes les villes|n'importe quelle ville/.test(message)) {
    preferencesAssistant.city = 'any';
    compris = true;
  }

  if (/week.?end|samedi|dimanche/.test(message)) {
    choisirDisponibiliteDepuisTexteAssistant('weekend', 'le week-end');
    compris = true;
  } else if (/semaine|lundi|mardi|mercredi|jeudi|vendredi/.test(message)) {
    choisirDisponibiliteDepuisTexteAssistant('weekday', 'en semaine');
    compris = true;
  } else if (/les deux|peu importe le jour|n'importe quel jour/.test(message)) {
    choisirDisponibiliteDepuisTexteAssistant('any', 'tous les jours me conviennent');
    compris = true;
  }

  if (!compris) {
    reflechirAssistant(() => {
      ajouterMessageAssistant('Je veux bien t’aider 😊 Tu peux me parler de ce qui t’intéresse, de ta ville ou des jours où tu es libre.');
      poursuivreTexteAssistant();
    });
    return;
  }

  reflechirAssistant(() => {
    ajouterMessageAssistant('Merci de me donner ces repères, ça m’aide à éviter une suggestion au hasard.');
    poursuivreTexteAssistant();
  });
}

function afficherTousLesClubsAssistant() {
  ajouterMessageAssistant('Avec plaisir ! Voici tous les clubs présents sur le site. Les horaires non renseignés sont à confirmer.');
  CLUBS.forEach(carteRecommandationAssistant);
  ajouterOptionsAssistant([
    { texte: 'M’aider à choisir', action: recommencerAssistant }
  ]);
}

function ouvrirAssistant(ouvert) {
  assistantPanel.hidden = !ouvert;
  assistantLauncher.setAttribute('aria-expanded', String(ouvert));
  if (ouvert) {
    if (!assistantStarted) {
      assistantStarted = true;
      ajouterMessageAssistant('Salut, bienvenue ! 😊 On va chercher ensemble un club qui te ressemble. Qu’est-ce qui t’attire le plus ?');
      optionsInteretsAssistant();
    }
    assistantInput.focus();
  } else {
    assistantLauncher.focus();
  }
}

assistantLauncher.addEventListener('click', () => ouvrirAssistant(assistantPanel.hidden));
document.getElementById('assistant-close').addEventListener('click', () => ouvrirAssistant(false));
assistantForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const texte = assistantInput.value.trim();
  if (!texte) return;
  assistantInput.value = '';
  ajouterMessageAssistant(texte, true);
  traiterMessageAssistant(texte);
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !assistantPanel.hidden) ouvrirAssistant(false);
});

if (window.lottie && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const animationAssistant = window.lottie.loadAnimation({
    container: document.getElementById('assistant-animation'), renderer: 'svg',
    loop: true, autoplay: true, path: 'assistant-clubs.json'
  });
  animationAssistant.addEventListener('DOMLoaded', () => assistantLauncher.classList.add('is-ready'));
  animationAssistant.addEventListener('data_failed', () => assistantLauncher.classList.remove('is-ready'));
}

function afficherContenu() { racine.classList.add('ready'); }

function lancerLoader() {
  // Tous les fanions forment l'étoile ; taille et rayon s'adaptent au nombre de clubs
  const n = CLUBS.length;
  const w = n > 5 ? 56 : 64;
  const r = Math.max(64, Math.ceil(w * 1.1 / (2 * Math.sin(Math.PI / n))));
  orbite.style.setProperty('--angle', (360 / n) + 'deg');
  orbite.style.setProperty('--w', w + 'px');
  orbite.style.setProperty('--h', Math.round(w * 1.35) + 'px');
  orbite.style.setProperty('--r', r + 'px');
  CLUBS.forEach((club, i) => {
    const img = document.createElement('img');
    img.className = 'loader__fanion';
    img.src = club.image;
    img.alt = '';
    img.style.setProperty('--i', i);
    gererImageAbsente(img);
    orbite.appendChild(img);
  });
  document.body.style.overflow = 'hidden';
  setTimeout(() => {                       // après 2 s : éclatement
    loader.classList.add('is-burst');
    setTimeout(() => {                     // puis on retire le loader du DOM
      loader.remove();
      document.body.style.overflow = '';
      afficherContenu();
    }, 200);
  }, 2000);
}

afficher();
afficherReunionsProches();

// Pas de loader si animations réduites ou si on revient depuis une page club
const sansLoader = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  || location.search.includes('retour');
if (location.search.includes('retour')) history.replaceState(null, '', location.pathname + location.hash); // un rechargement rejoue le loader
if (sansLoader) { loader.remove(); afficherContenu(); } else { lancerLoader(); }
