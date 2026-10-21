import type { Metadata } from 'next'
import SurveyClient from './survey-client'

/**
 * The research survey route.
 *
 * noindex: this is a research instrument, not marketing content. It should
 * never appear in a search result.
 *
 * There are deliberately NO analytics, no tracking pixels and no third-party
 * scripts anywhere on this route. That is what makes the "anonymous" claim in
 * the privacy box true, and it is why the page needs no cookie banner: the one
 * cookie it sets is the strictly necessary progressive-save identifier.
 */

export const metadata: Metadata = {
  title: 'The AYO Relationship Study',
  description:
    'An anonymous study of what actually happens in relationships, and what support would help.',
  robots: { index: false, follow: false, nocache: true },
}

export default function WhatDoYouThinkPage() {
  return <SurveyClient />
}
