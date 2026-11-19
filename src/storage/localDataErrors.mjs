const messages = {
  playlist_missing: 'A playlist local não está mais disponível. Carregue seus dados novamente.',
  playlist_full: 'Esta playlist atingiu o limite de 300 músicas. Escolha outra playlist.',
  read: 'Não foi possível carregar seus dados salvos. Tente novamente. Os dados existentes foram preservados.',
  write: 'Não foi possível confirmar o salvamento. Carregue os dados novamente antes de continuar.',
  invalid_data: 'Não foi possível validar os dados locais. Os dados salvos foram preservados.',
  unsupported_version: 'Os dados salvos foram criados por outra versão do aplicativo. Atualize o aplicativo para continuar.',
  timeout: 'O armazenamento demorou a responder. Tente carregar seus dados novamente.',
  unavailable: 'O aplicativo instalado precisa ser atualizado para salvar seus dados neste aparelho.',
  too_large: 'O limite de dados locais foi atingido. Carregue seus dados e reduza os itens antes de tentar novamente.',
  not_ready: 'Aguarde seus dados carregarem antes de alterar sua biblioteca.',
  cancelled: 'A conta ou a operação foi substituída.',
};
export class LocalDataError extends Error {
  constructor(code) { super(messages[code] ?? messages.read); this.name = 'LocalDataError'; this.code = code; }
}
export const localDataError = (error, code) => error instanceof LocalDataError ? error : new LocalDataError(code);
