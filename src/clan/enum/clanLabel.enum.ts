/**
 * Enum used to determine the valid labels that can be assigned to a Clan.
 *
 * This enum is used for validating the labels field in the Clan entity,
 * ensuring that only predefined values are allowed.
 *
 * Notice that whenever there is a need to add a new label for a Clan,
 * this enum must be updated as well with the new label value.
 *
 * @example ```ts
 * // Do not write it as plain text
 * const clanLabel = 'eläinrakkaat';
 * // Use the enum instead
 * const clanLabel = ClanLabel.ELÄINRAKKAAT;
 * ```
 */
export enum ClanLabel {
  ELÄINRAKKAAT = 'eläinrakkaat',
  MAAHANMUUTTOMYÖNTEISET = 'maahanmuuttomyönteiset',
  LGBTQ = 'lgbtq+',
  RAITTIIT = 'raittiit',
  KOHTELIAAT = 'kohteliaat',
  KIUSAAMISENVASTAISET = 'kiusaamisenvastaiset',
  URHEILEVAT = 'urheilevat',
  SYVÄLLISET = 'syvälliset',
  OIKEUDENMUKAISET = 'oikeudenmukaiset',
  KAIKKIEN_KAVERIT = 'kaikkien kaverit',
  ITSENÄISET = 'itsenäiset',
  RETKEILIJÄT = 'retkeilijät',
  SUOMENRUOTSALAISET = 'suomenruotsalaiset',
  HUUMORINTAJUISET = 'huumorintajuiset',
  RIKKAAT = 'rikkaat',
  IKITEINIT = 'ikiteinit',
  JUORUILEVAT = 'juoruilevat',
  RAKASTAVAT = 'rakastavat',
  OLEILIJAT = 'oleilijat',
  NÖRTIT = 'nörtit',
  MUSADIGGARIT = 'musadiggarit',
  TUNTEELLISET = 'tunteelliset',
  GAMERIT = 'gamerit',
  ANIMEFANIT = 'animefanit',
  SINKUT = 'sinkut',
  MONIKULTTUURISET = 'monikulttuuriset',
  KAUNIIT = 'kauniit',
  JÄRJESTELMÄLLISET = 'järjestelmälliset',
  EPÄJÄRJESTELMÄLLISET = 'epäjärjestelmälliset',
  TASA_ARVOISET = 'tasa-arvoiset',
  SOMEPERSOONAT = 'somepersoonat',
  KÄDENTAITAJAT = 'kädentaitajat',
  MUUSIKOT = 'muusikot',
  TAITEILIJAT = 'taiteilijat',
  SPÄMMÄÄJÄT = 'spämmääjät',
  KASVISSYÖJÄT = 'kasvissyöjät',
  TASAPAINOISET = 'tasapainoiset',
}
