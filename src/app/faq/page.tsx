"use client";

import { useState } from "react";
import Link from "next/link";
import { useMode } from "@/lib/mode-theme";
import { useLang } from "@/lib/useLang";
import LangToggle from "@/components/LangToggle";

type Lang = "fr" | "en";

const FAQ_FR = [
  {
    cat: "Commande & Livraison",
    items: [
      { q: "Comment fonctionne Travel IA ?", a: "Vous sélectionnez une offre, renseignez un questionnaire sur votre voyage (destination, dates, budget, préférences) et notre IA génère automatiquement un guide personnalisé en PDF, livré dans votre espace client et par email sous quelques minutes." },
      { q: "Combien de temps pour recevoir mon guide ?", a: "En général quelques minutes après la validation du questionnaire. Le délai maximum garanti est de 24 heures ouvrées. Si vous ne recevez rien au-delà, contactez-nous à travel-ia@nanocorp.app." },
      { q: "Mon guide est-il vraiment personnalisé ?", a: "Oui. Chaque guide est généré à partir de vos réponses spécifiques : destination exacte, dates, style de voyage, budget quotidien, intérêts (culture, gastronomie, nature…), préférences alimentaires, etc. Deux guides pour la même destination sont différents selon les profils." },
      { q: "Sous quel format reçois-je mon guide ?", a: "Votre guide est livré en PDF, téléchargeable depuis votre espace client et envoyé à l'email fourni lors de la commande. Vous pouvez le re-télécharger à tout moment depuis votre compte." },
      { q: "Puis-je commander plusieurs guides ?", a: "Oui, sans limite. Chaque commande génère un guide indépendant. Vous pouvez commander des guides pour différentes destinations, différentes durées ou différents voyageurs." },
    ],
  },
  {
    cat: "Prix & Paiement",
    items: [
      { q: "Quelles sont les offres disponibles ?", a: "Nous proposons 4 offres : Guide 3 jours (3€), Guide 7 jours (6€), Guide 14 jours (12€) et Guide 1 mois (18€). Tous les prix sont en TTC, TVA non applicable (micro-entreprise)." },
      { q: "Comment fonctionne le code promo WELCOME ?", a: "Le code WELCOME offre -25% sur votre première commande. Pour l'activer, vérifiez votre numéro de téléphone dans votre espace compte — cela débloque automatiquement le code. Il est valable une seule fois par compte." },
      { q: "Le paiement est-il sécurisé ?", a: "Oui. Les paiements sont traités exclusivement par Stripe, certifié PCI-DSS niveau 1 (le standard de sécurité le plus élevé pour les paiements en ligne). Nous ne voyons jamais votre numéro de carte bancaire." },
      { q: "Puis-je me faire rembourser ?", a: "Si votre guide n'est pas livré dans les 24 heures, vous avez droit à un remboursement intégral. Une fois le guide livré, le remboursement n'est pas possible (contenu numérique à exécution immédiate), sauf défaut grave signalé dans les 7 jours. Consultez nos CGV pour tous les détails." },
    ],
  },
  {
    cat: "Compte & Accès",
    items: [
      { q: "Dois-je créer un compte pour commander ?", a: "Oui, un compte est nécessaire pour accéder à votre guide et le re-télécharger à tout moment. La création du compte se fait en quelques secondes lors du processus de commande." },
      { q: "J'ai oublié mon mot de passe, que faire ?", a: "Cliquez sur « Mot de passe oublié ? » sur la page de connexion. Vous recevrez un email avec un lien de réinitialisation valable 1 heure." },
      { q: "Puis-je supprimer mon compte ?", a: "Oui. Envoyez une demande à travel-ia@nanocorp.app. Nous procédons à la suppression complète de vos données dans un délai de 30 jours. Seules certaines données comptables liées aux paiements Stripe sont conservées pour obligation légale." },
    ],
  },
  {
    cat: "Qualité du Guide",
    items: [
      { q: "Le guide est-il fiable ?", a: "Les guides sont générés par une IA entraînée sur de grandes quantités de données de voyage. Les informations sont généralement pertinentes et bien structurées, mais nous ne garantissons pas l'exactitude à 100% (horaires, prix, disponibilités). Vérifiez toujours les informations pratiques auprès des sources officielles avant votre voyage." },
      { q: "Que contient exactement le guide ?", a: "Un programme jour par jour avec les activités recommandées, les horaires, les conseils pratiques, les restaurants et adresses, le budget estimé par jour, les transports et hébergements, ainsi que des astuces locales adaptées à votre profil de voyageur." },
      { q: "Le guide est-il adapté à mon niveau de budget ?", a: "Oui. Vous indiquez votre budget quotidien dans le questionnaire et l'IA adapte les recommandations en conséquence : hébergements, restaurants, activités et transports sont sélectionnés selon votre budget." },
      { q: "Puis-je demander une correction si le guide est erroné ?", a: "En cas de défaut grave (destination incorrecte, document vide, erreur technique majeure), contactez-nous à travel-ia@nanocorp.app dans les 7 jours suivant la livraison avec une description du problème. Nous étudions chaque cas individuellement." },
    ],
  },
  {
    cat: "Données & Vie Privée",
    items: [
      { q: "Mes données sont-elles en sécurité ?", a: "Oui. Vos données sont stockées sur Supabase (infrastructure AWS, datacenter européen), avec chiffrement en transit (HTTPS/TLS) et au repos. Vos mots de passe sont hachés avec bcrypt — nous n'y avons jamais accès." },
      { q: "L'IA garde-t-elle mes informations ?", a: "Non. Notre IA entraînée n'utilise pas vos données personnelles pour s'améliorer. Seules vos préférences de voyage sont transmises pour générer votre guide." },
      { q: "Mon email sera-t-il revendu ?", a: "Jamais. Votre email est utilisé uniquement pour vous livrer votre guide et confirmer votre commande. Si vous vous inscrivez à la newsletter, vous pouvez vous désinscrire à tout moment d'un seul clic." },
      { q: "À quoi sert la vérification du numéro de téléphone ?", a: "Elle est optionnelle et sert uniquement à vérifier votre identité par SMS (code OTP) pour débloquer le code promo WELCOME. Votre numéro n'est pas utilisé à des fins commerciales et n'est pas revendu." },
    ],
  },
];

const FAQ_EN = [
  {
    cat: "Order & Delivery",
    items: [
      { q: "How does Travel IA work?", a: "You select a plan, fill in a questionnaire about your trip (destination, dates, budget, preferences) and our AI automatically generates a personalised guide in PDF format, delivered to your account and by email within minutes." },
      { q: "How long does it take to receive my guide?", a: "Usually a few minutes after submitting the questionnaire. The guaranteed maximum is 24 business hours. If you haven't received anything after that, contact us at travel-ia@nanocorp.app." },
      { q: "Is my guide truly personalised?", a: "Yes. Each guide is generated from your specific answers: exact destination, dates, travel style, daily budget, interests (culture, food, nature…), dietary preferences, etc. Two guides for the same destination will differ based on the traveller's profile." },
      { q: "What format is the guide delivered in?", a: "Your guide is delivered as a PDF, downloadable from your account and sent to the email provided at checkout. You can re-download it at any time from your account." },
    ],
  },
  {
    cat: "Pricing & Payment",
    items: [
      { q: "What plans are available?", a: "We offer 4 plans: 3-day guide (€3), 7-day guide (€6), 14-day guide (€12) and 1-month guide (€18). All prices are all-inclusive." },
      { q: "How does the WELCOME promo code work?", a: "The WELCOME code gives -25% off your first order. To activate it, verify your phone number in your account — this automatically unlocks the code. Valid once per account." },
      { q: "Is payment secure?", a: "Yes. Payments are processed exclusively by Stripe, PCI-DSS level 1 certified. We never see your card number." },
      { q: "Can I get a refund?", a: "If your guide is not delivered within 48 hours, you are entitled to a full refund. Once delivered, refunds are not possible (immediate digital content), except for serious defects reported within 7 days. See our Terms of Sale for full details." },
    ],
  },
  {
    cat: "Privacy & Data",
    items: [
      { q: "Is my data safe?", a: "Yes. Data is stored on Supabase (AWS infrastructure, European datacentre) with encryption in transit (HTTPS/TLS) and at rest. Passwords are bcrypt-hashed — we never have access to them." },
      { q: "Does the AI keep my information?", a: "No. Our trained AI does not use your personal data to improve itself. Only your travel preferences are sent to generate your guide." },
      { q: "Will my email be sold?", a: "Never. Your email is used solely to deliver your guide and confirm your order. If you subscribe to the newsletter, you can unsubscribe at any time with one click." },
    ],
  },
];

export default function FAQPage() {
  const [lang] = useLang();
  const [openItem, setOpenItem] = useState<string | null>(null);
  const { isBusiness } = useMode();
  const data = lang === "fr" ? FAQ_FR : FAQ_EN;
  const brandName = isBusiness ? "Travel Business" : "TravelGuide";
  const backHref = isBusiness ? "/business" : "/personal";

  return (
    <div className="min-h-screen" style={{ background: "var(--cb)", fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
      <header className="sticky top-0 z-10 backdrop-blur border-b" style={{ background: "var(--cb)", borderColor: "var(--ce)" }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href={backHref} className="text-sm font-medium transition-colors" style={{ color: "var(--cm)" }}>
            {lang === "fr" ? "← Retour au site" : "← Back to site"}
          </Link>
          <span className="font-bold" style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--ct)" }}>{brandName}</span>
          <LangToggle />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4" style={{ background: "var(--cc)", border: "1px solid var(--ce)" }}>
            <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--cm)" }}>
              {lang === "fr" ? "Questions fréquentes" : "Frequently Asked Questions"}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3" style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--ct)" }}>
            {lang === "fr" ? "Tout ce que vous voulez savoir" : "Everything you need to know"}
          </h1>
          <p className="text-base max-w-lg mx-auto" style={{ color: "var(--cm)" }}>
            {lang === "fr"
              ? "Des réponses claires sur notre service, la livraison, le paiement et vos données."
              : "Clear answers about our service, delivery, payment and your data."}
          </p>
        </div>

        <div className="space-y-10">
          {data.map((cat) => (
            <div key={cat.cat}>
              <h2 className="text-xs font-bold uppercase tracking-widest mb-4 px-1" style={{ color: "var(--ca)" }}>{cat.cat}</h2>
              <div className="space-y-2">
                {cat.items.map((item, i) => {
                  const key = `${cat.cat}-${i}`;
                  const open = openItem === key;
                  const q = item.q;
                  const a = item.a;
                  return (
                    <div key={key} className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--ce)", background: "var(--cc)" }}>
                      <button
                        type="button"
                        onClick={() => setOpenItem(open ? null : key)}
                        className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors"
                        style={{ color: "var(--ct)" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "var(--csh)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "")}
                      >
                        <span className="font-semibold text-sm pr-4">{q}</span>
                        <span className={`text-xl font-bold flex-shrink-0 transition-transform duration-200 ${open ? "rotate-45" : ""}`} style={{ color: "var(--ca)" }}>+</span>
                      </button>
                      {open && (
                        <div className="px-5 pb-5 pt-4 text-sm leading-relaxed border-t" style={{ color: "var(--cm)", borderColor: "var(--ce)" }}>
                          {a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 rounded-2xl p-8 text-center" style={{ background: "var(--cc)", border: "1px solid var(--ce)" }}>
          <h3 className="font-bold text-lg mb-2" style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: "var(--ct)" }}>
            {lang === "fr" ? "Vous n'avez pas trouvé votre réponse ?" : "Didn't find your answer?"}
          </h3>
          <p className="text-sm mb-5" style={{ color: "var(--cm)" }}>
            {lang === "fr" ? "Notre équipe répond sous 24h." : "Our team replies within 48 hours."}
          </p>
          <Link
            href="/contact"
            className="inline-block font-bold px-6 py-3 rounded-xl text-sm transition-colors"
            style={{ background: "var(--ca)", color: "var(--cat)" }}
            onMouseEnter={e => ((e.target as HTMLElement).style.background = "var(--cah)")}
            onMouseLeave={e => ((e.target as HTMLElement).style.background = "var(--ca)")}
          >
            {lang === "fr" ? "Nous contacter" : "Contact us"}
          </Link>
        </div>

        <div className="mt-10 text-center text-xs" style={{ color: "var(--cf)" }}>
          <p>
            {lang === "fr" ? "Voir aussi : " : "See also: "}
            <Link href="/cgv" className="underline" style={{ color: "var(--cf)" }}>{lang === "fr" ? "CGV" : "Terms of Sale"}</Link>
            {" · "}
            <Link href="/privacy" className="underline" style={{ color: "var(--cf)" }}>{lang === "fr" ? "Politique de confidentialité" : "Privacy Policy"}</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
