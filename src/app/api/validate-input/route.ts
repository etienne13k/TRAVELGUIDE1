import { NextRequest, NextResponse } from "next/server";
import { createAnthropicClient, getAnthropicApiKey, getAnthropicModel } from "@/lib/anthropic";

interface FieldToValidate {
  name: string;
  label: string;
  value: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { fields: FieldToValidate[] };
    const { fields } = body;

    if (!fields || fields.length === 0) {
      return NextResponse.json({ errors: {} });
    }

    const fieldsText = fields
      .filter(f => f.value && f.value.trim().length > 0)
      .map(f => `- ${f.label} (id: ${f.name}): "${f.value.trim()}"`)
      .join("\n");

    if (!fieldsText) {
      return NextResponse.json({ errors: {} });
    }

    const apiKey = await getAnthropicApiKey();
    if (!apiKey) {
      console.warn("[validate-input] No API key available");
      return NextResponse.json({ errors: {} });
    }

    const client = createAnthropicClient(apiKey);

    const message = await client.messages.create({
      model: getAnthropicModel(),
      max_tokens: 512,
      system: `Tu es un validateur de formulaire de questionnaire voyage. Tu dois être STRICT sur les noms de villes.

Règles de validation :

RÈGLE PRINCIPALE — Champs ville/destination :
- Une ville doit être un nom géographique réel (ville, commune, quartier connu). Les mots communs non-géographiques comme "rapide", "loin", "beau", "grand", "vite", "facile" etc. ne sont PAS des villes, même s'ils sont cohérents en français.
- Si un champ contient "Ville (Pays)", vérifie DEUX choses :
  1. Que le premier terme est un vrai nom de ville (pas un mot ordinaire)
  2. Que cette ville existe bien dans le pays indiqué
  Exemples : "Marseille (Norvège)" → INVALIDE (Marseille est en France). "rapide (Azerbaïdjan)" → INVALIDE ("rapide" n'est pas une ville). "Bakou (Azerbaïdjan)" → VALIDE.
- Les fautes d'orthographe légères sur un vrai nom de ville sont acceptées (ex: "Barcelonne" → accepté)

RÈGLE — Champs texte libre (incontournables, choses à éviter, pays visités, notes) :
- Doit être du texte lié au voyage — pas du texte aléatoire, des suites de lettres sans sens, ou du contenu sans rapport avec un voyage
- "Aucun" ou "None" sont toujours valides

Réponds UNIQUEMENT en JSON valide, sans explication ni markdown :
{ "errors": { "<field_id>": "<message_erreur_en_français>" } }

Si tout est valide, réponds : { "errors": {} }`,
      messages: [
        {
          role: "user",
          content: `Valide ces champs de formulaire voyage :\n${fieldsText}`,
        },
      ],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "{}";

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ errors: {} });
    }

    const result = JSON.parse(jsonMatch[0]) as { errors: Record<string, string> };
    return NextResponse.json({ errors: result.errors ?? {} });
  } catch (err) {
    console.error("[validate-input]", err);
    return NextResponse.json({ errors: {} });
  }
}
