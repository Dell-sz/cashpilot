// src/utils/dateUtils.js

/**
 * Converte uma data do input type="date" para o formato correto no Firestore
 * @param {string} dateString - Data no formato YYYY-MM-DD
 * @returns {string} - Data corrigida no mesmo formato
 */
export const fixTimezoneIssue = (dateString) => {
  if (!dateString) return new Date().toISOString().split('T')[0];

  // Cria a data considerando o fuso horário local
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day); // Mês é 0-indexed

  // Retorna no formato YYYY-MM-DD
  return date.toISOString().split('T')[0];
};

/**
 * Formata uma data para exibição em pt-BR
 * @param {string} dateString - Data no formato YYYY-MM-DD
 * @returns {string} - Data formatada (DD/MM/YYYY)
 */
export const formatDateForDisplay = (dateString) => {
  if (!dateString) return "Sem data";
  const [year, month, day] = dateString.split('-').map(Number);
  return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
};

/**
 * Obtém a data atual no formato YYYY-MM-DD
 * @returns {string}
 */
export const getTodayDate = () => {
  return new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
};
