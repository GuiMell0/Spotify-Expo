import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { getSpotifyConfig, SPOTIFY_ANDROID_REDIRECT_URI } from '../src/config/spotify.mjs';

const valid = {
  clientId: 'a'.repeat(32),
  androidRedirectUri: 'spotifyexpo-login://callback',
  webRedirectUri: 'http://127.0.0.1:8081/callback',
};

test('configuração incompleta produz orientação sem lançar exceção', () => {
  const result = getSpotifyConfig('android', {});
  assert.equal(result.isConfigured, false);
  assert.equal(result.issues.length, 2);
});

test('aceita Client ID público e retorno Android registrado pelo aplicativo', () => {
  const result = getSpotifyConfig('android', valid);
  assert.equal(result.isConfigured, true);
  assert.equal(result.redirectUri, SPOTIFY_ANDROID_REDIRECT_URI);
  const config = JSON.parse(readFileSync(new URL('../app.json', import.meta.url), 'utf8'));
  assert.ok(config.expo.scheme.includes(new URL(result.redirectUri).protocol.slice(0, -1)));
});

test('recusa placeholder e retorno nativo de outro scheme', () => {
  assert.equal(getSpotifyConfig('android', { ...valid, clientId: 'seu_client_id' }).isConfigured, false);
  assert.equal(getSpotifyConfig('android', { ...valid, clientId: 'BQ' + 'x'.repeat(80) }).isConfigured, false);
  assert.equal(getSpotifyConfig('android', { ...valid, androidRedirectUri: 'spotifyexpo://callback' }).isConfigured, false);
});

test('remove espaços ao redor dos valores copiados', () => {
  const result = getSpotifyConfig('android', { ...valid, clientId: '  ' + valid.clientId + ' ', androidRedirectUri: valid.androidRedirectUri + ' ' });
  assert.equal(result.isConfigured, true);
  assert.equal(result.clientId, valid.clientId);
});

test('aceita retorno web local com IP explícito e HTTPS publicado', () => {
  for (const webRedirectUri of [valid.webRedirectUri, 'http://[::1]:8081/callback', 'https://meu-app.example/callback']) {
    assert.equal(getSpotifyConfig('web', { ...valid, webRedirectUri }).isConfigured, true);
  }
});

test('recusa retornos web incompatíveis com o callback ou regras de transporte', () => {
  for (const webRedirectUri of ['', 'não é uma URL', 'http://localhost:8081/callback', 'https://localhost/callback', 'http://192.168.0.10:8081/callback', 'ftp://app.example/callback', 'https://app.example/outra-rota', 'https://app.example/callback#token', 'https://usuario:senha@app.example/callback']) {
    assert.equal(getSpotifyConfig('web', { ...valid, webRedirectUri }).isConfigured, false, webRedirectUri);
  }
});

test('campos de uma plataforma não bloqueiam a outra', () => {
  assert.equal(getSpotifyConfig('android', { ...valid, webRedirectUri: '' }).isConfigured, true);
  assert.equal(getSpotifyConfig('web', { ...valid, androidRedirectUri: '' }).isConfigured, true);
});

test('plataforma sem configuração específica não recebe retorno Android por engano', () => {
  const result = getSpotifyConfig('ios', valid);
  assert.equal(result.isConfigured, false);
  assert.equal(result.redirectUri, '');
});

