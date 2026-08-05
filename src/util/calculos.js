function normalizarHistorico(historicalDataPrice) {
  return [...historicalDataPrice]
    .sort((a, b) => a.date - b.date)
    .map((d) => ({
      data: new Date(d.date * 1000).toISOString().slice(0, 10), // date vem em SEGUNDOS
      abertura: d.open,
      maxima: d.high,
      minima: d.low,
      fechamento: d.close,
      volume: d.volume,
    }));
}

function calcularRetornoAcumulado(historicoNormalizado) {
  if (historicoNormalizado.length === 0) return [];
  const baseline = historicoNormalizado[0].fechamento;
  return historicoNormalizado.map((d) => ({
    data: d.data,
    percentual: Number((((d.fechamento / baseline) - 1) * 100).toFixed(2)),
  }));
}

function montarResumo(historicoNormalizado, quote) {
  if (historicoNormalizado.length === 0) {
    return {
      aberturaAno: null,
      maxima: null,
      minima: null,
      precoAtual: quote.regularMarketPrice ?? null,
      variacaoPercentualNoAno: null,
    };
  }

  const fechamentos = historicoNormalizado.map((d) => d.fechamento);
  const aberturaAno = historicoNormalizado[0].abertura;

  return {
    aberturaAno,
    maxima: Math.max(...fechamentos),
    minima: Math.min(...fechamentos),
    precoAtual: quote.regularMarketPrice,
    variacaoPercentualNoAno: aberturaAno
      ? Number((((quote.regularMarketPrice / aberturaAno) - 1) * 100).toFixed(2))
      : null,
  };
}

module.exports = { normalizarHistorico, calcularRetornoAcumulado, montarResumo };
