/**
 * Who operates KOOS, in one place.
 *
 * Eben EIO Global OÜ is both the company that runs the service and the data
 * controller for the research survey. The footer names it on every page and the
 * privacy notice names it as controller, so the value lives here rather than
 * being typed into two files that can drift apart. A regulator compares the
 * published notice against docs/gdpr/ropa.md in the private repo; two spellings
 * of the same company is exactly the kind of mismatch that looks like a second
 * organisation.
 *
 * Changed 27 Oct 2026 (INF-103). Until then the controller was Victor Ibrahim,
 * a natural person, because the company was not yet registered and an intended
 * company is not an identifiable legal person. That is a change of controller
 * under GDPR, not a correction, so ropa.md section 10a records the date and
 * which responses belong to which controller.
 */

/** Registered company name, exactly as registered. */
export const OPERATOR_NAME = 'Eben EIO Global OÜ'

/** Registered address, as it appears in the ROPA. */
export const OPERATOR_ADDRESS = 'Paldiski mnt 227c, 13520 Tallinn'

/** Country of registration. */
export const OPERATOR_COUNTRY = 'Estonia'

/**
 * The holder named in the copyright line.
 *
 * Deliberately not the KOOS-AYO wordmark: this is the corporate naming of the
 * product as the company holds it, which is why it carries a space rather than
 * the hyphen. See docs/brand/foundations/naming.md.
 */
export const COPYRIGHT_HOLDER = 'Koos Ayo'

/** The attribution line shown in the site footer. */
export const OPERATOR_LINE = `Developed and operated by ${OPERATOR_NAME}`

/**
 * Intellectual property notice, as supplied by the Product Owner.
 * Not a GDPR statement, so it sits beside the notice rather than inside it.
 */
export const IP_NOTICE =
  `Intellectual property rights in the service are owned by ${OPERATOR_NAME} or its licensors.`
