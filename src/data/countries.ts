/**
 * Country list for the phone-number picker. ISO-3166 alpha-2 code + name +
 * E.164 dial code + flag emoji. Comprehensive enough to cover the app's
 * realistic audience (MENA / Europe / Americas / Asia) without needing a
 * 250-row library.
 *
 * Default = Morocco. Adjust the {@link DEFAULT_COUNTRY} export if the
 * primary market changes.
 */

export interface Country {
  /** ISO-3166-1 alpha-2 code, e.g. "MA". Used as a stable id. */
  code: string;
  name: string;
  /** E.164 dial code with leading "+", e.g. "+212". */
  dialCode: string;
  /** Flag emoji rendered with the system font. */
  flag: string;
}

export const countries: Country[] = [
  // ── Africa & MENA ────────────────────────────────────────────────
  { code: 'MA', name: 'Morocco',         dialCode: '+212', flag: '🇲🇦' },
  { code: 'DZ', name: 'Algeria',         dialCode: '+213', flag: '🇩🇿' },
  { code: 'TN', name: 'Tunisia',         dialCode: '+216', flag: '🇹🇳' },
  { code: 'LY', name: 'Libya',           dialCode: '+218', flag: '🇱🇾' },
  { code: 'EG', name: 'Egypt',           dialCode: '+20',  flag: '🇪🇬' },
  { code: 'SD', name: 'Sudan',           dialCode: '+249', flag: '🇸🇩' },
  { code: 'SA', name: 'Saudi Arabia',    dialCode: '+966', flag: '🇸🇦' },
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪' },
  { code: 'KW', name: 'Kuwait',          dialCode: '+965', flag: '🇰🇼' },
  { code: 'QA', name: 'Qatar',           dialCode: '+974', flag: '🇶🇦' },
  { code: 'BH', name: 'Bahrain',         dialCode: '+973', flag: '🇧🇭' },
  { code: 'OM', name: 'Oman',            dialCode: '+968', flag: '🇴🇲' },
  { code: 'YE', name: 'Yemen',           dialCode: '+967', flag: '🇾🇪' },
  { code: 'JO', name: 'Jordan',          dialCode: '+962', flag: '🇯🇴' },
  { code: 'LB', name: 'Lebanon',         dialCode: '+961', flag: '🇱🇧' },
  { code: 'IQ', name: 'Iraq',            dialCode: '+964', flag: '🇮🇶' },
  { code: 'SY', name: 'Syria',           dialCode: '+963', flag: '🇸🇾' },
  { code: 'PS', name: 'Palestine',       dialCode: '+970', flag: '🇵🇸' },
  { code: 'IL', name: 'Israel',          dialCode: '+972', flag: '🇮🇱' },
  { code: 'TR', name: 'Turkey',          dialCode: '+90',  flag: '🇹🇷' },
  { code: 'IR', name: 'Iran',            dialCode: '+98',  flag: '🇮🇷' },

  // Africa (Sub-Saharan)
  { code: 'NG', name: 'Nigeria',         dialCode: '+234', flag: '🇳🇬' },
  { code: 'KE', name: 'Kenya',           dialCode: '+254', flag: '🇰🇪' },
  { code: 'ZA', name: 'South Africa',    dialCode: '+27',  flag: '🇿🇦' },
  { code: 'ET', name: 'Ethiopia',        dialCode: '+251', flag: '🇪🇹' },
  { code: 'GH', name: 'Ghana',           dialCode: '+233', flag: '🇬🇭' },
  { code: 'SN', name: 'Senegal',         dialCode: '+221', flag: '🇸🇳' },
  { code: 'CI', name: 'Côte d’Ivoire',   dialCode: '+225', flag: '🇨🇮' },
  { code: 'TZ', name: 'Tanzania',        dialCode: '+255', flag: '🇹🇿' },
  { code: 'UG', name: 'Uganda',          dialCode: '+256', flag: '🇺🇬' },
  { code: 'CM', name: 'Cameroon',        dialCode: '+237', flag: '🇨🇲' },
  { code: 'MR', name: 'Mauritania',      dialCode: '+222', flag: '🇲🇷' },

  // ── Europe ───────────────────────────────────────────────────────
  { code: 'FR', name: 'France',          dialCode: '+33',  flag: '🇫🇷' },
  { code: 'ES', name: 'Spain',           dialCode: '+34',  flag: '🇪🇸' },
  { code: 'IT', name: 'Italy',           dialCode: '+39',  flag: '🇮🇹' },
  { code: 'DE', name: 'Germany',         dialCode: '+49',  flag: '🇩🇪' },
  { code: 'GB', name: 'United Kingdom',  dialCode: '+44',  flag: '🇬🇧' },
  { code: 'IE', name: 'Ireland',         dialCode: '+353', flag: '🇮🇪' },
  { code: 'PT', name: 'Portugal',        dialCode: '+351', flag: '🇵🇹' },
  { code: 'NL', name: 'Netherlands',     dialCode: '+31',  flag: '🇳🇱' },
  { code: 'BE', name: 'Belgium',         dialCode: '+32',  flag: '🇧🇪' },
  { code: 'LU', name: 'Luxembourg',      dialCode: '+352', flag: '🇱🇺' },
  { code: 'CH', name: 'Switzerland',     dialCode: '+41',  flag: '🇨🇭' },
  { code: 'AT', name: 'Austria',         dialCode: '+43',  flag: '🇦🇹' },
  { code: 'SE', name: 'Sweden',          dialCode: '+46',  flag: '🇸🇪' },
  { code: 'NO', name: 'Norway',          dialCode: '+47',  flag: '🇳🇴' },
  { code: 'DK', name: 'Denmark',         dialCode: '+45',  flag: '🇩🇰' },
  { code: 'FI', name: 'Finland',         dialCode: '+358', flag: '🇫🇮' },
  { code: 'IS', name: 'Iceland',         dialCode: '+354', flag: '🇮🇸' },
  { code: 'PL', name: 'Poland',          dialCode: '+48',  flag: '🇵🇱' },
  { code: 'CZ', name: 'Czechia',         dialCode: '+420', flag: '🇨🇿' },
  { code: 'SK', name: 'Slovakia',        dialCode: '+421', flag: '🇸🇰' },
  { code: 'HU', name: 'Hungary',         dialCode: '+36',  flag: '🇭🇺' },
  { code: 'RO', name: 'Romania',         dialCode: '+40',  flag: '🇷🇴' },
  { code: 'BG', name: 'Bulgaria',        dialCode: '+359', flag: '🇧🇬' },
  { code: 'GR', name: 'Greece',          dialCode: '+30',  flag: '🇬🇷' },
  { code: 'HR', name: 'Croatia',         dialCode: '+385', flag: '🇭🇷' },
  { code: 'SI', name: 'Slovenia',        dialCode: '+386', flag: '🇸🇮' },
  { code: 'RS', name: 'Serbia',          dialCode: '+381', flag: '🇷🇸' },
  { code: 'AL', name: 'Albania',         dialCode: '+355', flag: '🇦🇱' },
  { code: 'UA', name: 'Ukraine',         dialCode: '+380', flag: '🇺🇦' },
  { code: 'RU', name: 'Russia',          dialCode: '+7',   flag: '🇷🇺' },

  // ── Americas ─────────────────────────────────────────────────────
  { code: 'US', name: 'United States',   dialCode: '+1',   flag: '🇺🇸' },
  { code: 'CA', name: 'Canada',          dialCode: '+1',   flag: '🇨🇦' },
  { code: 'MX', name: 'Mexico',          dialCode: '+52',  flag: '🇲🇽' },
  { code: 'BR', name: 'Brazil',          dialCode: '+55',  flag: '🇧🇷' },
  { code: 'AR', name: 'Argentina',       dialCode: '+54',  flag: '🇦🇷' },
  { code: 'CL', name: 'Chile',           dialCode: '+56',  flag: '🇨🇱' },
  { code: 'CO', name: 'Colombia',        dialCode: '+57',  flag: '🇨🇴' },
  { code: 'PE', name: 'Peru',            dialCode: '+51',  flag: '🇵🇪' },
  { code: 'VE', name: 'Venezuela',       dialCode: '+58',  flag: '🇻🇪' },
  { code: 'EC', name: 'Ecuador',         dialCode: '+593', flag: '🇪🇨' },

  // ── Asia & Pacific ───────────────────────────────────────────────
  { code: 'CN', name: 'China',           dialCode: '+86',  flag: '🇨🇳' },
  { code: 'JP', name: 'Japan',           dialCode: '+81',  flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea',     dialCode: '+82',  flag: '🇰🇷' },
  { code: 'IN', name: 'India',           dialCode: '+91',  flag: '🇮🇳' },
  { code: 'PK', name: 'Pakistan',        dialCode: '+92',  flag: '🇵🇰' },
  { code: 'BD', name: 'Bangladesh',      dialCode: '+880', flag: '🇧🇩' },
  { code: 'LK', name: 'Sri Lanka',       dialCode: '+94',  flag: '🇱🇰' },
  { code: 'NP', name: 'Nepal',           dialCode: '+977', flag: '🇳🇵' },
  { code: 'AF', name: 'Afghanistan',     dialCode: '+93',  flag: '🇦🇫' },
  { code: 'ID', name: 'Indonesia',       dialCode: '+62',  flag: '🇮🇩' },
  { code: 'MY', name: 'Malaysia',        dialCode: '+60',  flag: '🇲🇾' },
  { code: 'SG', name: 'Singapore',       dialCode: '+65',  flag: '🇸🇬' },
  { code: 'TH', name: 'Thailand',        dialCode: '+66',  flag: '🇹🇭' },
  { code: 'VN', name: 'Vietnam',         dialCode: '+84',  flag: '🇻🇳' },
  { code: 'PH', name: 'Philippines',     dialCode: '+63',  flag: '🇵🇭' },
  { code: 'HK', name: 'Hong Kong',       dialCode: '+852', flag: '🇭🇰' },
  { code: 'TW', name: 'Taiwan',          dialCode: '+886', flag: '🇹🇼' },
  { code: 'AU', name: 'Australia',       dialCode: '+61',  flag: '🇦🇺' },
  { code: 'NZ', name: 'New Zealand',     dialCode: '+64',  flag: '🇳🇿' },
];

/** Country picked when the picker first opens — adjust if the primary market changes. */
export const DEFAULT_COUNTRY: Country =
  countries.find((c) => c.code === 'MA') ?? countries[0];

/**
 * Case-insensitive lookup by name or dial code. Used to filter the picker
 * as the user types.
 */
export function filterCountries(query: string): Country[] {
  const q = query.trim().toLowerCase();
  if (!q) return countries;
  const digitsOnly = q.replace(/[^0-9+]/g, '');
  return countries.filter((c) => {
    if (c.name.toLowerCase().includes(q)) return true;
    if (c.code.toLowerCase().includes(q)) return true;
    if (digitsOnly && c.dialCode.includes(digitsOnly)) return true;
    return false;
  });
}
