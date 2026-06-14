"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import LangToggle from "@/components/LangToggle";
import { addCartItem, CART_PLANS, getCartItem, updateCartItem, type CartItemInput } from "@/lib/cart";

/* ──────────────────────────────────────────────────────────
   PLAN DATA
────────────────────────────────────────────────────────── */

const PLAN_KEY_MAP: Record<string, string> = {
  basic: "3j", standard: "7j", premium: "14j", elite: "1mois",
  "3": "3j", "7": "7j", "14": "14j", "30": "1mois",
};

const PLAN_ORDER = ["3j", "7j", "14j", "1mois"] as const;
type PlanKey = (typeof PLAN_ORDER)[number];
type Lang = "fr" | "en";
type Flow = "" | "destination" | "discover";

const PLANS: Record<PlanKey, { name: string; duration: string; oldPrice: string; price: string; priceN: number }> = {
  "3j":    { name: "Guide Express",  duration: "3 jours",  oldPrice: "5€",  price: "3€",  priceN: 3  },
  "7j":    { name: "Guide Complet",  duration: "7 jours",  oldPrice: "10€", price: "7€",  priceN: 7  },
  "14j":   { name: "Guide Immersif", duration: "14 jours", oldPrice: "18€", price: "12€", priceN: 12 },
  "1mois": { name: "Guide de Vie",   duration: "1 mois",   oldPrice: "25€", price: "18€", priceN: 18 },
};

const DESTINATIONS = [
  // France
  "Paris","Nice","Lyon","Marseille","Bordeaux","Toulouse","Strasbourg","Lille","Nantes","Montpellier","Rennes","Monaco","Cannes","Saint-Tropez","Annecy","Grenoble","Avignon","Aix-en-Provence","Carcassonne","Biarritz","Colmar","Tours","La Rochelle","Brest","Dijon","Metz","Nancy","Reims","Ajaccio","Bonifacio","Calvi","Toulon","Perpignan","Clermont-Ferrand","Limoges",
  // UK & Irlande
  "Londres","Édimbourg","Glasgow","Manchester","Liverpool","Bristol","Bath","Oxford","Cambridge","York","Brighton","Cardiff","Dublin","Belfast","Cork",
  // Italie
  "Rome","Milan","Florence","Venise","Naples","Turin","Bologne","Palerme","Vérone","Gênes","Capri","Amalfi","Positano","Sorrento","Cinque Terre","Portofino","Lac de Côme","Lac de Garde","Toscane","Sicile","Sardaigne","San Marin",
  // Espagne
  "Barcelone","Madrid","Séville","Valence","Bilbao","Saint-Sébastien","Grenade","Cordoue","Tolède","Salamanque","Saint-Jacques-de-Compostelle","Palma de Majorque","Ibiza","Formentera","Ténérife","Grande Canarie","Lanzarote","Fuerteventura","La Palma","Minorque","Malaga","Marbella","Cadix","Alicante","Murcie","Saragosse","Valladolid",
  // Portugal
  "Lisbonne","Porto","Algarve","Sintra","Madère","Açores","Faro","Évora","Braga","Coimbra",
  // Benelux
  "Amsterdam","Rotterdam","La Haye","Utrecht","Bruges","Bruxelles","Gand","Anvers","Luxembourg",
  // Allemagne
  "Berlin","Munich","Hambourg","Francfort","Cologne","Stuttgart","Dresde","Leipzig","Düsseldorf","Heidelberg","Rothenburg","Forêt-Noire","Vallée du Rhin","Nuremberg","Brême","Hanovre",
  // Autriche & Suisse
  "Vienne","Salzbourg","Innsbruck","Hallstatt","Graz","Zurich","Genève","Berne","Lucerne","Interlaken","Zermatt","Saint-Moritz","Lausanne","Bâle","Lugano",
  // Europe centrale
  "Prague","Brno","Český Krumlov","Karlovy Vary","Budapest","Eger","Varsovie","Cracovie","Gdansk","Wroclaw","Tallinn","Riga","Vilnius","Helsinki","Turku","Stockholm","Göteborg","Malmö","Oslo","Bergen","Tromsø","Lofoten","Stavanger","Flåm","Copenhague","Aarhus","Reykjavik",
  // Grèce & Balkans
  "Athènes","Thessalonique","Rhodes","Santorin","Mykonos","Corfou","Crète","Zakynthos","Météores","Delphes","Dubrovnik","Split","Hvar","Zadar","Pula","Zagreb","Kotor","Monténégro","Ljubljana","Lac de Bled","Bratislava","Bucarest","Transylvanie","Brasov","Sibiu","Cluj-Napoca","Sofia","Plovdiv","Belgrade","Novi Sad",
  // Turquie
  "Istanbul","Cappadoce","Antalya","Bodrum","Izmir","Éphèse","Pamukkale","Trabzon","Ölüdeniz","Alanya","Kaş","Göreme","Fethiye","Marmaris",
  // Israël & Moyen-Orient
  "Jérusalem","Tel Aviv","Mer Morte","Petra","Wadi Rum","Amman","Beyrouth","Aqaba","Dubaï","Abu Dhabi","Muscat","Doha","Bahreïn","Riyad","Koweït","Tbilissi","Batoumi","Erevan","Bakou",
  // Asie centrale
  "Almaty","Samarkand","Boukhara","Tachkent","Khiva","Oulan-Bator",
  // Japon
  "Tokyo","Kyoto","Osaka","Hiroshima","Nara","Hakone","Nikko","Sapporo","Fukuoka","Okinawa","Kanazawa","Nagasaki","Kobé","Nagoya","Sendai","Matsuyama",
  // Corée
  "Séoul","Busan","Île de Jeju","Gyeongju","Incheon",
  // Chine
  "Pékin","Shanghai","Hong Kong","Macao","Guangzhou","Shenzhen","Chengdu","Xi'an","Hangzhou","Suzhou","Guilin","Zhangjiajie","Lijiang","Dali","Kunming","Chongqing","Nankin","Harbin","Wuhan",
  // Taïwan
  "Taipei","Tainan","Taichung","Jiufen","Gorges de Taroko",
  // Thaïlande
  "Bangkok","Chiang Mai","Chiang Rai","Phuket","Koh Samui","Koh Phi Phi","Krabi","Kanchanaburi","Ayutthaya","Pai","Sukhothaï","Koh Lanta","Koh Chang","Pattaya","Koh Tao",
  // Indonésie
  "Bali","Jakarta","Yogyakarta","Lombok","Île de Komodo","Raja Ampat","Flores","Volcan Bromo","Borobudur","Ubud","Seminyak","Nusa Penida","Gili Air",
  // Malaisie & Singapour
  "Singapour","Kuala Lumpur","Penang","Langkawi","Malacca","Bornéo","Kota Kinabalu","Kuching",
  // Vietnam
  "Hô Chi Minh-Ville","Hanoï","Hoi An","Baie d'Ha Long","Da Nang","Hué","Sapa","Ninh Binh","Phong Nha","Mui Ne","Phu Quoc","Nha Trang",
  // Cambodge, Laos, Myanmar
  "Phnom Penh","Siem Reap","Angkor Wat","Luang Prabang","Vientiane","Vang Vieng","Yangon","Bagan","Lac Inle","Mandalay","Ngapali",
  // Inde
  "Mumbai","Delhi","Agra","Jaipur","Goa","Kerala","Varanasi","Kolkata","Chennai","Bangalore","Hyderabad","Udaipur","Jodhpur","Rishikesh","Ladakh","Darjeeling","Îles Andaman","Munnar","Pondichéry","Hampi","Mysore","Amritsar","Shimla","Manali","Pushkar","Jaisalmer","Alleppey",
  // Autres Asie du Sud
  "Maldives","Sri Lanka","Colombo","Sigiriya","Kandy","Galle","Ella","Mirissa","Népal","Katmandou","Pokhara","Chitwan","Bhoutan","Thimphou","Paro",
  // Amériques du Nord
  "New York","Los Angeles","Miami","San Francisco","Chicago","Las Vegas","Boston","Washington DC","La Nouvelle-Orléans","Nashville","Austin","Seattle","Portland","Denver","Phoenix","San Diego","Houston","Atlanta","Orlando","Honolulu","Maui","Big Island Hawaï","Napa Valley","Parc Yellowstone","Grand Canyon","Yosemite","Parc de Zion","Bryce Canyon","Glacier National Park","Montréal","Toronto","Vancouver","Québec","Ottawa","Calgary","Whistler","Victoria","Chutes du Niagara","Halifax",
  // Mexique & Amérique centrale
  "Mexico","Cancun","Playa del Carmen","Tulum","Oaxaca","Guadalajara","Puerto Vallarta","Los Cabos","Mérida","Chichen Itza","Guanajuato","Puebla","Holbox","Bacalar","Cozumel","La Havane","Trinidad Cuba","Punta Cana","Jamaïque","Barbade","Sainte-Lucie","Martinique","Guadeloupe","Aruba","Curaçao","Costa Rica","Arenal","Manuel Antonio","Monteverde","Panama City","Bocas del Toro","Guatemala","Antigua Guatemala","Tikal","Belize",
  // Amérique du Sud
  "Bogotá","Carthagène des Indes","Medellín","Santa Marta","Parc Tayrona","Lima","Cusco","Machu Picchu","Lac Titicaca","Arequipa","Lignes de Nazca","Vallée Sacrée","Montagne Arc-en-Ciel","La Paz","Sucre","Salar d'Uyuni","Potosí","Quito","Îles Galápagos","Cuenca","Amazonie","Rio de Janeiro","São Paulo","Salvador de Bahia","Manaus","Florianópolis","Chutes d'Iguazú","Fernando de Noronha","Buenos Aires","Patagonie","Mendoza","Bariloche","El Calafate","Ushuaia","Salta","Jujuy","Santiago du Chili","Valparaíso","Torres del Paine","Île de Pâques","Désert d'Atacama","Puerto Natales","Montevideo","Punta del Este","Colonia del Sacramento",
  // Afrique du Nord
  "Marrakech","Fès","Casablanca","Chefchaouen","Désert du Sahara","Essaouira","Meknès","Ouarzazate","Agadir","Tanger","Djerba","Tunis","Hammamet","Tozeur","Le Caire","Louxor","Assouan","Alexandrie","Mer Rouge","Hurghada","Charm el-Cheikh","Dahab","Sinaï","Abou Simbel","Oasis de Siwa",
  // Afrique de l'Est
  "Nairobi","Mombasa","Kisumu","Masai Mara","Amboseli","Tsavo","Lamu","Diani","Zanzibar","Serengeti","Kilimandjaro","Ngorongoro","Stone Town","Dar es Salaam","Arusha","Mwanza","Kampala","Entebbe","Jinja","Bwindi","Kigali","Parc des Volcans","Bujumbura","Addis-Abeba","Lalibela","Montagnes du Simien","Gondar","Dire Dawa","Asmara","Djibouti","Mogadiscio","Khartoum","Juba",
  // Afrique Australe & Océan Indien
  "Le Cap","Johannesburg","Pretoria","Durban","Safari Kruger","Garden Route","Drakensberg","Stellenbosch","Cape Winelands","Windhoek","Sossusvlei","Etosha","Swakopmund","Lüderitz","Botswana","Delta de l'Okavango","Chobe","Maun","Victoria Falls","Lusaka","Livingstone","Harare","Bulawayo","Maputo","Beira","Pemba","Lilongwe","Blantyre","Maseru","Mbabane","Antananarivo","Toamasina","Nosy Be","Avenue des Baobabs","Île Maurice","Port Louis","La Réunion","Seychelles","Mahé","Praslin","La Digue","Comores","Moroni",
  // Afrique de l'Ouest
  "Accra","Kumasi","Lagos","Abuja","Kano","Port Harcourt","Dakar","Saint-Louis Sénégal","Abidjan","Yamoussoukro","Bamako","Ouagadougou","Lomé","Porto-Novo","Cotonou","Conakry","Freetown","Monrovia","Bissau","Banjul","Nouakchott","Niamey","Ndjamena",
  // Afrique Centrale
  "Yaoundé","Douala","Libreville","Kinshasa","Lubumbashi","Brazzaville","Bangui","Malabo","São Tomé","Luanda","Huambo",
  // Pays africains
  "Nigeria","Côte d'Ivoire","Cameroun","Ghana","Mali","Burkina Faso","Guinée","Zambie","Zimbabwe","Malawi","Angola","Gabon","Congo","RDC Congo","Sierra Leone","Libéria","Togo","Bénin","Mauritanie","Érythrée","Somalie","Soudan du Sud","Eswatini","Lesotho","Cabo Verde","Guinée-Bissau","Guinée équatoriale","Centrafrique","Burundi","Comores","Sao Tomé-et-Principe",
  // Océanie — Australie & NZ
  "Sydney","Melbourne","Brisbane","Perth","Adélaïde","Cairns","Gold Coast","Darwin","Hobart","Alice Springs","Uluru","Grande Barrière de Corail","Whitsundays","Byron Bay","Noosa","Margaret River","Kimberley","Kakadu","Auckland","Wellington","Queenstown","Milford Sound","Rotorua","Christchurch","Fiordland","Wanaka","Napier","Taupo","Bay of Islands","Coromandel",
  // Pacifique
  "Fidji","Nadi","Suva","Tahiti","Papeete","Bora-Bora","Moorea","Rangiroa","Fakarava","Huahine","Raiatea","Nouvelle-Calédonie","Nouméa","Île des Pins","Vanuatu","Port Vila","Samoa","Apia","Tonga","Nukualofa","Îles Cook","Rarotonga","Palau","Îles Marshall","Micronésie","Kiribati","Tuvalu","Niue","Papouasie-Nouvelle-Guinée","Port Moresby","Goroka","Îles Salomon","Honiara",
  // Pays/territoires
  "Australie","Nouvelle-Zélande",
  // Europe supplémentaire — France
  "Rouen","Saint-Malo","Mont-Saint-Michel","Deauville","Honfleur","Étretat","Bayeux","Caen","Chamonix","Val-d'Isère","Courchevel","Megève","Méribel","Tignes","Les Arcs","Alpe d'Huez","Nîmes","Arles","Gordes","Cassis","Antibes","Menton","Grasse","Saint-Paul-de-Vence","Vence","Arcachon","Sarlat","Périgueux","Chartres","Blois","Amboise","Chinon","Bourges","Orléans","La Baule","Quimper","Vannes","Rochefort","Millau","Puy-en-Velay","Clermont-Ferrand",
  // Europe — Îles britanniques
  "Canterbury","Stratford-upon-Avon","Salisbury","Winchester","Leeds","Sheffield","Birmingham","Nottingham","Norwich","Portsmouth","Exeter","Plymouth","Inverness","Loch Ness","Isle of Skye","St Andrews","Stirling","Fort William","Galway","Killarney","Waterford","Limerick","Sligo",
  // Europe — Allemagne
  "Lübeck","Potsdam","Weimar","Erfurt","Bamberg","Würzburg","Regensburg","Passau","Augsburg","Freiburg-en-Brisgau","Mainz","Koblenz","Konstanz","Tübingen","Ulm","Baden-Baden","Aix-la-Chapelle","Bonn","Mannheim","Karlsruhe",
  // Europe — Scandinavie
  "Tampere","Rovaniemi","Oulu","Laponie","Odense","Aalborg","Roskilde","Visby","Trondheim","Ålesund","Bodø","Molde","Kristiansand","Uppsala","Göteborg" ,
  // Europe — Est & Balkans
  "Kyiv","Lviv","Odessa","Kharkiv","Dnipro","Minsk","Moscou","Saint-Pétersbourg","Kazan","Novgorod","Sotchi","Ekaterinbourg","Lac Baïkal","Vladivostok","Irkoutsk","Kamtchatka","Novosibirsk","Sarajevo","Mostar","Banja Luka","Tirana","Shkodër","Durrës","Berat","Gjirokastër","Pristina","Prizren","Ohrid","Skopje","Bitola","Chișinău","Tbilissi","Batoumi","Koutaïssi","Erevan","Gyumri","Bakou","Chirvane","Varna","Burgas","Sozopol","Timișoara","Iași","Constanța","Niš","Kosice","Tartu","Pärnu","Kaunas","Trakai","Zakopane","Łódź","Poznań","Lublin","Gdynia","Miskolc","Debrecen","Győr","Pécs","Plzeň","Sinaia","Bucarest",
  // Moyen-Orient supplémentaire
  "Téhéran","Ispahan","Chiraz","Yazd","Persépolis","Tabriz","Bagdad","Erbil","Bassora","Damas","Alep","Palmyre","Sanaa","Manama","Al Ula","Djeddah","La Mecque","Médine","Ras Al-Khaimah","Sharjah","Fujairah","Salalah","Byblos","Baalbek","Sidon","Jerash","Bethléem","Nazareth","Ramallah","Koweït City","Nur-Sultan","Almaty","Shymkent","Bishkek","Osh","Dushanbe","Ashgabat","Merv",
  // Asie — Philippines
  "Manille","Cebu","Palawan","El Nido","Boracay","Bohol","Siargao","Davao","Coron","Puerto Princesa",
  // Asie — Chine supplémentaire
  "Lhassa","Urumqi","Xiamen","Qingdao","Dalian","Changsha","Nanning","Lianyungang","Wuxi","Hangzhou",
  // Asie — Japon supplémentaire
  "Kamakura","Takayama","Matsumoto","Beppu","Nagasaki","Matsuyama","Shirakawa-go","Yakushima","Naoshima","Kanazawa","Noto","Himeji","Nikkō",
  // Asie — Inde supplémentaire
  "Ahmedabad","Chandigarh","Bhubaneswar","Coimbatore","Nagpur","Thiruvananthapuram","Vijayawada","Kochi","Madurai","Trichy",
  // Asie — Pakistan & Bangladesh
  "Islamabad","Karachi","Lahore","Peshawar","Multan","Dhaka","Cox's Bazar","Chittagong","Sylhet",
  // Amérique du Nord — USA supplémentaire
  "Salt Lake City","Minneapolis","Kansas City","Memphis","Detroit","Pittsburgh","Cleveland","Baltimore","Charlotte","Raleigh","Tampa","Indianapolis","Sacramento","Albuquerque","Anchorage","Fairbanks","Juneau","Sedona","Big Sur","Route 66","Parc national des Arches","Monument Valley","Death Valley","Everglades","Cape Cod","Martha's Vineyard",
  // Canada supplémentaire
  "Banff","Jasper","Tofino","Charlottetown","Regina","Saskatoon","Whitehorse","Yellowknife","Iqaluit","Prince Edward Island","Niagara-on-the-Lake",
  // Mexique & Am. centrale supplémentaire
  "San Cristóbal de las Casas","Taxco","Morelia","Querétaro","Zacatecas","Veracruz","Acapulco","Huatulco","Ixtapa","Palenque","Managua","Tegucigalpa","San Salvador","Guatemala City","Antigua Guatemala","Belmopan","San José Costa Rica","Montezuma","Puerto Viejo",
  // Caraïbes
  "Porto Rico","San Juan","Nassau","Port-au-Prince","Santo Domingo","Kingston Jamaïque","Port-of-Spain","Bridgetown","Castries","Kingstown","Turks-et-Caïcos","Saint-Barthélemy","Saint-Martin","Bonaire","Anguilla","Santiago de Cuba",
  // Amérique du Sud supplémentaire
  "Recife","Fortaleza","Belém","Porto Alegre","Curitiba","Belo Horizonte","Natal","Maceió","João Pessoa","Vitória","Cuiabá","Manaus","Santarém","Rosario","Córdoba","Asunción","Caracas","Cartagène Venezuela","Georgetown Guyana","Paramaribo","Cayenne","Bogotá","Cali","Barranquilla","Santa Marta","Villavicencio","Iquitos","Arequipa","Trujillo","Chiclayo",
  // Pays non couverts
  "Afghanistan","Albanie","Algérie","Andorre","Antigua-et-Barbuda","Bosnie-Herzégovine","Brunéi","Chypre","Dominique","Équateur","Grenade","Haïti","Honduras","Iran","Irak","Jamaïque","Kiribati","Kosovo","Libye","Liechtenstein","Macédoine du Nord","Malte","Moldavie","Mongolie","Nauru","Nicaragua","Palaos","Paraguay","Saint-Kitts-et-Nevis","Samoa","Suriname","Syrie","Timor oriental","Tuvalu","Ukraine","Venezuela","Yémen",
];

const PLAN_DATE_LIMITS: Record<PlanKey, { maxDays: number; label: string }> = {
  "3j": { maxDays: 3, label: "3 jours" },
  "7j": { maxDays: 7, label: "7 jours" },
  "14j": { maxDays: 14, label: "14 jours" },
  "1mois": { maxDays: 31, label: "1 mois" },
};

function resolvePlanKey(rawPlan: string): PlanKey | null {
  const mapped = PLAN_KEY_MAP[rawPlan] ?? rawPlan;
  return PLAN_ORDER.includes(mapped as PlanKey) ? (mapped as PlanKey) : null;
}

function resolveLanguage(rawLang: string | null): Lang {
  return rawLang === "en" ? "en" : "fr";
}

const LEGAL_COPY: Record<Lang, {
  noticeTitle: string; noticeBody: string; termsPrefix: string; termsLabel: string;
  termsJoin: string; privacyLabel: string; termsSuffix: string; error: string; paymentButton: string;
}> = {
  fr: {
    noticeTitle: "Information importante",
    noticeBody: "Les horaires et jours d'ouverture des monuments et lieux recommandés dans votre guide sont fournis à titre indicatif, sur la base des informations disponibles au moment de la génération. TravelGuide AI ne peut être tenu responsable en cas de fermeture exceptionnelle, de modification d'horaires ou d'événements imprévus affectant l'accès aux lieux mentionnés. Nous vous recommandons de vérifier les informations officielles avant chaque visite.",
    termsPrefix: "J'ai lu et j'accepte les",
    termsLabel: "Conditions Générales de Vente",
    termsJoin: "ainsi que la",
    privacyLabel: "Politique de confidentialité",
    termsSuffix: "Je comprends que les informations fournies dans le guide sont indicatives et non contractuelles.",
    error: "Veuillez accepter les conditions générales de vente pour continuer.",
    paymentButton: "Ajouter au panier",
  },
  en: {
    noticeTitle: "Important notice",
    noticeBody: "Opening hours and schedules listed in your guide are provided for informational purposes only. TravelGuide AI cannot be held responsible for unexpected closures, schedule changes, or any unforeseen events affecting access to the listed locations. We recommend checking official sources before each visit.",
    termsPrefix: "I have read and agree to the",
    termsLabel: "Terms & Conditions",
    termsJoin: "and",
    privacyLabel: "Privacy Policy",
    termsSuffix: "I understand that the information provided in the guide is indicative and non-contractual.",
    error: "Please accept the terms and conditions to continue.",
    paymentButton: "Add to cart",
  },
};

/* ──────────────────────────────────────────────────────────
   OPTION DEFINITIONS
────────────────────────────────────────────────────────── */

type Opt = { id: string; emoji: string; label: string };

const TRAVELER_TYPE: Opt[] = [
  { id: "solo",    emoji: "🧍",       label: "En solo" },
  { id: "couple",  emoji: "💑",       label: "Couple" },
  { id: "family",  emoji: "👨‍👩‍👧‍👦", label: "Famille avec enfants" },
  { id: "friends", emoji: "👫",       label: "Groupe d'amis" },
];

const ACTIVITY_PACE: Opt[] = [
  { id: "packed",      emoji: "⚡",  label: "Intense (plusieurs activités/jour)" },
  { id: "relaxed",     emoji: "☀️",  label: "Détendu (1-2 activités/jour)" },
  { id: "ultra_chill", emoji: "🌊",  label: "Très libre (sans programme)" },
];

const BUDGET_OPTS: Opt[] = [
  { id: "backpacker", emoji: "🎒", label: "Petit budget / sac à dos" },
  { id: "comfort",    emoji: "😊", label: "Confort (milieu de gamme)" },
  { id: "luxury",     emoji: "💎", label: "Haut de gamme" },
];

const ACCOMMODATION: Opt[] = [
  { id: "hostel",    emoji: "🛏️", label: "Auberge de jeunesse" },
  { id: "airbnb",    emoji: "🏠", label: "Appartement / Airbnb" },
  { id: "hotel_3_4", emoji: "🏨", label: "Hôtel 3-4★" },
  { id: "boutique",  emoji: "🏡", label: "Boutique hôtel" },
  { id: "resort",    emoji: "🌴", label: "Complexe tout compris" },
  { id: "camping",   emoji: "⛺", label: "Camping / plein air" },
];

const TRANSPORT: Opt[] = [
  { id: "public",  emoji: "🚌", label: "Transports en commun" },
  { id: "walking", emoji: "🚶", label: "À pied / vélo" },
  { id: "rental",  emoji: "🚗", label: "Voiture de location" },
  { id: "taxi",    emoji: "🚕", label: "Taxi / VTC" },
];

const INTERESTS: Opt[] = [
  { id: "culture",      emoji: "🏛️", label: "Culture & histoire" },
  { id: "nature",       emoji: "🌿", label: "Nature & plein air" },
  { id: "adventure",    emoji: "🧗", label: "Aventure & sport" },
  { id: "gastronomy",   emoji: "🍽️", label: "Gastronomie" },
  { id: "shopping",     emoji: "🛍️", label: "Shopping & marchés" },
  { id: "nightlife",    emoji: "🎉", label: "Vie nocturne" },
  { id: "art",          emoji: "🎨", label: "Art & musées" },
  { id: "photography",  emoji: "📸", label: "Photographie" },
  { id: "architecture", emoji: "🏙️", label: "Architecture" },
  { id: "sport",        emoji: "🏅", label: "Sport & activités" },
];

const SPORTS: Opt[] = [
  { id: "hiking",        emoji: "🥾", label: "Randonnée" },
  { id: "climbing",      emoji: "🧗", label: "Escalade" },
  { id: "diving",        emoji: "🤿", label: "Plongée" },
  { id: "surf",          emoji: "🏄", label: "Surf" },
  { id: "ski",           emoji: "⛷️", label: "Ski / snowboard" },
  { id: "yoga",          emoji: "🧘", label: "Yoga / méditation" },
  { id: "mountain_bike", emoji: "🚵", label: "VTT" },
  { id: "paragliding",   emoji: "🪂", label: "Parapente" },
  { id: "kayak",         emoji: "🚣", label: "Kayak / canoë" },
];

const LANDSCAPE: Opt[] = [
  { id: "beach",       emoji: "🏖️", label: "Plage & mer" },
  { id: "mountain",    emoji: "⛰️", label: "Montagne" },
  { id: "city",        emoji: "🏙️", label: "Ville & urbain" },
  { id: "desert",      emoji: "🏜️", label: "Désert" },
  { id: "jungle",      emoji: "🌴", label: "Jungle & forêt tropicale" },
  { id: "countryside", emoji: "🌾", label: "Campagne & vignobles" },
  { id: "island",      emoji: "🏝️", label: "Île isolée" },
];

const CLIMATE: Opt[] = [
  { id: "warm",      emoji: "☀️", label: "Chaud & ensoleillé" },
  { id: "temperate", emoji: "🌤️", label: "Tempéré / doux" },
  { id: "cold",      emoji: "❄️",  label: "Froid / hiver" },
  { id: "any",       emoji: "🌈", label: "Peu importe" },
];

const AUTHENTICITY: Opt[] = [
  { id: "off_beaten",    emoji: "🗺️", label: "Hors des sentiers battus" },
  { id: "mixed",         emoji: "⚖️", label: "Équilibre classique / local" },
  { id: "tourist_spots", emoji: "📸", label: "Sites touristiques incontournables" },
];

const TRIP_VIBE: Opt[] = [
  { id: "rest",      emoji: "😴", label: "Repos & ressourcement" },
  { id: "discovery", emoji: "🧭", label: "Découverte & culture" },
  { id: "adventure", emoji: "⛰️", label: "Aventure & adrénaline" },
  { id: "party",     emoji: "🎉", label: "Fête & rencontres" },
];

const TRIP_TYPE: Opt[] = [
  { id: "one_place",  emoji: "📍", label: "Un seul lieu / immersion" },
  { id: "road_trip",  emoji: "🛣️", label: "Road trip / plusieurs étapes" },
];

const FLIGHT_TIME: Opt[] = [
  { id: "2h",     emoji: "🟢", label: "Moins de 2h" },
  { id: "4h",     emoji: "🟡", label: "Moins de 4h" },
  { id: "8h",     emoji: "🟠", label: "Moins de 8h" },
  { id: "any",    emoji: "✈️", label: "Peu importe" },
];

const LANGUAGE_SPOKEN: Opt[] = [
  { id: "fr", emoji: "🇫🇷", label: "Français" },
  { id: "en", emoji: "🇬🇧", label: "Anglais" },
  { id: "es", emoji: "🇪🇸", label: "Espagnol" },
  { id: "it", emoji: "🇮🇹", label: "Italien" },
  { id: "de", emoji: "🇩🇪", label: "Allemand" },
  { id: "pt", emoji: "🇵🇹", label: "Portugais" },
  { id: "ar", emoji: "🌙", label: "Arabe" },
  { id: "zh", emoji: "🇨🇳", label: "Mandarin / Chinois" },
  { id: "translate", emoji: "📱", label: "J'utilise un traducteur" },
];

const DIET: Opt[] = [
  { id: "vegetarian",   emoji: "🌿", label: "Végétarien" },
  { id: "vegan",        emoji: "🌱", label: "Végan" },
  { id: "pescatarian",  emoji: "🐟", label: "Pescatarien" },
  { id: "gluten_free",  emoji: "🚫", label: "Sans gluten" },
  { id: "lactose_free", emoji: "🥛", label: "Sans lactose" },
  { id: "halal",        emoji: "🔵", label: "Halal" },
  { id: "kosher",       emoji: "✡️", label: "Casher" },
  { id: "allergies",    emoji: "⚠️", label: "Allergies alimentaires" },
  { id: "none",         emoji: "✅", label: "Aucune restriction" },
];

/* ──────────────────────────────────────────────────────────
   TYPES
────────────────────────────────────────────────────────── */

interface Answers {
  flow: Flow;
  // Destination
  destination: string;
  scope_type: string;
  country_zones: string[];
  departure_city: string;
  // Dates
  arrival_date: string;
  departure_date: string;
  travel_dates: string;
  dates_flexible: string;
  // Group
  traveler_type: string;
  traveler_adults: number;
  traveler_children: number;
  // Budget
  budget: string;
  budget_amount: string;
  budget_currency: string;
  budget_scope: string;
  // Style
  activity_pace: string;
  authenticity: string;
  trip_type: string;
  trip_vibe: string;
  max_flight_time: string;
  // Accommodation & transport
  accommodations: string[];
  transport: string[];
  neighborhood_vibe: string;
  // Interests
  interests: string[];
  sports: string[];
  landscape: string[];
  climate: string;
  // Q2 specific
  already_visited: string;
  dream_experience: string;
  // Q1 specific
  non_negotiables: string;
  // Shared
  things_to_avoid: string;
  diet: string[];
  allergy_details: string;
  language_spoken: string[];
  special_occasion: string;
  // Final
  user_email: string;
  notes: string;
  language: Lang;
}

interface DestinationSuggestion {
  name: string;
  country: string;
  iso: string;
  flag: string;
  emoji: string;
  photo: string | null;
  type: string; // "valeur_sure" | "caractere" | "coup_de_coeur"
  tagline: string;
  why: string;
  weather: string;
  budget_note: string;
  ideal_duration: string;
  keywords: string[];
  downside: string;
}

const ISO_FLAGS: Record<string, string> = {
  AF:"🇦🇫",AL:"🇦🇱",DZ:"🇩🇿",AD:"🇦🇩",AO:"🇦🇴",AG:"🇦🇬",AR:"🇦🇷",AM:"🇦🇲",AU:"🇦🇺",AT:"🇦🇹",
  AZ:"🇦🇿",BS:"🇧🇸",BH:"🇧🇭",BD:"🇧🇩",BB:"🇧🇧",BY:"🇧🇾",BE:"🇧🇪",BZ:"🇧🇿",BJ:"🇧🇯",BT:"🇧🇹",
  BO:"🇧🇴",BA:"🇧🇦",BW:"🇧🇼",BR:"🇧🇷",BN:"🇧🇳",BG:"🇧🇬",BF:"🇧🇫",BI:"🇧🇮",CV:"🇨🇻",KH:"🇰🇭",
  CM:"🇨🇲",CA:"🇨🇦",CF:"🇨🇫",TD:"🇹🇩",CL:"🇨🇱",CN:"🇨🇳",CO:"🇨🇴",KM:"🇰🇲",CG:"🇨🇬",CR:"🇨🇷",
  HR:"🇭🇷",CU:"🇨🇺",CY:"🇨🇾",CZ:"🇨🇿",DK:"🇩🇰",DJ:"🇩🇯",DM:"🇩🇲",DO:"🇩🇴",EC:"🇪🇨",EG:"🇪🇬",
  SV:"🇸🇻",GQ:"🇬🇶",ER:"🇪🇷",EE:"🇪🇪",ET:"🇪🇹",FJ:"🇫🇯",FI:"🇫🇮",FR:"🇫🇷",GA:"🇬🇦",GM:"🇬🇲",
  GE:"🇬🇪",DE:"🇩🇪",GH:"🇬🇭",GR:"🇬🇷",GD:"🇬🇩",GT:"🇬🇹",GN:"🇬🇳",GW:"🇬🇼",GY:"🇬🇾",HT:"🇭🇹",
  HN:"🇭🇳",HU:"🇭🇺",IS:"🇮🇸",IN:"🇮🇳",ID:"🇮🇩",IR:"🇮🇷",IQ:"🇮🇶",IE:"🇮🇪",IL:"🇮🇱",IT:"🇮🇹",
  JM:"🇯🇲",JP:"🇯🇵",JO:"🇯🇴",KZ:"🇰🇿",KE:"🇰🇪",KI:"🇰🇮",KW:"🇰🇼",KG:"🇰🇬",LA:"🇱🇦",LV:"🇱🇻",
  LB:"🇱🇧",LS:"🇱🇸",LR:"🇱🇷",LY:"🇱🇾",LI:"🇱🇮",LT:"🇱🇹",LU:"🇱🇺",MG:"🇲🇬",MW:"🇲🇼",MY:"🇲🇾",
  MV:"🇲🇻",ML:"🇲🇱",MT:"🇲🇹",MH:"🇲🇭",MR:"🇲🇷",MU:"🇲🇺",MX:"🇲🇽",FM:"🇫🇲",MD:"🇲🇩",MC:"🇲🇨",
  MN:"🇲🇳",ME:"🇲🇪",MA:"🇲🇦",MZ:"🇲🇿",MM:"🇲🇲",NA:"🇳🇦",NR:"🇳🇷",NP:"🇳🇵",NL:"🇳🇱",NZ:"🇳🇿",
  NI:"🇳🇮",NE:"🇳🇪",NG:"🇳🇬",NO:"🇳🇴",OM:"🇴🇲",PK:"🇵🇰",PW:"🇵🇼",PA:"🇵🇦",PG:"🇵🇬",PY:"🇵🇾",
  PE:"🇵🇪",PH:"🇵🇭",PL:"🇵🇱",PT:"🇵🇹",QA:"🇶🇦",RO:"🇷🇴",RU:"🇷🇺",RW:"🇷🇼",KN:"🇰🇳",LC:"🇱🇨",
  VC:"🇻🇨",WS:"🇼🇸",SM:"🇸🇲",ST:"🇸🇹",SA:"🇸🇦",SN:"🇸🇳",RS:"🇷🇸",SC:"🇸🇨",SL:"🇸🇱",SG:"🇸🇬",
  SK:"🇸🇰",SI:"🇸🇮",SB:"🇸🇧",SO:"🇸🇴",ZA:"🇿🇦",SS:"🇸🇸",ES:"🇪🇸",LK:"🇱🇰",SD:"🇸🇩",SR:"🇸🇷",
  SE:"🇸🇪",CH:"🇨🇭",SY:"🇸🇾",TW:"🇹🇼",TJ:"🇹🇯",TZ:"🇹🇿",TH:"🇹🇭",TL:"🇹🇱",TG:"🇹🇬",TO:"🇹🇴",
  TT:"🇹🇹",TN:"🇹🇳",TR:"🇹🇷",TM:"🇹🇲",TV:"🇹🇻",UG:"🇺🇬",UA:"🇺🇦",AE:"🇦🇪",GB:"🇬🇧",US:"🇺🇸",
  UY:"🇺🇾",UZ:"🇺🇿",VU:"🇻🇺",VE:"🇻🇪",VN:"🇻🇳",YE:"🇾🇪",ZM:"🇿🇲",ZW:"🇿🇼",
};

function getFlag(s: DestinationSuggestion): string {
  if (s.iso) {
    const f = ISO_FLAGS[s.iso.toUpperCase().trim()];
    if (f) return f;
  }
  return s.emoji || "🌍";
}

const SCOPE_TYPE: Opt[] = [
  { id: "city", emoji: "🏙️", label: "Visite de la ville" },
  { id: "country", emoji: "🗺️", label: "Tour du pays / road trip" },
];

const COUNTRY_ZONES: Opt[] = [
  { id: "nord", emoji: "⬆️", label: "Nord" },
  { id: "sud", emoji: "⬇️", label: "Sud" },
  { id: "est", emoji: "➡️", label: "Est" },
  { id: "ouest", emoji: "⬅️", label: "Ouest" },
  { id: "tout", emoji: "🌐", label: "Tout le pays" },
];

const EMPTY: Answers = {
  flow: "", destination: "", scope_type: "", country_zones: [], departure_city: "",
  arrival_date: "", departure_date: "", travel_dates: "", dates_flexible: "",
  traveler_type: "", traveler_adults: 1, traveler_children: 0,
  budget: "", budget_amount: "", budget_currency: "€", budget_scope: "",
  activity_pace: "", authenticity: "", trip_type: "", trip_vibe: "",
  max_flight_time: "", accommodations: [], transport: [], neighborhood_vibe: "",
  interests: [], sports: [], landscape: [], climate: "",
  already_visited: "", dream_experience: "", non_negotiables: "", things_to_avoid: "",
  diet: [], allergy_details: "", language_spoken: [], special_occasion: "",
  user_email: "", notes: "", language: "fr",
};

/* ──────────────────────────────────────────────────────────
   UI PRIMITIVES
────────────────────────────────────────────────────────── */

function Pill({
  emoji, label, selected, onClick, disabled,
}: {
  emoji?: string; label: string; selected: boolean; onClick: () => void; disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "inline-flex items-center gap-1.5 px-4 py-2 rounded-full border-2 text-sm font-medium",
        "transition-all duration-150 select-none cursor-pointer",
        selected
          ? "border-[#425B48] bg-[#425B48] text-white shadow-[0_2px_8px_rgba(66,91,72,0.3)]"
          : disabled
          ? "border-[#e2e8f0] bg-[#f8fafc] text-[#94a3b8] cursor-not-allowed opacity-60"
          : "border-[#e2e8f0] bg-white text-[#475569] hover:border-[#c9a84c] hover:text-[#425B48]",
      ].join(" ")}
    >
      {emoji && <span>{emoji}</span>}
      <span>{label}</span>
    </button>
  );
}

function SectionCard({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-[#e8e0d4] p-6 shadow-sm">
      <h3 className="text-base font-bold text-[#425B48] flex items-center gap-2 mb-4">
        <span className="text-xl">{icon}</span>
        {title}
      </h3>
      {children}
    </div>
  );
}

function Stepper({
  value, min, max, onChange, label, sublabel,
}: {
  value: number; min: number; max: number; onChange: (v: number) => void; label: string; sublabel?: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[#e2e8f0] bg-white px-4 py-3">
      <div>
        <p className="text-sm font-semibold text-[#334155]">{label}</p>
        {sublabel && <p className="text-xs text-[#94a3b8] mt-0.5">{sublabel}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}
          className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#e2e8f0] text-lg font-bold text-[#425B48] transition hover:border-[#c9a84c] hover:text-[#c9a84c] disabled:opacity-30 disabled:cursor-not-allowed">−</button>
        <span className="w-6 text-center text-lg font-black text-[#425B48]">{value}</span>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}
          className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#e2e8f0] text-lg font-bold text-[#425B48] transition hover:border-[#c9a84c] hover:text-[#c9a84c] disabled:opacity-30 disabled:cursor-not-allowed">+</button>
      </div>
    </div>
  );
}

function QLabel({ children, hint, required }: { children: React.ReactNode; hint?: string; required?: boolean }) {
  return (
    <p className="text-sm font-semibold text-[#334155] mb-3">
      {children}
      {required && <span className="text-red-400 ml-1">*</span>}
      {hint && <span className="text-[#94a3b8] font-normal ml-1.5 text-xs">{hint}</span>}
    </p>
  );
}

/* ──────────────────────────────────────────────────────────
   CALENDAR
────────────────────────────────────────────────────────── */

const MONTH_NAMES = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
const WEEKDAY_LABELS = ["L","M","M","J","V","S","D"];
const LAST_SELECTABLE_DATE = "2027-12-31";

function toLocalDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
}
function parseLocalDate(dateKey: string): Date {
  const [y,m,d] = dateKey.split("-").map(Number);
  return new Date(y, m-1, d);
}
function compareDateKeys(a: string, b: string): number { return a.localeCompare(b); }
function addDays(date: Date, amount: number): Date {
  const d = new Date(date); d.setDate(d.getDate()+amount); return d;
}
function countInclusiveDays(start: string, end: string): number {
  return Math.floor((parseLocalDate(end).getTime()-parseLocalDate(start).getTime())/86_400_000)+1;
}
function formatDateFr(dateKey: string): string {
  return parseLocalDate(dateKey).toLocaleDateString("fr-FR",{day:"numeric",month:"short",year:"numeric"});
}
function formatTravelDates(s: string, e: string): string {
  if (!s && !e) return "";
  if (s && !e) return s;
  if (!s && e) return e;
  if (s === e) return s;
  return `${s} → ${e}`;
}
function getMonthCells(monthDate: Date) {
  const first = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const offset = (first.getDay()+6)%7;
  const firstCell = addDays(first, -offset);
  return Array.from({length:42},(_,i) => {
    const date = addDays(firstCell,i);
    return { date, key: toLocalDateKey(date), inCurrentMonth: date.getMonth()===monthDate.getMonth(), isWeekend: date.getDay()===0||date.getDay()===6 };
  });
}

function TravelDateCalendar({ planKey, startDate, endDate, onChange }: {
  planKey: PlanKey|null; startDate: string; endDate: string; onChange: (s:string,e:string)=>void;
}) {
  const todayKey = useMemo(()=>toLocalDateKey(new Date()),[]);
  const firstMonth = useMemo(()=>{const t=parseLocalDate(todayKey);return new Date(t.getFullYear(),t.getMonth(),1);},[todayKey]);
  const [visibleMonth, setVisibleMonth] = useState(firstMonth);
  const [calendarError, setCalendarError] = useState<string|null>(null);
  const [isChoosingEnd, setIsChoosingEnd] = useState(false);

  const maxDays = planKey ? PLAN_DATE_LIMITS[planKey].maxDays : 3;
  const planLabel = planKey ? PLAN_DATE_LIMITS[planKey].label : "3 jours";
  const selectedDays = startDate && endDate ? countInclusiveDays(startDate,endDate) : startDate ? 1 : 0;
  const monthCells = getMonthCells(visibleMonth);
  const curKey = `${visibleMonth.getFullYear()}-${String(visibleMonth.getMonth()+1).padStart(2,"0")}`;
  const firstKey = `${firstMonth.getFullYear()}-${String(firstMonth.getMonth()+1).padStart(2,"0")}`;

  function moveMonth(n: number) { setVisibleMonth(p=>new Date(p.getFullYear(),p.getMonth()+n,1)); setCalendarError(null); }

  function selectDate(dateKey: string) {
    if (!planKey) { setCalendarError("Choisissez d'abord un forfait."); return; }
    if (!startDate || !isChoosingEnd || compareDateKeys(dateKey,startDate)<0) {
      onChange(dateKey,dateKey); setIsChoosingEnd(true); setCalendarError(null); return;
    }
    const next = countInclusiveDays(startDate,dateKey);
    if (next>maxDays) { setCalendarError(`Votre plan ${planLabel} ne peut pas dépasser ${maxDays} jours. Choisissez un plan supérieur.`); return; }
    onChange(startDate,dateKey); setIsChoosingEnd(false); setCalendarError(null);
  }

  return (
    <div className="mt-5 rounded-3xl border border-[#d9c996] bg-[#fffdf8] p-4 sm:p-5 shadow-[0_18px_50px_rgba(66,91,72,0.08)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#c9a84c]">Calendrier de voyage</p>
          <h4 className="mt-1 text-lg font-bold text-[#425B48]" style={{fontFamily:"var(--font-playfair),Georgia,serif"}}>Sélectionnez vos dates</h4>
          <p className="mt-1 text-xs leading-relaxed text-[#64748b]">Cliquez sur une date de début puis une de fin. Vous pouvez choisir moins de jours que le forfait.</p>
        </div>
        <div className="rounded-2xl border border-[#c9a84c]/40 bg-[#fff8e6] px-4 py-2 text-center">
          <p className="text-xl font-black text-[#425B48]">{selectedDays} / {maxDays}</p>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9a7b21]">jours sélectionnés</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#425B48] px-3 py-2 text-white">
        <button type="button" onClick={()=>moveMonth(-1)} disabled={curKey<=firstKey}
          className="rounded-xl px-3 py-2 text-lg font-bold transition-colors enabled:hover:bg-white/10 disabled:cursor-not-allowed disabled:text-white/30">←</button>
        <p className="text-sm font-bold capitalize tracking-wide">{MONTH_NAMES[visibleMonth.getMonth()]} {visibleMonth.getFullYear()}</p>
        <button type="button" onClick={()=>moveMonth(1)} disabled={curKey>="2027-12"}
          className="rounded-xl px-3 py-2 text-lg font-bold transition-colors enabled:hover:bg-white/10 disabled:cursor-not-allowed disabled:text-white/30">→</button>
      </div>
      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[11px] font-bold uppercase tracking-[0.14em] text-[#94a3b8]">
        {WEEKDAY_LABELS.map((w,i)=><span key={i} className={i>=5?"text-[#c9a84c]":undefined}>{w}</span>)}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1.5">
        {monthCells.map(({key,date,inCurrentMonth,isWeekend})=>{
          if (!inCurrentMonth) return <div key={key} className="aspect-square"/>;
          const isPast = compareDateKeys(key,todayKey)<0;
          const isTooFar = compareDateKeys(key,LAST_SELECTABLE_DATE)>0;
          const disabled = isPast||isTooFar;
          const inRange = startDate&&endDate&&compareDateKeys(key,startDate)>=0&&compareDateKeys(key,endDate)<=0;
          const isStart = key===startDate;
          const isEnd = key===endDate&&endDate!==startDate;
          return (
            <button key={key} type="button" onClick={()=>selectDate(key)} disabled={disabled}
              className={["relative aspect-square rounded-2xl text-sm font-bold transition-all duration-150",
                disabled?"cursor-not-allowed bg-[#f1f5f9] text-[#cbd5e1] opacity-50":
                inRange?"bg-[#425B48] text-white shadow-[0_10px_22px_rgba(66,91,72,0.22)] hover:scale-105":
                isWeekend?"bg-[#fff7df] text-[#9a7b21] hover:bg-[#c9a84c] hover:text-white":
                "bg-white text-[#334155] hover:bg-[#c9a84c] hover:text-white",
                (isStart||isEnd)&&!disabled?"ring-2 ring-[#c9a84c]":"",
              ].join(" ")}
              aria-label={formatDateFr(key)} aria-pressed={Boolean(inRange)}
            >{date.getDate()}</button>
          );
        })}
      </div>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-[#64748b]">Disponible jusqu&apos;au 31 décembre 2027.</p>
        {(startDate||endDate)&&(
          <button type="button" onClick={()=>{onChange("","");setIsChoosingEnd(false);setCalendarError(null);}}
            className="self-start rounded-full border border-[#e2e8f0] px-4 py-2 text-xs font-bold text-[#425B48] transition-colors hover:border-[#c9a84c] hover:text-[#c9a84c] sm:self-auto">
            Effacer les dates
          </button>
        )}
      </div>
      {startDate&&(
        <div className="mt-3 rounded-2xl border border-[#c9a84c]/30 bg-white px-4 py-3 text-sm text-[#425B48]">
          <strong>Dates choisies :</strong> {formatDateFr(startDate)}{endDate&&endDate!==startDate?` → ${formatDateFr(endDate)}`:""}
        </div>
      )}
      {calendarError&&<p className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{calendarError}</p>}
    </div>
  );
}

function PlanSelector({ selectedPlanKey, onSelect }: { selectedPlanKey: PlanKey|null; onSelect: (p:PlanKey)=>void }) {
  return (
    <section className="bg-white rounded-2xl border border-[#e8e0d4] p-5 sm:p-6 shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[#c9a84c] font-bold mb-1">Forfait</p>
          <h2 className="text-xl sm:text-2xl font-bold text-[#425B48]" style={{fontFamily:"var(--font-playfair),Georgia,serif"}}>
            {selectedPlanKey ? "Votre forfait sélectionné" : "Choisissez votre forfait"}
          </h2>
        </div>
        <p className="text-sm text-[#64748b] sm:text-right">Modifiable avant le paiement.</p>
      </div>
      <div className="-mx-5 sm:mx-0 overflow-x-auto pb-1 sm:overflow-visible">
        <div className="flex gap-3 px-5 sm:px-0 sm:grid sm:grid-cols-4 min-w-max sm:min-w-0">
          {PLAN_ORDER.map(planKey=>{
            const p = PLANS[planKey];
            const selected = selectedPlanKey===planKey;
            return (
              <button key={planKey} type="button" onClick={()=>onSelect(planKey)} aria-pressed={selected}
                className={["w-36 sm:w-auto rounded-2xl border-2 p-4 text-left transition-all duration-200 shrink-0",
                  selected?"border-[#c9a84c] bg-[#fff8e6] shadow-[0_10px_24px_rgba(201,168,76,0.22)] scale-[1.02]":
                  "border-[#e8e0d4] bg-[#fffdf9] hover:border-[#c9a84c]/70 hover:bg-[#fffaf0]"].join(" ")}>
                <span className="block text-sm font-bold text-[#425B48]">{p.duration}</span>
                <span className="mt-2 flex items-baseline gap-2">
                  <span className="text-xs text-[#94a3b8] line-through">{p.oldPrice}</span>
                  <span className="text-2xl font-black text-[#c9a84c]">{p.price}</span>
                </span>
                <span className="mt-2 block text-[11px] font-semibold text-[#64748b]">{p.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────
   MAIN COMPONENT
────────────────────────────────────────────────────────── */

function QuestionnaireContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialPlanKey = resolvePlanKey(searchParams.get("plan") ?? "");
  const initialEmail = searchParams.get("email") ?? "";
  const editItemId = searchParams.get("edit");
  const urlLang = resolveLanguage(searchParams.get("lang"));

  const [language, setLanguage] = useState<Lang>(()=>{
    if (typeof window!=="undefined"){const s=localStorage.getItem("tgai_lang");if(s==="en")return "en";}
    return urlLang;
  });
  const legalCopy = LEGAL_COPY[language];

  const [step, setStep] = useState(1);
  const [selectedPlanKey, setSelectedPlanKey] = useState<PlanKey|null>(initialPlanKey);
  const [answers, setAnswers] = useState<Answers>(()=>({...EMPTY, user_email:initialEmail, language}));
  const [errors, setErrors] = useState<{destination?:string;dates?:string;email?:string;departure_city?:string}>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string|null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [step2Errors, setStep2Errors] = useState<Record<string,string>>({});
  const [termsError, setTermsError] = useState<string|null>(null);
  const [cartNotice, setCartNotice] = useState<string|null>(null);
  const [isEditingCartItem, setIsEditingCartItem] = useState(false);
  const [discoverPhase, setDiscoverPhase] = useState<"form"|"loading"|"results"|"error">("form");
  const [suggestions, setSuggestions] = useState<DestinationSuggestion[]>([]);
  const [suggestError, setSuggestError] = useState<string>("");
  const [phoneGate, setPhoneGate] = useState<null|"checking"|"blocked">(null);

  const plan = selectedPlanKey ? PLANS[selectedPlanKey] : null;

  useEffect(()=>{
    const handler = (e: Event)=>{
      const ev = e as CustomEvent<{lang:"fr"|"en"}>;
      setLanguage(ev.detail.lang);
      setAnswers(p=>({...p,language:ev.detail.lang}));
    };
    window.addEventListener("tgai_lang_change",handler);
    return ()=>window.removeEventListener("tgai_lang_change",handler);
  },[]);

  useEffect(()=>{
    if (!editItemId) return;
    queueMicrotask(()=>{
      const cartItem = getCartItem(editItemId);
      if (!cartItem){setSubmitError("Cet article n'est plus dans votre panier.");return;}
      setIsEditingCartItem(true);
      setSelectedPlanKey(cartItem.planId);
      setAnswers({...EMPTY,...(cartItem.criteria as Partial<Answers>),destination:cartItem.destination,travel_dates:cartItem.dates,language} as Answers);
    });
  },[editItemId,language]);

  /* helpers */
  function radio(field: keyof Answers, value: string) {
    setAnswers(p=>({...p,[field]:(p[field] as string)===value?"":value}));
  }
  function toggle(field: "accommodations"|"transport"|"interests"|"sports"|"landscape"|"diet"|"language_spoken", value: string) {
    setAnswers(p=>{const arr=p[field] as string[];return{...p,[field]:arr.includes(value)?arr.filter(v=>v!==value):[...arr,value]};});
  }
  function toggleInterest(value: string) {
    setAnswers(p=>{
      const arr=p.interests;
      if (arr.includes(value)) return{...p,interests:arr.filter(v=>v!==value)};
      if (arr.length>=5) return p;
      return{...p,interests:[...arr,value]};
    });
  }

  function choosePlan(next: PlanKey) {
    setSelectedPlanKey(next);
    setSubmitError(null);
    const nextMax = PLAN_DATE_LIMITS[next].maxDays;
    if (answers.arrival_date&&answers.departure_date&&countInclusiveDays(answers.arrival_date,answers.departure_date)>nextMax) {
      setAnswers(p=>({...p,arrival_date:"",departure_date:"",travel_dates:""}));
      setErrors(p=>({...p,dates:`Votre nouveau plan ${PLAN_DATE_LIMITS[next].label} accepte ${nextMax} jours maximum.`}));
    }
    const params = new URLSearchParams(searchParams.toString());
    params.set("plan",next);
    window.history.replaceState(null,"",`?${params.toString()}`);
  }

  function updateTravelDates(s: string, e: string) {
    setAnswers(p=>({...p,arrival_date:s,departure_date:e,travel_dates:formatTravelDates(s,e)}));
    if (errors.dates) setErrors(p=>({...p,dates:undefined}));
  }

  function scrollToError(id: string) {
    setTimeout(()=>{const el=document.getElementById(id);if(el)el.scrollIntoView({behavior:"smooth",block:"center"});},50);
  }

  function goNext() {
    if (step===1) {
      const nextErrors: typeof errors = {};
      if (answers.flow==="destination"&&!answers.destination.trim()) nextErrors.destination="Veuillez indiquer votre destination.";
      if (!answers.departure_city.trim()) nextErrors.departure_city="Veuillez indiquer votre ville de départ.";
      if (!answers.arrival_date) nextErrors.dates="Veuillez sélectionner au moins une date.";
      if (!answers.dates_flexible) nextErrors.dates=(nextErrors.dates||"Veuillez indiquer si vos dates sont flexibles.");
      if (Object.keys(nextErrors).length>0) {
        setErrors(nextErrors);
        if (nextErrors.destination) scrollToError("field-destination");
        else if (nextErrors.departure_city) scrollToError("field-departure-city");
        else if (nextErrors.dates) scrollToError("field-dates");
        return;
      }
      setErrors({});
    }
    if (step===2) {
      const s2: Record<string,string> = {};
      if (!answers.budget) s2.budget="Veuillez choisir un niveau de budget.";
      if (answers.accommodations.length===0) s2.accommodations="Veuillez choisir au moins un type d'hébergement.";
      if (!answers.activity_pace) s2.activity_pace="Veuillez choisir un rythme.";
      if (!answers.authenticity) s2.authenticity="Veuillez choisir un style de découverte.";
      if (answers.transport.length===0) s2.transport="Veuillez choisir au moins un transport.";
      if (answers.interests.length===0) s2.interests="Veuillez choisir au moins un intérêt.";
      if (answers.language_spoken.length===0) s2.language_spoken="Veuillez indiquer au moins une langue.";
      if (!isDestFlow) {
        if (!answers.climate) s2.climate="Veuillez choisir un climat.";
        if (!answers.trip_vibe) s2.trip_vibe="Veuillez choisir une ambiance.";
        if (!answers.trip_type) s2.trip_type="Veuillez choisir un type de voyage.";
      }
      if (Object.keys(s2).length>0) {
        setStep2Errors(s2);
        const firstKey = Object.keys(s2)[0];
        scrollToError(`s2-${firstKey}`);
        return;
      }
      setStep2Errors({});
      if (answers.flow==="discover") {
        window.scrollTo({top:0,behavior:"smooth"});
        setDiscoverPhase("loading");
        fetch("/api/suggest-destinations",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(answers)})
          .then(r=>{
            if(!r.ok) return r.text().then(t=>{throw new Error(`HTTP ${r.status}: ${t.slice(0,300)}`);});
            return r.json();
          })
          .then(data=>{
            if(data.suggestions?.length>0){setSuggestions(data.suggestions);setDiscoverPhase("results");}
            else{setSuggestError(data.error||data.raw||"Réponse vide");setDiscoverPhase("error");}
          })
          .catch(e=>{setSuggestError(String(e));setDiscoverPhase("error");});
        return;
      }
    }
    setStep(s=>Math.min(3,s+1));
    window.scrollTo({top:0,behavior:"smooth"});
  }

  function goPrev() { setStep(s=>Math.max(1,s-1)); window.scrollTo({top:0,behavior:"smooth"}); }

  function buildCartItemInput(planKey: PlanKey, selectedPlan: typeof PLANS[PlanKey]): CartItemInput {
    const dest = answers.destination.trim() || "Destination suggérée par IA";
    return {
      planId: planKey,
      planLabel: CART_PLANS[planKey].label,
      price: selectedPlan.priceN*100,
      destination: dest,
      dates: answers.travel_dates||formatTravelDates(answers.arrival_date,answers.departure_date),
      criteria: {...answers},
    };
  }

  function handleAddToCart() {
    setTermsError(null);
    if (!selectedPlanKey||!plan) {setSubmitError("Veuillez choisir votre forfait.");setStep(1);window.scrollTo({top:0,behavior:"smooth"});return;}
    if (!answers.user_email.trim()||!answers.user_email.includes("@")) {setErrors({email:"Veuillez entrer une adresse courriel valide."});scrollToError("field-email");return;}
    if (answers.flow==="destination"&&!answers.destination.trim()) {setErrors({destination:"Veuillez indiquer votre destination."});setStep(1);setTimeout(()=>scrollToError("field-destination"),100);return;}
    if (!answers.arrival_date) {setErrors({dates:"Veuillez sélectionner au moins une date."});setStep(1);setTimeout(()=>scrollToError("field-dates"),100);return;}
    setErrors({});
    setSubmitting(true);
    setSubmitError(null);

    const cartInput = buildCartItemInput(selectedPlanKey,plan);
    const updatedItem = editItemId ? updateCartItem(editItemId,cartInput) : null;
    if (editItemId&&updatedItem){router.push("/cart");return;}
    if (editItemId&&!updatedItem){setSubmitError("Cet article n'existe plus.");setSubmitting(false);return;}
    addCartItem(cartInput);
    setCartNotice("✅ Ajouté au panier !");
    setSubmitting(false);
    window.scrollTo({top:0,behavior:"smooth"});
  }

  const showSports = answers.interests.some(i=>["adventure","sport"].includes(i));
  const tripDuration = (()=>{
    if (answers.arrival_date&&answers.departure_date){const d=countInclusiveDays(answers.arrival_date,answers.departure_date);if(d>0)return `${d} jour${d>1?"s":""}`;}
    return plan?.duration??"durée à choisir";
  })();

  /* ── FLOW SELECTOR ── */
  if (!answers.flow) {
    return (
      <div className="min-h-screen bg-[#fdf8f0]" style={{fontFamily:"var(--font-dm-sans),system-ui,sans-serif"}}>
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-[#e8e0d4] shadow-sm">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <Link href="/" className="font-bold text-[#425B48] text-base" style={{fontFamily:"var(--font-playfair),Georgia,serif"}}>TravelGuide AI</Link>
            <LangToggle />
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-[#425C47]/8 border border-[#425C47]/15 rounded-full px-4 py-1.5 mb-4">
              <span>✈️</span>
              <span className="text-xs font-bold text-[#425C47] uppercase tracking-wide">Créer mon guide</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#425B48] mb-3" style={{fontFamily:"var(--font-playfair),Georgia,serif"}}>
              Quel type de voyage ?
            </h1>
            <p className="text-[#64748b] text-base max-w-md mx-auto">
              Deux parcours selon votre situation. Le guide sera personnalisé dans les deux cas.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {/* Q1 */}
            <button
              type="button"
              onClick={()=>setAnswers(p=>({...p,flow:"destination"}))}
              className="group text-left rounded-3xl border-2 border-[#e8e0d4] bg-white p-7 shadow-sm hover:border-[#425B48] hover:shadow-lg transition-all duration-200"
            >
              <div className="text-4xl mb-4">📍</div>
              <h2 className="text-lg font-bold text-[#425B48] mb-2" style={{fontFamily:"var(--font-playfair),Georgia,serif"}}>
                J&apos;ai ma destination
              </h2>
              <p className="text-sm text-[#64748b] leading-relaxed mb-4">
                Vous savez déjà où vous voulez aller. L&apos;IA crée un programme sur mesure pour votre destination.
              </p>
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#425B48] group-hover:text-[#c9a84c] transition-colors">
                Choisir ce parcours →
              </span>
            </button>

            {/* Q2 */}
            <button
              type="button"
              onClick={async ()=>{
                setPhoneGate("checking");
                try {
                  const r = await fetch("/api/phone-status");
                  const d = await r.json();
                  if (!d.loggedIn || !d.verified) { setPhoneGate("blocked"); return; }
                } catch { setPhoneGate("blocked"); return; }
                setPhoneGate(null);
                setAnswers(p=>({...p,flow:"discover"}));
              }}
              className="group text-left rounded-3xl border-2 border-[#e8e0d4] bg-white p-7 shadow-sm hover:border-[#c9a84c] hover:shadow-lg transition-all duration-200"
            >
              <div className="text-4xl mb-4">🌍</div>
              <h2 className="text-lg font-bold text-[#425B48] mb-2" style={{fontFamily:"var(--font-playfair),Georgia,serif"}}>
                Où partir ?
              </h2>
              <p className="text-sm text-[#64748b] leading-relaxed mb-4">
                Vous n&apos;avez pas encore choisi. L&apos;IA vous suggère les meilleures destinations selon vos envies.
              </p>
              {phoneGate==="checking"
                ? <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#94a3b8]">Vérification…</span>
                : <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#c9a84c] group-hover:text-[#b8962e] transition-colors">Choisir ce parcours →</span>
              }
            </button>
            {phoneGate==="blocked"&&(
              <div className="sm:col-span-2 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
                <p className="font-bold mb-1">📱 Numéro de téléphone requis</p>
                <p>Pour accéder aux suggestions IA, vérifiez votre numéro de téléphone dans votre <a href="/account" className="font-semibold underline">espace compte</a>.</p>
              </div>
            )}
          </div>

          <p className="mt-8 text-center text-xs text-[#94a3b8]">
            Vous pourrez modifier votre sélection à tout moment avant de payer.
          </p>
        </main>
      </div>
    );
  }

  const isDestFlow = answers.flow==="destination";
  const STEP_LABELS = ["Infos essentielles","Vos préférences","Finaliser"];

  /* ── RENDER MAIN ── */
  return (
    <div className="min-h-screen bg-[#fdf8f0]" style={{fontFamily:"var(--font-dm-sans),system-ui,sans-serif"}}>
      {/* HEADER */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-[#e8e0d4] shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-3 mb-2">
            <button
              type="button"
              onClick={()=>setAnswers(p=>({...p,flow:""}))}
              className="font-bold text-[#425B48] text-base shrink-0 hover:text-[#c9a84c] transition-colors"
              style={{fontFamily:"var(--font-playfair),Georgia,serif"}}
            >
              TravelGuide AI
            </button>
            <LangToggle />
            <div className="flex items-center gap-2 bg-[#425B48]/8 border border-[#425B48]/15 rounded-full px-3 py-1.5 text-xs font-semibold text-[#425B48]">
              <span>{isDestFlow?"📍":"🌍"}</span>
              <span className="hidden sm:inline">{isDestFlow?"J'ai ma destination":"Où partir ?"} — </span>
              {plan ? <span className="text-[#c9a84c]">{plan.price}</span> : <span>Choisissez un forfait</span>}
            </div>
          </div>
          {/* Progress */}
          <div className="flex items-center gap-0">
            {STEP_LABELS.map((label,i)=>{
              const n=i+1;const active=n===step;const done=n<step;
              return (
                <div key={n} className="flex items-center flex-1 last:flex-none">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${done?"bg-[#425B48] text-white":active?"bg-[#c9a84c] text-white shadow-md":"bg-[#e2e8f0] text-[#94a3b8]"}`}>
                      {done?"✓":n}
                    </div>
                    <span className={`text-xs font-medium hidden sm:inline ${active?"text-[#425B48]":"text-[#94a3b8]"}`}>{label}</span>
                  </div>
                  {n<3&&<div className="flex-1 h-0.5 mx-2 bg-[#e2e8f0] rounded-full overflow-hidden"><div className={`h-full bg-[#425B48] transition-all duration-300 ${done?"w-full":"w-0"}`}/></div>}
                </div>
              );
            })}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5">
        {cartNotice&&(
          <div className="rounded-2xl border border-[#c9a84c]/40 bg-white px-5 py-4 shadow-sm">
            <p className="font-bold text-[#425B48]">{cartNotice}</p>
            <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold">
              <Link href="/#pricing" className="rounded-full border border-[#425B48]/15 px-4 py-2 text-[#425B48] hover:border-[#c9a84c]">Continuer</Link>
              <Link href="/cart" className="rounded-full bg-[#c9a84c] px-4 py-2 text-white hover:bg-[#b8962e]">Voir le panier</Link>
            </div>
          </div>
        )}

        {discoverPhase==="form"&&<PlanSelector selectedPlanKey={selectedPlanKey} onSelect={choosePlan} />}

        {/* ═══════════ STEP 1 ═══════════ */}
        {step===1&&(
          <>
            <div className="mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#425B48] mb-1" style={{fontFamily:"var(--font-playfair),Georgia,serif"}}>
                {isDestFlow?"Votre voyage ✈️":"Vos envies de voyage 🌍"}
              </h1>
              <p className="text-[#64748b] text-sm">
                {isDestFlow?"Indiquez votre destination, vos dates et votre groupe.":"Dites-nous d'où vous partez, quand et avec qui."}
              </p>
            </div>

            {/* Destination — Q1 only */}
            {isDestFlow&&(
              <div id="field-destination">
                <SectionCard icon="📍" title="Destination">
                  <QLabel required>Où souhaitez-vous aller ?</QLabel>
                  <input
                    type="text"
                    list="destinations-list"
                    value={answers.destination}
                    onChange={e=>{setAnswers(p=>({...p,destination:e.target.value}));if(errors.destination)setErrors({});}}
                    placeholder="Ville, pays ou région… ex. Tokyo, Japon"
                    className={`w-full border-2 rounded-xl px-4 py-3 text-sm focus:outline-none bg-white transition-colors ${errors.destination?"border-red-400":"border-[#e2e8f0] focus:border-[#c9a84c]"}`}
                  />
                  <datalist id="destinations-list">{DESTINATIONS.map(d=><option key={d} value={d}/>)}</datalist>
                  <p className="text-xs text-[#94a3b8] mt-1.5">💡 Suggestions disponibles — vérifiez l&apos;orthographe avant de continuer.</p>
                  {errors.destination&&<p className="text-xs text-red-500 mt-1 font-semibold">{errors.destination}</p>}
                  <div className="mt-4">
                    <QLabel>Type de séjour</QLabel>
                    <div className="flex flex-wrap gap-2">
                      {SCOPE_TYPE.map(o=>(
                        <Pill key={o.id} emoji={o.emoji} label={o.label}
                          selected={answers.scope_type===o.id}
                          onClick={()=>radio("scope_type",o.id)}/>
                      ))}
                    </div>
                  </div>
                  {answers.scope_type==="country"&&(
                    <div className="mt-4">
                      <QLabel hint="(plusieurs choix)">Quelle(s) zone(s) du pays ?</QLabel>
                      <div className="flex flex-wrap gap-2">
                        {COUNTRY_ZONES.map(o=>(
                          <Pill key={o.id} emoji={o.emoji} label={o.label}
                            selected={answers.country_zones.includes(o.id)}
                            onClick={()=>{setAnswers(p=>{const arr=p.country_zones;return{...p,country_zones:arr.includes(o.id)?arr.filter(v=>v!==o.id):[...arr,o.id]};});}}/>
                        ))}
                      </div>
                    </div>
                  )}
                </SectionCard>
              </div>
            )}

            {/* Departure city — both flows */}
            <div id="field-departure-city">
              <SectionCard icon="🏠" title="Départ">
                <QLabel required>Depuis quelle ville partez-vous ?</QLabel>
                <input
                  type="text"
                  value={answers.departure_city}
                  onChange={e=>{setAnswers(p=>({...p,departure_city:e.target.value}));if(errors.departure_city)setErrors({});}}
                  placeholder="ex. Paris, Lyon, Bordeaux…"
                  className={`w-full border-2 rounded-xl px-4 py-3 text-sm focus:outline-none bg-white transition-colors ${errors.departure_city?"border-red-400":"border-[#e2e8f0] focus:border-[#c9a84c]"}`}
                />
                {errors.departure_city&&<p className="text-xs text-red-500 mt-1 font-semibold">{errors.departure_city}</p>}

                {/* Max flight time — Q2 only */}
                {!isDestFlow&&(
                  <div className="mt-4">
                    <QLabel>Temps de vol maximum acceptable ?</QLabel>
                    <div className="flex flex-wrap gap-2">
                      {FLIGHT_TIME.map(o=><Pill key={o.id} emoji={o.emoji} label={o.label} selected={answers.max_flight_time===o.id} onClick={()=>radio("max_flight_time",o.id)}/>)}
                    </div>
                  </div>
                )}
              </SectionCard>
            </div>

            {/* Dates */}
            <div id="field-dates">
              <SectionCard icon="📅" title="Dates du voyage">
                <TravelDateCalendar planKey={selectedPlanKey} startDate={answers.arrival_date} endDate={answers.departure_date} onChange={updateTravelDates}/>
                {errors.dates&&<p className="text-xs font-semibold text-red-500 mt-2">{errors.dates}</p>}
                <div className="mt-4">
                  <QLabel required>Vos dates sont-elles flexibles ?</QLabel>
                  <div className="flex flex-wrap gap-2">
                    {[{id:"fixed",emoji:"📌",label:"Non, dates fixes"},{id:"flexible",emoji:"🗓️",label:"Oui, flexibles"}].map(o=>(
                      <Pill key={o.id} emoji={o.emoji} label={o.label} selected={answers.dates_flexible===o.id} onClick={()=>radio("dates_flexible",o.id)}/>
                    ))}
                  </div>
                </div>
              </SectionCard>
            </div>

            {/* Group */}
            <SectionCard icon="👥" title="Votre groupe">
              <div className="space-y-4">
                <div>
                  <QLabel>Avec qui voyagez-vous ?</QLabel>
                  <div className="flex flex-wrap gap-2">
                    {TRAVELER_TYPE.map(o=><Pill key={o.id} emoji={o.emoji} label={o.label} selected={answers.traveler_type===o.id} onClick={()=>radio("traveler_type",o.id)}/>)}
                  </div>
                </div>
                <div>
                  <QLabel>Combien de voyageurs ?</QLabel>
                  <div className="space-y-2">
                    <Stepper label="🧑 Adultes" sublabel="18 ans et plus" value={answers.traveler_adults} min={1} max={20} onChange={v=>setAnswers(p=>({...p,traveler_adults:v}))}/>
                    <Stepper label="👶 Enfants" sublabel="Moins de 18 ans" value={answers.traveler_children} min={0} max={10} onChange={v=>setAnswers(p=>({...p,traveler_children:v}))}/>
                  </div>
                  {answers.traveler_children>0&&(
                    <p className="mt-2 rounded-xl border border-[#c9a84c]/30 bg-[#fffbf0] px-3 py-2 text-xs text-[#9a7629]">
                      💡 Précisez les âges des enfants dans les notes libres (étape 3) si besoin d&apos;activités adaptées.
                    </p>
                  )}
                </div>
              </div>
            </SectionCard>
          </>
        )}

        {/* ═══════════ STEP 2 ═══════════ */}
        {step===2&&discoverPhase==="form"&&(
          <>
            <div className="mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#425B48] mb-1" style={{fontFamily:"var(--font-playfair),Georgia,serif"}}>
                Vos préférences 🎯
              </h1>
              <p className="text-[#64748b] text-sm">Personnalisez votre style de voyage.</p>
            </div>

            {/* Budget */}
            <div id="s2-budget">
            <SectionCard icon="💰" title="Budget">
              <div className="space-y-4">
                <div>
                  <QLabel required>Niveau de budget</QLabel>
                  <div className="flex flex-wrap gap-2">
                    {BUDGET_OPTS.map(o=><Pill key={o.id} emoji={o.emoji} label={o.label} selected={answers.budget===o.id} onClick={()=>{radio("budget",o.id);setStep2Errors(p=>{const n={...p};delete n.budget;return n;});}}/>)}
                  </div>
                  {step2Errors.budget&&<p className="text-xs text-red-500 mt-1 font-semibold">{step2Errors.budget}</p>}
                </div>
                <div>
                  <QLabel hint="(optionnel)">Budget total approximatif</QLabel>
                  <div className="flex flex-wrap items-center gap-2">
                    <input type="number" min="0" max="999999" value={answers.budget_amount}
                      onChange={e=>setAnswers(p=>({...p,budget_amount:e.target.value}))}
                      placeholder="ex. 1500"
                      className="w-32 border-2 border-[#e2e8f0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c9a84c] bg-white transition-colors"/>
                    <div className="flex gap-1">
                      {["€","$","£"].map(c=>(
                        <button key={c} type="button" onClick={()=>setAnswers(p=>({...p,budget_currency:c}))}
                          className={`w-9 h-9 rounded-full text-sm font-bold border-2 transition-all ${answers.budget_currency===c?"border-[#425B48] bg-[#425B48] text-white":"border-[#e2e8f0] text-[#64748b] hover:border-[#c9a84c]"}`}>
                          {c}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      {[{id:"total",label:"total"},{id:"per_person",label:"/ pers."}].map(o=>(
                        <button key={o.id} type="button" onClick={()=>radio("budget_scope",o.id)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${answers.budget_scope===o.id?"border-[#425B48] bg-[#425B48] text-white":"border-[#e2e8f0] text-[#64748b] hover:border-[#c9a84c]"}`}>
                          {o.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>
            </div>

            {/* Landscape & Climate — Q2 only */}
            {!isDestFlow&&(
              <SectionCard icon="🌍" title="Décor & environnement">
                <div className="space-y-4">
                  <div>
                    <QLabel hint="(plusieurs choix)">Type de paysage souhaité</QLabel>
                    <div className="flex flex-wrap gap-2">
                      {LANDSCAPE.map(o=><Pill key={o.id} emoji={o.emoji} label={o.label} selected={answers.landscape.includes(o.id)} onClick={()=>toggle("landscape",o.id)}/>)}
                    </div>
                  </div>
                  <div id="s2-climate">
                    <QLabel required>Climat préféré</QLabel>
                    <div className="flex flex-wrap gap-2">
                      {CLIMATE.map(o=><Pill key={o.id} emoji={o.emoji} label={o.label} selected={answers.climate===o.id} onClick={()=>{radio("climate",o.id);setStep2Errors(p=>{const n={...p};delete n.climate;return n;});}}/>)}
                    </div>
                    {step2Errors.climate&&<p className="text-xs text-red-500 mt-1 font-semibold">{step2Errors.climate}</p>}
                  </div>
                  <div id="s2-trip_vibe">
                    <QLabel required>Ambiance du voyage</QLabel>
                    <div className="flex flex-wrap gap-2">
                      {TRIP_VIBE.map(o=><Pill key={o.id} emoji={o.emoji} label={o.label} selected={answers.trip_vibe===o.id} onClick={()=>{radio("trip_vibe",o.id);setStep2Errors(p=>{const n={...p};delete n.trip_vibe;return n;});}}/>)}
                    </div>
                    {step2Errors.trip_vibe&&<p className="text-xs text-red-500 mt-1 font-semibold">{step2Errors.trip_vibe}</p>}
                  </div>
                  <div id="s2-trip_type">
                    <QLabel required>Un lieu ou plusieurs étapes ?</QLabel>
                    <div className="flex flex-wrap gap-2">
                      {TRIP_TYPE.map(o=><Pill key={o.id} emoji={o.emoji} label={o.label} selected={answers.trip_type===o.id} onClick={()=>{radio("trip_type",o.id);setStep2Errors(p=>{const n={...p};delete n.trip_type;return n;});}}/>)}
                    </div>
                    {step2Errors.trip_type&&<p className="text-xs text-red-500 mt-1 font-semibold">{step2Errors.trip_type}</p>}
                  </div>
                  <div>
                    <QLabel hint="(optionnel)">Endroits déjà visités à éviter</QLabel>
                    <input type="text" value={answers.already_visited}
                      onChange={e=>setAnswers(p=>({...p,already_visited:e.target.value}))}
                      placeholder="ex. Thaïlande, Bali, Barcelone…"
                      className="w-full border-2 border-[#e2e8f0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c9a84c] bg-white transition-colors"/>
                  </div>
                </div>
              </SectionCard>
            )}

            {/* Accommodation & vibe */}
            <div id="s2-accommodations">
            <SectionCard icon="🏨" title="Hébergement & quartier">
              <div className="space-y-4">
                <div>
                  <QLabel required hint="(plusieurs choix)">Type d&apos;hébergement</QLabel>
                  <div className="flex flex-wrap gap-2">
                    {ACCOMMODATION.map(o=><Pill key={o.id} emoji={o.emoji} label={o.label} selected={answers.accommodations.includes(o.id)} onClick={()=>{toggle("accommodations",o.id);setStep2Errors(p=>{const n={...p};delete n.accommodations;return n;});}}/>)}
                  </div>
                  {step2Errors.accommodations&&<p className="text-xs text-red-500 mt-1 font-semibold">{step2Errors.accommodations}</p>}
                </div>
                <div>
                  <QLabel hint="(optionnel)">Quartier ou ambiance préférés</QLabel>
                  <input type="text" value={answers.neighborhood_vibe}
                    onChange={e=>setAnswers(p=>({...p,neighborhood_vibe:e.target.value}))}
                    placeholder={isDestFlow?"ex. centre historique, proche de la plage, branché…":"ex. calme et résidentiel, animé, authentique…"}
                    className="w-full border-2 border-[#e2e8f0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c9a84c] bg-white transition-colors"/>
                </div>
              </div>
            </SectionCard>
            </div>

            {/* Pace & style */}
            <div id="s2-activity_pace">
            <SectionCard icon="🏃" title="Rythme & style">
              <div className="space-y-4">
                <div>
                  <QLabel required>Rythme d&apos;activités</QLabel>
                  <div className="flex flex-wrap gap-2">
                    {ACTIVITY_PACE.map(o=><Pill key={o.id} emoji={o.emoji} label={o.label} selected={answers.activity_pace===o.id} onClick={()=>{radio("activity_pace",o.id);setStep2Errors(p=>{const n={...p};delete n.activity_pace;return n;});}}/>)}
                  </div>
                  {step2Errors.activity_pace&&<p className="text-xs text-red-500 mt-1 font-semibold">{step2Errors.activity_pace}</p>}
                </div>
                <div id="s2-authenticity">
                  <QLabel required>Découvertes touristiques ou locales ?</QLabel>
                  <div className="flex flex-wrap gap-2">
                    {AUTHENTICITY.map(o=><Pill key={o.id} emoji={o.emoji} label={o.label} selected={answers.authenticity===o.id} onClick={()=>{radio("authenticity",o.id);setStep2Errors(p=>{const n={...p};delete n.authenticity;return n;});}}/>)}
                  </div>
                  {step2Errors.authenticity&&<p className="text-xs text-red-500 mt-1 font-semibold">{step2Errors.authenticity}</p>}
                </div>
              </div>
            </SectionCard>
            </div>

            {/* Transport */}
            <div id="s2-transport">
            <SectionCard icon="🚌" title="Transport sur place">
              <QLabel required hint="(plusieurs choix)">Comment vous déplacer ?</QLabel>
              <div className="flex flex-wrap gap-2">
                {TRANSPORT.map(o=><Pill key={o.id} emoji={o.emoji} label={o.label} selected={answers.transport.includes(o.id)} onClick={()=>{toggle("transport",o.id);setStep2Errors(p=>{const n={...p};delete n.transport;return n;});}}/>)}
              </div>
              {step2Errors.transport&&<p className="text-xs text-red-500 mt-1 font-semibold">{step2Errors.transport}</p>}
            </SectionCard>
            </div>

            {/* Interests */}
            <div id="s2-interests">
            <SectionCard icon="🎯" title="Intérêts & passions">
              <div className="space-y-4">
                <div>
                  <QLabel required hint={`(5 maximum — ${answers.interests.length}/5)`}>Activités principales</QLabel>
                  <div className="flex flex-wrap gap-2">
                    {INTERESTS.map(o=>(
                      <Pill key={o.id} emoji={o.emoji} label={o.label}
                        selected={answers.interests.includes(o.id)}
                        disabled={!answers.interests.includes(o.id)&&answers.interests.length>=5}
                        onClick={()=>{toggleInterest(o.id);setStep2Errors(p=>{const n={...p};delete n.interests;return n;});}}/>
                    ))}
                  </div>
                  {step2Errors.interests&&<p className="text-xs text-red-500 mt-1 font-semibold">{step2Errors.interests}</p>}
                </div>
                {showSports&&(
                  <div>
                    <QLabel hint="(plusieurs choix)">Sports & activités spécifiques</QLabel>
                    <div className="flex flex-wrap gap-2">
                      {SPORTS.map(o=><Pill key={o.id} emoji={o.emoji} label={o.label} selected={answers.sports.includes(o.id)} onClick={()=>toggle("sports",o.id)}/>)}
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>
            </div>

            {/* Q1: non-negotiables / Q2: dream experience */}
            <SectionCard icon="⭐" title={isDestFlow?"Incontournables & à éviter":"Rêve de voyage & à éviter"}>
              <div className="space-y-4">
                {isDestFlow?(
                  <div>
                    <QLabel hint="(optionnel)">2-3 choses incontournables pour vous</QLabel>
                    <textarea value={answers.non_negotiables}
                      onChange={e=>{if(e.target.value.length<=300)setAnswers(p=>({...p,non_negotiables:e.target.value}));}}
                      rows={2} placeholder="ex. voir le Mont Fuji, manger des sushis authentiques, quartier Shibuya…"
                      className="w-full border-2 border-[#e2e8f0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c9a84c] bg-white resize-none transition-colors"/>
                    <p className="text-xs text-[#94a3b8] text-right mt-1">{answers.non_negotiables.length}/300</p>
                  </div>
                ):(
                  <div>
                    <QLabel hint="(optionnel)">Votre rêve de voyage — qu&apos;est-ce qui vous ferait rêver ?</QLabel>
                    <textarea value={answers.dream_experience}
                      onChange={e=>{if(e.target.value.length<=300)setAnswers(p=>({...p,dream_experience:e.target.value}));}}
                      rows={2} placeholder="ex. voir des temples perdus dans la jungle, se perdre dans une médina, voir les aurores boréales…"
                      className="w-full border-2 border-[#e2e8f0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c9a84c] bg-white resize-none transition-colors"/>
                    <p className="text-xs text-[#94a3b8] text-right mt-1">{answers.dream_experience.length}/300</p>
                  </div>
                )}
                <div>
                  <QLabel hint="(optionnel)">Ce que vous ne voulez surtout pas</QLabel>
                  <textarea value={answers.things_to_avoid}
                    onChange={e=>{if(e.target.value.length<=200)setAnswers(p=>({...p,things_to_avoid:e.target.value}));}}
                    rows={2} placeholder="ex. éviter les bus bondés, pas de musées, pas de plage bondée…"
                    className="w-full border-2 border-[#e2e8f0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c9a84c] bg-white resize-none transition-colors"/>
                  <p className="text-xs text-[#94a3b8] text-right mt-1">{answers.things_to_avoid.length}/200</p>
                </div>
              </div>
            </SectionCard>

            {/* Langue */}
            <div id="s2-language_spoken">
            <SectionCard icon="🗣️" title="Langues parlées">
              <QLabel required hint="(plusieurs choix)">Quelles langues parlez-vous ?</QLabel>
              <div className="flex flex-wrap gap-2">
                {LANGUAGE_SPOKEN.map(o=>(
                  <Pill key={o.id} emoji={o.emoji} label={o.label}
                    selected={answers.language_spoken.includes(o.id)}
                    onClick={()=>{toggle("language_spoken",o.id);setStep2Errors(p=>{const n={...p};delete n.language_spoken;return n;});}}/>
                ))}
              </div>
              {step2Errors.language_spoken&&<p className="text-xs text-red-500 mt-1 font-semibold">{step2Errors.language_spoken}</p>}
            </SectionCard>
            </div>
          </>
        )}

        {/* ═══════════ DISCOVER — SUGGESTION SCREENS ═══════════ */}
        {step===2&&answers.flow==="discover"&&discoverPhase==="error"&&(
          <div className="flex flex-col items-center justify-center py-20 gap-5 text-center">
            <div className="text-5xl">😕</div>
            <div className="w-full max-w-md mx-auto">
              <h2 className="text-xl font-bold text-[#425B48] mb-2" style={{fontFamily:"var(--font-playfair),Georgia,serif"}}>Une erreur est survenue</h2>
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-left">
                <p className="text-xs font-bold text-red-600 mb-1">Détail de l&apos;erreur :</p>
                <p className="text-xs text-red-500 font-mono break-all">{suggestError || "(aucun message — timeout probable)"}</p>
              </div>
              <button type="button" onClick={()=>{
                setSuggestError("");
                setDiscoverPhase("loading");
                fetch("/api/suggest-destinations",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(answers)})
                  .then(r=>{
                    if(!r.ok) return r.text().then(t=>{throw new Error(`HTTP ${r.status}: ${t.slice(0,200)}`);});
                    return r.json();
                  })
                  .then(data=>{
                    if(data.suggestions?.length>0){setSuggestions(data.suggestions);setDiscoverPhase("results");}
                    else{setSuggestError(data.error||data.raw||"Réponse vide");setDiscoverPhase("error");}
                  })
                  .catch(e=>{setSuggestError(String(e));setDiscoverPhase("error");});
              }}
                className="bg-[#425B48] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#344a39] transition-all text-sm">
                Réessayer →
              </button>
            </div>
          </div>
        )}

        {step===2&&answers.flow==="discover"&&discoverPhase==="loading"&&(
          <div className="flex flex-col items-center justify-center py-24 gap-6">
            <div className="text-6xl animate-bounce">🌍</div>
            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#c9a84c] mb-2">IA en action</p>
              <h2 className="text-2xl font-bold text-[#425B48] mb-3" style={{fontFamily:"var(--font-playfair),Georgia,serif"}}>
                Analyse de vos envies...
              </h2>
              <p className="text-[#64748b] text-sm max-w-sm text-center">
                Notre IA entraînée sélectionne les 3 destinations qui correspondent le mieux à votre profil.
              </p>
            </div>
            <div className="flex gap-2 mt-2">
              {[0,1,2].map(i=>(
                <div key={i} className="w-3 h-3 rounded-full bg-[#c9a84c] animate-bounce" style={{animationDelay:`${i*0.2}s`}}/>
              ))}
            </div>
          </div>
        )}

        {step===2&&answers.flow==="discover"&&discoverPhase==="results"&&(
          <div className="space-y-5">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#425C47]/8 border border-[#425C47]/15 rounded-full px-4 py-1.5 mb-4">
                <span>✨</span>
                <span className="text-xs font-bold text-[#425C47] uppercase tracking-wide">Sélection personnalisée</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#425B48] mb-2" style={{fontFamily:"var(--font-playfair),Georgia,serif"}}>
                Vos 3 destinations idéales
              </h2>
              <p className="text-[#64748b] text-sm">Choisissez la destination qui vous inspire le plus — votre guide sera créé autour d&apos;elle.</p>
            </div>

            {suggestions.map((s,i)=>(
              <button key={i} type="button"
                onClick={()=>{setAnswers(p=>({...p,destination:`${s.name}, ${s.country}`}));setDiscoverPhase("form");setStep(3);window.scrollTo({top:0,behavior:"smooth"});}}
                className="w-full text-left bg-white rounded-3xl border-2 border-[#e8e0d4] overflow-hidden shadow-sm hover:border-[#c9a84c] hover:shadow-xl transition-all duration-200 group">
                {/* Card header */}
                <div className="relative h-44 sm:h-52 w-full flex items-center justify-center bg-[#f5f0e8]">
                  <span className="text-[120px] sm:text-[140px] leading-none select-none">{getFlag(s)}</span>
                  <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 flex items-end justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#c9a84c] mb-0.5">{s.country}</p>
                      <h3 className="text-xl font-bold text-[#2e2e2e]" style={{fontFamily:"var(--font-playfair),Georgia,serif"}}>{s.name}</h3>
                    </div>
                    <span className="text-[#425C47] text-xl font-bold group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
                {/* Card body */}
                <div className="p-5">
                  {/* Badge type */}
                  {s.type && (
                    <span className="inline-block mb-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border"
                      style={s.type==="coup_de_coeur"
                        ? {background:"#fef3c7",color:"#92400e",borderColor:"#fde68a"}
                        : s.type==="caractere"
                        ? {background:"#ede9fe",color:"#5b21b6",borderColor:"#ddd6fe"}
                        : {background:"#dcfce7",color:"#166534",borderColor:"#bbf7d0"}}>
                      {s.type==="coup_de_coeur" ? "✨ Coup de cœur" : s.type==="caractere" ? "⚡ A du caractère" : "✅ Valeur sûre"}
                    </span>
                  )}
                  <p className="text-base font-semibold text-[#1e293b] italic mb-3">&laquo; {s.tagline} &raquo;</p>
                  <p className="text-sm text-[#475569] leading-relaxed mb-4">{s.why}</p>
                  <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                    {s.weather && <div className="flex gap-1.5"><span>🌡️</span><span className="text-[#475569]">{s.weather}</span></div>}
                    {s.budget_note && <div className="flex gap-1.5"><span>💶</span><span className="text-[#475569]">{s.budget_note}</span></div>}
                    {s.ideal_duration && <div className="flex gap-1.5"><span>⏱️</span><span className="text-[#475569]">{s.ideal_duration}</span></div>}
                  </div>
                  {s.keywords?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {s.keywords.map((k,j)=>(
                        <span key={j} className="px-2.5 py-1 rounded-full bg-[#425B48]/8 text-[#425B48] text-xs font-semibold border border-[#425B48]/15">{k}</span>
                      ))}
                    </div>
                  )}
                  {s.downside && (
                    <p className="text-xs text-[#92400e] bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-3">⚠️ {s.downside}</p>
                  )}
                  <div className="flex items-center justify-end">
                    <span className="text-xs font-bold text-[#c9a84c] group-hover:text-[#b8962e] transition-colors">Choisir cette destination →</span>
                  </div>
                </div>
              </button>
            ))}

            <div className="pt-2 pb-4">
              <button type="button" onClick={()=>{setDiscoverPhase("form");window.scrollTo({top:0,behavior:"smooth"});}}
                className="flex items-center gap-2 text-[#94a3b8] font-semibold text-sm hover:text-[#425B48] transition-colors">
                ← Modifier mes critères
              </button>
            </div>
          </div>
        )}

        {/* ═══════════ STEP 3 — FINALISER ═══════════ */}
        {step===3&&(
          <>
            <div className="mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#425B48] mb-1" style={{fontFamily:"var(--font-playfair),Georgia,serif"}}>
                Finaliser votre guide ✨
              </h1>
              <p className="text-[#64748b] text-sm">Quelques dernières infos, puis vous payez et recevez votre guide.</p>
            </div>

            <SectionCard icon="✨" title="Informations pratiques">
              <div className="space-y-5">
                {/* Diet */}
                <div>
                  <QLabel hint="(optionnel, plusieurs choix)">Restrictions & besoins alimentaires</QLabel>
                  <div className="flex flex-wrap gap-2">
                    {DIET.map(o=><Pill key={o.id} emoji={o.emoji} label={o.label} selected={answers.diet.includes(o.id)} onClick={()=>toggle("diet",o.id)}/>)}
                  </div>
                  {answers.diet.includes("allergies")&&(
                    <div className="mt-3">
                      <QLabel required>Précisez vos allergies</QLabel>
                      <input type="text" value={answers.allergy_details}
                        onChange={e=>setAnswers(p=>({...p,allergy_details:e.target.value}))}
                        placeholder="ex. arachides, fruits de mer, gluten…"
                        className="w-full border-2 border-[#e2e8f0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c9a84c] bg-white transition-colors"/>
                    </div>
                  )}
                </div>

                {/* Special occasion */}
                <div>
                  <QLabel hint="(optionnel)">Occasion spéciale ?</QLabel>
                  <input type="text" value={answers.special_occasion}
                    onChange={e=>setAnswers(p=>({...p,special_occasion:e.target.value}))}
                    placeholder="ex. anniversaire, lune de miel, retraite, EVJF…"
                    className="w-full border-2 border-[#e2e8f0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c9a84c] bg-white transition-colors"/>
                </div>

                {/* Email */}
                <div id="field-email">
                  <QLabel required>📧 Adresse de réception du guide</QLabel>
                  <input type="email" value={answers.user_email}
                    onChange={e=>{setAnswers(p=>({...p,user_email:e.target.value}));if(errors.email)setErrors({});}}
                    placeholder="votre@courriel.com"
                    className={`w-full border-2 rounded-xl px-4 py-3 text-sm focus:outline-none bg-white transition-colors ${errors.email?"border-red-400":"border-[#e2e8f0] focus:border-[#c9a84c]"}`}/>
                  <p className="text-xs text-[#94a3b8] mt-1">Votre guide PDF sera envoyé à cette adresse.</p>
                  {errors.email&&<p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>

                {/* Notes */}
                <div>
                  <QLabel hint="(optionnel)">📝 Notes libres</QLabel>
                  <textarea value={answers.notes}
                    onChange={e=>{if(e.target.value.length<=500)setAnswers(p=>({...p,notes:e.target.value}));}}
                    rows={3} placeholder="Toute information complémentaire, demande particulière, contrainte…"
                    className="w-full border-2 border-[#e2e8f0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c9a84c] bg-white resize-none transition-colors"/>
                  <p className="text-xs text-[#94a3b8] text-right mt-1">{answers.notes.length}/500</p>
                </div>
              </div>
            </SectionCard>

            {/* RECAP */}
            <div className="bg-[#425B48] text-white rounded-2xl p-6 shadow-lg">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span>✈️</span>
                <span>{isEditingCartItem?"Mettre à jour ce guide":"Votre guide TravelGuide AI"}</span>
              </h3>
              <div className="space-y-2.5 text-sm">
                {isDestFlow&&answers.destination&&(
                  <div className="flex items-start gap-2"><span className="w-5 shrink-0">📍</span><span><strong>{answers.destination}</strong></span></div>
                )}
                {!isDestFlow&&(
                  <div className="flex items-start gap-2"><span className="w-5 shrink-0">🌍</span><span className="italic text-white/80">Destination suggérée par l&apos;IA</span></div>
                )}
                {answers.departure_city&&(
                  <div className="flex items-start gap-2"><span className="w-5 shrink-0">🏠</span><span>Départ : <strong>{answers.departure_city}</strong></span></div>
                )}
                {(answers.arrival_date||answers.departure_date)&&(
                  <div className="flex items-start gap-2">
                    <span className="w-5 shrink-0">📅</span>
                    <span>
                      {answers.arrival_date&&formatDateFr(answers.arrival_date)}
                      {answers.arrival_date&&answers.departure_date&&answers.departure_date!==answers.arrival_date&&" → "}
                      {answers.departure_date&&answers.departure_date!==answers.arrival_date&&formatDateFr(answers.departure_date)}
                      {" "}<span className="text-white/60">({tripDuration})</span>
                    </span>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <span className="w-5 shrink-0">🗂️</span>
                  <span>Forfait : {plan?<><strong>{plan.name}</strong> — <span className="text-[#c9a84c]">{plan.price}</span></>:<strong>à choisir</strong>}</span>
                </div>
                {answers.traveler_type&&(
                  <div className="flex items-start gap-2">
                    <span className="w-5 shrink-0">👤</span>
                    <span>{TRAVELER_TYPE.find(o=>o.id===answers.traveler_type)?.label} — {answers.traveler_adults} adulte{answers.traveler_adults>1?"s":""}{answers.traveler_children>0&&`, ${answers.traveler_children} enfant${answers.traveler_children>1?"s":""}`}</span>
                  </div>
                )}
                {answers.budget&&(
                  <div className="flex items-start gap-2">
                    <span className="w-5 shrink-0">💰</span>
                    <span>{BUDGET_OPTS.find(o=>o.id===answers.budget)?.label}{answers.budget_amount&&` — ${answers.budget_amount}€ ${answers.budget_scope==="per_person"?"/ pers.":""}`}</span>
                  </div>
                )}
                {answers.interests.length>0&&(
                  <div className="flex items-start gap-2">
                    <span className="w-5 shrink-0">🎯</span>
                    <span className="text-white/80">{answers.interests.map(id=>INTERESTS.find(o=>o.id===id)?.label??id).join(", ")}</span>
                  </div>
                )}
              </div>

              <div className="mt-5 rounded-2xl border border-amber-300/60 bg-amber-50 px-4 py-4 text-left shadow-[0_10px_30px_rgba(120,80,0,0.12)]">
                <p className="text-sm font-bold text-amber-950">⚠️ {legalCopy.noticeTitle}</p>
                <p className="mt-2 text-xs leading-relaxed text-amber-900/90">{legalCopy.noticeBody}</p>
              </div>

              <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 text-left text-xs leading-relaxed text-white/85 transition-colors hover:bg-white/15">
                <input type="checkbox" checked={termsAccepted}
                  onChange={e=>{setTermsAccepted(e.target.checked);if(e.target.checked)setTermsError(null);}}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/40 accent-[#c9a84c]"/>
                <span>
                  {legalCopy.termsPrefix}{" "}
                  <Link href="/cgv" className="font-semibold text-white underline underline-offset-2">{legalCopy.termsLabel}</Link>{" "}
                  {legalCopy.termsJoin}{" "}
                  <Link href="/privacy" className="font-semibold text-white underline underline-offset-2">{legalCopy.privacyLabel}</Link>
                  . {legalCopy.termsSuffix}
                </span>
              </label>
              {termsError&&<p className="mt-2 text-center text-xs font-semibold text-red-300">{termsError}</p>}

              <div className="border-t border-white/20 mt-4 pt-4 flex flex-col sm:flex-row gap-3">
                <button type="button" onClick={()=>setStep(2)}
                  className="flex-1 border-2 border-white/30 text-white font-semibold py-3 rounded-xl hover:bg-white/10 transition-all text-sm">
                  Revoir mes réponses
                </button>
                <button type="button" onClick={handleAddToCart} disabled={submitting}
                  className="flex-[2] bg-[#c9a84c] hover:bg-[#b8962e] disabled:bg-[#94a3b8] disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all enabled:hover:scale-[1.02] shadow-lg text-sm">
                  {submitting?(
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Enregistrement…
                    </span>
                  ):(
                    isEditingCartItem?"Mettre à jour le panier →":plan?`${legalCopy.paymentButton} →`:"Choisir un forfait"
                  )}
                </button>
              </div>
              {submitError&&<p className="text-red-300 text-xs mt-3 text-center">{submitError}</p>}
            </div>

            <p className="text-center text-xs text-[#94a3b8] -mt-1">
              Ajoutez plusieurs guides au panier, puis payez en une seule transaction sécurisée.
            </p>
          </>
        )}

        {/* NAV BUTTONS */}
        <div className="flex items-center justify-between pt-4 pb-8">
          {discoverPhase==="form"&&(step>1?(
            <button type="button" onClick={goPrev}
              className="flex items-center gap-2 text-[#425B48] font-semibold text-sm hover:text-[#c9a84c] transition-colors">
              ← Précédent
            </button>
          ):(
            <button type="button" onClick={()=>setAnswers(p=>({...p,flow:""}))}
              className="flex items-center gap-2 text-[#94a3b8] font-semibold text-sm hover:text-[#425B48] transition-colors">
              ← Changer de parcours
            </button>
          ))}
          {step<3&&discoverPhase==="form"&&(
            <button type="button" onClick={goNext}
              className="bg-[#425B48] text-white font-bold px-8 py-3 rounded-xl hover:bg-[#344a39] transition-all hover:scale-[1.02] shadow-md text-sm">
              Suivant →
            </button>
          )}
        </div>
      </main>

      <footer className="border-t border-[#e8e0d4] py-6 mt-4">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-xs text-[#94a3b8]">© 2026 TravelGuide AI — Guides de voyage personnalisés par IA entraînée</p>
        </div>
      </footer>
    </div>
  );
}

export default function QuestionnairePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fdf8f0] flex items-center justify-center"><div className="text-5xl animate-bounce">✈️</div></div>}>
      <QuestionnaireContent />
    </Suspense>
  );
}
