require('dotenv').config();

const express = require('express');
const cors = require('cors');

const usuarioRoutes = require('./src/routes/usuario.routes');
const tarefaRoutes = require('./src/routes/tarefa.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/usuarios', usuarioRoutes);
app.use('/tarefas', tarefaRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});