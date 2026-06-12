"use client";

import { useState } from "react";
import Link from "next/link";

const content = {
  fr: {
    lang: "FR",
    other: "🇬🇧",
    title: "Conditions Générales de Vente",
    subtitle: "TravelGuide AI — Version du [DATE À COMPLÉTER]",
    back: "← Retour au site",
    note: "Document juridiquement contraignant soumis au droit français.",
    sections: [
      {
        id: "art1",
        title: "Article 1 — Identification du Vendeur",
        body: `Les présentes Conditions Générales de Vente (« CGV ») régissent les relations contractuelles entre :

**Le Vendeur :**
- Nom / Raison sociale : [NOM PRÉNOM OU RAISON SOCIALE]
- Statut : Auto-entrepreneur
- SIRET : [NUMÉRO SIRET]
- Adresse : [ADRESSE COMPLÈTE], France
- Email de contact : [EMAIL DE CONTACT]

Et toute personne physique ou morale (« le Client ») passant commande sur le Site TravelGuide AI (https://spiregg.nanocorp.app).`,
      },
      {
        id: "art2",
        title: "Article 2 — Objet et Champ d'Application",
        body: `Les présentes CGV définissent les droits et obligations des parties dans le cadre de la vente en ligne de contenus numériques via TravelGuide AI. Elles s'appliquent sans restriction à toutes les commandes passées sur le Site. En passant commande, le Client accepte ces CGV sans réserve.`,
      },
      {
        id: "art3",
        title: "Article 3 — Description du Service",
        body: `**3.1 Nature du service**
TravelGuide AI génère automatiquement des guides de voyage personnalisés par intelligence artificielle, à partir d'un questionnaire rempli par le Client.

**3.2 Formats de livraison**
Chaque guide est livré sous deux formats :
- **PDF** : téléchargeable depuis l'espace client et envoyé par email.
- **Google Doc** : lien partagé accessible via l'adresse email du Client.

**3.3 Délais**
- Délai standard : quelques minutes après validation du questionnaire.
- Délai maximum garanti : 24 heures.`,
      },
      {
        id: "art4",
        title: "Article 4 — Prix et TVA",
        body: `**Grille tarifaire :**

| Offre | Durée | Prix |
|---|---|---|
| Guide 3 jours | 1 à 3 jours | 10,00 € |
| Guide 7 jours | 4 à 7 jours | 20,00 € |
| Guide 14 jours | 8 à 14 jours | 40,00 € |
| Guide 1 mois | 15 à 30 jours | 65,00 € |

**TVA :** [TVA non applicable — Art. 293 B CGI / ou TVA 20 % incluse — à compléter selon situation fiscale]

Les prix applicables sont ceux affichés sur le Site au moment de la validation de la commande.`,
      },
      {
        id: "art5",
        title: "Article 5 — Processus de Commande",
        body: `La commande suit les étapes suivantes :

1. **Sélection de l'offre** sur la page de tarification.
2. **Renonciation au droit de rétractation** (case à cocher obligatoire — Art. 6.3).
3. **Paiement sécurisé** via Stripe par carte bancaire.
4. **Création ou connexion au compte** client.
5. **Questionnaire de personnalisation** (destination, dates, préférences).
6. **Génération du guide** par le système IA.
7. **Livraison** dans l'espace client et par email (PDF + Google Doc).

Un email de confirmation est envoyé dès réception du paiement.`,
      },
      {
        id: "art6",
        title: "Article 6 — Droit de Rétractation et Clause de Renonciation",
        body: `**6.1 Principe légal**
Conformément à l'article L. 221-18 du Code de la consommation, le Client dispose d'un délai de 14 jours pour exercer son droit de rétractation.

**6.2 Exception applicable**
Conformément à l'article L. 221-28, 13° du Code de la consommation, ce droit est exclu pour les contenus numériques à exécution immédiate, dès lors que le Client y a consenti expressément et a expressément renoncé à son droit.

**6.3 Clause de renonciation — Case à cocher obligatoire**

> ☐ Je reconnais avoir été informé(e) que ma commande porte sur un contenu numérique dont la livraison débute immédiatement après le paiement et la validation du questionnaire. En cochant cette case, je consens expressément à l'exécution immédiate du contrat et je renonce expressément à mon droit de rétractation de 14 jours.

Cette case est obligatoire pour valider la commande. La renonciation est enregistrée et horodatée.`,
      },
      {
        id: "art7",
        title: "Article 7 — Politique de Remboursement",
        body: `**7.1 Service non rendu**
Si le guide n'est pas livré dans les 24 heures, le Client peut demander un remboursement intégral à [EMAIL DE CONTACT]. Remboursement effectué sous 14 jours par le même moyen de paiement.

**7.2 Guide déjà livré**
Une fois le guide généré et livré, aucun remboursement n'est possible, conformément à la renonciation au droit de rétractation (Art. 6.3).

**7.3 Défaut grave**
Un remboursement total ou partiel peut être accordé à la discrétion du Vendeur en cas de défaut grave et manifeste (destination erronée, document vide, erreur technique majeure), signalé dans les 7 jours suivant la livraison.

**7.4 Procédure**
Toute demande de remboursement doit être adressée par email à [EMAIL DE CONTACT] avec la référence de commande et le motif.`,
      },
      {
        id: "art8",
        title: "Article 8 — Limitation de Responsabilité — Contenu Généré par IA",
        body: `**8.1 Nature du contenu**
Les guides TravelGuide AI sont générés automatiquement par un système d'intelligence artificielle et ne sont pas rédigés ni vérifiés par un expert humain, guide professionnel ou agent de voyage.

**8.2 Absence de garantie**
Le Vendeur ne garantit pas l'exactitude, l'exhaustivité ni l'actualité des informations, notamment : horaires d'ouverture, tarifs, disponibilités, conditions d'accès, recommandations de sécurité.

**8.3 Utilisation aux risques de l'utilisateur**
L'utilisation des informations du guide se fait entièrement aux risques de l'utilisateur. Il est fortement recommandé de vérifier toutes les informations pratiques auprès des sources officielles avant et pendant le voyage.

**8.4 Exclusion de responsabilité**
La responsabilité du Vendeur est en tout état de cause strictement limitée au montant payé par le Client pour la commande concernée.`,
      },
      {
        id: "art9",
        title: "Article 9 — Propriété Intellectuelle",
        body: `**9.1 Licence accordée**
Le Client bénéficie d'une licence personnelle, non exclusive, non cessible, pour un usage strictement personnel et non commercial.

**9.2 Utilisations autorisées**
Consultation personnelle, impression pour usage personnel, partage gratuit avec des proches participant au même voyage.

**9.3 Interdictions**
Il est expressément interdit de revendre le guide, de le distribuer commercialement, de l'exploiter à des fins lucratives ou de céder la licence sans accord écrit préalable du Vendeur.`,
      },
      {
        id: "art10",
        title: "Article 10 — Données Personnelles",
        body: `Le Vendeur traite les données personnelles conformément au RGPD (Règlement UE 2016/679) et à la loi Informatique et Libertés.

Les données collectées (nom, email, destination, préférences) sont utilisées exclusivement pour la gestion de la commande, la livraison du guide et l'amélioration du service.

Le Client dispose d'un droit d'accès, de rectification, d'effacement et d'opposition. Pour exercer ces droits, consultez la Politique de Confidentialité sur le Site ou contactez [EMAIL DE CONTACT].

Pour toute réclamation non résolue : CNIL — https://www.cnil.fr`,
      },
      {
        id: "art11",
        title: "Article 11 — Médiation et Règlement des Litiges",
        body: `**11.1 Réclamation préalable**
Tout litige doit d'abord faire l'objet d'une tentative de résolution amiable par email à [EMAIL DE CONTACT].

**11.2 Médiation**
Conformément aux articles L. 612-1 et suivants du Code de la consommation, en cas d'échec, le Client peut saisir gratuitement un médiateur de la consommation agréé dans l'année suivant sa réclamation écrite.

Médiateur désigné : [NOM DU MÉDIATEUR — ex : FEVAD (https://www.mediateurfevad.fr), CM2C (https://cm2c.net) ou CNPM (https://cnpm-mediation-consommation.eu)]

Liste des médiateurs agréés : https://www.economie.gouv.fr/mediation-conso

**11.3 Plateforme RLL européenne**
Règlement en ligne des litiges UE : https://ec.europa.eu/consumers/odr/`,
      },
      {
        id: "art12",
        title: "Article 12 — Droit Applicable et Juridiction",
        body: `Les présentes CGV sont soumises au droit français. En cas de litige persistant après médiation, les tribunaux français sont seuls compétents. Pour les litiges consommateurs, le tribunal du lieu de résidence du consommateur est compétent.`,
      },
      {
        id: "art13",
        title: "Article 13 — Dispositions Diverses",
        body: `Si une clause des présentes CGV était déclarée nulle, les autres clauses resteraient en vigueur. Le fait de ne pas se prévaloir d'une clause ne vaut pas renonciation à s'en prévaloir ultérieurement.`,
      },
    ],
  },
  en: {
    lang: "EN",
    other: "🇫🇷",
    title: "Terms of Sale",
    subtitle: "TravelGuide AI — Version [DATE]",
    back: "← Back to site",
    note: "This is a faithful English translation. In case of conflict, the French version prevails.",
    sections: [
      {
        id: "s1",
        title: "1. Seller Identification",
        body: `These Terms of Sale govern the relationship between:

**The Seller:**
- Name / Company: [FULL NAME OR COMPANY NAME]
- Status: Self-employed entrepreneur (auto-entrepreneur)
- SIRET: [SIRET NUMBER]
- Address: [FULL ADDRESS], France
- Contact email: [CONTACT EMAIL]

And any individual or entity ("Customer") placing an order on TravelGuide AI (https://spiregg.nanocorp.app).`,
      },
      {
        id: "s2",
        title: "2. Scope",
        body: `These Terms apply to all orders placed on the Site. By placing an order, the Customer accepts these Terms unconditionally.`,
      },
      {
        id: "s3",
        title: "3. Service Description",
        body: `TravelGuide AI automatically generates personalised travel guides using AI, based on a questionnaire completed by the Customer.

**Delivery formats:**
- **PDF**: downloadable from the customer account and sent by email.
- **Google Doc**: a shared editable link via the Customer's email address.

**Delivery time:** a few minutes (max 24 hours) after questionnaire submission.`,
      },
      {
        id: "s4",
        title: "4. Pricing and VAT",
        body: `| Plan | Duration | Price |
|---|---|---|
| 3-day guide | 1–3 day trips | €10.00 |
| 7-day guide | 4–7 day trips | €20.00 |
| 14-day guide | 8–14 day trips | €40.00 |
| 1-month guide | 15–30 day trips | €65.00 |

**VAT:** [VAT not applicable — Art. 293 B French Tax Code / or VAT at 20% included — complete as applicable]`,
      },
      {
        id: "s5",
        title: "5. Order Process",
        body: `1. Select a plan on the pricing page.
2. Check the withdrawal waiver box (Article 6.3, mandatory).
3. Secure payment via Stripe.
4. Create or log in to your customer account.
5. Complete the personalisation questionnaire.
6. AI generates your guide.
7. Guide delivered in your account and by email (PDF + Google Doc).`,
      },
      {
        id: "s6",
        title: "6. Right of Withdrawal and Waiver",
        body: `Under EU Directive 2011/83/EU, consumers have a 14-day right of withdrawal. However, under Article L. 221-28, 13° of the French Consumer Code, this right does not apply to digital content with immediate delivery where the Customer has given prior express consent and expressly waived the right.

**Mandatory waiver checkbox:**

> ☐ I acknowledge that my order is for digital content whose delivery begins immediately after payment. By checking this box, I expressly consent to immediate performance and waive my 14-day right of withdrawal.

This checkbox is mandatory. The waiver is recorded with a timestamp.`,
      },
      {
        id: "s7",
        title: "7. Refund Policy",
        body: `**Undelivered service:** If the guide is not delivered within 24 hours, the Customer is entitled to a full refund (contact [CONTACT EMAIL]).

**Guide already delivered:** No refund once the guide is generated and delivered, in line with the withdrawal waiver.

**Serious defect** (wrong destination, blank document, major technical error): partial or full refund at the Seller's discretion, if reported within 7 days with a description of the defect.`,
      },
      {
        id: "s8",
        title: "8. AI Liability Disclaimer",
        body: `Travel guides are generated entirely by AI and are not written or verified by any human expert, professional guide, or travel agent.

The Seller makes **no warranty** on the accuracy, completeness or currency of information, including opening hours, prices, availability, entry requirements, or safety conditions.

**Use of the guide's information is entirely at the Customer's own risk.** Always verify practical details with official sources before and during travel.

The Seller's total liability is limited to the amount paid by the Customer for the relevant order.`,
      },
      {
        id: "s9",
        title: "9. Intellectual Property",
        body: `The Customer receives a personal, non-exclusive, non-transferable licence for **personal, non-commercial use only**.

Resale, commercial distribution, or commercial reproduction of guide content is strictly prohibited.`,
      },
      {
        id: "s10",
        title: "10. Personal Data",
        body: `The Seller processes personal data in compliance with the GDPR (EU Regulation 2016/679). Data is used solely to process orders and deliver the service. See the Privacy Policy on the Site or contact [CONTACT EMAIL] for any data rights requests.`,
      },
      {
        id: "s11",
        title: "11. Dispute Resolution",
        body: `1. **First:** contact the Seller at [CONTACT EMAIL] for amicable resolution.
2. **Mediation:** consumers may refer unresolved disputes to a certified mediator (free of charge) within one year of their written complaint. Mediator: [MEDIATOR NAME AND LINK].
3. **EU ODR platform:** https://ec.europa.eu/consumers/odr/`,
      },
      {
        id: "s12",
        title: "12. Governing Law",
        body: `These Terms are governed by French law. The competent French courts shall have exclusive jurisdiction for any unresolved dispute after mediation.`,
      },
    ],
  },
};

function renderBody(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    if (line.startsWith("| ")) {
      return null;
    }
    const bold = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    if (line.startsWith("- ")) {
      return (
        <li key={i} className="ml-4 list-disc" dangerouslySetInnerHTML={{ __html: bold.slice(2) }} />
      );
    }
    if (/^\d+\. /.test(line)) {
      return (
        <li key={i} className="ml-4 list-decimal" dangerouslySetInnerHTML={{ __html: bold.replace(/^\d+\. /, "") }} />
      );
    }
    if (line.startsWith("> ")) {
      return (
        <blockquote key={i} className="border-l-4 border-[#E8A87C] pl-4 my-3 bg-amber-50 py-2 pr-2 rounded-r text-sm italic">
          {line.slice(2)}
        </blockquote>
      );
    }
    if (line.trim() === "") return <br key={i} />;
    return (
      <p key={i} className="mb-1" dangerouslySetInnerHTML={{ __html: bold }} />
    );
  });
}

export default function CGVPage() {
  const [lang, setLang] = useState<"fr" | "en">("fr");
  const t = content[lang];

  return (
    <div className="min-h-screen bg-[#F8F4EF]" style={{ fontFamily: "var(--font-dm-sans, system-ui, sans-serif)" }}>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#F8F4EF]/95 backdrop-blur border-b border-[#425C47]/10 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-sm text-[#425C47]/60 hover:text-[#425C47] transition-colors">
            {t.back}
          </Link>
          <div className="flex items-center gap-1 border border-[#425C47]/20 rounded-lg p-0.5">
            <button
              onClick={() => setLang("fr")}
              title="Passer en français"
              className={`text-xl rounded-md px-2 py-0.5 transition-all ${lang === "fr" ? "bg-[#425C47]/15 shadow-sm" : "opacity-40 hover:opacity-70"}`}
            >
              🇫🇷
            </button>
            <button
              onClick={() => setLang("en")}
              title="Switch to English"
              className={`text-xl rounded-md px-2 py-0.5 transition-all ${lang === "en" ? "bg-[#425C47]/15 shadow-sm" : "opacity-40 hover:opacity-70"}`}
            >
              🇬🇧
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* Title */}
        <div className="mb-10">
          <h1
            className="text-3xl font-bold text-[#425C47] mb-2"
            style={{ fontFamily: "var(--font-playfair, Georgia, serif)" }}
          >
            {t.title}
          </h1>
          <p className="text-sm text-[#425C47]/50">{t.subtitle}</p>
          <p className="mt-3 text-xs text-[#425C47]/40 italic border-l-2 border-[#E8A87C] pl-3">{t.note}</p>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {t.sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-20">
              <h2 className="text-lg font-semibold text-[#425C47] mb-3 pb-1 border-b border-[#425C47]/10">
                {section.title}
              </h2>
              <div className="text-sm text-[#425C47]/75 leading-relaxed space-y-1">
                {renderBody(section.body)}
              </div>
            </section>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-16 pt-8 border-t border-[#425C47]/10 text-center text-xs text-[#425C47]/40">
          <p>TravelGuide AI — Spire GG</p>
          <p className="mt-1">
            {lang === "fr"
              ? "Pour toute question : [EMAIL DE CONTACT]"
              : "For any question: [CONTACT EMAIL]"}
          </p>
        </div>
      </main>
    </div>
  );
}
