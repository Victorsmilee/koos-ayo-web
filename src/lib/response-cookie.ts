/**
 * The progressive-save cookie, named once.
 *
 * It holds nothing but a random row id. That is what makes it "strictly
 * necessary" under the ePrivacy rules and why this route needs no cookie
 * banner: it stores no identifier about the person and is used for nothing
 * except resuming their own unfinished response.
 */
export const RESPONSE_COOKIE = 'koos_rid'

/** The survey route. The cookie is scoped to it and nowhere else. */
export const SURVEY_PATH = '/whatdoyouthink'

/** Long enough to finish in one sitting, then gone. */
export const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 4
