"use client";

import { useState } from "react";
import Link from "next/link";

const SECTIONS_FR = [
  {
    id: "qui",
    title: "1. Qui sommes-nous ?",
    body: `TravelGuide AI est un service de génération de guides de voyage personnalisés par intelligence artificielle, édité par NanoCorp.

**Contact :** travel-guide@nanocorp.app
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
| E-mail (newsletter) | Envoi d'actualités TravelGuide AI | Consentement explicite |
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

**Pour exercer vos droits :** Contactez-nous à travel-guide@nanocorp.app avec une preuve d'identité. Nous répondons sous 30 jours.

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
    body: `**Contact DPO / Privacy :** travel-guide@nanocorp.app

Cette politique peut être mise à jour. La date de dernière modification est indiquée en haut de page. En cas de modification substantielle, vous serez informé par e-mail.

**Version actuelle :** Juin 2026`,
  },
];

export default function PrivacyPage() {
  const [activeSection, setActiveSection] = useState<string>("qui");

  function renderBody(text: string) {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      if (line.startsWith("| ")) return null;
      const bold = line.replace(/\*\*(.*?)\*\*/g, "<strong class='text-[#b8cdb4]'>$1</strong>");
      if (line.startsWith("- ")) return <li key={i} className="ml-4 list-disc" dangerouslySetInnerHTML={{ __html: bold.slice(2) }} />;
      if (/^\d+\. /.test(line)) return <li key={i} className="ml-4 list-decimal" dangerouslySetInnerHTML={{ __html: bold.replace(/^\d+\. /, "") }} />;
      if (line.startsWith("> ")) return (
        <blockquote key={i} className="border-l-4 border-[#c9a84c]/40 pl-4 my-3 bg-[#1e2820] py-2 pr-2 rounded-r text-sm italic text-[#7a9076]">
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
                <tr className="bg-[#232c20]">
                  {headers.map((h, k) => <th key={k} className="px-3 py-2 text-left font-semibold text-[#d8e3d5]">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {dataRows.map((row, k) => {
                  const cells = row.split("|").filter(Boolean).map(c => c.trim());
                  return (
                    <tr key={k} className={k % 2 === 0 ? "bg-[#111810]" : "bg-[#161c14]"}>
                      {cells.map((cell, l) => (
                        <td key={l} className="px-3 py-2 border-b border-[#232c20] text-[#7a9076]" dangerouslySetInnerHTML={{ __html: cell.replace(/\*\*(.*?)\*\*/g, "<strong class='text-[#b8cdb4]'>$1</strong>") }} />
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
    <div className="min-h-screen bg-[#0e1310]" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
      <header className="sticky top-0 z-10 bg-[#0e1310]/95 backdrop-blur border-b border-[#232c20]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-sm text-[#7a9076] hover:text-[#d8e3d5] transition-colors font-medium">
            ← Retour au site
          </Link>
          <span className="font-bold text-[#d8e3d5]" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>TravelGuide AI</span>
          <div className="w-24" />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 bg-[#161c14] border border-[#232c20] rounded-full px-4 py-1.5 mb-4">
            <span className="text-xs font-bold text-[#7a9076] uppercase tracking-wide">RGPD conforme · Juin 2026</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#d8e3d5] mb-3" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
            Politique de Confidentialité
          </h1>
          <p className="text-[#7a9076] max-w-xl mx-auto text-base">
            Transparent sur ce que nous faisons de vos données. Aucune surprise, aucune revente.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-14">
          {[
            { title: "Zéro revente", desc: "Vos données ne sont jamais vendues à des tiers ou annonceurs." },
            { title: "IA sans données perso", desc: "Notre IA entraînée reçoit uniquement vos préférences de voyage, pas votre email ni téléphone." },
            { title: "Email = commande only", desc: "On vous écrit uniquement pour votre guide et votre commande. Newsletter = opt-in." },
          ].map(card => (
            <div key={card.title} className="rounded-2xl border border-[#232c20] bg-[#161c14] p-5 text-center">
              <div className="font-bold text-[#d8e3d5] text-sm mb-1">{card.title}</div>
              <p className="text-xs text-[#7a9076] leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[220px_1fr] gap-8">
          <nav className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-[#232c20] bg-[#161c14] p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-[#4a6447] mb-3">Sommaire</p>
              <ul className="space-y-1">
                {SECTIONS_FR.map(s => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      onClick={() => setActiveSection(s.id)}
                      className={`block text-xs py-1.5 px-2 rounded-lg transition-colors ${
                        activeSection === s.id
                          ? "bg-[#232c20] text-[#d8e3d5] font-semibold"
                          : "text-[#7a9076] hover:text-[#d8e3d5] hover:bg-[#1e2820]"
                      }`}
                    >
                      {s.title.replace(/^\d+\.\s/, "")}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          <div className="space-y-10">
            <div className="rounded-2xl border border-[#c9a84c]/20 bg-[#c9a84c]/5 px-5 py-4 text-sm text-[#c9a84c]">
              <span className="font-bold">Information importante :</span> N&apos;incluez jamais d&apos;informations sensibles (données médicales précises, coordonnées bancaires, mots de passe) dans les notes libres du questionnaire. Ces données seraient traitées par l&apos;IA sans les garanties adaptées.
            </div>

            {SECTIONS_FR.map(section => (
              <section key={section.id} id={section.id}>
                <h2 className="text-lg font-bold text-[#d8e3d5] mb-3 pb-2 border-b border-[#232c20]" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                  {section.title}
                </h2>
                <div className="text-sm text-[#7a9076] leading-relaxed space-y-3">
                  {renderSection(section.body)}
                </div>
              </section>
            ))}
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-[#232c20] text-center text-xs text-[#4a6447]">
          <p>© 2026 TravelGuide AI · <a href="mailto:travel-guide@nanocorp.app" className="underline hover:text-[#7a9076]">travel-guide@nanocorp.app</a></p>
          <p className="mt-1">Pour exercer vos droits RGPD, contactez-nous. Nous répondons sous 30 jours.</p>
        </div>
      </main>
    </div>
  );
}
