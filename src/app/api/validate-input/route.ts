import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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

    const message = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 512,
      system: `Tu es un validateur de formulaire de questionnaire voyage.
Tu reçois des champs de formulaire et tu dois vérifier si les valeurs saisies sont cohérentes et réelles.

Règles de validation :
- Les destinations, villes et pays doivent être des lieux réels qui existent sur Terre
- Si un champ indique une ville avec un pays associé (format "Ville (Pays)"), vérifie que la ville appartient bien à ce pays. Par exemple "Marseille (Norvège)" est invalide car Marseille est en France, pas en Norvège. "Marseille (France)" est valide.
- Les textes libres (incontournables, choses à éviter, notes, pays visités) doivent être du texte cohérent lié au voyage — pas du texte aléatoire, des suites de lettres sans sens, des caractères spéciaux sans signification, ou du contenu qui n'a aucun rapport avec un voyage
- "Aucun" ou "None" sont des valeurs valides pour les champs texte
- Un seul mot cohérent est valide (ex: "Tokyo", "France", "Aucun")
- Sois permissif : les fautes d'orthographe légères sont acceptées, les abréviations connues aussi
- Ne valide PAS le format, seulement le sens et la cohérence

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

    // Extract JSON from response (may have surrounding text)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ errors: {} });
    }

    const result = JSON.parse(jsonMatch[0]) as { errors: Record<string, string> };
    return NextResponse.json({ errors: result.errors ?? {} });
  } catch (err) {
    console.error("[validate-input]", err);
    // On error, don't block the user — return no errors
    return NextResponse.json({ errors: {} });
  }
}
