const express = require('express');
const path = require('path');
const acoesRouter = require('./src/routes/acoes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/acoes', acoesRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ erro: 'Erro interno do servidor - não conectado.' });
});

app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
