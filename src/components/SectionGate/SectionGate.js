'use client';

import { useDraft } from '@/contexts/ContentContext';
import { SECTIONS } from '@/constants/site';

/** Renders children only when the section is enabled in admin (SECTIONS map). */
export default function SectionGate({ section, children }) {
  const sections = useDraft('SECTIONS', SECTIONS);
  if (sections[section] === false) return null;
  return children;
}
