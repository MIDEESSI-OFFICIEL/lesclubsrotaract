/* Page d'un club : club.html?club=<slug> */
const $ = (id) => document.getElementById(id);
const slug = new URLSearchParams(location.search).get('club');
const club = CLUBS.find(c => c.slug === slug);

function ouvrirPartageWhatsApp(statut, message) {
  const url = 'https://wa.me/?text=' + encodeURIComponent(message);
  const lien = document.createElement('a');
  lien.href = url;
  lien.target = '_blank';
  lien.rel = 'noopener noreferrer';
  lien.textContent = 'Ouvrir WhatsApp pour envoyer l’invitation.';

  statut.replaceChildren('Si le partage ne s’ouvre pas, ', lien);
  const fenetre = window.open(url, '_blank');
  if (fenetre) fenetre.opener = null;
}

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
  $('qr-club').hidden = true;
  $('rejoindre').hidden = true;
  $('introuvable').hidden = false;
} else {
  document.title = club.nom + ' · Rotaract';
  const img = $('fiche-image');
  img.src = club.image;
  img.loading = 'eager';
  img.decoding = 'async';
  img.fetchPriority = 'high';
  img.alt = 'Fanion du ' + club.nom;
  gererImageAbsente(img);
  $('fiche-ville').textContent = club.ville;
  $('fiche-nom').textContent = club.nom;
  $('fiche-info').textContent = club.info;
  $('fiche-info').hidden = !club.info;
  $('fiche-desc').textContent = club.description || 'Présentation bientôt disponible.';

  const qrBase = 'qr-codes/' + club.slug + '-qr-';
  const qrTransparent = $('qr-club-transparent');
  qrTransparent.src = qrBase + 'transparent.png';
  qrTransparent.alt = 'QR code du ' + club.nom + ' sur fond transparent';
  $('qr-club-telecharger-transparent').href = qrTransparent.src;
  $('qr-club-telecharger-transparent').download = club.slug + '-qr-transparent.png';
  const qrFond = $('qr-club-fond');
  qrFond.src = qrBase + 'fond-doux.png';
  qrFond.alt = 'QR code du ' + club.nom + ' avec fond doux';
  $('qr-club-telecharger-fond').href = qrFond.src;
  $('qr-club-telecharger-fond').download = club.slug + '-qr-fond-doux.png';

  // Président
  const photo = $('pres-photo');
  photo.alt = club.president ? 'Photo de ' + club.president : 'Photo du président';
  photo.src = club.photo || AVATAR;
  photo.loading = 'lazy';
  photo.decoding = 'async';
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

  const invitationStatut = $('invitation-statut');
  $('inviter-club').addEventListener('click', async () => {
    const url = new URL('club.html?club=' + encodeURIComponent(club.slug), location.href).href;
    const rencontre = [club.jour, club.heure, club.lieu].filter(Boolean).join(' · ');
    const invitation = [
      'Tu es invité(e) à découvrir et rejoindre ' + club.nom + ' !',
      'Ville : ' + club.ville,
      rencontre ? 'Rencontre : ' + rencontre : 'Les horaires de réunion sont à confirmer.',
      'Découvre le club et ses contacts : ' + url
    ].join('\n');

    if (!navigator.share) {
      ouvrirPartageWhatsApp(invitationStatut, invitation);
      return;
    }

    try {
      await navigator.share({ title: 'Rejoins ' + club.nom, text: invitation, url });
      invitationStatut.textContent = 'Invitation partagée.';
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      console.error('Impossible de partager l’invitation du club.', error);
      ouvrirPartageWhatsApp(invitationStatut, invitation);
    }
  });

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
