"use client";

import { useState } from "react";
import Link from "next/link";
import { useMode } from "@/lib/mode-theme";

const CONTACT = "travel-ia@nanocorp.app";
const SITE_URL = "https://travel-ia.nanocorp.app";

const content = {
  fr: {
    lang: "FR",
    title: "Conditions Générales de Vente",
    subtitle: "Travel IA — Version juin 2026",
    back: "← Retour au site",
    note: "Document juridiquement contraignant soumis au droit français. En cas de divergence entre la version française et toute autre version, la version française prévaut.",
    sections: [
      {
        id: "art1",
        title: "Article 1 — Identification du Vendeur",
        body: `Les présentes Conditions Générales de Vente (« CGV ») régissent les relations contractuelles entre :

**Le Vendeur :**
- Raison sociale : Travel IA, exploité sous l'enseigne NanoCorp
- Statut : Auto-entrepreneur (micro-entreprise)
- SIRET : [À COMPLÉTER]
- Adresse : [À COMPLÉTER], France
- Email de contact : ${CONTACT}
- Site web : ${SITE_URL}

Et toute personne physique ou morale (« le Client ») passant commande sur le Site Travel IA (${SITE_URL}).`,
      },
      {
        id: "art2",
        title: "Article 2 — Objet et Champ d'Application",
        body: `Les présentes CGV définissent les droits et obligations des parties dans le cadre de la vente en ligne de contenus numériques via Travel IA.

Elles s'appliquent sans restriction ni réserve à toutes les commandes passées sur le Site par tout Client, qu'il soit consommateur ou professionnel, résidant en France ou à l'étranger.

En validant sa commande, le Client reconnaît avoir pris connaissance des présentes CGV et les accepter sans réserve. Les présentes CGV prévalent sur tout document émanant du Client.`,
      },
      {
        id: "art3",
        title: "Article 3 — Description du Service",
        body: `**3.1 Nature du service**
Travel IA est un service de génération automatisée de guides de voyage personnalisés par intelligence artificielle. Le guide est créé à partir des réponses fournies par le Client dans un questionnaire de personnalisation.

**3.2 Format de livraison**
Chaque guide est livré en format **PDF**, téléchargeable depuis l'espace client et envoyé par email à l'adresse fournie lors de la commande.

**3.3 Délais de livraison**
- Délai standard : quelques minutes après validation du questionnaire.
- Délai maximum garanti : 24 heures ouvrées à compter de la validation du questionnaire.

**3.4 Langue du guide**
Le guide est généré dans la langue choisie par le Client lors du questionnaire (français ou anglais).`,
      },
      {
        id: "art4",
        title: "Article 4 — Prix et TVA",
        body: `**Grille tarifaire TravelGuide (mode personnel) :**

| Offre | Durée du voyage | Prix TTC |
|---|---|---|
| Guide 3 jours | 1 à 3 jours | 3,00 € |
| Guide 7 jours | 4 à 7 jours | 6,00 € |
| Guide 14 jours | 8 à 14 jours | 12,00 € |
| Guide 1 mois | 15 à 30 jours | 18,00 € |

**Grille tarifaire Travel Business (mode professionnel) :**

| Offre | Durée | Prix TTC |
|---|---|---|
| Guide 7 jours (à la carte) | jusqu'à 7 jours | 6,00 € |
| Abonnement mensuel | 1 mois · 10 guides de 3j inclus | 20,00 € |

**TVA :** TVA non applicable — Article 293 B du CGI (micro-entreprise non soumise à la TVA).

Tous les prix sont indiqués en euros (€) toutes taxes comprises. Les prix applicables sont ceux affichés sur le Site au moment de la validation de la commande. Le Vendeur se réserve le droit de modifier ses tarifs à tout moment, sans préavis, les modifications ne s'appliquant pas aux commandes déjà passées.

Des codes promotionnels peuvent être proposés ponctuellement. Ils ne sont pas cumulables sauf mention contraire.`,
      },
      {
        id: "art5",
        title: "Article 5 — Processus de Commande",
        body: `La commande suit les étapes suivantes :

1. **Sélection de l'offre** sur la page de tarification du Site.
2. **Renonciation au droit de rétractation** — case à cocher obligatoire (Art. 6).
3. **Paiement sécurisé** via Stripe (carte bancaire Visa, Mastercard, American Express).
4. **Création ou connexion au compte client.**
5. **Complétion du questionnaire de personnalisation** (destination, dates, préférences, budget, etc.).
6. **Génération automatique du guide** par le système d'intelligence artificielle.
7. **Livraison** du guide dans l'espace client et par email (PDF).

Un email de confirmation est envoyé à l'adresse fournie dès réception et validation du paiement.

La commande n'est définitivement confirmée qu'après encaissement effectif du paiement par Stripe.`,
      },
      {
        id: "art6",
        title: "Article 6 — Droit de Rétractation et Renonciation",
        body: `**6.1 Principe légal**
Conformément aux articles L. 221-18 et suivants du Code de la consommation, le consommateur dispose d'un délai de 14 jours calendaires pour exercer son droit de rétractation à compter de la conclusion du contrat.

**6.2 Exception légale applicable**
Conformément à l'article L. 221-28, 13° du Code de la consommation, le droit de rétractation est exclu pour les contenus numériques non fournis sur un support matériel dont l'exécution a commencé après accord préalable exprès du consommateur et renoncement exprès à son droit de rétractation.

**6.3 Clause de renonciation — Obligatoire à la commande**

> Je reconnais avoir été informé(e) que ma commande porte sur un contenu numérique dont la livraison commence immédiatement après le paiement et la validation du questionnaire. En cochant cette case, je consens expressément à l'exécution immédiate du contrat et je renonce expressément et irrévocablement à mon droit de rétractation de 14 jours, conformément à l'article L. 221-28 du Code de la consommation.

Cette case est obligatoire pour valider la commande. La renonciation est enregistrée et horodatée avec l'adresse IP du Client.`,
      },
      {
        id: "art7",
        title: "Article 7 — Politique de Remboursement",
        body: `**7.1 Service non rendu dans les délais**
Si le guide n'est pas livré dans les 24 heures suivant la validation du questionnaire, le Client peut demander un remboursement intégral par email à ${CONTACT} en indiquant son numéro de commande. Le remboursement est effectué sous 14 jours par le même moyen de paiement.

**7.2 Guide livré**
Une fois le guide généré et mis à disposition dans l'espace client, aucun remboursement n'est accordé, conformément à la renonciation au droit de rétractation (Art. 6.3).

**7.3 Défaut grave ou erreur technique**
En cas de défaut grave et manifeste (destination entièrement erronée, document vide, erreur technique majeure rendant le guide inutilisable), le Client peut solliciter un remboursement total ou partiel à la discrétion du Vendeur, en adressant une demande motivée à ${CONTACT} dans les **7 jours** suivant la livraison, accompagnée d'une description précise du problème.

**7.4 Procédure**
Toute demande de remboursement doit être adressée par email à ${CONTACT} avec :
- La référence de commande
- L'adresse email utilisée lors de la commande
- Le motif détaillé de la demande`,
      },
      {
        id: "art8",
        title: "Article 8 — Limitation de Responsabilité — Contenu IA",
        body: `**8.1 Nature du contenu généré**
Les guides Travel IA sont générés automatiquement par un système d'intelligence artificielle entraînée et ne sont pas rédigés, relus ni vérifiés par un expert humain, un guide professionnel ou un agent de voyage agréé.

**8.2 Absence de garantie sur l'exactitude**
Le Vendeur ne garantit pas l'exactitude, l'exhaustivité, l'actualité ni la pertinence des informations contenues dans les guides, notamment :
- Horaires et jours d'ouverture des sites et établissements
- Tarifs d'entrée, de transport ou d'hébergement
- Disponibilités et capacités d'accueil
- Conditions d'accès (visa, vaccination, sécurité)
- Recommandations sanitaires ou sécuritaires

**8.3 Responsabilité du Client**
L'utilisation des informations du guide se fait entièrement sous la responsabilité du Client. Il est fortement recommandé de vérifier toutes les informations pratiques auprès des sources officielles (ambassades, offices de tourisme, sites gouvernementaux) avant et pendant le voyage.

**8.4 Plafond de responsabilité**
La responsabilité du Vendeur est, en tout état de cause, strictement limitée au montant effectivement payé par le Client pour la commande concernée. En aucun cas le Vendeur ne saurait être tenu responsable des préjudices indirects, immatériels ou consécutifs liés à l'utilisation du guide.`,
      },
      {
        id: "art9",
        title: "Article 9 — Propriété Intellectuelle",
        body: `**9.1 Titularité**
Les guides générés par Travel IA sont protégés par le droit de la propriété intellectuelle. Le Vendeur est titulaire des droits sur la structure, la mise en forme et les éléments distinctifs du guide.

**9.2 Licence accordée au Client**
Le Client bénéficie d'une licence personnelle, non exclusive, non cessible et non transférable, pour un usage strictement personnel et non commercial du guide.

**9.3 Utilisations autorisées**
- Consultation personnelle sur tout support
- Impression pour usage personnel
- Partage à titre gratuit avec des proches participant au même voyage

**9.4 Utilisations interdites**
Il est expressément interdit, sans accord écrit préalable du Vendeur, de :
- Revendre le guide ou en céder l'accès à titre onéreux
- Reproduire, diffuser ou distribuer le guide commercialement
- Exploiter le contenu du guide à des fins lucratives
- Créer des œuvres dérivées à des fins commerciales`,
      },
      {
        id: "art10",
        title: "Article 10 — Données Personnelles",
        body: `Le Vendeur traite les données personnelles des Clients conformément au Règlement Général sur la Protection des Données (RGPD — Règlement UE 2016/679) et à la loi Informatique et Libertés du 6 janvier 1978 modifiée.

**Données collectées :** adresse email, mot de passe (chiffré), numéro de téléphone (optionnel), données du questionnaire de voyage (destination, préférences, dates, budget).

**Finalités :** gestion de la commande, génération et livraison du guide, assistance client, amélioration du service.

**Durée de conservation :** données de compte conservées pendant la durée d'activité du compte + 3 ans. Données de paiement conservées selon les obligations légales comptables (10 ans).

**Droits des personnes :** droit d'accès, de rectification, d'effacement, d'opposition, de limitation et de portabilité. Pour exercer ces droits, contactez : ${CONTACT}

**Politique complète :** consultez la Politique de Confidentialité sur le Site.
**Autorité de contrôle :** CNIL — https://www.cnil.fr`,
      },
      {
        id: "art11",
        title: "Article 11 — Médiation et Règlement des Litiges",
        body: `**11.1 Réclamation préalable obligatoire**
Avant toute procédure contentieuse, le Client est tenu d'adresser une réclamation écrite au Vendeur par email à ${CONTACT}. Le Vendeur s'engage à répondre dans un délai de 15 jours ouvrés.

**11.2 Médiation de la consommation**
Conformément aux articles L. 612-1 et suivants du Code de la consommation, en cas d'échec de la réclamation amiable, le Client consommateur peut saisir gratuitement un médiateur de la consommation agréé dans un délai maximum d'un an à compter de sa réclamation écrite :

- **FEVAD :** https://www.mediateurfevad.fr (commerce électronique)
- **CM2C :** https://cm2c.net
- **Liste officielle :** https://www.economie.gouv.fr/mediation-conso

**11.3 Plateforme européenne de règlement en ligne des litiges (RLL)**
Règlement en ligne des litiges UE : https://ec.europa.eu/consumers/odr/`,
      },
      {
        id: "art12",
        title: "Article 12 — Droit Applicable et Juridiction Compétente",
        body: `Les présentes CGV sont soumises au droit français.

En cas de litige persistant après tentative de médiation, les tribunaux français sont seuls compétents. Conformément à l'article R. 631-3 du Code de la consommation, pour les litiges de consommation, le tribunal du lieu de résidence du consommateur au moment de la conclusion du contrat est compétent.

Pour les litiges entre professionnels, les parties conviennent de la compétence exclusive des tribunaux du ressort du siège du Vendeur.`,
      },
      {
        id: "art13",
        title: "Article 13 — Dispositions Diverses",
        body: `**13.1 Intégralité**
Les présentes CGV constituent l'intégralité de l'accord entre les parties relatif à leur objet et annulent et remplacent tout accord antérieur.

**13.2 Divisibilité**
Si une clause des présentes CGV était déclarée nulle ou inapplicable par une juridiction compétente, les autres clauses resteraient intégralement en vigueur.

**13.3 Non-renonciation**
Le fait pour le Vendeur de ne pas se prévaloir d'une clause ne vaut pas renonciation à s'en prévaloir ultérieurement.

**13.4 Mises à jour**
Le Vendeur se réserve le droit de modifier les présentes CGV à tout moment. Les nouvelles CGV s'appliquent aux commandes passées après leur publication sur le Site. La version applicable est celle en vigueur au moment de la validation de la commande.`,
      },
    ],
  },
  en: {
    lang: "EN",
    title: "Terms of Sale",
    subtitle: "Travel IA — June 2026",
    back: "← Back to site",
    note: "This is a faithful English translation for information purposes. In case of conflict, the French version prevails.",
    sections: [
      {
        id: "s1",
        title: "1. Seller Identification",
        body: `These Terms of Sale govern the contractual relationship between:

**The Seller:**
- Trading name: Travel IA, operated under NanoCorp
- Status: Self-employed entrepreneur (micro-entreprise — French sole trader)
- SIRET: [TO BE COMPLETED]
- Address: [TO BE COMPLETED], France
- Contact email: ${CONTACT}
- Website: ${SITE_URL}

And any individual or entity ("Customer") placing an order on Travel IA (${SITE_URL}).`,
      },
      {
        id: "s2",
        title: "2. Scope",
        body: `These Terms of Sale apply without restriction to all orders placed on the Site by any Customer, whether a consumer or a professional, residing in France or abroad.

By validating an order, the Customer acknowledges having read and accepted these Terms unconditionally.`,
      },
      {
        id: "s3",
        title: "3. Service Description",
        body: `Travel IA is an AI-powered service that automatically generates personalised travel guides based on the Customer's questionnaire responses.

**Delivery format:** PDF, downloadable from the customer account and sent by email.

**Delivery time:** A few minutes (maximum 24 business hours) after questionnaire submission.

**Language:** Guide generated in the language chosen by the Customer (French or English).`,
      },
      {
        id: "s4",
        title: "4. Pricing and VAT",
        body: `| Plan | Trip Duration | Price (incl. all taxes) |
|---|---|---|
| 3-day guide | 1–3 day trips | €3.00 |
| 7-day guide | 4–7 day trips | €6.00 |
| 14-day guide | 8–14 day trips | €12.00 |
| 1-month guide | 15–30 day trips | €18.00 |

**VAT:** Not applicable — Article 293 B of the French General Tax Code (micro-enterprise VAT exemption).

Prices are in euros (€) inclusive of all taxes. Promotional codes may be offered periodically and are not combinable unless stated otherwise.`,
      },
      {
        id: "s5",
        title: "5. Order Process",
        body: `1. Select a plan on the pricing page.
2. Check the mandatory withdrawal waiver box (Article 6).
3. Secure payment via Stripe (Visa, Mastercard, Amex).
4. Create or log in to your customer account.
5. Complete the personalisation questionnaire.
6. AI generates your guide automatically.
7. Guide delivered to your account and by email (PDF).

An order confirmation email is sent upon receipt and validation of payment.`,
      },
      {
        id: "s6",
        title: "6. Right of Withdrawal and Waiver",
        body: `Under EU Directive 2011/83/EU and Articles L. 221-18 et seq. of the French Consumer Code, consumers have a 14-day right of withdrawal from the date of contract conclusion.

**Applicable exception:** Under Article L. 221-28, 13° of the French Consumer Code, this right does not apply to digital content not supplied on a physical medium where performance has begun with the consumer's prior express consent and express waiver of the right of withdrawal.

**Mandatory waiver checkbox:**

> I acknowledge that my order concerns digital content whose delivery begins immediately after payment and questionnaire validation. By checking this box, I expressly consent to the immediate performance of the contract and expressly and irrevocably waive my 14-day right of withdrawal under Article L. 221-28 of the French Consumer Code.

This checkbox is mandatory. The waiver is recorded with a timestamp and IP address.`,
      },
      {
        id: "s7",
        title: "7. Refund Policy",
        body: `**Guide not delivered on time:** If the guide is not delivered within 24 business hours, the Customer is entitled to a full refund. Contact ${CONTACT} with your order reference.

**Guide already delivered:** No refund is possible once the guide has been generated and made available, in accordance with the withdrawal waiver (Article 6).

**Serious defect** (entirely wrong destination, blank document, major technical error making the guide unusable): partial or full refund at the Seller's discretion, upon written request to ${CONTACT} within 7 days of delivery, with a detailed description of the issue.`,
      },
      {
        id: "s8",
        title: "8. AI Content — Liability Disclaimer",
        body: `Travel guides are generated entirely by a trained AI system and are not written, reviewed or verified by any human expert, professional guide or licensed travel agent.

The Seller makes **no warranty** on the accuracy, completeness, currency or relevance of information, including opening hours, prices, availability, entry requirements (visas, vaccinations) or safety conditions.

**Use of the guide is entirely at the Customer's own risk.** Always verify practical details with official sources (embassies, tourism boards, government websites) before and during travel.

The Seller's total liability is strictly limited to the amount paid by the Customer for the relevant order. The Seller shall not be liable for any indirect, consequential or intangible loss arising from use of the guide.`,
      },
      {
        id: "s9",
        title: "9. Intellectual Property",
        body: `The Customer receives a personal, non-exclusive, non-transferable licence for **personal, non-commercial use only**.

Permitted uses: personal consultation, personal printing, free sharing with travel companions.

Prohibited without prior written consent: resale, commercial distribution, commercial reproduction, or commercial derivative works based on guide content.`,
      },
      {
        id: "s10",
        title: "10. Personal Data",
        body: `The Seller processes personal data in compliance with the GDPR (EU Regulation 2016/679). Data is used solely to process orders, deliver the guide and improve the service.

Data subject rights (access, rectification, erasure, objection, portability): contact ${CONTACT}

Full details: see the Privacy Policy on the Site.
Supervisory authority: CNIL — https://www.cnil.fr`,
      },
      {
        id: "s11",
        title: "11. Dispute Resolution",
        body: `**Step 1 — Amicable resolution:** contact the Seller at ${CONTACT}. The Seller undertakes to respond within 15 business days.

**Step 2 — Consumer mediation:** if unresolved, consumers may refer the dispute free of charge to a certified mediator within one year of their written complaint:
- FEVAD: https://www.mediateurfevad.fr
- EU ODR platform: https://ec.europa.eu/consumers/odr/`,
      },
      {
        id: "s12",
        title: "12. Governing Law and Jurisdiction",
        body: `These Terms are governed by French law. In the event of an unresolved dispute after mediation, the competent French courts shall have exclusive jurisdiction.

For consumer disputes, the court of the consumer's place of residence at the time of contract conclusion has jurisdiction (Article R. 631-3 of the French Consumer Code).`,
      },
    ],
  },
};

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

function renderSection(body: string, brand = "TravelGuide") {
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

export default function CGVPage() {
  const [lang, setLang] = useState<"fr" | "en">("fr");
  const { isBusiness } = useMode();
  const t = content[lang];
  const brandName = isBusiness ? "Travel Business" : "TravelGuide";
  const backHref = isBusiness ? "/business" : "/personal";

  return (
    <div className="min-h-screen" style={{ background: "var(--cb)", fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
      <header className="sticky top-0 z-10 backdrop-blur border-b px-6 py-4" style={{ background: "var(--cb)", borderColor: "var(--ce)" }}>
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href={backHref} className="text-sm transition-colors" style={{ color: "var(--cm)" }}>
            {t.back}
          </Link>
          <span className="font-bold" style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--ct)" }}>{brandName}</span>
          <div className="flex items-center gap-1 rounded-lg p-0.5" style={{ border: "1px solid var(--ce)" }}>
            <button onClick={() => setLang("fr")} title="Passer en français" className={`rounded-md px-2 py-0.5 transition-all ${lang !== "fr" ? "opacity-40 hover:opacity-70" : ""}`} style={lang === "fr" ? { background: "var(--ce)" } : {}}>
              <img src="https://flagcdn.com/w40/fr.png" width="24" height="16" alt="FR" style={{display:"inline",borderRadius:"2px"}} />
            </button>
            <button onClick={() => setLang("en")} title="Switch to English" className={`rounded-md px-2 py-0.5 transition-all ${lang !== "en" ? "opacity-40 hover:opacity-70" : ""}`} style={lang === "en" ? { background: "var(--ce)" } : {}}>
              <img src="https://flagcdn.com/w40/gb.png" width="24" height="16" alt="GB" style={{display:"inline",borderRadius:"2px"}} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--ct)" }}>
            {t.title}
          </h1>
          <p className="text-sm" style={{ color: "var(--cm)" }}>{t.subtitle}</p>
          <p className="mt-3 text-xs italic border-l-2 pl-3" style={{ color: "var(--cf)", borderColor: "var(--ca)" }}>{t.note}</p>
        </div>

        <div className="space-y-8">
          {t.sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-20">
              <h2 className="text-lg font-semibold mb-3 pb-1 border-b" style={{ color: "var(--ct)", borderColor: "var(--ce)" }}>
                {section.title}
              </h2>
              <div className="text-sm leading-relaxed" style={{ color: "var(--cm)" }}>
                {renderSection(section.body, brandName)}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t text-center text-xs" style={{ borderColor: "var(--ce)", color: "var(--cf)" }}>
          <p>{brandName} — NanoCorp · {SITE_URL}</p>
          <p className="mt-1">
            {lang === "fr" ? `Pour toute question : ` : `For any question: `}
            <a href={`mailto:${CONTACT}`} className="underline" style={{ color: "var(--cf)" }}>{CONTACT}</a>
          </p>
        </div>
      </main>
    </div>
  );
}
