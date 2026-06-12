# TravelGuide AI — Specification du système de comptes clients

## 1. Objectif

Concevoir un système de comptes clients pour TravelGuide AI avec les contraintes suivantes :

- le compte n'existe pas avant le paiement ;
- l'activation du compte se fait après paiement Stripe avec `email + mot de passe` ;
- le client dispose d'un tableau de bord pour retrouver ses commandes, re-télécharger ses PDF, ouvrir ses Google Docs et gérer son profil ;
- tout le système est disponible en français et en anglais ;
- la stack doit rester exploitable par une opération solo/lean, sans backend séparé ni SaaS auth lourd.

## 2. Contraintes produit et plateforme

### Contraintes fonctionnelles

- TravelGuide AI vend un service livré en différé : le guide est produit puis livré plus tard, ce n'est pas un téléchargement instantané au moment du paiement.
- Le compte doit donc servir à la fois d'espace d'activation, d'historique de commande et de bibliothèque de guides.
- Un même email peut repayer plus tard pour un nouveau guide. Il faut rattacher automatiquement les nouvelles commandes au compte existant.

### Contraintes NanoCorp / paiement

- Le webhook de paiement NanoCorp est `POST /api/webhooks/nanocorp`.
- Il relaie `checkout.session.completed` en JSON normal, sans signature Stripe à vérifier.
- La page `/checkout/success` est uniquement une page UX ; elle ne doit pas déclencher la création de droits.
- Le webhook est best-effort, sans retry. Il faut donc prévoir une stratégie de fallback simple côté support.

### Contrainte métier importante

- Avec le payment link actuel, le webhook fournit de façon fiable `session_id`, `amount_total`, `currency` et `customer_details.email`, mais pas un brief de voyage exploitable.
- Le compte client doit donc inclure un mini flow d'onboarding de commande après activation pour compléter ou confirmer les détails du guide acheté.

## 3. Recommandation de stack

### Stack recommandée

| Domaine | Recommandation | Pourquoi |
| --- | --- | --- |
| Frontend + backend web | Next.js 16 App Router dans le repo existant | Une seule codebase pour pages publiques, auth, dashboard, routes API et pages bilingues |
| Hébergement applicatif | Vercel | Déjà en place, zéro ops, adapté à un solo operator |
| Auth | Better Auth auto-hébergé dans l'app | Email/mot de passe, reset password, sessions et gestion utilisateur dans la même app |
| Base de données | PostgreSQL existant via `DATABASE_URL` | Déjà disponible sur la plateforme, robuste pour users, commandes et assets |
| ORM / migrations | Drizzle ORM + Drizzle Kit | Léger, proche du SQL, simple à maintenir seul |
| i18n | `next-intl` | Routing propre `/fr/...` et `/en/...`, messages versionnés dans le repo |
| Stockage PDF | Vercel Blob privé | Simple à opérer avec Vercel, accès privé possible via route authentifiée |
| Emails transactionnels | Resend ou Postmark | Nécessaire pour activation, reset password et notifications de livraison |

### Pourquoi cette stack est la bonne pour une opération lean

- pas de service backend séparé ;
- pas d'auth SaaS externe à configurer manuellement pour les flows de base ;
- une seule base PostgreSQL pour la vérité métier ;
- les PDF sont stockés hors base dans un object storage adapté ;
- toute la logique de rattachement commande -> compte -> assets reste dans le même projet.

### Alternatives écartées

- `Auth.js` seul : possible, mais il faut reconstruire soi-même plus de briques autour du mot de passe, du reset et du provisioning post-paiement.
- Clerk / Supabase Auth : bons produits, mais ajoutent un fournisseur critique et plus de complexité opérationnelle qu'un setup auto-hébergé simple.
- Stockage des PDF directement en base : évitable, coûteux et peu pratique pour les redownloads.

## 4. Architecture cible

### Principe général

1. Le client paie via Stripe/NanoCorp.
2. Le webhook crée ou met à jour une commande locale, idempotente via `stripe_session_id`.
3. Si l'email n'a pas encore de compte, le système génère un lien d'activation.
4. Le client définit son mot de passe et accède à son dashboard.
5. Il complète ensuite le brief de commande manquant si nécessaire.
6. Quand le guide est prêt, le PDF privé et le lien Google Doc sont rattachés à la commande.
7. Le client retrouve ensuite tout dans son espace.

### Règles de vérité

- `orders` est la vérité métier pour les achats reçus.
- `stripe_session_id` est la clé d'idempotence.
- le succès browser `/checkout/success` ne donne jamais accès à un guide ;
- seuls les enregistrements locaux validés par le webhook ouvrent l'accès ;
- l'accès aux fichiers dépend de la session authentifiée et du rattachement `order.user_id`.

## 5. Modèle de données recommandé

### Tables d'auth

Laisser Better Auth gérer ses tables standard :

- `user`
- `session`
- `account`
- `verification`

Le projet ne doit pas dupliquer la gestion du mot de passe hors de ce périmètre.

### Tables métier

#### `customer_profiles`

Complément du `user` d'auth pour les préférences produit.

Champs recommandés :

- `user_id` UUID PK/FK vers `user.id`
- `full_name` text nullable
- `preferred_locale` text not null default `'fr'`
- `home_airport` text nullable
- `default_currency` text nullable
- `marketing_opt_in` boolean default `false`
- `created_at`, `updated_at`

#### `orders`

Un enregistrement par checkout session reçu.

Champs recommandés :

- `id` UUID PK
- `stripe_session_id` text unique not null
- `user_id` UUID nullable FK vers `user.id`
- `customer_email` text not null
- `amount_total_cents` integer not null
- `currency` text not null
- `status` text not null
- `account_state` text not null
- `order_brief_state` text not null
- `guide_state` text not null
- `purchased_at` timestamp not null
- `claimed_at` timestamp nullable
- `delivered_at` timestamp nullable
- `refunded_at` timestamp nullable
- `source_locale` text nullable
- `notes_internal` text nullable
- `created_at`, `updated_at`

Valeurs de statut recommandées :

- `status`: `paid`, `refunded`, `cancelled`
- `account_state`: `unclaimed`, `claimed`
- `order_brief_state`: `pending`, `submitted`, `validated`
- `guide_state`: `not_started`, `in_production`, `ready`, `delivered`

#### `order_intakes`

Sépare le brief voyage de la ligne de paiement.

Champs recommandés :

- `id` UUID PK
- `order_id` UUID unique FK
- `selected_plan` text nullable
- `destination` text nullable
- `trip_length_days` integer nullable
- `travel_dates` daterange nullable ou `start_date` + `end_date`
- `travelers_count` integer nullable
- `budget_level` text nullable
- `travel_style` text nullable
- `interests` jsonb not null default `'[]'`
- `constraints` text nullable
- `language_requested` text not null default `'fr'`
- `google_doc_editable_requested` boolean default `true`
- `submitted_at` timestamp nullable
- `validated_at` timestamp nullable

#### `guide_assets`

Un enregistrement par guide livré.

Champs recommandés :

- `id` UUID PK
- `order_id` UUID unique FK
- `pdf_blob_path` text nullable
- `pdf_filename` text nullable
- `pdf_size_bytes` integer nullable
- `google_doc_url` text nullable
- `google_doc_title` text nullable
- `delivery_email_sent_at` timestamp nullable
- `ready_at` timestamp nullable
- `created_at`, `updated_at`

#### `account_claim_tokens`

Jetons one-shot pour activation post-paiement.

Champs recommandés :

- `id` UUID PK
- `order_id` UUID FK
- `email` text not null
- `token_hash` text unique not null
- `expires_at` timestamp not null
- `consumed_at` timestamp nullable
- `created_at` timestamp not null

#### `password_reset_requests`

Optionnel si Better Auth couvre seul le stockage ; sinon conserver uniquement une table technique alignée avec la solution choisie.

#### `asset_access_logs`

Optionnel en phase 1, utile si besoin de support ou d'audit léger.

## 6. Parcours utilisateur détaillés

### Flow A — Premier achat puis création de compte

1. Le client paie via Stripe.
2. NanoCorp envoie `checkout.session.completed` à `/api/webhooks/nanocorp`.
3. La route :
   - parse le JSON ;
   - ignore tout événement autre que `checkout.session.completed` ;
   - upsert `orders` via `stripe_session_id` ;
   - stocke `customer_email`, `amount_total_cents`, `currency`, `purchased_at` ;
   - crée `account_claim_tokens` si aucun utilisateur n'existe pour cet email ;
   - envoie un email d'activation bilingue.
4. Le client clique sur le lien d'activation.
5. La page `/[locale]/activate-account?token=...` :
   - vérifie le jeton ;
   - si aucun compte n'existe, crée le user via Better Auth ;
   - demande `full_name` optionnel, mot de passe, confirmation ;
   - crée la session ;
   - marque la commande comme `claimed`.
6. Redirection vers `/[locale]/account/orders/[orderId]/start`.
7. Le client complète le brief voyage.

### Flow B — Client existant qui repaie

1. Le webhook reçoit un paiement avec un email déjà connu.
2. La commande est créée avec `user_id` déjà rattaché.
3. Aucun nouveau compte n'est créé.
4. Un email transactionnel informe le client qu'une nouvelle commande est disponible dans son espace.
5. Au prochain login, la nouvelle commande apparaît dans l'historique avec un CTA "Compléter les détails".

### Flow C — Connexion

1. Route `/[locale]/login`.
2. Formulaire `email + mot de passe`.
3. En cas de succès :
   - redirection vers le dashboard ;
   - si une commande récente a `order_brief_state = pending`, redirection prioritaire vers cette commande.
4. En cas d'échec :
   - message non verbeux ;
   - protection contre l'énumération d'email ;
   - limitation de débit par IP et par email.

### Flow D — Mot de passe oublié

1. Route `/[locale]/forgot-password`.
2. Le client saisit son email.
3. Réponse toujours neutre : "Si un compte existe, nous avons envoyé un email".
4. Envoi d'un email bilingue ou localisé selon `preferred_locale`.
5. Le lien mène à `/[locale]/reset-password?token=...`.
6. Le client saisit un nouveau mot de passe.
7. Invalidation des sessions sensibles si la lib choisie le permet.

### Flow E — Accès aux guides

1. Le client ouvre `/[locale]/account`.
2. Onglet principal : historique des commandes.
3. Chaque carte de commande affiche :
   - date d'achat ;
   - destination ;
   - statut ;
   - langue ;
   - disponibilité du PDF ;
   - disponibilité du Google Doc.
4. Bouton `Télécharger le PDF / Download PDF` :
   - appelle une route protégée ;
   - vérifie la session ;
   - vérifie que `order.user_id` correspond ;
   - stream le fichier privé depuis Vercel Blob.
5. Bouton `Ouvrir le Google Doc / Open Google Doc` :
   - ouvre l'URL stockée dans `guide_assets.google_doc_url`.
6. Si le guide n'est pas prêt, la carte indique `En cours / In progress` avec date estimée ou texte standard.

### Flow F — Gestion du profil

Depuis `/[locale]/account/profile`, le client peut :

- changer son nom ;
- changer sa langue préférée FR/EN ;
- modifier son mot de passe ;
- consulter l'email associé au compte ;
- demander la suppression du compte via support ou flow dédié plus tard.

Phase 1 recommandée :

- édition du nom ;
- changement de langue ;
- changement de mot de passe ;
- pas de changement d'email en self-service tant que le volume reste faible.

## 7. UX et structure d'écrans

### Arborescence recommandée

- `/[locale]/login`
- `/[locale]/activate-account`
- `/[locale]/forgot-password`
- `/[locale]/reset-password`
- `/[locale]/account`
- `/[locale]/account/orders`
- `/[locale]/account/orders/[orderId]`
- `/[locale]/account/orders/[orderId]/start`
- `/[locale]/account/profile`
- `/checkout/success`
- `/api/webhooks/nanocorp`
- `/api/account/download/[guideAssetId]`

### Structure du dashboard

#### Vue `Orders`

- liste chronologique inverse ;
- badge de statut ;
- CTA principal selon état :
  - `Créer mon compte / Create account`
  - `Compléter les détails / Complete details`
  - `Télécharger le PDF / Download PDF`
  - `Ouvrir le Google Doc / Open Google Doc`

#### Vue `Profile`

- informations personnelles ;
- langue préférée ;
- sécurité du compte.

### Statuts front-office à afficher

- `Paiement confirmé / Payment confirmed`
- `Détails à compléter / Details needed`
- `Guide en préparation / Guide in production`
- `Guide livré / Guide delivered`
- `Remboursé / Refunded`

## 8. Bilingue FR / EN

### Principe

- utiliser `next-intl` avec locales `fr` et `en` ;
- routes localisées côté dashboard et auth ;
- conserver une langue par défaut dans `customer_profiles.preferred_locale`.

### Cas spécial post-paiement

Avant création du compte, le système ne connaît pas toujours la langue préférée du client. La solution lean est :

- email d'activation bilingue FR + EN ;
- page d'activation capable de basculer FR/EN ;
- une fois le compte créé, stocker `preferred_locale` et localiser tous les emails suivants.

### Contenus à traduire

- pages auth ;
- dashboard ;
- statuts de commande ;
- emails transactionnels ;
- messages d'erreur utilisateur ;
- CTA de téléchargement / accès document.

## 9. Sécurité et fiabilité

### Sécurité

- sessions sécurisées en cookie `httpOnly`, `secure`, `sameSite=lax` ;
- mots de passe gérés par la lib d'auth choisie, sans stockage custom artisanal ;
- jetons d'activation et de reset stockés hashés, expirant rapidement ;
- téléchargement PDF uniquement via route authentifiée ;
- vérification stricte du rattachement `user_id` avant tout accès asset ;
- rate limiting sur login, reset et activation.

### Fiabilité opérationnelle

- webhook idempotent par `stripe_session_id` ;
- réponse `200` rapide ;
- journaliser les erreurs de provisioning ;
- prévoir un fallback support simple :
  - page de succès expliquant que l'email d'activation peut prendre quelques minutes ;
  - CTA de contact si aucun email reçu ;
  - procédure manuelle d'association commande -> compte en base si le webhook a échoué.

### Décision produit utile

En phase 1, ne pas essayer de déduire de façon "magique" tout le contenu de la commande depuis le paiement seul. Le système doit accepter qu'un paiement crée d'abord un droit d'accès, puis qu'un brief commande soit complété ensuite.

## 10. Implémentation recommandée en phases

### Phase 1 — Fondations

- intégrer `next-intl` ;
- intégrer Better Auth ;
- créer le schéma PostgreSQL / Drizzle ;
- créer `/api/webhooks/nanocorp` ;
- créer `/checkout/success` ;
- créer le flow `activate-account`.

### Phase 2 — Dashboard minimal exploitable

- créer `/[locale]/account` ;
- afficher l'historique des commandes ;
- afficher les statuts ;
- créer le formulaire `order_intakes` ;
- créer la page profil simple.

### Phase 3 — Bibliothèque de guides

- intégrer Vercel Blob privé ;
- créer la route de téléchargement sécurisée ;
- afficher les Google Doc links ;
- ajouter email "guide prêt".

### Phase 4 — Raffinement

- logs d'accès ;
- support self-service plus fin ;
- changement d'email ;
- suppression de compte ;
- éventuelle vue admin interne si le volume le justifie.

## 11. Recommandations de mise en oeuvre

### Ce qu'il faut faire

- garder toute la logique dans la même app Next.js ;
- stocker les commandes localement même si l'utilisateur n'a pas encore activé son compte ;
- rattacher les achats futurs au même compte par email ;
- utiliser un stockage privé pour les PDF ;
- localiser toute l'expérience compte et emails.

### Ce qu'il ne faut pas faire

- ne pas créer le compte avant paiement ;
- ne pas s'appuyer sur `/checkout/success` pour accorder l'accès ;
- ne pas exposer les PDF via des URLs publiques permanentes ;
- ne pas déduire automatiquement le brief de voyage depuis `amount_total` seul ;
- ne pas multiplier les services externes alors que Next.js + Postgres couvrent le besoin.

## 12. Décisions ouvertes mais non bloquantes

- choix final du provider email : Resend ou Postmark ;
- politique de changement d'email en self-service ou via support ;
- édition Google Doc en mode commentaire ou édition libre ;
- niveau exact de réconciliation manuelle si un webhook NanoCorp est manqué.

## 13. Résumé exécutif

La meilleure architecture pour TravelGuide AI est une application Next.js unique, hébergée sur Vercel, avec Better Auth pour l'authentification, PostgreSQL pour les comptes et commandes, Drizzle pour le schéma, `next-intl` pour FR/EN et Vercel Blob privé pour les PDF. Le paiement Stripe via NanoCorp crée d'abord une commande locale, puis déclenche un email d'activation. Le client crée ensuite son mot de passe, accède à son dashboard, complète les détails du guide si besoin, puis retrouve tous ses assets depuis un espace sécurisé.
