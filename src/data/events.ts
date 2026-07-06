export type EventItem = {
  id: string;
  sport: string;
  audience: string;
  date: string;
  location: string;
  icon: string;
  theme: 'ice' | 'handball' | 'football' | 'swimming' | 'basketball' | 'athletics';
};

export const events: EventItem[] = [
  {
    id: 'maedcheneishockey-2026-11-04',
    sport: 'Tag des Mädcheneishockeys',
    audience: 'Mädchen: 3. & 4. Klasse (Herne & Wanne-Eickel)',
    date: '2026-11-04',
    location: 'Eishalle Gysenberg',
    icon: '🏒',
    theme: 'ice',
  },
  {
    id: 'jungeneishockey-2026-11-04',
    sport: 'Tag des Jungeneishockeys',
    audience: 'Jungen: 3. & 4. Klasse (Herne & Wanne-Eickel)',
    date: '2026-11-04',
    location: 'Eishalle Gysenberg',
    icon: '🏒',
    theme: 'ice',
  },
  {
    id: 'handball-2026-11-25',
    sport: 'Handball',
    audience: 'Jungen & Mädchen: 1. - 4. Klasse (Herne & Wanne-Eickel)',
    date: '2026-11-25',
    location: 'Sporthalle Eickel',
    icon: '🤾',
    theme: 'handball',
  },
  {
    id: 'hallenfussball-jungen-2027-01-20',
    sport: 'Hallenfußball',
    audience: 'Jungen: 3. & 4. Klasse',
    date: '2027-01-20',
    location: 'Sporthalle Westring',
    icon: '⚽',
    theme: 'football',
  },
  {
    id: 'hallenfussball-maedchen-2027-02-02',
    sport: 'Hallenfußball',
    audience: 'Mädchen: 1. - 4. Klasse (Herne & Wanne-Eickel)',
    date: '2027-02-02',
    location: 'Sporthalle Eickel',
    icon: '⚽',
    theme: 'football',
  },
  {
    id: 'schwimmen-2027-02-22',
    sport: 'Schwimmen',
    audience: 'Jungen & Mädchen: 1. - 4. Klasse (Herne & Wanne-Eickel)',
    date: '2027-02-22',
    location: 'Südpool Herne',
    icon: '🏊',
    theme: 'swimming',
  },
  {
    id: 'basketball-maedchen-2027-03-09',
    sport: 'Basketball',
    audience: 'Mädchen: 3. & 4. Klasse (Herne & Wanne-Eickel)',
    date: '2027-03-09',
    location: 'Sporthalle Mont-Cenis-Gesamtschule',
    icon: '🏀',
    theme: 'basketball',
  },
  {
    id: 'maedchenfussball-2027-04-21',
    sport: 'Tag des Mädchenfußballs',
    audience: 'Mädchen: 1. - 4. Klasse (Herne & Wanne-Eickel)',
    date: '2027-04-21',
    location: 'Stadion Eickel (Rasen)',
    icon: '⚽',
    theme: 'football',
  },
  {
    id: 'basketball-jungen-2027-04-28',
    sport: 'Basketball',
    audience: 'Jungen: 3. & 4. Klasse (Herne & Wanne-Eickel)',
    date: '2027-04-28',
    location: 'Sporthalle Mont-Cenis-Gesamtschule',
    icon: '🏀',
    theme: 'basketball',
  },
  {
    id: 'kleinfeldfussball-2027-05-11',
    sport: 'Kleinfeldfußball',
    audience: 'Jungen & Mädchen: 3. & 4. Klasse',
    date: '2027-05-11',
    location: 'Stadion Schloss Strünkede oder Stadion Eickel',
    icon: '⚽',
    theme: 'football',
  },
  {
    id: 'leichtathletik-2027-06-16',
    sport: 'Leichtathletik',
    audience: 'Jungen & Mädchen: 1. - 4. Klasse',
    date: '2027-06-16',
    location: 'Ort noch offen - Herne und Wanne finden gemeinsam statt',
    icon: '🏃',
    theme: 'athletics',
  },
  {
    id: 'maedchen-kleinfeldfussball-2027-06-25',
    sport: 'Mädchen-Kleinfeldfußball',
    audience: 'Mädchen: 3. & 4. Klasse (Herne & Wanne-Eickel)',
    date: '2027-06-25',
    location: 'Stadion Eickel (Rasen)',
    icon: '⚽',
    theme: 'football',
  },
];

export const formattedDate = (date: string) =>
  new Intl.DateTimeFormat('de-DE', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${date}T12:00:00`));
