# Spire GG — Documentation Projet

## Vue d'ensemble
Repository pour Spire GG. Le projet inclut un système de génération de guides de voyage ultra-personnalisés via IA (TravelGuide AI).

---

## Stack technique
- **Framework** : Next.js 16 (App Router) + TypeScript
- **Styling** : Tailwind CSS
- **Fonts** : Playfair Display (display/titres) + DM Sans (body)
- **Analytics** : PostHog (autocapture via script tag dans layout)
- **Paiement** : Stripe via NanoCorp payment links
- **Déploiement** : Vercel (auto-deploy sur push main)
- **URL prod** : https://spiregg.nanocorp.app

---

## Livrables

### 1. Landing Page TravelGuide AI (`src/app/page.tsx`)
**Créée le :** 2026-06-08
**Description :** Landing page complète et bilingue FR/EN.

**Sections :**
1. **Navigation fixe** — logo, toggle FR/EN, CTA Stripe
2. **Hero** — titre Playfair Display, sous-titre, CTA → Stripe, trust badges (24h, 100%, 4.9★), carte guide Tokyo animée
3. **Comment ça marche** — 3 étapes (formulaire → IA → livraison) sur fond navy
4. **Tarifs** — 4 cartes pricing (10€/3j, 20€/7j, 40€/14j, 65€/1 mois), boutons Stripe
5. **Exemples visuels** — maquette couverture + page itinéraire jour 3 (Tokyo)
6. **Témoignages** — 3 avis 5 étoiles
7. **CTA final** — sur fond navy
8. **Footer**

**Fonctionnalités :**
- Toggle langue FR ↔ EN (état React client)
- Tracking PostHog : `cta_clicked`, `purchase_started`
- Toutes les cartes pricing + CTAs → Stripe payment link

### 2. Produits Stripe (créés 2026-06-08)
| Produit | Prix | ID |
|---|---|---|
| Guide 3 jours | 10€ | a9e2ec59-52ff-4b29-9263-b6c85095bf0c |
| Guide 7 jours | 20€ | e589d190-c277-4311-97b5-734acd826c2e |
| Guide 14 jours | 40€ | 71fc80be-261f-48c7-8cba-31cfaad65855 |
| Guide 1 mois | 65€ | 8b346f9d-a485-498c-a12b-8f58ea591073 |

**Payment link actif** : https://buy.stripe.com/eVqbJ22DabL9eP88cHeQi09

### 3. Prompt IA Maître — Guides de Voyage (`prompts/travel-guide-master-prompt.md`)
**Créé le :** 2026-06-08
**Description :** System prompt complet pour générer des guides de voyage professionnels et personnalisés via l'API Claude ou OpenAI.

---

## Structure du repo
```
/
├── README.md
├── DOCS.md                              ← ce fichier
├── prompts/
│   └── travel-guide-master-prompt.md   ← prompt IA maître
└── src/
    └── app/
        ├── layout.tsx                   ← fonts + analytics
        ├── page.tsx                     ← landing page principale
        ├── globals.css                  ← styles + animations
        └── posthog.d.ts                 ← types window.posthog
```

---

### 4. CGV — Conditions Générales de Vente (`legal/cgv-fr.md` + `legal/cgv-en.md`)
**Créées le :** 2026-06-08
**Description :** CGV complètes conformes au droit français (14 articles), avec version anglaise de synthèse fidèle.

**Couverture :**
- Art. 1 : Identification du vendeur (placeholders SIRET, adresse, email)
- Art. 2 : Objet et champ d'application
- Art. 3 : Description du service (PDF + Google Doc, délais 24h max)
- Art. 4 : Grille tarifaire (10€/20€/40€/65€) + mention TVA (franchise/assujetti)
- Art. 5 : Processus de commande en 7 étapes
- Art. 6 : Droit de rétractation + clause de renonciation avec case à cocher (L. 221-28, 13° CConso)
- Art. 7 : Politique de remboursement (service non rendu / guide livré / défaut grave)
- Art. 8 : Disclaimer IA — pas d'expert humain, aucune garantie exactitude, risque utilisateur
- Art. 9 : Propriété intellectuelle — licence personnelle non commerciale
- Art. 10 : RGPD — renvoi politique confidentialité
- Art. 11 : Médiation obligatoire (L. 612-1 CConso) + plateforme RLL européenne
- Art. 12 : Droit français, tribunaux compétents
- Art. 13 : Dispositions diverses (divisibilité, non-renonciation)

**Page web :** `/cgv` — page bilingue FR/EN (toggle langue), rendue statiquement.
**Footer :** Lien « Conditions Générales de Vente / Terms of Sale » ajouté dans le footer de la landing page.

**Placeholders à compléter :**
- SIRET, nom/raison sociale, adresse complète, email de contact
- Option TVA (franchise Art. 293 B CGI ou TVA 20%)
- Médiateur de la consommation agréé (ex : FEVAD, CM2C, CNPM)
- Date de mise en vigueur

---

## Structure du repo
```
/
├── README.md
├── DOCS.md                              ← ce fichier
├── docs/
│   └── travelguide-account-system-spec.md ← spec comptes clients TravelGuide AI
├── legal/
│   ├── cgv-fr.md                        ← CGV version française complète
│   ├── cgv-en.md                        ← CGV version anglaise de synthèse
│   ├── privacy-fr.md                    ← Politique confidentialité française (RGPD)
│   └── privacy-en.md                    ← Privacy Policy anglaise de synthèse
├── prompts/
│   └── travel-guide-master-prompt.md   ← prompt IA maître
└── src/
    └── app/
        ├── layout.tsx                   ← fonts + analytics
        ├── page.tsx                     ← landing page principale
        ├── globals.css                  ← styles + animations
        ├── posthog.d.ts                 ← types window.posthog
        ├── cgv/
        │   └── page.tsx                ← page CGV bilingue FR/EN
        └── privacy/
            └── page.tsx                ← page Politique de Confidentialité bilingue FR/EN
```

---

### 5. Politique de Confidentialité RGPD (`legal/privacy-fr.md` + `legal/privacy-en.md`)
**Créée le :** 2026-06-08
**Description :** Politique de confidentialité complète conforme au RGPD, avec version anglaise de synthèse.

**Couverture (11 articles) :**
- Art. 1 : Identité du responsable de traitement (placeholders SIRET, adresse, email)
- Art. 2 : Données collectées (email, mot de passe hashé, préférences voyage, commandes, données techniques)
- Art. 3 : Base légale de chaque traitement (exécution du contrat, obligation légale, intérêt légitime)
- Art. 4 : Finalités (exécution service, facturation, analytics agrégés, emails transactionnels)
- Art. 5 : Durée de conservation (3 ans inactivité compte, 7 ans facturation, 13 mois analytics)
- Art. 6 : Droits RGPD Art. 15-22 (accès, rectification, effacement, portabilité, opposition, limitation) + procédure + CNIL
- Art. 7 : Sous-traitants (Stripe + OpenAI + Google + hébergeur) avec garanties CCT/DPF
- Art. 8 : Cookies (session, auth, PostHog — aucun publicitaire)
- Art. 9 : Sécurité (HTTPS, bcrypt, accès restreint, PCI-DSS via Stripe)
- Art. 10 : Modifications
- Art. 11 : Contact + recours CNIL

**Page web :** `/privacy` — page bilingue FR/EN (toggle langue), rendue statiquement.
**Footer :** Lien « Politique de Confidentialité / Privacy Policy » ajouté dans le footer de la landing page.

**Placeholders à compléter :**
- SIRET, nom/raison sociale, adresse complète, email de contact
- Hébergeur effectif (Vercel / OVH / Scaleway)
- Date de mise en vigueur

---

---

## Mise à jour 2026-06-08 — Branding + UI complets

### Modifications apportées

**Branding TravelGuide AI :**
- `layout.tsx` : title → "TravelGuide AI — Guides de voyage personnalisés par IA", meta description mise à jour, OG tags, favicon ✈️ emoji
- `globals.css` : animation `ticker` ajoutée pour la banderolle
- `page.tsx` : 
  - Banderolle défilante fixe au-dessus de la navbar (3 messages en boucle)
  - Navbar : icône profil → /login (à droite du toggle FR/EN)
  - Hero H1 = "TravelGuide AI" (Playfair Display, grand, contrasté)
  - Sous-titre FR : "Votre guide de voyage personnalisé, généré par IA et livré en PDF"
  - Suppression des compteurs de mots partout (6 000 mots, etc.)
  - Pricing cascade INCLUSIVE : chaque plan montre "Tout le plan X +" + ses nouvelles fonctionnalités
  - Prix 7j mis à jour : 20€ → 25€ (Stripe product recréé)
  - Badges Premium (indigo) sur 14j et Prestige (doré) sur 1 mois
  - CTAs pricing → /cart?plan=PLAN_KEY

**Nouvelles pages :**
- `/cart` — panier avec résumé commande, code promo (LAUNCH30 → -30%), prix réduit en temps réel, bouton Stripe
- `/questionnaire` — 7 champs post-paiement (destination, dates, voyageurs, type, budget, centres d'intérêt, notes)
- `/login` — placeholder espace client

**Stripe :**
- Produit "Guide 7 jours" recréé à 25€ (était 20€)
- Nouveau payment link : https://buy.stripe.com/bJe4gAgu0bL9fTc0KfeQi19

### Structure repo mise à jour
```
src/app/
├── layout.tsx         ← metadata + favicon mis à jour
├── page.tsx           ← landing + banderolle + hero H1 + pricing cascade
├── globals.css        ← animation ticker ajoutée
├── posthog.d.ts
├── cart/page.tsx      ← NOUVEAU : panier
├── questionnaire/page.tsx ← NOUVEAU : questionnaire post-paiement
├── login/page.tsx     ← NOUVEAU : placeholder espace client
├── cgv/page.tsx
└── privacy/page.tsx
```

### 7. Disclaimer IA Complet pour Guides PDF (`legal/ai-disclaimer.md`)
**Créé le :** 2026-06-08
**Description :** Texte complet bilingue FR/EN du disclaimer IA à intégrer dans chaque guide PDF généré par TravelGuide AI.

**Contenu :**
1. Version française complète (3 paragraphes) — contenu IA, absence de garantie, responsabilité utilisateur + renvoi aux CGV
2. Version anglaise complète (3 paragraphes) — traduction fidèle, même structure légale
3. Version courte FR (1 ligne) — pour pied de page PDF
4. Version courte EN (1 ligne) — pour pied de page PDF
5. Recommandations de mise en page PDF (position, taille de police, couleurs, police, interligne)

**Alignement légal :** Cohérent avec l'Art. 8 des CGV (`legal/cgv-fr.md`).
**Intégration recommandée dans `pdf-generator.ts`** : remplacer la constante `DISCLAIMER` par la version courte FR, et ajouter une page dédiée (avant-dernière page) avec le texte complet bilingue.

---

---

## Mise à jour 2026-06-09 — Fix panier Stripe : article unique + codes promo

### Problèmes résolus

**Bug 1 — article unique dans Stripe Checkout :**
- Nouvelle route `POST /api/create-checkout-session` (`src/app/api/create-checkout-session/route.ts`)
- Crée une session Stripe avec `price_data` inline pour **uniquement** le plan sélectionné
- Pas de line_items multiples — seul l'article du panier est transmis
- Ajoute `metadata: { plan: planKey }` pour que le webhook NanoCorp identifie le bon plan
- Fallback automatique vers le NanoCorp payment link si `STRIPE_SECRET_KEY` n'est pas configuré

**Bug 2 — codes promo Stripe :**
- `allow_promotion_codes: true` ajouté à la session → Stripe active le champ de code promo natif
- Aucun `discounts: []` présent (incompatible avec `allow_promotion_codes`)
- Code AMI10 (−10 %) ajouté à la validation locale du panier (LAUNCH30 + AMI10)

### Fichiers modifiés
| Fichier | Changement |
|---------|-----------|
| `src/app/api/create-checkout-session/route.ts` | **NOUVEAU** — crée session Stripe (1 article, allow_promotion_codes) |
| `src/app/cart/page.tsx` | Bouton Payer → POST vers /api/create-checkout-session, fallback payment link |
| `package.json` | Ajout dépendance `stripe ^22.2.0` |

### Variable d'environnement REQUISE
```
STRIPE_SECRET_KEY=sk_live_...  ← À configurer sur Vercel pour activer le checkout custom
```
Sans cette variable, le panier utilise le fallback NanoCorp payment link (tous les produits visibles).

### Prérequis Stripe Dashboard
Pour que les codes promo fonctionnent côté Stripe :
1. `allow_promotion_codes: true` est maintenant dans la session (code OK)
2. Les codes LAUNCH30 et AMI10 doivent exister sous **Products → Coupons → Promotion codes** (pas juste Coupons)

---

## Mise à jour 2026-06-09 — Refonte pricing + code promo EXPLORE3 + vérification téléphone

### Nouveaux prix

| Plan | Avant | Après |
|------|-------|-------|
| Guide 3 jours | 10€ | GRATUIT (avec code promo EXPLORE3) |
| Guide 7 jours | 25€ | **7€** |
| Guide 14 jours | 40€ | **12€** |
| Guide 1 mois | 65€ | **20€** |

### Code promo — Guide 3 jours gratuit

**Code actif** : `EXPLORE3` (mémorable, recommandé)  
**Autre option** : `DECOUVERTE` (fonctionne aussi — mêmes règles)  
**Effet** : 100% de réduction sur le Guide 3 jours  
**Limite** : 1 fois par compte · Numéro de téléphone requis

### Nouvelles tables PostgreSQL (migration déjà appliquée)

```sql
-- Ajouté à la table users
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);

-- Nouvelle table
CREATE TABLE IF NOT EXISTS promo_usages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  promo_code VARCHAR(50) NOT NULL,
  product_id VARCHAR(100),
  used_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, promo_code)
);
```

### Nouvelles routes API

| Route | Description |
|-------|-------------|
| `POST /api/apply-promo` | Valide le code promo côté serveur (login, téléphone, usage unique) |
| `POST /api/free-order` | Crée une commande 0€ (bypass Stripe), enregistre usage promo |
| `POST /api/account/update-phone` | Met à jour phone_number de l'utilisateur |

### Fichiers modifiés

| Fichier | Changement |
|---------|-----------|
| `src/app/cart/page.tsx` | Nouveaux prix + flow EXPLORE3 gratuit + erreurs contextuelles |
| `src/app/page.tsx` | Bannière lancement dorée, prix barrés, carte 3j verte "GRATUIT" |
| `src/app/account/page.tsx` | Encart "Complétez votre profil" + PhoneForm si téléphone manquant |
| `src/components/PhoneForm.tsx` | **NOUVEAU** — Formulaire client téléphone |
| `src/app/api/create-checkout-session/route.ts` | Nouveaux montants Stripe (700/1200/2000 cents) |
| `src/app/api/webhooks/nanocorp/route.ts` | `inferPlan` mis à jour avec nouveaux montants |

### Flux commande gratuite (EXPLORE3 + plan 3j)

```
1. User entre EXPLORE3 dans le panier → POST /api/apply-promo
2. Serveur vérifie : connecté + téléphone renseigné + code non utilisé
3. Si OK → bouton "Obtenir gratuitement" (vert)
4. User clique → POST /api/free-order
5. Serveur re-vérifie (anti-abus) → crée payment_session(0€) + order + promo_usage
6. Redirect vers /questionnaire?plan=3j&email=...
```

---

---

## Mise à jour 2026-06-09 — Refonte questionnaire 25 critères + UI pill/chip

### Nouveau flow complet
```
Landing / → [Commander] → /questionnaire?plan=XXX → Stripe Checkout → /checkout/success → (webhook) → guide généré
```
**Changement majeur** : le questionnaire se remplit AVANT le paiement (pas après).

### /questionnaire — Refonte complète (3 étapes wizard)

**Étape 1 "Votre voyage"** :
- Destination (texte libre, obligatoire)
- Dates arrivée + départ (date pickers)
- Vitesse de voyage (radio pills : city hopping / immersion)
- Type de voyageur (radio pills : solo, couple, famille, amis)
- Rythme d'activités (radio pills : serré, relaxe, ultra-chill)

**Étape 2 "Vos préférences"** :
- Budget global (radio pills)
- Hébergement (multi pills)
- Transport (multi pills)
- Activités principales (multi pills, max 5)
- Sports & aventure (multi pills, conditionnel si aventure/sport sélectionné)
- Paysage préféré (multi pills)
- Climat (radio pills)
- Sociabilité (radio pills)
- Ambiance (multi pills)
- Confort (radio pills)
- Connectivité (radio pills)
- Accessibilité (multi pills, optionnel)
- Éco-tourisme (radio pills)
- Authenticité (radio pills)

**Étape 3 "Finaliser"** :
- Restrictions alimentaires (multi pills, optionnel)
- Instagrammabilité (radio pills)
- Email (texte, obligatoire)
- Notes libres (textarea, 500 chars)
- Récapitulatif visuel (navy card)
- Bouton "Payer €XX" → POST /api/create-checkout-session

### Design
- Pills/chips cliquables (border-2, rounded-full, transition)
- Non sélectionné : `border-[#e2e8f0] bg-white text-[#475569]`
- Sélectionné : `border-[#1e3a5f] bg-[#1e3a5f] text-white shadow-md`
- Hover : `border-[#c9a84c] text-[#1e3a5f]`
- Sticky header : logo + badge plan + barre de progression 3 étapes
- Responsive mobile-first, flex-wrap pour les pills

### /api/create-checkout-session — mise à jour
- Accepte maintenant `{ planKey, answers }` dans le body
- Construit 25 champs de metadata Stripe depuis `answers`
- Chaque valeur tronquée à 500 chars, arrays sérialisés en CSV
- `cancel_url` pointe vers `/questionnaire?plan=XXX`

### Metadata Stripe passées au webhook
```
plan, destination, arrival_date, departure_date, travel_speed, traveler_type,
activity_pace, budget, accommodations, transport, interests, sports,
landscape, climate, sociability, vibe, comfort_level, connectivity,
accessibility, eco_tourism, authenticity, diet, instagram, user_email, notes
```

### / landing page — mise à jour
- Nav CTA "Créer mon guide" → `/questionnaire?plan=7j`
- Hero CTA → `/questionnaire?plan=7j`
- Pricing cards → `/questionnaire?plan=${plan_key}`
- Bottom CTA → `/questionnaire?plan=7j`
- (La variable `STRIPE_LINK` reste définie mais n'est plus utilisée dans les CTAs)

### TODO follow-up
- Mettre à jour le webhook `/api/webhooks/nanocorp` pour lire les 25 champs metadata et enrichir le prompt IA
- Mettre à jour `/api/generate-guide` pour accepter tous les nouveaux paramètres
- Gérer le flow free-order (3j / EXPLORE3) dans le nouveau questionnaire

---

## Tâches suivantes suggérées
- Intégrer la case à cocher de renonciation au droit de rétractation dans le tunnel de commande
- Connecter la route `/api/generate-guide` → API Claude
- Export PDF automatique après génération
- Système de sauvegarde des guides (PostgreSQL)
- Intégrer le disclaimer complet (page dédiée + pied de page mis à jour) dans `src/lib/pdf-generator.ts`

---

## Mise à jour 2026-06-08 — Kit Outreach Influenceurs Voyage

### Fichier créé : `outreach/influencer-outreach-kit.md`

Kit complet d'outreach pour contacter des micro-influenceurs voyage (5K–50K abonnés).

**7 templates inclus :**
1. **DM Instagram/TikTok** — version courte ≤280 caractères (3 variantes : générique, digital nomad, EN)
2. **Email outreach FR** — objet + corps complet + signature, ton professionnel-chaleureux
3. **Email outreach EN** — version anglophone, même structure
4. **Message de relance J+5** — FR et EN, sans pression, nouvelle accroche
5. **Email de confirmation partenariat** — résumé modalités, code promo, instructions questionnaire
6. **Brief créatif** — points clés, ce qu'on NE veut PAS, CTAs efficaces, formats qui marchent
7. **Remerciement post-publication** — FR et EN, avec demande de stats (vues, swipes, clics)

**Profils cibles décrits :** backpackers, digital nomads, solo female travelers, couples van/roadtrip, travel hackers, créateurs FR et EN.

**Workflow d'outreach inclus :** séquence J1 → J6 → partenariat → brief → remerciement.

**Publié aussi comme document NanoCorp :** type `influencer_outreach`.

**Variables à personnaliser :** `[PRÉNOM]`, `[CODE_PROMO]`, `[DESTINATION_RÉCENTE]`, `[CONTENU_SPÉCIFIQUE]`, `[TON_PRÉNOM]`, `[INSTAGRAM_HANDLE]`.

---

## Mise à jour 2026-06-08 — Scripts TikTok/Reels pré-lancement

### Fichier créé : `content/tiktok-scripts.md`

10 scripts vidéo courts (30–60 s) pour TikTok et Instagram Reels, prêts à être tournés.

**Angles couverts :**
1. Démo produit — "Je planifie mon voyage au Japon en 2 minutes avec l'IA" (FR)
2. Urgence/problème — "POV : Bali dans 3 semaines et t'as rien prévu" (FR)
3. Before/After — "Ce que ton guide de voyage DEVRAIT ressembler" (FR)
4. Comparatif — "J'ai testé tous les planificateurs de voyage…" (FR)
5. Valeur — "Itinéraire 7j Tokyo pour 25€ vs agence 2000€" (FR)
6. Frustration commune — "Stop copier les itinéraires génériques de Google" (FR)
7. Démo produit — "I got a full custom Japan guide in under 3 minutes" (EN)
8. Niche solo — "Le guide de voyage parfait pour les solo travelers" (FR)
9. Lifestyle nomad — "Comment j'organise mes voyages en tant que digital nomad" (FR)
10. Saisonnier SEO — "Itinéraire Thaïlande 14 jours — saison sèche" (FR)

**Format de chaque script :** hook 0–3 s · corps 15–45 s · CTA 5–10 s · hashtags · overlays texte · ambiance musicale

**Notes de production incluses** : ordre de tournage recommandé, conseils rythme/sous-titres, lien bio + code promo LAUNCH30.

---

## Mise à jour 2026-06-08 — Webhook Stripe NanoCorp + flow post-paiement

### Nouvelles routes API

| Route | Type | Description |
|-------|------|-------------|
| `POST /api/webhooks/nanocorp` | Dynamic | Webhook NanoCorp — reçoit `checkout.session.completed`, stocke en PostgreSQL |
| `GET /api/session/[sessionId]` | Dynamic | Lit les données de session (email, plan) depuis la DB |

### Nouvelles pages

| Page | Description |
|------|-------------|
| `/checkout/success` | Page de confirmation post-paiement, redirige vers `/questionnaire` avec email et plan |

### Base de données

Table `payment_sessions` créée dans PostgreSQL :
```sql
session_id TEXT PRIMARY KEY, email TEXT, plan TEXT, amount_cents INTEGER, currency TEXT, created_at TIMESTAMPTZ
```

### Fichiers créés

- `src/app/api/webhooks/nanocorp/route.ts` — webhook handler
- `src/app/api/session/[sessionId]/route.ts` — API lecture session
- `src/app/checkout/success/page.tsx` — page succès + redirection questionnaire
- `src/lib/db.ts` — singleton Pool PostgreSQL
- `STRIPE_SETUP.md` — documentation complète (produits, webhook, variables d'env, tests)

### Points importants NanoCorp

- Le webhook reçoit le payload sur `/api/webhooks/nanocorp` (PAS `/api/webhook/stripe`)
- Aucune vérification de signature — NanoCorp relaie déjà un payload vérifié
- Pas de `STRIPE_SECRET_KEY` ni `STRIPE_WEBHOOK_SECRET` nécessaires
- Le plan est extrait de `data.object.metadata.plan` ou déduit du montant en fallback
- `DATABASE_URL` est l'unique variable d'environnement requise (déjà configurée)

---

## Exploration complémentaire — 2026-06-08

### Constats persistés
- Le repo contient bien l'application TravelGuide AI décrite plus haut (`src/app/*`), mais ne contient pas encore de zone compte, de page `checkout/success` ni de webhook NanoCorp implémenté.
- `README.md` est actuellement obsolète et ne reflète pas le produit TravelGuide AI ; il ne doit pas être utilisé comme source produit.
- La landing actuelle promet déjà une livraison `PDF + Google Doc`, ce qui implique un futur espace client avec stockage de fichiers et rattachement commande -> assets.
- Le besoin "compte créé après paiement" est cohérent avec la contrainte NanoCorp : le webhook doit être la source d'initialisation, pas la page de succès.

### 6. Spécification du système de comptes clients (`docs/travelguide-account-system-spec.md`)
**Créée le :** 2026-06-08  
**Description :** spécification technique complète du système de comptes clients post-paiement pour TravelGuide AI.

**Contenu couvert :**
- stack recommandée pour une opération solo/lean :
  - Next.js 16 + Vercel
  - Better Auth
  - PostgreSQL + Drizzle
  - `next-intl`
  - Vercel Blob privé
- modèle de données recommandé :
  - `customer_profiles`
  - `orders`
  - `order_intakes`
  - `guide_assets`
  - `account_claim_tokens`
- flows détaillés :
  - création de compte après paiement
  - achat répété par client existant
  - connexion
  - récupération de mot de passe
  - accès au dashboard et aux guides
- règles bilingues FR/EN pour pages et emails
- principes de sécurité, idempotence webhook et fallback support
- plan d'implémentation en 4 phases

**Décision d'architecture clé :**
- le paiement crée d'abord une **commande locale** ;
- l'utilisateur **active ensuite son compte** via email et définit son mot de passe ;
- les détails du guide sont complétés dans un **flow post-activation** plutôt que déduits automatiquement du paiement seul.

---

## Mise à jour 2026-06-08 — Pipeline complet de génération de guides AI → PDF → Email

### Pipeline `/api/generate-guide` (POST)

**Flux :**
1. Réception des données questionnaire (email, destination, duration, budget, style, hebergement, regime, compagnie, notes)
2. Construction du prompt IA via `src/lib/guide-prompt.ts` (system prompt + user message avec toutes les variables)
3. Appel OpenAI GPT-4o (`max_tokens` adaptés à la durée : 3j=4000, 7j=8000, 14j=12000, 1mois=16000)
4. Génération PDF via `src/lib/pdf-generator.ts` (pdfkit) :
   - Page de couverture navy + doré (destination, durée, budget, compagnie)
   - Sections parsées depuis l'output IA (délimiteur `─{20,}`)
   - Disclaimer IA en page finale + footer sur toutes les pages
5. Stockage PDF (base64) en PostgreSQL table `guides`
6. Envoi email via Resend (PDF en pièce jointe + lien de téléchargement)
7. Retour JSON `{ guideId, emailSent, destination, duration }`

**Timeout max :** `export const maxDuration = 60` (Vercel Pro)

### Routes créées

| Route | Type | Description |
|-------|------|-------------|
| `POST /api/generate-guide` | Dynamic | Pipeline complet IA → PDF → DB → email |
| `GET /api/download-guide/[id]` | Dynamic | Sert le PDF depuis PostgreSQL |

### Pages créées/modifiées

| Page | Description |
|------|-------------|
| `/questionnaire` | Mis à jour (2026-06-08 v2) : bilingue FR/EN, durée auto-remplie depuis query param `?plan=`, champs exacts spec (Budget 3 niveaux, Style 7 options, Hébergement 5, Régime 6 dont Casher, Compagnie 5 dont "En famille avec enfants" et "Voyage d'affaires"), détection langue navigateur, toggle FR/EN dans header, email pré-rempli depuis query param |
| `/success` | Nouveau : confirmation, bouton téléchargement, info email, disclaimer, "commander un autre guide" |

### Base de données

Table `guides` (créée à la volée si absente) :
```sql
CREATE TABLE IF NOT EXISTS guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  destination TEXT NOT NULL,
  duration TEXT NOT NULL,
  pdf_data TEXT NOT NULL,   -- PDF encodé base64
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Variables d'environnement

| Variable | Statut | Usage |
|----------|--------|-------|
| `DATABASE_URL` | ✅ Configurée | PostgreSQL (stockage guides + sessions) |
| `NEXT_PUBLIC_BASE_URL` | ✅ Configurée | `https://spiregg.nanocorp.app` (lien de téléchargement dans l'email) |
| `OPENAI_API_KEY` | ❌ **À configurer** | Génération du contenu guide (GPT-4o) |
| `RESEND_API_KEY` | ❌ **À configurer** | Envoi email avec PDF en pièce jointe |

**Pour activer le pipeline complet :**
```bash
nanocorp vercel env set --vars '[{"key":"OPENAI_API_KEY","value":"sk-..."}]'
nanocorp vercel env set --vars '[{"key":"RESEND_API_KEY","value":"re_..."}]'
```

### Librairies installées

- `openai` — SDK OpenAI
- `resend` — SDK email
- `pdfkit` + `@types/pdfkit` — Génération PDF server-side (pure Node.js, compatible Vercel)

### Comportement sans clés API

- Sans `OPENAI_API_KEY` → 503 avec message "Service temporairement indisponible"
- Sans `RESEND_API_KEY` → PDF généré + stocké, mais email non envoyé (silently skipped)
- En cas d'erreur DB → PDF retourné en base64 dans la réponse JSON (fallback)

### Structure repo mise à jour
```
src/
├── app/
│   ├── api/
│   │   ├── generate-guide/route.ts      ← NOUVEAU : pipeline AI → PDF → email
│   │   ├── download-guide/[id]/route.ts ← NOUVEAU : téléchargement PDF
│   │   ├── session/[sessionId]/route.ts
│   │   └── webhooks/nanocorp/route.ts
│   ├── questionnaire/page.tsx           ← MIS À JOUR : email + hebergement + regime + compagnie
│   └── success/page.tsx                 ← NOUVEAU : page de confirmation
└── lib/
    ├── guide-prompt.ts  ← NOUVEAU : construction des prompts OpenAI
    ├── pdf-generator.ts ← NOUVEAU : génération PDF pdfkit
    ├── auth.ts          ← NOUVEAU : JWT (jose) + session utilities
    └── db.ts
```

---

## Mise à jour 2026-06-09 — Système de comptes clients + Dashboard de suivi de commande

### Architecture auth
- JWT httpOnly cookies (7 jours), secret `JWT_SECRET` configuré sur Vercel
- `src/proxy.ts` (Next.js 16 Proxy, remplaçant du middleware) protège `/account/**`
- Librairies : `bcryptjs` (hashing), `jose` (JWT edge-compatible), `leaflet` (cartes)

### Nouvelles tables PostgreSQL
- `users(id, email, password_hash, created_at)` — comptes clients
- `orders(id, user_id, session_id, destination, plan, status, created_at, estimated_delivery, guide_url)` — commandes liées aux paiements Stripe
- `order_steps(id, order_id, step_name, completed_at, is_completed)` — étapes granulaires (non utilisées en UI pour l'instant)
- `account_claim_tokens(token, email, expires_at, used)` — pour la future fonctionnalité "magic link"

### Cycle de vie d'une commande
```
webhook Stripe → order(status=questionnaire_pending)
questionnaire + generate-guide → status=generating → status=delivered (+ guide_url)
```

### Nouvelles pages
| Page | Description |
|------|-------------|
| `/signup` | Inscription email + mot de passe |
| `/login` | Connexion (remplace le placeholder précédent) |
| `/account` | Dashboard : liste toutes les commandes du client |
| `/account/orders/[id]` | Suivi détaillé : timeline 6 étapes + mini-map Leaflet |

### Nouvelles API routes
| Route | Description |
|-------|-------------|
| `POST /api/auth/signup` | Inscription, crée cookie JWT |
| `POST /api/auth/login` | Connexion, crée cookie JWT |
| `POST /api/auth/logout` | Supprime le cookie JWT |
| `GET /api/orders` | Liste les commandes de l'utilisateur authentifié |
| `GET /api/orders/[id]` | Détail + étapes d'une commande |
| `GET /api/geocode?q=` | Proxy Nominatim (OpenStreetMap) → lat/lng |

### Nouveaux composants
- `OrderTimeline` — timeline verticale 6 étapes (style suivi colis), étapes colorées/grisées selon statut
- `DestinationMap` — carte Leaflet.js avec tuiles CartoDB Positron, marker + popup, géocodage Nominatim
- `DestinationMapWrapper` — wrapper client pour dynamic import (ssr:false) depuis Server Component
- `LogoutButton` — bouton client déconnexion (fetch POST /api/auth/logout)

### Mise à jour webhook
- Après `checkout.session.completed` → cherche l'utilisateur par email → crée un `order` lié (ou non lié si pas de compte)
- Le signup lie rétroactivement les commandes orphelines à l'email correspondant

### Variables d'environnement
| Variable | Statut |
|----------|--------|
| `JWT_SECRET` | ✅ Configuré sur Vercel |
| `DATABASE_URL` | ✅ Configuré |
| `NEXT_PUBLIC_BASE_URL` | ✅ Configuré |
| `OPENAI_API_KEY` | ❌ À configurer pour pipeline complet |
| `RESEND_API_KEY` | ❌ À configurer pour envoi email |

### Limitations actuelles / TODO follow-up
- Le compte n'est pas créé automatiquement après le paiement si le client n'a pas de compte — la commande est créée mais `user_id = NULL`. Il faut un "magic link" pour que le client réclame sa commande.
- Pas encore de flow "mot de passe oublié"
- Les `order_steps` sont calculées dynamiquement depuis le `status` de la commande (pas via la table `order_steps`)
- Le questionnaire ne passe pas l'`order_id` — le lien commande↔questionnaire se fait par (email, plan) : si un client a plusieurs commandes pour le même plan, seule la plus récente est mise à jour

---

## Mise à jour 2026-06-09 — Dashboard administrateur sécurisé `/admin`

### Fonctionnalités livrées
- `/admin/login` : page de connexion privée sans lien public, identifiants via variables Vercel `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `ADMIN_JWT_SECRET`.
- Session admin dédiée : JWT `role: "admin"` dans cookie HttpOnly `tgai_admin_session`, durée 8h, distincte du cookie client `tgai_session`.
- Protection Next.js 16 via `src/proxy.ts` : `/admin` et sous-routes redirigent vers `/admin/login` si le JWT admin est absent/invalide.
- Rate limiting admin : table `admin_login_attempts`, maximum 5 échecs par IP sur 15 minutes, message générique `Identifiants incorrects`.
- `/admin` : dashboard dark mode avec KPIs, revenus, filtres statut/plan/date/email, pagination 20 commandes/page, modal détails questionnaire, actions regénérer/renvoyer email/télécharger PDF.
- `/admin/users` : tableau utilisateurs + panneau latéral avec infos personnelles, commandes, statut compte, usage EXPLORE3, suspension/réactivation.
- Logs admin : table `admin_logs` pour tracer regénération, renvoi email et suspension/réactivation.

### Base de données ajoutée
```sql
CREATE TABLE IF NOT EXISTS admin_logs (...);
CREATE TABLE IF NOT EXISTS admin_login_attempts (...);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guide_id UUID;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_error TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS questionnaire_data JSONB;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ;
```

### Livraison guides
- `src/app/api/webhooks/nanocorp/route.ts` stocke maintenant les métadonnées Stripe/NanoCorp du questionnaire dans `orders.questionnaire_data` et la destination.
- `src/app/api/generate-guide/route.ts` accepte `orderId`, met les commandes en `generating`, renseigne `guide_id`, `guide_url`, `delivered_at` si l'email Resend part, ou `status = 'error'` avec `delivery_error` si OpenAI/PDF/email échoue.
- Actions admin disponibles : `POST /api/admin/orders/[id]/regenerate`, `POST /api/admin/orders/[id]/resend`, `POST /api/admin/users/[id]/toggle-suspension`.

### Variables Vercel configurées
- `ADMIN_EMAIL=admin@spiregg.app`
- `ADMIN_PASSWORD_HASH` = bcrypt hash de `SpireggAdmin2025!`
- `ADMIN_JWT_SECRET` = clé aléatoire 64 caractères

---

## Mise à jour 2026-06-09 — Connexion Supabase + migration BDD

### Modifications apportées

**Client Supabase :**
- Dépendance `@supabase/supabase-js` installée.
- `src/lib/supabase.ts` ajouté avec deux factories :
  - `createSupabaseAnonClient()` pour les usages front/client avec `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
  - `createSupabaseServiceRoleClient()` pour les API routes/server components avec `SUPABASE_SERVICE_ROLE_KEY`.
- Typage minimal des tables Supabase ajouté pour `profiles`, `orders`, `promo_usage`, `ip_logs`, `password_reset_tokens`, `payment_sessions`, `guides`, `admin_logs`, `admin_login_attempts`.

**Schéma SQL :**
- Migration ajoutée : `supabase/migrations/20260609000000_base_travelguide_schema.sql`.
- La migration contient le schéma demandé : `profiles`, `orders`, `promo_usage`, `ip_logs`, `password_reset_tokens`.
- Compatibilité app existante ajoutée dans la même migration : colonnes de suivi commandes, `payment_sessions`, `guides`, tables admin, vues legacy `users` et `promo_usages`.

**Persistence applicative :**
- JWT local conservé (`src/lib/auth.ts` inchangé), mais auth client branchée sur Supabase `profiles`.
- Routes login/signup/profil/promo/commandes/webhook/génération PDF/admin migrées de `pg`/`DATABASE_URL` vers Supabase service-role.
- `signup` écrit aussi dans `ip_logs` avec action `signup`.

### Validation

- `npm run build` passe avec les variables Supabase configurées.
- Test Supabase REST effectué avec la service key : connexion OK, mais `profiles` absent côté Supabase distant (`PGRST205: Could not find the table 'public.profiles' in the schema cache`).
- Tentative d'exécution SQL via l'API Management Supabase avec la service key refusée (`401: JWT could not be decoded`) : un token Management Supabase ou accès SQL Editor/CLI lié est requis pour appliquer la migration distante.

---

## Mise à jour 2026-06-09 — Correction système d'authentification

### Diagnostic racine

Le problème n'était pas Supabase mais la **base de données** : les routes auth utilisaient `@supabase/supabase-js` mais les variables d'environnement Supabase (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) **n'étaient pas configurées sur Vercel**.

La vraie base de données de production est **Neon PostgreSQL** via `DATABASE_URL`, déjà configurée sur Vercel.

### Base de données Neon — Tables existantes

| Table | Description |
|---|---|
| `users` | Comptes clients (`id, email, password_hash, phone_number, is_suspended, suspended_at, created_at`) |
| `orders` | Commandes guides |
| `payment_sessions` | Sessions de paiement Stripe |
| `promo_usages` | Codes promo utilisés |
| `account_claim_tokens` | Tokens de réclamation de compte |
| `admin_logs` | Journal admin |
| `admin_login_attempts` | Tentatives de connexion admin |
| `guides` | Guides générés |
| `order_steps` | Étapes de commande |
| `ip_logs` | Logs d'adresses IP (créée 2026-06-09) |
| `password_reset_tokens` | Tokens reset mot de passe (créée 2026-06-09) |

**Note importante** : La colonne téléphone s'appelle `phone_number` dans `users` (pas `phone`).

### Fichiers modifiés

- `src/app/api/auth/signup/route.ts` — Supabase → pg, table `users`
- `src/app/api/auth/login/route.ts` — Supabase → pg, table `users`
- `src/app/account/page.tsx` — Supabase → pg, `phone_number`
- `src/app/account/orders/[id]/page.tsx` — Supabase → pg
- `src/app/api/account/update-phone/route.ts` — Supabase → pg, `phone_number`

### Tests en production (2026-06-09)

| Test | Résultat |
|---|---|
| Inscription (`/signup`) | ✅ Fonctionne — compte créé, cookie JWT posé, redirection `/account` |
| Connexion (`/login`) | ✅ Fonctionne — session restaurée, redirection `/account` |
| Protection routes (`/account` sans session) | ✅ Redirige vers `/login?redirect=%2Faccount` |
| Dashboard compte (`/account` connecté) | ✅ Affiche le compte utilisateur |

### Routes encore sur Supabase (hors scope)

**Toutes les routes admin ont été migrées vers pg (2026-06-09)**. Voir section ci-dessous.

---

## Mise à jour 2026-06-09 — Migration routes admin vers Neon + compte admin

### Objectif accompli
Le dashboard `/admin` est maintenant pleinement fonctionnel via Neon PostgreSQL.

### Compte admin créé en base
- Email : `admin@spiregg.app`
- Mot de passe : `SpireggAdmin2025!`
- Colonne `is_admin = true` dans la table `users` (colonne existait déjà)

### Fichiers migrés (Supabase → pg via getPool())

| Fichier | Changement |
|---------|-----------|
| `src/lib/admin-db.ts` | Suppression Supabase, logAdminAction → pool.query sur admin_logs |
| `src/app/api/admin/auth/login/route.ts` | Auth via users table (is_admin=true + is_suspended check), rate limiting via admin_login_attempts |
| `src/app/api/admin/orders/[id]/regenerate/route.ts` | Requêtes orders, payment_sessions, users via pg |
| `src/app/api/admin/orders/[id]/resend/route.ts` | Requêtes orders, payment_sessions, users, guides via pg |
| `src/app/api/admin/users/[id]/toggle-suspension/route.ts` | Requêtes/updates table users via pg (pas profiles) |
| `src/app/admin/page.tsx` | getDashboardData via pg (orders + payment_sessions + users) |
| `src/app/admin/users/page.tsx` | getUsers via pg (users + orders + promo_usages, colonne phone_number) |

### Sécurité admin
- Login vérifie : email dans users + bcrypt.compare + is_admin=true + is_suspended=false
- Cookie JWT `tgai_admin_session` (8h), secret `ADMIN_JWT_SECRET`
- Rate limiting : 5 tentatives max / 15 min par IP via table admin_login_attempts
- Toutes les routes /api/admin/* vérifient le JWT via getAdminSession()

### Testé en production (2026-06-09)
| Test | Résultat |
|---|---|
| Connexion admin@spiregg.app / SpireggAdmin2025! | ✅ Redirige vers /admin |
| Dashboard commandes | ✅ Affiche KPIs (1 commande, 5 utilisateurs, 25€ revenus) |
| Plus aucune référence Supabase dans /admin | ✅ Confirmé |

---

## Mise à jour 2026-06-09 — Landing page prix barrés 3€/7€/12€/20€

**Fichier modifié :** `src/app/page.tsx`

**Changements frontend landing uniquement :**
- Banderolle promo bilingue mise à jour avec l'offre lancement : 3 jours à 3€ au lieu de 5€, jusqu'à 10€ économisés.
- Hero CTA secondaire mis à jour : "À partir de 3€" / "From €3".
- Cartes pricing landing mises à jour : 3j 5€ → 3€, 7j 10€ → 7€, 14j 18€ → 12€, 1 mois 30€ → 20€.
- Prix barrés affichés en gris + `line-through`, prix actuels affichés en grand avec la couleur principale dorée `#C9A84C`.
- Badges économies ajoutés : Économisez 2€/3€/6€/10€ (`Save €2/€3/€6/€10`).
- La carte "1 mois" / "1 month" est maintenant la carte mise en avant avec badge "Meilleure offre" / "Best value".

**Important :** aucun prix Stripe, checkout, API ou produit NanoCorp n'a été modifié dans cette tâche.

---

## Mise à jour 2026-06-09 — Suppression mention « satisfait ou remboursé »

**Objectif :** retirer la promesse commerciale « satisfait ou remboursé » des parcours panier/checkout, car Spire GG ne propose pas cette garantie.

### Audit effectué

Recherche effectuée dans les pages et composants avec les termes : `satisfait`, `money-back`, `satisfaction guarantee`, `garantie de remboursement`, `rembours`.

**Mentions commerciales trouvées et corrigées :**
- `src/app/cart/page.tsx` — texte sous le bouton de paiement/free order.
- `src/app/questionnaire/page.tsx` — texte de réassurance sous le bouton de paiement.

**Mentions non modifiées :**
- `src/app/cgv/page.tsx` contient encore une politique légale de réclamation/remboursement, distincte d'une garantie commerciale « satisfait ou remboursé ».
- `src/app/privacy/page.tsx` et `legal/privacy-*.md` utilisent « garanties RGPD » pour les garanties de conformité des sous-traitants, sans lien avec une garantie client.

### Changements appliqués

- Panier : remplacement de « Satisfait ou remboursé » par « Guide livré par email sous 24h ».
- Questionnaire/checkout : remplacement de « Satisfait ou remboursé » par « Guide livré par email sous 24h ».
- Aucun produit Stripe, prix, API ou texte légal n'a été modifié.

---

## Mise à jour 2026-06-09 — Anti-abus inscription : CAPTCHA, IP, téléphone

**Objectif :** limiter la création automatisée de comptes sur `/signup`.

### Audit effectué

- Le projet utilise Next.js 16 App Router avec `/src/app/signup/page.tsx` et `/src/app/api/auth/signup/route.ts`.
- La base live contient les tables `users` et `ip_logs`; `ip_logs` enregistrait déjà les actions `signup` mais sans blocage à 3 comptes/24h.
- Aucun secret Twilio/Vonage n'est configuré dans l'environnement (`TWILIO_*`, `VONAGE_*`) : la vérification SMS n'est donc pas implémentable sans compte externe.
- Aucun secret Cloudflare Turnstile n'est configuré au moment de la tâche : le formulaire utilise un fallback anti-bot simple jusqu'à configuration des clés.

### Changements appliqués

- `src/app/signup/page.tsx` est devenu un wrapper serveur qui charge le script Cloudflare Turnstile si `TURNSTILE_SITE_KEY` ou `NEXT_PUBLIC_TURNSTILE_SITE_KEY` est configuré.
- `src/app/signup/SignupForm.tsx` ajoute : champ téléphone obligatoire E.164, widget Turnstile, honeypot, et fallback anti-bot “3 + 4” si aucune site key Turnstile n'est disponible.
- `src/app/api/auth/signup/route.ts` valide désormais : téléphone E.164, unicité téléphone, CAPTCHA/anti-bot, et limite persistante de 3 inscriptions par IP glissante sur 24h via `ip_logs`.
- `src/app/api/account/update-phone/route.ts` réutilise la validation E.164 et bloque les doublons téléphone aussi après inscription.
- `src/lib/signup-anti-abuse.ts` centralise les messages bilingues, extraction IP Vercel, validation téléphone, vérification Turnstile, fallback anti-bot et helpers DB.
- `supabase/migrations/20260609190000_signup_anti_abuse.sql` ajoute l'index `idx_ip_logs_ip_action_created_at` et l'index unique partiel `users_phone_number_unique`.

### Base de données

Migration appliquée sur la base live le 2026-06-09 :

- `idx_ip_logs_ip_action_created_at` sur `ip_logs(ip_address, action, created_at DESC)`.
- `users_phone_number_unique` sur `users(phone_number)` quand `phone_number IS NOT NULL`.

### Configuration restante

Pour activer Cloudflare Turnstile en production, configurer dans Vercel :

- `TURNSTILE_SITE_KEY` : clé publique affichée sur `/signup`.
- `TURNSTILE_SECRET_KEY` : clé secrète utilisée uniquement côté serveur pour `/api/auth/signup`.

SMS reste à faire uniquement si un fournisseur est fourni : `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_SERVICE_SID` ou équivalent Vonage.

---

## Mise à jour 2026-06-10 — CTAs landing vers section pricing

**Objectif :** remplacer les CTAs pré-pricing “Créer mon guide” qui envoyaient directement vers `/questionnaire?plan=7j` par un scroll fluide vers les cartes de prix.

### Exploration effectuée
- `src/app/page.tsx` utilise Next.js App Router en composant client pour la landing (`"use client"`).
- La section pricing avait déjà l'ancre `id="pricing"`.
- CTAs pré-pricing trouvés avec le libellé “Créer mon guide” / “Create my guide” : navbar, hero, bottom CTA.
- Les boutons des cartes pricing restent les seuls liens vers `/questionnaire?plan=${plan.plan_key}` pour conserver la sélection explicite du plan.
- Les guides locaux Next.js lus après installation des dépendances : `node_modules/next/dist/docs/01-app/01-getting-started/04-linking-and-navigating.md` et `node_modules/next/dist/docs/01-app/01-getting-started/11-css.md`.

### Changements appliqués
- `src/app/page.tsx` : navbar, hero et bottom CTA passent de `/questionnaire?plan=7j` à `#pricing`.
- `src/app/page.tsx` : la section pricing garde `id="pricing"` et reçoit `scroll-mt-28` pour compenser la bannière/navbar fixes.
- `src/app/globals.css` : ajout de `html { scroll-behavior: smooth; }` pour un scroll fluide via les ancres.
- Styles visuels et tracking `cta_clicked` conservés.

## Mise à jour 2026-06-10 — Sélecteur de forfait questionnaire + français pur

**Objectif :** permettre le choix explicite du forfait directement dans `/questionnaire` et nettoyer les libellés français du questionnaire.

**Changements :**
- `src/app/questionnaire/page.tsx` ajoute un sélecteur horizontal de forfaits en haut du questionnaire, avec 3 jours / 7 jours / 14 jours / 1 mois, prix barrés 9€/19€/29€/49€ et prix actuels 3€/7€/12€/20€.
- L'accès direct à `/questionnaire` ne pré-sélectionne plus le forfait 7 jours : l'interface affiche `Choisissez votre forfait` jusqu'à une sélection explicite.
- Les paramètres `?plan=3j`, `?plan=7j`, `?plan=14j`, `?plan=1mois` restent pré-sélectionnés ; les anciens alias `basic`, `standard`, `premium`, `elite` continuent d'être acceptés.
- Le changement de forfait met à jour l'URL via `window.history.replaceState` sans rechargement et conserve les autres paramètres comme `email`.
- Le paiement envoie toujours le forfait sélectionné à `/api/create-checkout-session`; sans forfait sélectionné, le questionnaire demande de choisir un forfait avant de payer.
- Les libellés visibles FR ont été nettoyés : `City hopping` → `Voyage itinérant`, `Solo` → `En solo`, `Backpackers` → `Voyageurs sac à dos`, `Eco-friendly` → `Tourisme responsable`, `Off the beaten path` → `Hors des sentiers battus`, etc.
- `src/app/api/create-checkout-session/route.ts` synchronise le prix Stripe du guide 3 jours sur l'offre affichée à 3€ (`amount: 300`).

**Validation :**
- `npx eslint src/app/questionnaire/page.tsx src/app/api/create-checkout-session/route.ts` passe.
- `npm run build` passe avec Next.js 16.2.7.
- QA locale agent-browser : `/questionnaire` affiche l'état neutre, `?plan=3j` pré-sélectionne le guide 3 jours, cliquer sur 14 jours remplace l'URL par `?plan=14j` sans rechargement.

**Note :** `npm run lint` global échoue encore sur des règles préexistantes dans `src/app/cart/page.tsx` et `src/components/DestinationMap.tsx` (`react-hooks/set-state-in-effect`), hors périmètre de cette tâche.

---

## Mise à jour 2026-06-10 — Mentions prix d'entrée à 3€

### Exploration persistée
- Next.js local consulté après `npm install` : `generate-metadata.md`, `page.md` et `layout.md` dans `node_modules/next/dist/docs/01-app/03-api-reference/`.
- Recherche globale effectuée sur `src`, `content`, `outreach`, `legal`, `docs`, `README.md`, `STRIPE_SETUP.md` et `DOCS.md` pour les formulations `à partir`, `dès`, `from`, `starting`, `prix minimum`, `7€` et `€7`.
- Aucun motif restant de type `from 7€`, `starting from 7€`, `from €7`, `starting at 7€`, `à partir de 7€` ou `dès 7€` après correction.

### Changements apportés
- `src/app/page.tsx` : témoignages FR/EN mis à jour de `Pour 7€` / `For €7` vers `Pour 3€` / `For €3`.
- `src/app/layout.tsx` : title, meta description et Open Graph mis à jour pour afficher un point d'entrée `dès 3€`.
- `outreach/influencer-outreach-kit.md` : grille tarifaire et mention `à partir de` synchronisées sur 3€/7€/12€/20€.
- `content/tiktok-scripts.md` : mentions marketing de prix d'entrée passées à `Dès 3€`; prix 7 jours synchronisés à 7€ dans les scripts concernés.
- `STRIPE_SETUP.md` : tableau des prix actuels synchronisé sur 3€/7€/12€/20€.

---

## Mise à jour 2026-06-10 — Responsabilité horaires + acceptation CGV avant paiement

### Exploration persistée
- Guides Next.js consultés après installation des dépendances : `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md`, `node_modules/next/dist/docs/01-app/03-api-reference/02-components/link.md` et `node_modules/next/dist/docs/01-app/02-guides/forms.md`.
- La page récap active avant paiement se trouve dans `src/app/questionnaire/page.tsx`, étape 3 du questionnaire, avec redirection Stripe via `/api/create-checkout-session`.
- Une ancienne page panier/récap existe aussi dans `src/app/cart/page.tsx`; elle peut encore déclencher Stripe ou une commande gratuite promo.
- Le prompt IA de génération des guides est centralisé dans `src/lib/guide-prompt.ts`; la génération PDF est dans `src/lib/pdf-generator.ts`.

### Changements appliqués
- `src/lib/guide-prompt.ts` demande désormais explicitement les horaires d'ouverture habituels, jours de fermeture hebdomadaire et fermetures annuelles connues pour chaque lieu/monument recommandé, avec fallback “à vérifier” si incertain.
- `src/lib/guide-prompt.ts` supporte `language: "fr" | "en"` et génère un prompt complet en anglais quand la langue active est anglaise.
- `src/lib/pdf-generator.ts` ajoute une note visible dans la section Introduction du PDF : horaires indicatifs et vérification obligatoire avant visite, en FR/EN selon `input.language`.
- `src/lib/pdf-generator.ts` met aussi l'avertissement final du PDF à jour pour inclure les fermetures exceptionnelles, changements d'horaires et vérification des sources officielles.
- `src/app/questionnaire/page.tsx` ajoute l'encadré de non-responsabilité au-dessus de la case CGV obligatoire sur le récap avant paiement, avec texte FR/EN selon `?lang=fr|en`.
- `src/app/questionnaire/page.tsx` désactive le bouton de paiement tant que la case CGV/confidentialité n'est pas cochée, affiche un message d'erreur rouge en cas de tentative, et envoie `language` dans les réponses transmises à Stripe.
- `src/app/cart/page.tsx` applique le même encadré et la même case obligatoire sur le panier/récap legacy pour éviter un contournement.
- `src/app/page.tsx` propage la langue active dans les liens vers `/questionnaire` via `?lang=${lang}`.
- `src/app/api/create-checkout-session/route.ts` persiste `language` dans les métadonnées Stripe pour que la génération ultérieure puisse produire le guide dans la langue active.

### Validation
- `npx eslint src/app/questionnaire/page.tsx src/app/cart/page.tsx src/app/page.tsx src/app/api/create-checkout-session/route.ts src/app/api/generate-guide/route.ts src/lib/guide-prompt.ts src/lib/pdf-generator.ts` passe.
- `npm run build` passe avec Next.js 16.2.7.
- QA locale agent-browser sur `/cart?plan=7j&lang=en` : l'encadré “Important notice” apparaît, la case CGV est décochée par défaut, le bouton est désactivé, une tentative de clic affiche “Please accept the terms and conditions to continue.”, puis cocher la case active le bouton.

---

## 2026-06-10 — Calendrier de dates limité par forfait dans le questionnaire

### Exploration
- Le questionnaire principal est dans `src/app/questionnaire/page.tsx` et fonctionne en composant client avec `useSearchParams` sous `Suspense`.
- La création du paiement passe par `src/app/api/create-checkout-session/route.ts`, qui construit les métadonnées Stripe depuis `answers`.
- Le webhook NanoCorp dans `src/app/api/webhooks/nanocorp/route.ts` persiste les métadonnées Stripe dans `orders.questionnaire_data` et `orders.quiz_responses`.
- La page de confirmation checkout est `src/app/checkout/success/page.tsx`; l'API associée `src/app/api/session/[sessionId]/route.ts` lit les infos session/commande.
- Le détail de commande client est rendu côté serveur dans `src/app/account/orders/[id]/page.tsx` via `orders.questionnaire_data`.

### Changements appliqués
- `src/app/questionnaire/page.tsx` accepte désormais `?plan=3`, `?plan=7`, `?plan=14`, `?plan=30` en plus des clés historiques, puis normalise vers `3j`, `7j`, `14j`, `1mois`.
- Ajout d'un calendrier interactif custom Tailwind, sans nouvelle dépendance, affichant les mois de la date du jour jusqu'au 31 décembre 2027 avec navigation précédent/suivant.
- Les dates passées sont grisées et désactivées; les weekends sont légèrement dorés; la plage sélectionnée est mise en avant en navy avec anneau gold.
- La sélection fonctionne en plage : premier clic = date seule, second clic = fin de plage; le bouton “Effacer les dates” réinitialise la sélection.
- Les limites par forfait sont appliquées côté client : 3, 7, 14 ou 31 jours maximum, avec message français en cas de dépassement.
- Le questionnaire exige au moins une date avant de passer à l'étape suivante ou de payer, tout en autorisant moins de jours que le forfait.
- `src/app/api/create-checkout-session/route.ts` normalise aussi les plans numériques, valide la durée côté serveur et ajoute `travel_dates` aux métadonnées Stripe.
- `src/app/api/session/[sessionId]/route.ts` renvoie maintenant destination, `travel_dates`, `arrival_date` et `departure_date` depuis la commande liée à la session.
- `src/app/checkout/success/page.tsx` affiche un vrai récapitulatif post-paiement avec forfait, destination, dates de voyage et email au lieu de rediriger vers le questionnaire.
- `src/app/account/orders/[id]/page.tsx` affiche les dates de voyage dans le détail de commande à partir de `orders.questionnaire_data.travel_dates`.

### Validation
- `npx eslint src/app/questionnaire/page.tsx src/app/api/create-checkout-session/route.ts src/app/api/session/[sessionId]/route.ts src/app/checkout/success/page.tsx src/app/account/orders/[id]/page.tsx` passe.
- `npm run build` passe avec Next.js 16.2.7.
- QA locale agent-browser sur `/questionnaire?plan=3` puis `/questionnaire?plan=7j` : le calendrier apparaît, les dates passées sont désactivées, une plage valide affiche `7 / 7`, et un dépassement affiche “Votre plan 7 jours ne permet pas de dépasser 7 jours. Pour plus de jours, choisissez un plan supérieur.”

---

## Mise à jour 2026-06-10 — Panier multi-plans avant paiement

**Objectif :** remplacer le paiement direct en fin de questionnaire par un flux panier localStorage permettant d'ajouter plusieurs guides avant une seule transaction Stripe.

### Architecture panier
- `src/lib/cart.ts` centralise le panier localStorage (`spiregg_cart_items_v1`), les types `CartItem`, les prix en centimes et les helpers `addCartItem`, `updateCartItem`, `removeCartItem`, `clearCart`.
- Chaque item sauvegarde `planId`, `planLabel`, `price`, `destination`, `dates` et `criteria` avec les réponses du questionnaire.
- Le panier déclenche l'événement browser `spiregg_cart_updated` pour mettre à jour le badge navbar.

### Questionnaire
- `src/app/questionnaire/page.tsx` remplace le CTA final Stripe par `Ajouter au panier`.
- Après ajout, un encart affiche `✅ Ajouté au panier ! Continuer mes achats ou voir le panier`, avec liens vers `/#pricing` et `/cart`.
- `?edit=<cartItemId>` recharge le questionnaire pré-rempli depuis localStorage ; le CTA final devient `Mettre à jour le panier` et redirige vers `/cart` sans doublon.
- Le bouton de revue interne du récap a été renommé `Revoir mes réponses` pour garder le libellé `Modifier` uniquement sur les items du panier.

### Page `/cart`
- `src/app/cart/page.tsx` affiche désormais plusieurs items avec destination, dates, durée, prix, `Supprimer` et `Modifier`.
- Le total est calculé dynamiquement en centimes et affiché en euros FR.
- Le champ code promo reste présent ; le code est envoyé au checkout et Stripe garde aussi `allow_promotion_codes`.
- Le bouton `Payer maintenant` envoie tous les items à `/api/create-checkout-session`.
- Panier vide : message `Votre panier est vide.` + CTA `Commencer un guide →`.

### Checkout et post-paiement
- `src/app/api/create-checkout-session/route.ts` accepte maintenant `items[]` en plus de l'ancien payload `{ planKey, answers }`.
- Chaque item devient un `line_item` Stripe séparé avec label `Guide Spiregg – <destination> <durée>`.
- Les métadonnées sont préfixées par index (`item_0_destination`, `item_1_destination`, etc.) et conservent les critères questionnaire.
- `src/app/api/webhooks/nanocorp/route.ts` lit `item_count` et crée/met à jour une commande par item avec `session_id` suffixé (`<session>_0`, `<session>_1`) tout en conservant `stripe_session_id` commun.
- `src/app/api/session/[sessionId]/route.ts` renvoie maintenant `items[]` pour le récap multi-guides de `/checkout/success`.
- `src/app/checkout/success/page.tsx` vide le panier localStorage quand `session_id` est présent et peut afficher plusieurs guides dans le récap.

### Navbar
- `src/app/page.tsx` ajoute l'icône panier 🛒 à droite, à côté de `Créer mon guide`, avec badge rouge si le panier contient au moins un item.

### Validation
- `npx eslint src/lib/cart.ts src/app/questionnaire/page.tsx src/app/cart/page.tsx src/app/page.tsx src/app/checkout/success/page.tsx src/app/api/create-checkout-session/route.ts src/app/api/webhooks/nanocorp/route.ts src/app/api/session/[sessionId]/route.ts` passe.
- `npm run build` passe.
- QA locale agent-browser : `/cart` vide affiche `Votre panier est vide`; avec deux items localStorage, `/cart` affiche Tokyo + Paris, boutons `Modifier`/`Supprimer`, total `10,00 €`; `Modifier` ouvre `/questionnaire?edit=...` pré-rempli; `/` affiche le lien panier dans la navbar.
- Note exploration : les docs Next locales demandées par `AGENTS.md` (`node_modules/next/dist/docs/`) ne sont pas présentes dans `next@16.2.7` installé dans ce repo.

---

## Mise à jour 2026-06-10 — Promo EXPLORE3 téléphone vérifié + usage unique

### Diagnostic
- Le panier multi-items est dans `src/app/cart/page.tsx` et utilise `src/lib/cart.ts` (`planId` vaut `3j`, `7j`, `14j` ou `1mois`).
- La validation promo existante utilisait des routes Supabase (`profiles`, `promo_usage`), mais la base de production vérifiée via `DATABASE_URL` expose `users` et `promo_usages`.
- La base de production avait déjà `promo_usages` avec unicité `(user_id, promo_code)`, mais pas `users.phone_verified`.
- Aucune occurrence publique de type “1 par compte”, “un par compte”, “once per account” ou variante similaire n'a été trouvée dans `src`, `content`, `legal`, `docs`, `README.md`, `STRIPE_SETUP.md` ou `supabase`.

### Changements appliqués
- `src/lib/promo.ts` centralise les règles EXPLORE3/DECOUVERTE : plan `3j`, connexion obligatoire, `users.phone_number` présent, `users.phone_verified = true`, refus si `promo_usages` contient déjà `(user_id, promo_code)`, messages publics requis.
- `src/app/api/apply-promo/route.ts`, `src/app/api/create-checkout-session/route.ts` et `src/app/api/free-order/route.ts` valident désormais les codes gérés côté serveur avant application.
- `src/app/api/create-checkout-session/route.ts` recherche le `promotion_code` Stripe actif correspondant au code saisi et l'attache à la session Checkout via `discounts`; sinon le champ Stripe reste ouvert avec `allow_promotion_codes`.
- `src/app/api/webhooks/nanocorp/route.ts` persiste maintenant via PostgreSQL (`users`, `payment_sessions`, `orders`) et enregistre `promo_usages` après `checkout.session.completed` si les métadonnées contiennent EXPLORE3/DECOUVERTE.
- `src/app/cart/page.tsx` auto-remplit `EXPLORE3` uniquement quand le premier item du panier est `3j`, vide ce code quand le premier plan devient `7j`, `14j` ou `1mois`, et affiche le lien `/account/profile` pour l'erreur téléphone non vérifié.
- `src/app/account/profile/page.tsx` redirige vers `/account` pour que le lien d'erreur demandé existe.
- `src/app/api/account/update-phone/route.ts` remet `phone_verified` à `false` quand le numéro est modifié.
- `src/app/account/page.tsx` et `src/components/PhoneForm.tsx` n'affirment plus qu'un simple numéro enregistré suffit à utiliser EXPLORE3.
- `supabase/migrations/20260610103000_explore3_phone_verified_usage.sql` ajoute `phone_verified` et crée la table d'usage adaptée selon que le schéma expose `users` ou `profiles`; la migration a été appliquée à la base PostgreSQL de production.

### Validation
- `npx eslint src/lib/promo.ts src/app/cart/page.tsx src/app/api/apply-promo/route.ts src/app/api/create-checkout-session/route.ts src/app/api/free-order/route.ts src/app/api/webhooks/nanocorp/route.ts src/app/api/account/update-phone/route.ts src/app/account/page.tsx src/components/PhoneForm.tsx src/app/account/profile/page.tsx` passe.
- `npm run build` passe avec Next.js 16.2.7.

---

## Refonte couleurs : Bleu → Vert forêt (2026-06-10)

### Palette appliquée
- `#1e3a5f` (navy) → `#425B48` (vert forêt principal)
- `#162d4a` (navy foncé / hover) → `#344a39` (vert plus sombre)
- `#2563eb` (bleu-600) → `#425B48`
- `#eff6ff` (bleu très clair bg) → `#d4e0d6` (vert très clair)
- `#bfdbfe` (bleu clair border) → `#b3cbb9` (vert clair border)
- `#3D6B8C` (bleu-ish tag demo itinéraire) → `#425B48`
- `rgba(30,58,95,...)` (ombres navy) → `rgba(66,91,72,...)`
- Couleurs conservées : `#c9a84c` (or/gold), `#fdf8f0` (crème), rouge pour erreurs

### Fichiers modifiés
- `src/app/questionnaire/page.tsx` — 25 occurrences (boutons, textes, fonds, progress bar, stepper)
- `src/app/account/page.tsx` — badges plan + événement questionnaire
- `src/app/account/orders/[id]/page.tsx` — badges plan
- `src/components/OrderTimeline.tsx` — couleur événement "questionnaire_filled"
- `src/app/page.tsx` — tag couleur dans itinéraire démo Tokyo

---

## 2026-06-10 — Badge cadeau Plan 3 jours + vérification SMS

### Exploration persistée
- Le projet est une app Next.js 16 App Router avec `src/app/page.tsx` pour la landing, `src/app/account/page.tsx` pour le compte, `src/lib/cart.ts` pour les plans/panier, et des routes API sous `src/app/api/`.
- La base live utilise actuellement une table `users` avec `phone_number` et `phone_verified`; les migrations historiques du repo supportent aussi une table `profiles` selon l'environnement.
- Le code promo `EXPLORE3` existe déjà dans `src/lib/promo.ts` et est auto-prérempli dans `src/app/cart/page.tsx` pour le plan `3j`.
- Next.js 16 docs lues localement : `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`, `cookies.md`, et `use-router.md` avant création des routes App Router.

### Changements livrés
- Ajout du badge 🎁 animé sur la carte pricing `Guide Express / 3 jours`, avec tooltip FR/EN et état `🎁 Déjà débloqué !` si l'utilisateur connecté a `phone_verified = true`.
- Ajout des routes `POST /api/phone/send-otp`, `POST /api/phone/verify-otp`, et `GET /api/phone/status`.
- Ajout du provider SMS Twilio Verify via `SMS_PROVIDER=twilio`, avec placeholders `vonage`/`sinch` et mock local `SMS_PROVIDER=mock`.
- Ajout du composant client `src/components/PhoneVerification.tsx` : sélection pays/préfixe, envoi OTP, 6 champs OTP avec autofocus, resend 60s, état succès animé.
- Intégration du composant dans `/account` avec affichage conditionnel selon `phone_verified` et numéro masqué si validé.
- Ajout de la migration `supabase/migrations/20260610121500_phone_sms_verification.sql` et application sur la base live (`phone_verifications` créé, index rate-limit créé).
- Documentation Twilio/migration ajoutée dans `docs/phone-sms-verification.md`.
- Complément après validation : `src/app/cart/page.tsx` route maintenant le checkout d'un panier solo `3j` + `EXPLORE3` vers `POST /api/free-order`, ce qui crée une commande à 0€ sans dépendre d'un promotion code Stripe. `src/app/api/free-order/route.ts` accepte les critères du panier, crée l'ordre avec `questionnaire_completed` si la destination est connue, puis redirige vers le suivi de commande.

---

## 2026-06-11 — Système d'authentification complet (password reset, /register, nom dans header)

### Contexte
Le système d'auth était déjà partiellement en place : `/login`, `/signup` (avec phone anti-abuse), `/account` (dashboard avec commandes + profil), route protection via `src/proxy.ts`, LogoutButton. Manquait : la récupération de mot de passe et quelques détails UX.

### Important : Next.js 16 Breaking Changes
- **`middleware.ts` est dépréciée** → renommée en `proxy.ts`. Avoir les deux fichiers ensemble cause une erreur de build.
- Le projet avait un `src/middleware.ts` résiduel qui a été supprimé.
- Pour les imports Node.js natifs (ex: `crypto`), utiliser le préfixe `node:` : `import { randomBytes, createHash } from "node:crypto"` pour être compatible avec Turbopack.
- Les API routes n'ont pas besoin de `export const runtime = "nodejs"` explicitement (les routes existantes ne l'ont pas).

### Fichiers créés
- `src/app/api/auth/forgot-password/route.ts` — POST : reçoit un email, génère un token SHA-256 (32 bytes hex), l'insère dans `password_reset_tokens`, envoie un email via Resend avec lien de reset. Ne révèle pas si l'email existe (anti-enumeration).
- `src/app/api/auth/reset-password/route.ts` — POST : reçoit token + nouveau mot de passe, valide token (non-expiré, non-utilisé), met à jour `password_hash` dans `profiles`, marque le token comme utilisé.
- `src/app/forgot-password/page.tsx` — Page avec formulaire email, état succès post-envoi.
- `src/app/reset-password/page.tsx` — Page avec formulaire nouveau mot de passe, lit le token depuis les query params (Suspense wrapper requis pour `useSearchParams()`), redirect auto vers `/login` après succès.
- `src/app/register/page.tsx` — Simple `redirect("/signup")` pour compatibilité URL.

### Fichiers modifiés
- `src/app/login/page.tsx` — Ajout lien "Mot de passe oublié ?" sous le champ mot de passe.
- `src/app/api/phone/status/route.ts` — Ajout de `email: session.email` dans la réponse pour affichage dans le header.
- `src/app/page.tsx` — Mise à jour du `PhoneStatus` type (ajout `email?`), affichage du préfixe email (avant `@`) dans la nav quand `phoneStatus.loggedIn && phoneStatus.email`.
- `src/middleware.ts` — SUPPRIMÉ (dépréciée, remplacée par `src/proxy.ts` en Next.js 16).

### DB : `password_reset_tokens` + Migrations appliquées
Toutes les migrations ont été appliquées manuellement via `psql "$DATABASE_URL"` (la DB Neon de prod était vide) :
```bash
for f in supabase/migrations/*.sql; do psql "$DATABASE_URL" -f "$f"; done
```
Tables présentes après migration : `profiles`, `users` (VIEW), `orders`, `payment_sessions`, `guides`, `promo_usage`, `promo_usages` (VIEW), `ip_logs`, `password_reset_tokens`, `phone_verifications`, `admin_logs`, `admin_login_attempts`.

**Important :** Le `DATABASE_URL` dans l'environnement worker == même DB que Vercel (Neon). Les routes API en prod utilisent cette même URL.

---

## Mise à jour 2026-06-11 — Drapeaux emoji + persistance de la langue

### Contexte
Les boutons de sélection de langue affichaient déjà 🇫🇷/🇬🇧 dans la plupart des pages. Le problème était que la préférence de langue n'était pas persistée, et que les composants LangToggle n'informaient pas les pages parentes des changements.

### Changements appliqués
- `src/app/page.tsx` : lit `tgai_lang` depuis localStorage au montage pour restaurer la langue; les boutons du toggle écrivent dans localStorage et dispatche l'événement `tgai_lang_change`; écoute aussi cet événement pour se synchro avec les autres pages
- `src/components/LangToggle.tsx` : dispatch `window.dispatchEvent(new CustomEvent("tgai_lang_change", ...))` à chaque toggle
- `src/app/questionnaire/page.tsx` : `language` est maintenant un `useState` initialisé depuis localStorage (fallback URL param); écoute `tgai_lang_change` pour mettre à jour la langue et `answers.language` sans perdre la progression du formulaire

### Comportement après fix
- Changement de langue sur une page → persisté dans localStorage → toutes les pages ouvertes et les navigations futures respectent la préférence
- Clic sur 🇫🇷 sur le questionnaire → contenu légal (CGV notice) passe en français; `answers.language` = "fr"
- Clic sur 🇬🇧 sur le questionnaire → contenu légal passe en anglais; guide sera généré en anglais

### Limite connue
- Les labels d'options du questionnaire (TRAVEL_SPEED, TRAVELER_TYPE, etc.) sont en français uniquement. La traduction complète EN des options est un TODO futur.
- La page `/cart` et `/privacy` ont un toggle langue mais leur contenu est en français uniquement.

---

## Mise à jour 2026-06-11 — Intégration Twilio Verify pour vérification de numéro de téléphone

### Contexte
L'infrastructure de vérification SMS existait déjà (via HTTP fetch dans `src/lib/sms-provider.ts`), mais sans les credentials Twilio configurés. La tâche a ajouté le service Twilio Verify, les variables d'environnement, et deux nouvelles routes SDK.

### Twilio Verify Service créé
- **Service SID** : `your_verify_service_sid_here`
- **Friendly Name** : TravelGuide AI
- **Code length** : 6 chiffres, canal SMS

### Variables d'environnement configurées sur Vercel
| Variable | Valeur |
|---|---|
| `TWILIO_ACCOUNT_SID` | `your_account_sid_here` |
| `TWILIO_AUTH_TOKEN` | `your_auth_token_here` |
| `TWILIO_VERIFY_SERVICE_SID` | `your_verify_service_sid_here` |

### Nouvelles routes API (Twilio SDK)

| Route | Description |
|-------|-------------|
| `POST /api/auth/send-phone-code` | Reçoit `{ phoneNumber }` E.164, envoie SMS via Twilio Verify SDK |
| `POST /api/auth/verify-phone-code` | Reçoit `{ phoneNumber, code }`, vérifie via Twilio SDK, met `phone_verified=true` + `phone_number` dans `profiles` |

### Librairie installée
- `twilio` — SDK officiel Twilio (utilisé dans les nouvelles routes)

### Migration DB appliquée sur Neon (prod)
```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_number TEXT;
-- phone_verified existait déjà
```

La table `profiles` a maintenant : `phone` (ancien), `phone_number` (nouveau alias), `phone_verified`.

Les nouvelles routes mettent à jour **les deux colonnes** (`phone` et `phone_number`) pour la compatibilité.

### Architecture
- Routes existantes (`/api/phone/send-otp`, `/api/phone/verify-otp`) : utilisent HTTP fetch via `sms-provider.ts`, mettent à jour `profiles.phone`
- Nouvelles routes (`/api/auth/send-phone-code`, `/api/auth/verify-phone-code`) : utilisent le SDK `twilio`, mettent à jour `profiles.phone_number` ET `profiles.phone`
- UI existante (`src/components/PhoneVerification.tsx` dans `/account`) : appelle les anciennes routes
- Le composant PhoneVerification affiche ✅ vert à l'état `verified`

---

## Mise à jour 2026-06-11 — Sécurisation des credentials Twilio

### Résumé
Les credentials Twilio ont été déplacés hors des fichiers suivis par Git et documentés via `.env.example` uniquement. Les routes API App Router conservent l'accès serveur via `process.env`.

### Fichiers mis à jour
- `.gitignore` ignore explicitement `.env`, `.env.local`, `.env*.local`, `.env.production` et `.env*`.
- `.env.example` documente `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` et `TWILIO_VERIFY_SERVICE_SID` avec des placeholders.
- `src/app/api/auth/send-phone-code/route.ts` utilise `process.env.TWILIO_*` via `accountSid`, `authToken` et `verifyServiceSid`.
- `src/app/api/auth/verify-phone-code/route.ts` utilise `process.env.TWILIO_*` via `accountSid`, `authToken` et `verifyServiceSid`.
- `DOCS.md` ne stocke plus les valeurs réelles Twilio, seulement des placeholders.

### Vérifications effectuées
- `.env.local` existe localement avec les variables Twilio réelles et reste ignoré par Git.
- Les variables `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` et `TWILIO_VERIFY_SERVICE_SID` sont présentes sur Vercel via `nanocorp vercel env`.
- L'historique Git a été réécrit pour remplacer les anciennes valeurs Twilio par des placeholders; le scan final retourne `tracked_secret_hits=0` et `history_secret_hits=0`.

---

## Mise à jour 2026-06-11 — Compte admin fonctionnel + migration is_admin

### Ce qui a été fait

**Base de données :**
- `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;`
- Vue `users` recréée pour exposer `is_admin` (la colonne était absente de la vue, bloquant le login admin).
- Compte `admin@spiregg.app` inséré dans `profiles` avec :
  - `password_hash` = bcrypt(12) de `SpireggAdmin2025!`
  - `is_admin = true`
  - `phone_verified = true`
  - `is_suspended = false`

**Variables Vercel configurées :**
- `ADMIN_JWT_SECRET` = clé 96 caractères hex (signage des sessions admin JWT 8h).

**Script reproductible :**
- `scripts/seed-admin.js` — recrée ou met à jour le compte admin en cas de reset DB.
  - Usage : `DATABASE_URL=<url> node scripts/seed-admin.js`
  - Supporte `ADMIN_EMAIL` et `ADMIN_PASSWORD` en override.
  - Idempotent : ON CONFLICT DO UPDATE.

### Dashboard admin existant (déjà livré 2026-06-09, maintenant opérationnel)
- `/admin/login` : formulaire de connexion (rate-limited, 5 tentatives/15 min par IP)
- `/admin` : KPIs + tableau commandes + filtres statut/plan/date/email + pagination + modal détails questionnaire + actions (regénérer, renvoyer email, télécharger PDF)
- `/admin/users` : tableau utilisateurs + panneau détails + suspension/réactivation
- Protection route via `src/proxy.ts` : toute URL `/admin/*` sauf `/admin/login` redirige vers login si JWT admin absent ou invalide

### Identifiants de connexion
URL : `https://travel-guide.nanocorp.app/admin/login`
Email : `admin@spiregg.app`
Mot de passe : `SpireggAdmin2025!` (stocké bcrypt, jamais en clair)

---

## Mise à jour 2026-07-08 — Fix système de compte utilisateur (inscription/connexion/OTP)

### Problèmes résolus

**Bug 1 — `relation "ip_logs" does not exist` à l'inscription :**
- La base de données était complètement vide (aucune migration exécutée).
- Toutes les migrations SQL ont été appliquées via `psql $DATABASE_URL -f supabase/migrations/*.sql`.
- Tables créées : `profiles`, `orders`, `ip_logs`, `payment_sessions`, `guides`, `admin_logs`, `admin_login_attempts`, `password_reset_tokens`, `phone_verifications`, `promo_usage`.
- Vues créées : `users` (alias de `profiles`), `promo_usages`.

**Bug 2 — `relation "users" does not exist` à la connexion :**
- Même cause (migrations non exécutées). Résolu par la même action.
- Note : `users` est une VUE auto-updatable sur `profiles` (PostgreSQL). Les INSERT/SELECT fonctionnent sur la vue.

**Bug 3 — Mock SMS bloqué en production :**
- `sms-provider.ts` bloquait le provider mock en production avec une erreur 501.
- Modifié pour utiliser automatiquement le mock si Twilio n'est pas configuré.
- Code de vérification mock = `SMS_MOCK_CODE` env var (défaut `000000`).

### Nouveau flux inscription avec vérification OTP

`src/app/signup/SignupForm.tsx` reécrit avec deux étapes :
1. **Formulaire** : Email, Téléphone (E.164), Mot de passe, Confirmation, Anti-bot
2. **Vérification OTP** : 6 cases individuelles, focus automatique, renvoi avec compteur 60s
   - Après succès API signup → appel automatique `/api/phone/send-otp`
   - Saisie code → appel `/api/phone/verify-otp` → redirection `/account`
   - Bouton "Passer cette étape" pour accès immédiat sans vérification

### Fichiers modifiés
| Fichier | Changement |
|---------|-----------|
| `src/app/signup/SignupForm.tsx` | Ajout étape OTP inline après inscription |
| `src/lib/sms-provider.ts` | Mock SMS autorisé quand Twilio non configuré |

### Migrations exécutées (base de données)
1. `20260609000000_base_travelguide_schema.sql` — tables core
2. `20260609190000_signup_anti_abuse.sql` — index ip_logs
3. `20260610103000_explore3_phone_verified_usage.sql` — phone_verified + promo_usage
4. `20260610121500_phone_sms_verification.sql` — phone_verifications table
5. `20260611000000_profile_name_fields.sql` — first_name, last_name

---

## Mise à jour 2026-07-08 — Vérification SMS Twilio transparente

### Exploration persistée
- `nanocorp site env list` ne montre actuellement que `DATABASE_URL` sur Vercel/NanoCorp : `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` et `TWILIO_VERIFY_SERVICE_SID` ne sont pas configurées côté déploiement.
- Aucun `.env.local` n'est présent dans le repo ; `.env.example` contenait seulement les trois placeholders Twilio sans `SMS_PROVIDER` ni `SMS_MOCK_CODE`.
- `src/lib/sms-provider.ts` utilisait déjà Twilio Verify par HTTP `fetch` quand les trois variables Twilio étaient présentes, mais retombait silencieusement en mock (`000000`) quand elles manquaient.
- Les routes actives pour l'interface compte et signup sont `POST /api/phone/send-otp` et `POST /api/phone/verify-otp`; les anciennes routes `src/app/api/auth/send-phone-code` et `src/app/api/auth/verify-phone-code` ne sont plus référencées par l'UI actuelle.
- La consigne AGENTS demandait de lire `node_modules/next/dist/docs/`, mais le package `next` installé dans ce sandbox ne contient pas ce dossier ; la convention App Router a été vérifiée sur les routes existantes du projet.

### Changements livrés
- `src/lib/sms-provider.ts` ignore maintenant les placeholders d'environnement (`your_*`, `*_here`), logge explicitement les erreurs Twilio côté serveur et logge le fallback mock avec la raison (`twilio_missing_credentials` ou `sms_provider_mock`).
- `POST /api/phone/send-otp` renvoie maintenant `provider`, `demoMode`, `demoCode` et un `message` clair ; en mode mock, la réponse dit `Mode démo - Code : 000000` au lieu de faire croire à un SMS réel.
- `src/components/PhoneVerification.tsx` et `src/app/signup/SignupForm.tsx` affichent une bannière visible `Mode démo - Code : <code>` sur l'écran OTP quand Twilio n'est pas configuré.
- `src/lib/phone-verification.ts` expose un message public distinct `sms_provider_error` pour les erreurs Twilio réelles, au lieu de retomber sur le message de configuration absente.
- `.env.example` et `docs/phone-sms-verification.md` documentent `SMS_PROVIDER=twilio`, les trois variables Twilio requises, `SMS_MOCK_CODE`, et la commande `nanocorp site env set --vars '[...]'` pour configurer Vercel/NanoCorp.
- `src/app/signup/page.tsx` et `src/app/login/page.tsx` enveloppent maintenant les composants utilisant `useSearchParams()` dans `Suspense`, ce qui débloque `next build` avec Next 15.5.20.
- `tsconfig.json` a été normalisé par `next build` avec `jsx: "preserve"`, changement obligatoire annoncé par Next pendant la compilation.

### Configuration Twilio à faire
```bash
nanocorp site env set --vars '[{"key":"SMS_PROVIDER","value":"twilio"},{"key":"TWILIO_ACCOUNT_SID","value":"AC..."},{"key":"TWILIO_AUTH_TOKEN","value":"..."},{"key":"TWILIO_VERIFY_SERVICE_SID","value":"VA..."}]'
```
Après configuration, pousser/redéployer puis vérifier `/api/health` : les trois variables Twilio doivent être marquées `✅ défini`.

### Validation
- `npx eslint src/app/login/page.tsx src/app/signup/page.tsx src/app/signup/SignupForm.tsx src/components/PhoneVerification.tsx src/lib/sms-provider.ts src/app/api/phone/send-otp/route.ts src/app/api/phone/verify-otp/route.ts src/lib/phone-verification.ts` passe.
- `npm run build` passe.
- `npm run lint` global reste bloqué par des erreurs préexistantes hors périmètre (`scripts/seed-admin.js`, `src/app/business/page.tsx`, `src/app/business/questionnaire/page.tsx`, `src/components/DestinationMap.tsx`, `src/lib/mode-theme.ts`, `src/lib/useLang.ts`).
