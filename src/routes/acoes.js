const express = require('express');
const { fetchQuote } = require('../brapiClient');
const { normalizarHistorico, calcularRetornoAcumulado, montarResumo } = require('../util/calculos');
// Identificacao
const router = express.Router();
const TICKERS = ['PETR4', 'ITUB4', 'VALE3'];

router.get('/ytd', async (req, res) => {
  const resultados = await Promise.allSettled(
    TICKERS.map((ticker) => fetchQuote(ticker, { range: 'ytd', interval: '1d' }))
  );

  const acoes = [];
  const avisos = [];

  resultados.forEach((r, i) => {
    const ticker = TICKERS[i];
    if (r.status === 'fulfilled') {
      const quote = r.value;
      const historico = normalizarHistorico(quote.historicalDataPrice);
      acoes.push({
        ticker,
        nome: quote.shortName || ticker,
        moeda: quote.currency || 'BRL',
        historico,
        retornoAcumulado: calcularRetornoAcumulado(historico),
        resumo: montarResumo(historico, quote),
      });
    } else {
      avisos.push(`Falha ao buscar ${ticker}: ${r.reason?.message || 'erro desconhecido - avise a T.I'}`);
    }
  });

  if (acoes.length === 0) {
    return res.status(503).json({
      erro: 'Não foi possível obter dados da brapi.dev no momento. Por favor, tente mais tarde.',
      avisos,
    });
  }
// Segunda identificação
  res.json({ acoes, avisos, atualizadoEm: new Date().toISOString() });
});

module.exports = router;
