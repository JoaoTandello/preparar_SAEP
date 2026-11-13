const prisma = require("../data/prisma");

const statusPermitidos = ["a fazer", "fazendo", "pronto"];
const prioridadesPermitidas = ["Baixa", "Média", "Alta"];

const validarDados = async (dados, parcial = false) => {
    const { descricao, setor, prioridade, usuarioId, status } = dados;

    if (!parcial && (!descricao || !setor || !prioridade || !usuarioId)) {
        throw new Error("Todos os campos de cadastro de tarefa são obrigatórios.");
    }
    if (descricao !== undefined && !String(descricao).trim()) throw new Error("A descrição da tarefa é obrigatória.");
    if (setor !== undefined && !String(setor).trim()) throw new Error("O setor é obrigatório.");
    if (prioridade !== undefined && !prioridadesPermitidas.includes(prioridade)) {
        throw new Error("Selecione uma prioridade válida: Baixa, Média ou Alta.");
    }
    if (status !== undefined && !statusPermitidos.includes(String(status).toLowerCase())) {
        throw new Error("Selecione um status válido.");
    }
    if (usuarioId !== undefined) {
        const usuarioExiste = await prisma.usuario.findUnique({ where: { id: Number(usuarioId) } });
        if (!usuarioExiste) throw new Error("Usuário vinculado não encontrado.");
    }
};

const criarTarefa = async (dados) => {
    await validarDados(dados);
    const { descricao, setor, prioridade, usuarioId, status } = dados;
    return await prisma.tarefa.create({
        data: {
            descricao: String(descricao).trim(),
            setor: String(setor).trim(),
            prioridade,
            usuarioId: Number(usuarioId),
            status: status ? String(status).toLowerCase() : "a fazer"
        },
        include: { usuario: true }
    });
};

const listarTarefas = async () => prisma.tarefa.findMany({
    include: { usuario: true },
    orderBy: { dataCadastro: "desc" }
});

const buscarTarefaPorId = async (id) => prisma.tarefa.findUnique({
    where: { id: Number(id) },
    include: { usuario: true }
});

const atualizarTarefa = async (id, dados) => {
    await validarDados(dados, true);
    const dadosAtualizacao = {};
    if (dados.descricao !== undefined) dadosAtualizacao.descricao = String(dados.descricao).trim();
    if (dados.setor !== undefined) dadosAtualizacao.setor = String(dados.setor).trim();
    if (dados.prioridade !== undefined) dadosAtualizacao.prioridade = dados.prioridade;
    if (dados.usuarioId !== undefined) dadosAtualizacao.usuarioId = Number(dados.usuarioId);
    if (dados.status !== undefined) dadosAtualizacao.status = String(dados.status).toLowerCase();

    return await prisma.tarefa.update({
        where: { id: Number(id) },
        data: dadosAtualizacao,
        include: { usuario: true }
    });
};

const atualizarStatusTarefa = async (id, status) => {
    if (!status || !statusPermitidos.includes(String(status).toLowerCase())) {
        throw new Error("Selecione um status válido.");
    }
    return await prisma.tarefa.update({
        where: { id: Number(id) },
        data: { status: String(status).toLowerCase() },
        include: { usuario: true }
    });
};

const excluirTarefa = async (id) => prisma.tarefa.delete({ where: { id: Number(id) } });

module.exports = {
    criarTarefa,
    listarTarefas,
    buscarTarefaPorId,
    atualizarTarefa,
    atualizarStatusTarefa,
    excluirTarefa
};
