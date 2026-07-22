/**
 * presentation/pages/AnimeListPage.jsx
 * Wrapper around unified ItemListPage for 'anime'.
 */
import React from 'react';
import { ItemListPage } from './ItemListPage.jsx';

export function AnimeListPage(props) {
  return <ItemListPage media="anime" {...props} />;
}
