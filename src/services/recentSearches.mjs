import { LOCAL_DATA_LIMITS } from '../storage/localDataSchema.mjs';
import { LocalDataError } from '../storage/localDataErrors.mjs';

export const MAX_RECENT_TERM_LENGTH = 150;
export function normalizeSearchTerm(value) {
  if (typeof value !== 'string') throw new LocalDataError('invalid_data');
  const term = value.trim().replace(/\s+/g, ' ');
  if (term.length > MAX_RECENT_TERM_LENGTH) throw new LocalDataError('invalid_data');
  return term;
}
const key = term => normalizeSearchTerm(term).toLowerCase();

export function listRecentSearches(data) {
  const seen = new Set();
  return [...(data?.recentSearches ?? [])].sort((a, b) => b.searchedAt - a.searchedAt).filter(item => {
    const value = key(item.term);
    if (!value || seen.has(value)) return false;
    seen.add(value); return true;
  });
}
export function rememberRecentSearch(data, value, searchedAt = Date.now()) {
  const term = normalizeSearchTerm(value);
  if (!term) return data;
  if (!Number.isSafeInteger(searchedAt) || searchedAt < 0) throw new LocalDataError('invalid_data');
  const previous = listRecentSearches(data).filter(item => key(item.term) !== key(term));
  return { ...data, recentSearches: [{ term, searchedAt }, ...previous].slice(0, LOCAL_DATA_LIMITS.recentSearches) };
}
export function forgetRecentSearch(data, value) {
  const term = normalizeSearchTerm(value);
  if (!term) return data;
  const recentSearches = data.recentSearches.filter(item => key(item.term) !== key(term));
  return recentSearches.length === data.recentSearches.length ? data : { ...data, recentSearches };
}
export function clearRecentSearches(data) {
  return data.recentSearches.length ? { ...data, recentSearches: [] } : data;
}
export function saveRecentSearch(localData, term, { now = Date.now } = {}) {
  return localData.update(current => rememberRecentSearch(current, term, now()));
}
export const removeRecentSearch = (localData, term) => localData.update(current => forgetRecentSearch(current, term));
export const removeAllRecentSearches = localData => localData.update(clearRecentSearches);
