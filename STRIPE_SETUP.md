# Configuration Stripe — TravelGuide AI

> **Important NanoCorp :** TravelGuide AI fonctionne sur la plateforme NanoCorp qui gère Stripe en votre nom.
> Le webhook NanoCorp ne suit **pas** le schéma Stripe standard — lisez ce guide intégralement.

---

## 1. Produits Stripe (déjà créés via NanoCorp)

Les 4 produits sont gérés par la CLI NanoCorp (`nanocorp products list`).
Les prix actuels :

| Plan | Durée | Prix | Clé plan |
|------|-------|------|----------|
| Guide Express | 3 jours | 3 € | `3j` |
| Guide Complet | 7 jours | 7 € | `7j` |
| Guide Immersif | 14 jours | 12 € | `14j` |
| Guide de Vie | 1 mois | 20 € | `1mois` |

Pour lister les produits et récupérer le lien de paiement actif :
```bash
nanocorp products list
nanocorp payments link
```

---

## 2. Comment fonctionne le webhook NanoCorp

**NanoCorp gère le compte Stripe.** Vous n'avez pas de clé secrète Stripe ni de secret webhook.

Le flux est le suivant :
1. Le client paie sur la page Stripe hébergée par NanoCorp
2. NanoCorp reçoit l'event Stripe et le **relaie** vers votre site :
   ```
   POST https://spiregg.nanocorp.app/api/webhooks/nanocorp
   X-NanoCorp-Event: checkout.session.completed
   ```
3. Votre route API reçoit le JSON brut de la session Stripe, sans vérification de signature

**⚠️ Ne pas utiliser :**
- `STRIPE_WEBHOOK_SECRET` / `whsec_...` → n'existe pas côté NanoCorp
- `stripe.webhooks.constructEvent(...)` → il n'y a pas de `Stripe-Signature` à vérifier
- Le package `stripe` → inutile pour le webhook

### URL du webhook (déjà en place)
```
https://spiregg.nanocorp.app/api/webhooks/nanocorp
```

Cette route est implémentée dans `src/app/api/webhooks/nanocorp/route.ts`.

---

## 3. Structure du payload reçu

```json
{
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "id": "cs_test_...",
      "amount_total": 2500,
      "currency": "eur",
      "payment_status": "paid",
      "customer_details": {
        "email": "client@exemple.com",
        "name": "Jean Dupont"
      },
      "metadata": {
        "plan": "7j"
      }
    }
  }
}
```

Champs utilisés :
- `data.object.id` → `session_id` (clé d'idempotence)
- `data.object.customer_details.email` → email du client
- `data.object.metadata.plan` → plan acheté (`3j` | `7j` | `14j` | `1mois`)
- `data.object.amount_total` → montant en centimes (2500 = 25,00 €)

### Ajout du metadata `plan` dans les liens Stripe

Puisque NanoCorp utilise un lien de paiement partagé, le `plan` n'est pas automatiquement
inclus dans les métadonnées. Le webhook **infère le plan depuis le montant** :

| Montant (centimes) | Plan déduit |
|--------------------|------------|
| ≤ 1 000 (10 €) | `3j` |
| ≤ 2 500 (25 €) | `7j` |
| ≤ 4 000 (40 €) | `14j` |
| > 4 000 (65 €) | `1mois` |

Pour une meilleure précision, créez un **lien de paiement dédié par plan** avec
`metadata.plan` configuré dans le Dashboard Stripe. Si `metadata.plan` est présent,
il prend priorité sur la déduction par montant.

---

## 4. Flow post-paiement

```
Client paie → Stripe → NanoCorp → POST /api/webhooks/nanocorp
                                         ↓
                              Stockage en base PostgreSQL
                              (session_id, email, plan, montant)

Navigateur → /checkout/success?session_id=cs_...
                   ↓ (attente 2s + fetch GET /api/session/{id})
             /questionnaire?email=...&plan=...&session_id=...
```

### Page de succès
`/checkout/success` — affiche une confirmation de paiement et redirige
automatiquement vers `/questionnaire` avec email et plan pré-remplis.

---

## 5. Variables d'environnement

### Ce qui est nécessaire

| Variable | Description | Requis |
|----------|-------------|--------|
| `DATABASE_URL` | Connexion PostgreSQL (déjà configurée par NanoCorp) | ✅ |

### Ce qui n'est PAS nécessaire sur NanoCorp

| Variable | Raison |
|----------|--------|
| `STRIPE_SECRET_KEY` | NanoCorp gère le compte Stripe |
| `STRIPE_WEBHOOK_SECRET` | Pas de signature à vérifier côté NanoCorp |

### Vérifier DATABASE_URL sur Vercel

```bash
nanocorp vercel env set DATABASE_URL "$(echo $DATABASE_URL)"
```

Ou via le dashboard Vercel → Settings → Environment Variables.

---

## 6. Schéma base de données

Table créée automatiquement lors du premier déploiement :

```sql
CREATE TABLE IF NOT EXISTS payment_sessions (
  session_id  TEXT PRIMARY KEY,
  email       TEXT,
  plan        TEXT,
  amount_cents INTEGER,
  currency    TEXT DEFAULT 'eur',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

Pour créer manuellement :
```bash
psql $DATABASE_URL -c "
CREATE TABLE IF NOT EXISTS payment_sessions (
  session_id TEXT PRIMARY KEY,
  email TEXT,
  plan TEXT,
  amount_cents INTEGER,
  currency TEXT DEFAULT 'eur',
  created_at TIMESTAMPTZ DEFAULT NOW()
);"
```

---

## 7. Tester le webhook en local

Simuler un event NanoCorp depuis le terminal :

```bash
curl -X POST http://localhost:3000/api/webhooks/nanocorp \
  -H "Content-Type: application/json" \
  -H "X-NanoCorp-Event: checkout.session.completed" \
  -d '{
    "type": "checkout.session.completed",
    "data": {
      "object": {
        "id": "cs_test_local_123",
        "amount_total": 2500,
        "currency": "eur",
        "payment_status": "paid",
        "customer_details": {
          "email": "test@exemple.com",
          "name": "Test User"
        },
        "metadata": {
          "plan": "7j"
        }
      }
    }
  }'
```

Réponse attendue : `{"received":true}`

Vérifier en base :
```bash
psql $DATABASE_URL -c "SELECT * FROM payment_sessions WHERE session_id = 'cs_test_local_123';"
```

---

## 8. Checklist de mise en production

- [x] Route webhook créée : `src/app/api/webhooks/nanocorp/route.ts`
- [x] Table PostgreSQL `payment_sessions` créée
- [x] Page de succès : `src/app/checkout/success/page.tsx`
- [x] API session : `src/app/api/session/[sessionId]/route.ts`
- [x] `DATABASE_URL` disponible en production (Vercel)
- [ ] Vérifier que NanoCorp redirige bien vers `/checkout/success` après paiement
- [ ] Tester un paiement réel et vérifier l'entrée en base
- [ ] Mettre à jour les liens du panier pour avoir un lien par plan (optionnel, pour metadata précis)
