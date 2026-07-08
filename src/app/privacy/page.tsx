"use client";

import { useState } from "react";
import Link from "next/link";
import { useMode } from "@/lib/mode-theme";

const SECTIONS_FR = [
  {
    id: "qui",
    title: "1. Qui sommes-nous ?",
    body: `Travel IA est un service de génération de guides de voyage personnalisés par intelligence artificielle, édité par NanoCorp.

**Contact :** travel-ia@nanocorp.app
**Site :** https://travelguide-ai.com

Pour toute question relative à vos données personnelles, écrivez-nous directement à l'adresse ci-dessus.`,
  },
  {
    id: "collecte",
    title: "2. Quelles données collectons-nous ?",
    body: `Nous ne collectons que le strict nécessaire :

**Données de compte :**
- Adresse e-mail : pour créer votre compte, vous livrer votre guide et vous contacter sur votre commande uniquement.
- Mot de passe : stocké sous forme chiffrée (hachage bcrypt). Nous n'y avons pas accès.

**Numéro de téléphone :**
- Collecté uniquement pour la vérification d'identité par SMS (code OTP via Twilio).
- Non utilisé à des fins commerciales, non revendu, non partagé à des tiers non mentionnés.

**Données du questionnaire de voyage :**
- Destination, dates, préférences de voyage, style de voyage, budget, intérêts.
- Ces données sont **non sensibles** (aucune donnée de santé, aucune donnée financière précise, aucune opinion politique).
- Elles sont transmises à notre IA entraînée uniquement pour générer votre guide personnalisé.

**Données de paiement :**
- Gérées exclusivement par Stripe. Nous ne voyons ni ne stockons jamais votre numéro de carte bancaire.

**Données de navigation (analytics) :**
- PostHog collecte des données anonymisées sur l'utilisation du site (pages visitées, clics) afin d'améliorer l'expérience utilisateur. Ces données ne permettent pas de vous identifier personnellement.`,
  },
  {
    id: "ia",
    title: "3. L'IA et vos données — ce que vous devez savoir",
    body: `**Comment l'IA utilise vos données :**

Vos réponses au questionnaire (destination, préférences, dates) sont envoyées à notre IA entraînée pour générer votre guide de voyage. C'est la raison d'être du service.

**Ce que l'IA ne reçoit PAS :**
- Votre nom complet
- Votre adresse e-mail
- Votre numéro de téléphone
- Vos coordonnées bancaires

**Important :** N'incluez dans vos réponses et vos notes libres **aucune information personnelle sensible** (numéro de sécurité sociale, données médicales précises, coordonnées bancaires, mots de passe, etc.). Ces informations n'ont aucune utilité pour générer votre guide et leur traitement par une IA tiers n'est pas couvert par cette politique.

Notre IA entraînée n'utilise pas les données soumises pour s'améliorer. Les données du questionnaire sont traitées uniquement pour générer votre guide, sans aucune réutilisation à des fins d'entraînement.`,
  },
  {
    id: "utilisation",
    title: "4. Comment utilisons-nous vos données ?",
    body: `| Donnée | Utilisation | Base légale |
|--------|-------------|-------------|
| E-mail | Livraison du guide, confirmation d'achat, support client | Exécution du contrat |
| E-mail (newsletter) | Envoi d'actualités Travel IA | Consentement explicite |
| Téléphone | Vérification OTP, déblocage code promo WELCOME | Intérêt légitime / consentement |
| Questionnaire | Génération de votre guide par IA | Exécution du contrat |
| Paiement | Traitement de la transaction | Exécution du contrat |
| Analytics | Amélioration du service | Intérêt légitime |

**Ce que nous ne faisons JAMAIS :**
- Revendre vos données à des tiers
- Utiliser votre e-mail à des fins publicitaires sans votre consentement
- Partager vos informations avec des annonceurs
- Créer des profils publicitaires`,
  },
  {
    id: "newsletter",
    title: "5. Newsletter et communications",
    body: `**Inscription à la newsletter :**
- Uniquement sur inscription volontaire (pop-up ou formulaire dédié).
- Vous pouvez vous désinscrire à tout moment via le lien présent dans chaque e-mail.

**E-mails liés à votre achat :**
- Confirmation de commande
- Livraison de votre guide PDF
- Réponses à vos demandes de support

Nous ne vous enverrons **jamais** d'e-mails commerciaux non sollicités.`,
  },
  {
    id: "soustraitants",
    title: "6. Sous-traitants et transferts de données",
    body: `Nous faisons appel aux prestataires suivants. Chacun est soumis à des contrats de traitement conformes au RGPD :

| Prestataire | Rôle | Localisation |
|-------------|------|--------------|
| **Supabase** | Base de données, authentification | UE (hébergement AWS eu-central) |
| **Vercel** | Hébergement du site web | UE / USA (Standard Contractual Clauses) |
| **Stripe** | Paiement en ligne | USA (SCC + Privacy Shield) |
| **Twilio** | Vérification SMS (OTP) | USA (SCC) |
| **IA entraînée** | Génération du guide par IA | Données questionnaire uniquement, non personnelles |
| **PostHog** | Analytics anonymisés | EU Cloud |

Aucun autre tiers n'a accès à vos données personnelles.`,
  },
  {
    id: "conservation",
    title: "7. Durée de conservation",
    body: `- **Compte et e-mail :** conservés tant que votre compte est actif, puis supprimés sous 30 jours après demande de clôture.
- **Numéro de téléphone :** conservé jusqu'à suppression du compte.
- **Données du questionnaire :** conservées dans votre historique de commande pour vous permettre de les consulter. Supprimées à la clôture du compte.
- **Données de paiement :** gérées par Stripe selon ses propres règles de conservation (obligations légales comptables — 10 ans).
- **Logs de navigation (PostHog) :** 12 mois, données anonymisées.`,
  },
  {
    id: "droits",
    title: "8. Vos droits RGPD",
    body: `Conformément au Règlement Général sur la Protection des Données (RGPD — UE 2016/679), vous disposez des droits suivants :

- **Droit d'accès** : obtenir une copie de vos données personnelles
- **Droit de rectification** : corriger des données inexactes
- **Droit à l'effacement** ("droit à l'oubli") : demander la suppression de vos données
- **Droit à la portabilité** : recevoir vos données dans un format lisible
- **Droit d'opposition** : vous opposer à certains traitements (ex. newsletter)
- **Droit à la limitation** : restreindre le traitement dans certains cas

**Pour exercer vos droits :** Contactez-nous à travel-ia@nanocorp.app avec une preuve d'identité. Nous répondons sous 30 jours.

En cas de litige, vous pouvez également saisir la **CNIL** : cnil.fr`,
  },
  {
    id: "cookies",
    title: "9. Cookies et traceurs",
    body: `**Cookies strictement nécessaires :** Session utilisateur (JWT chiffré). Indispensable au fonctionnement du service. Durée : 7 jours.

**Cookies analytics (PostHog) :** Analyse anonymisée de l'utilisation. Vous pouvez les refuser sans impact sur le service.

Aucun cookie publicitaire ou de tracking tiers n'est déposé sur votre navigateur.`,
  },
  {
    id: "contact",
    title: "10. Contact & mise à jour",
    body: `**Contact DPO / Privacy :** travel-ia@nanocorp.app

Cette politique peut être mise à jour. La date de dernière modification est indiquée en haut de page. En cas de modification substantielle, vous serez informé par e-mail.

**Version actuelle :** Juin 2026`,
  },
];

const SECTIONS_EN = [
  {
    id: "qui",
    title: "1. Who are we?",
    body: `Travel IA is an AI-powered personalized travel guide generation service, published by NanoCorp.

**Contact:** travel-ia@nanocorp.app
**Website:** https://travelguide-ai.com

For any questions regarding your personal data, write to us directly at the address above.`,
  },
  {
    id: "collecte",
    title: "2. What data do we collect?",
    body: `We only collect what is strictly necessary:

**Account data:**
- Email address: to create your account, deliver your guide and contact you about your order only.
- Password: stored in encrypted form (bcrypt hash). We do not have access to it.

**Phone number:**
- Collected solely for SMS identity verification (OTP code via Twilio).
- Not used for commercial purposes, not resold, not shared with unlisted third parties.

**Travel questionnaire data:**
- Destination, dates, travel preferences, travel style, budget, interests.
- This data is **non-sensitive** (no health data, no precise financial data, no political opinions).
- It is transmitted to our trained AI solely to generate your personalized guide.

**Payment data:**
- Managed exclusively by Stripe. We never see or store your credit card number.

**Navigation data (analytics):**
- PostHog collects anonymized data about site usage (pages visited, clicks) to improve user experience. This data cannot personally identify you.`,
  },
  {
    id: "ia",
    title: "3. AI and your data — what you need to know",
    body: `**How AI uses your data:**

Your questionnaire answers (destination, preferences, dates) are sent to our trained AI to generate your travel guide. This is the core purpose of the service.

**What AI does NOT receive:**
- Your full name
- Your email address
- Your phone number
- Your banking details

**Important:** Do not include in your answers and free-text notes **any sensitive personal information** (social security number, precise medical data, banking details, passwords, etc.). This information is of no use for generating your guide and its processing by a third-party AI is not covered by this policy.

Our trained AI does not use submitted data to improve itself. Questionnaire data is processed solely to generate your guide, with no reuse for training purposes.`,
  },
  {
    id: "utilisation",
    title: "4. How do we use your data?",
    body: `| Data | Use | Legal basis |
|------|-----|-------------|
| Email | Guide delivery, purchase confirmation, customer support | Contract performance |
| Email (newsletter) | Sending Travel IA news | Explicit consent |
| Phone | OTP verification, WELCOME promo code unlock | Legitimate interest / consent |
| Questionnaire | AI guide generation | Contract performance |
| Payment | Transaction processing | Contract performance |
| Analytics | Service improvement | Legitimate interest |

**What we NEVER do:**
- Sell your data to third parties
- Use your email for advertising without your consent
- Share your information with advertisers
- Create advertising profiles`,
  },
  {
    id: "newsletter",
    title: "5. Newsletter and communications",
    body: `**Newsletter subscription:**
- Only on voluntary subscription (pop-up or dedicated form).
- You can unsubscribe at any time via the link in every email.

**Purchase-related emails:**
- Order confirmation
- PDF guide delivery
- Responses to your support requests

We will **never** send you unsolicited commercial emails.`,
  },
  {
    id: "soustraitants",
    title: "6. Sub-processors and data transfers",
    body: `We use the following providers. Each is subject to GDPR-compliant processing contracts:

| Provider | Role | Location |
|----------|------|----------|
| **Supabase** | Database, authentication | EU (AWS eu-central hosting) |
| **Vercel** | Website hosting | EU / USA (Standard Contractual Clauses) |
| **Stripe** | Online payment | USA (SCC + Privacy Shield) |
| **Twilio** | SMS verification (OTP) | USA (SCC) |
| **Trained AI** | AI guide generation | Questionnaire data only, non-personal |
| **PostHog** | Anonymized analytics | EU Cloud |

No other third party has access to your personal data.`,
  },
  {
    id: "conservation",
    title: "7. Data retention",
    body: `- **Account and email:** retained while your account is active, then deleted within 30 days of closure request.
- **Phone number:** retained until account deletion.
- **Questionnaire data:** retained in your order history for your reference. Deleted upon account closure.
- **Payment data:** managed by Stripe according to its own retention rules (legal accounting obligations — 10 years).
- **Navigation logs (PostHog):** 12 months, anonymized data.`,
  },
  {
    id: "droits",
    title: "8. Your GDPR rights",
    body: `Under the General Data Protection Regulation (GDPR — EU 2016/679), you have the following rights:

- **Right of access**: obtain a copy of your personal data
- **Right of rectification**: correct inaccurate data
- **Right to erasure** ("right to be forgotten"): request deletion of your data
- **Right to portability**: receive your data in a readable format
- **Right to object**: object to certain processing (e.g. newsletter)
- **Right to restriction**: restrict processing in certain cases

**To exercise your rights:** Contact us at travel-ia@nanocorp.app with proof of identity. We respond within 30 days.

In case of dispute, you can also contact the **ICO** (UK) or your national data protection authority.`,
  },
  {
    id: "cookies",
    title: "9. Cookies and trackers",
    body: `**Strictly necessary cookies:** User session (encrypted JWT). Essential to the service. Duration: 7 days.

**Analytics cookies (PostHog):** Anonymized usage analysis. You can refuse them without any impact on the service.

No advertising or third-party tracking cookies are placed on your browser.`,
  },
  {
    id: "contact",
    title: "10. Contact & updates",
    body: `**DPO / Privacy contact:** travel-ia@nanocorp.app

This policy may be updated. The last modification date is shown at the top of the page. In case of substantial changes, you will be notified by email.

**Current version:** June 2026`,
  },
];

const UI = {
  fr: {
    back: "← Retour au site",
    badge: "RGPD conforme · Juin 2026",
    title: "Politique de Confidentialité",
    subtitle: "Transparent sur ce que nous faisons de vos données. Aucune surprise, aucune revente.",
    cards: [
      { title: "Zéro revente", desc: "Vos données ne sont jamais vendues à des tiers ou annonceurs." },
      { title: "IA sans données perso", desc: "Notre IA entraînée reçoit uniquement vos préférences de voyage, pas votre email ni téléphone." },
      { title: "Email = commande only", desc: "On vous écrit uniquement pour votre guide et votre commande. Newsletter = opt-in." },
    ],
    toc: "Sommaire",
  },
  en: {
    back: "← Back to site",
    badge: "GDPR compliant · June 2026",
    title: "Privacy Policy",
    subtitle: "Transparent about what we do with your data. No surprises, no selling.",
    cards: [
      { title: "Zero resale", desc: "Your data is never sold to third parties or advertisers." },
      { title: "AI without personal data", desc: "Our trained AI receives only your travel preferences, not your email or phone." },
      { title: "Email = order only", desc: "We only email you about your guide and order. Newsletter = opt-in." },
    ],
    toc: "Contents",
  },
};

export default function PrivacyPage() {
  const [activeSection, setActiveSection] = useState<string>("qui");
  const [lang, setLang] = useState<"fr" | "en">("fr");
  const { isBusiness } = useMode();
  const sections = lang === "fr" ? SECTIONS_FR : SECTIONS_EN;
  const ui = UI[lang];
  const brandName = isBusiness ? "Travel Business" : "TravelGuide";
  const backHref = isBusiness ? "/business" : "/personal";

  function renderBody(text: string) {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      if (line.startsWith("| ")) return null;
      const bold = line.replace(/\*\*(.*?)\*\*/g, "<strong style='color:var(--cs)'>$1</strong>");
      if (line.startsWith("- ")) return <li key={i} className="ml-4 list-disc" dangerouslySetInnerHTML={{ __html: bold.slice(2) }} />;
      if (/^\d+\. /.test(line)) return <li key={i} className="ml-4 list-decimal" dangerouslySetInnerHTML={{ __html: bold.replace(/^\d+\. /, "") }} />;
      if (line.startsWith("> ")) return (
        <blockquote key={i} className="border-l-4 pl-4 my-3 py-2 pr-2 rounded-r text-sm italic" style={{ borderColor: "var(--ca)", background: "var(--csh)", color: "var(--cm)" }}>
          {line.slice(2)}
        </blockquote>
      );
      if (line.trim() === "") return <br key={i} />;
      return <p key={i} className="mb-1" dangerouslySetInnerHTML={{ __html: bold }} />;
    });
  }

  function renderSection(body: string) {
    const blocks = body.split("\n\n");
    return blocks.map((block, j) => {
      if (block.trim().startsWith("|")) {
        const rows = block.trim().split("\n").filter(r => !r.match(/^\|[-\s|]+$/));
        const headers = rows[0].split("|").filter(Boolean).map(h => h.trim());
        const dataRows = rows.slice(1);
        return (
          <div key={j} className="overflow-x-auto my-3">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr style={{ background: "var(--ce)" }}>
                  {headers.map((h, k) => <th key={k} className="px-3 py-2 text-left font-semibold" style={{ color: "var(--ct)" }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {dataRows.map((row, k) => {
                  const cells = row.split("|").filter(Boolean).map(c => c.trim());
                  return (
                    <tr key={k} style={{ background: k % 2 === 0 ? "var(--cd)" : "var(--cc)" }}>
                      {cells.map((cell, l) => (
                        <td key={l} className="px-3 py-2 border-b" style={{ borderColor: "var(--ce)", color: "var(--cm)" }} dangerouslySetInnerHTML={{ __html: cell.replace(/\*\*(.*?)\*\*/g, "<strong style='color:var(--cs)'>$1</strong>") }} />
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      }
      return (
        <div key={j} className="mb-2 space-y-1">
          {renderBody(block)}
        </div>
      );
    });
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--cb)", fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
      <header className="sticky top-0 z-10 backdrop-blur border-b" style={{ background: "var(--cb)", borderColor: "var(--ce)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href={backHref} className="text-sm font-medium transition-colors" style={{ color: "var(--cm)" }}>
            {ui.back}
          </Link>
          <span className="font-bold" style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--ct)" }}>{brandName}</span>
          <div className="flex items-center gap-1 rounded-lg p-1" style={{ background: "var(--cc)", border: "1px solid var(--ce)" }}>
            {(["fr", "en"] as const).map(l => (
              <button key={l} onClick={() => setLang(l)}
                className="rounded-md px-2 py-0.5 text-xs font-bold transition-all"
                style={lang === l ? { background: "var(--ce)", color: "var(--ct)" } : { color: "var(--cm)", opacity: 0.6 }}>
                {l === "fr" ? "🇫🇷 FR" : "🇬🇧 EN"}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4" style={{ background: "var(--cc)", border: "1px solid var(--ce)" }}>
            <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--cm)" }}>{ui.badge}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3" style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--ct)" }}>
            {ui.title}
          </h1>
          <p className="max-w-xl mx-auto text-base" style={{ color: "var(--cm)" }}>
            {ui.subtitle}
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-14">
          {ui.cards.map(card => (
            <div key={card.title} className="rounded-2xl p-5 text-center" style={{ border: "1px solid var(--ce)", background: "var(--cc)" }}>
              <div className="font-bold text-sm mb-1" style={{ color: "var(--ct)" }}>{card.title}</div>
              <p className="text-xs leading-relaxed" style={{ color: "var(--cm)" }}>{card.desc}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[220px_1fr] gap-8">
          <nav className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl p-4" style={{ border: "1px solid var(--ce)", background: "var(--cc)" }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--cf)" }}>{ui.toc}</p>
              <ul className="space-y-1">
                {sections.map(s => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      onClick={() => setActiveSection(s.id)}
                      className="block text-xs py-1.5 px-2 rounded-lg transition-colors"
                      style={activeSection === s.id
                        ? { background: "var(--ce)", color: "var(--ct)", fontWeight: 600 }
                        : { color: "var(--cm)" }}
                      onMouseEnter={e => { if (activeSection !== s.id) (e.currentTarget as HTMLElement).style.background = "var(--csh)"; }}
                      onMouseLeave={e => { if (activeSection !== s.id) (e.currentTarget as HTMLElement).style.background = ""; }}
                    >
                      {s.title.replace(/^\d+\.\s/, "")}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          <div className="space-y-10">
            <div className="rounded-2xl px-5 py-4 text-sm" style={{ border: "1px solid var(--ca)", background: "var(--caf)", color: "var(--ca)" }}>
              <span className="font-bold">Information importante :</span> N&apos;incluez jamais d&apos;informations sensibles (données médicales précises, coordonnées bancaires, mots de passe) dans les notes libres du questionnaire. Ces données seraient traitées par l&apos;IA sans les garanties adaptées.
            </div>

            {sections.map(section => (
              <section key={section.id} id={section.id}>
                <h2 className="text-lg font-bold mb-3 pb-2 border-b" style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--ct)", borderColor: "var(--ce)" }}>
                  {section.title}
                </h2>
                <div className="text-sm leading-relaxed space-y-3" style={{ color: "var(--cm)" }}>
                  {renderSection(section.body)}
                </div>
              </section>
            ))}
          </div>
        </div>

        <div className="mt-16 pt-8 border-t text-center text-xs" style={{ borderColor: "var(--ce)", color: "var(--cf)" }}>
          <p>© 2026 Travel IA · <a href="mailto:travel-ia@nanocorp.app" className="underline" style={{ color: "var(--cf)" }}>travel-ia@nanocorp.app</a></p>
          <p className="mt-1">Pour exercer vos droits RGPD, contactez-nous. Nous répondons sous 30 jours.</p>
        </div>
      </main>
    </div>
  );
}
