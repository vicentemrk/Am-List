/**
 * presentation/pages/MangaListPage.jsx
 * Wrapper around unified ItemListPage for 'manga'.
 */
import React from 'react';
import { ItemListPage } from './ItemListPage.jsx';

export function MangaListPage(props) {
  return <ItemListPage media="manga" {...props} />;
}
