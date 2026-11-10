/* Page d'un club : club.html?club=<slug> */
const $ = (id) => document.getElementById(id);
const slug = new URLSearchParams(location.search).get('club');
const club = CLUBS.find(c => c.slug === slug);

/* Affiche une valeur, ou « À venir » si elle n'est pas encore renseignée */
function valeur(id, texte, lien) {
  const el = $(id);
  if (!texte) { el.textContent = 'À venir'; el.classList.add('infos__vide'); return; }
  if (lien) {
    const a = document.createElement('a');
    a.href = lien;
    a.textContent = texte;
    if (lien.startsWith('http')) { a.target = '_blank'; a.rel = 'noopener'; }
    el.replaceChildren(a);
  } else {
    el.textContent = texte;
  }
}

if (!club) {
  $('fiche').hidden = true;
  $('infos').hidden = true;
  $('rejoindre').hidden = true;
  $('introuvable').hidden = false;
} else {
  document.title = club.nom + ' · Rotaract';
  const img = $('fiche-image');
  img.src = club.image;
  img.alt = 'Fanion du ' + club.nom;
  gererImageAbsente(img);
  $('fiche-ville').textContent = club.ville;
  $('fiche-nom').textContent = club.nom;
  $('fiche-info').textContent = club.info;
  $('fiche-info').hidden = !club.info;
  $('fiche-desc').textContent = club.description || 'Présentation bientôt disponible.';

  // Président
  const photo = $('pres-photo');
  photo.alt = club.president ? 'Photo de ' + club.president : 'Photo du président';
  photo.src = club.photo || AVATAR;
  photo.addEventListener('error', () => { photo.src = AVATAR; }, { once: true });
  $('pres-nom').textContent = club.president;
  $('pres-nom').hidden = !club.president;

  // Réunions et contacts
  valeur('r-jour', club.jour);
  valeur('r-heure', club.heure);
  valeur('r-lieu', club.lieu);
  const num = (club.whatsapp || '').replace(/\D/g, '');
  valeur('c-whatsapp', club.whatsapp, num && 'https://wa.me/' + num);
  valeur('c-tel', club.telephone, club.telephone && 'tel:' + club.telephone.replace(/[^\d+]/g, ''));
  valeur('c-email', club.email, club.email && 'mailto:' + club.email);
  valeur('c-facebook', club.facebook && 'Page Facebook', club.facebook);

  // Les autres clubs
  const autres = CLUBS.filter(c => c !== club).slice(0, 4);
  $('grille').append(...autres.map((c, i) => creerCarte(c, i, false)));
  $('autres').hidden = false;

  // Demande d'adhésion : WhatsApp en priorité, sinon e-mail
  const form = $('form-rejoindre');
  const statut = $('form-statut');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = new FormData(form);
    const texte = 'Bonjour, je souhaite rejoindre ' + club.nom + '.\n' +
      'Nom : ' + f.get('nom') + '\nTéléphone : ' + f.get('tel') +
      (f.get('email') ? '\nE-mail : ' + f.get('email') : '') +
      (f.get('message') ? '\nMessage : ' + f.get('message') : '');
    if (num) {
      window.open('https://wa.me/' + num + '?text=' + encodeURIComponent(texte), '_blank', 'noopener');
      statut.textContent = 'Ta demande est prête dans WhatsApp : appuie sur Envoyer.';
    } else if (club.email) {
      location.href = 'mailto:' + club.email + '?subject=' +
        encodeURIComponent('Demande d\u2019adhésion · ' + club.nom) + '&body=' + encodeURIComponent(texte);
      statut.textContent = 'Ta demande est prête dans ta messagerie : envoie-la.';
    } else {
      statut.textContent = 'Le contact de ce club n\u2019est pas encore disponible.';
    }
  });
}
