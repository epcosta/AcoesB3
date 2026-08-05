const CORES = { PETR4: '#2a78d6', ITUB4: '#eb6834', VALE3: '#1baf7a' };

async function carregar() {
  const statusEl = document.getElementById('status-atualizacao');
  try {
    const res = await fetch('/api/acoes/ytd');
    const json = await res.json();

    if (json.erro) {
      statusEl.textContent = json.erro;
      statusEl.classList.add('aviso');
      return;
    }

    renderResumo(json.acoes);
    renderGraficoPreco(json.acoes);
    renderGraficoVolume(json.acoes);
    renderGraficoRetorno(json.acoes);
    renderTabela(json.acoes);

    const atualizado = new Date(json.atualizadoEm).toLocaleString('pt-BR');
    if (json.avisos?.length) {
      statusEl.textContent = `Atualizado em ${atualizado}. Aviso: ${json.avisos.join(' | ')}`;
      statusEl.classList.add('aviso');
    } else {
      statusEl.textContent = `Atualizado em ${atualizado}`;
      statusEl.classList.remove('aviso');
    }
  } catch (e) {
    statusEl.textContent = 'Não foi possível carregar os dados. Verifique sua conexão e recarregue a página.';
    statusEl.classList.add('aviso');
  }
}

function formatarMoeda(valor) {
  if (valor === null || valor === undefined) return '—';
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarPercentual(valor) {
  if (valor === null || valor === undefined) return '—';
  const sinal = valor > 0 ? '+' : '';
  return `${sinal}${valor.toFixed(2)}%`;
}
function formatarDataBR(valor) {
    const [ano, mes, dia] = valor.split("-");
    return `${dia}/${mes}/${ano}`;
}

function renderResumo(acoes) {
  const container = document.getElementById('resumo');
  container.innerHTML = acoes.map((a) => {
    const r = a.resumo;
    const classeVar = (r.variacaoPercentualNoAno ?? 0) >= 0 ? 'positiva' : 'negativa';
    return `
      <div class="card">
        <div class="ticker">
          <span class="dot" style="background:${CORES[a.ticker]}"></span>
          ${a.ticker}
        </div>
        <dl>
          <dt>Abertura do ano</dt><dd>${formatarMoeda(r.aberturaAno)}</dd>
          <dt>Máxima</dt><dd>${formatarMoeda(r.maxima)}</dd>
          <dt>Mínima</dt><dd>${formatarMoeda(r.minima)}</dd>
          <dt>Preço atual</dt><dd>${formatarMoeda(r.precoAtual)}</dd>
          <dt>Variação no ano</dt><dd class="variacao ${classeVar}">${formatarPercentual(r.variacaoPercentualNoAno)}</dd>
        </dl>
      </div>
    `;
  }).join('');
}

function renderGraficoPreco(acoes) {
  new Chart(document.getElementById('chart-preco'), {
    type: 'line',
    data: {
      labels: acoes[0].historico.map((d) => formatarDataBR(d.data)),
      datasets: acoes.map((a) => ({
        label: a.ticker,
        data: a.historico.map((d) => d.fechamento),
        borderColor: CORES[a.ticker],
        backgroundColor: CORES[a.ticker],
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.15,
      })),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { display: true, position: 'top' } },
      scales: {
        y: { title: { display: true, text: 'R$' }, grid: { color: 'rgba(128,128,128,0.15)' } },
        x: { grid: { display: false }, ticks: { maxTicksLimit: 12 } },
      },
    },
  });
}

function renderGraficoVolume(acoes) {
  new Chart(document.getElementById('chart-volume'), {
    type: 'bar',
    data: {
      labels: acoes[0].historico.map((d) => formatarDataBR(d.data)),
      datasets: acoes.map((a) => ({
        label: a.ticker,
        data: a.historico.map((d) => d.volume),
        backgroundColor: CORES[a.ticker],
        maxBarThickness: 8,
      })),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { display: true, position: 'top' } },
      scales: {
        y: { title: { display: true, text: 'Volume' }, grid: { color: 'rgba(128,128,128,0.15)' } },
        x: { grid: { display: false }, ticks: { maxTicksLimit: 12 } },
      },
    },
  });
}

function renderGraficoRetorno(acoes) {
  new Chart(document.getElementById('chart-retorno'), {
    type: 'line',
    data: {
      labels: acoes[0].retornoAcumulado.map((d) => formatarDataBR(d.data)),
      datasets: acoes.map((a) => ({
        label: a.ticker,
        data: a.retornoAcumulado.map((d) => d.percentual),
        borderColor: CORES[a.ticker],
        backgroundColor: CORES[a.ticker],
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.15,
      })),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { display: true, position: 'top' } },
      scales: {
        y: { title: { display: true, text: '%' }, grid: { color: 'rgba(128,128,128,0.15)' } },
        x: { grid: { display: false }, ticks: { maxTicksLimit: 12 } },
      },
    },
  });
}

function renderTabela(acoes) {
  const tbody = document.querySelector('#tabela tbody');
  tbody.innerHTML = acoes.map((a) => {
    const r = a.resumo;
    const classeVar = (r.variacaoPercentualNoAno ?? 0) >= 0 ? 'positiva' : 'negativa';
    return `
      <tr>
        <td>${a.ticker}</td>
        <td>${formatarMoeda(r.aberturaAno)}</td>
        <td>${formatarMoeda(r.maxima)}</td>
        <td>${formatarMoeda(r.minima)}</td>
        <td>${formatarMoeda(r.precoAtual)}</td>
        <td class="variacao ${classeVar}">${formatarPercentual(r.variacaoPercentualNoAno)}</td>
      </tr>
    `;
  }).join('');
}

carregar();
