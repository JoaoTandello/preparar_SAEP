const prisma = require("../data/prisma");

const emailDuplicado = async (email, idIgnorado = undefined) => {
    const usuario = await prisma.usuario.findUnique({ where: { email } });
    return usuario != null && usuario.id !== idIgnorado;
};

const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

const criarUsuario = async (dados) => {
    const nome = String(dados.nome || "").trim();
    const email = String(dados.email || "").trim().toLowerCase();

    if (!nome || !email) throw new Error("Os campos nome e e-mail são obrigatórios.");
    if (!validarEmail(email)) throw new Error("O e-mail digitado não é válido.");
    if (await emailDuplicado(email)) throw new Error("Já existe um usuário cadastrado com este e-mail.");

    return await prisma.usuario.create({
        data: { nome, email },
        select: { id: true, nome: true, email: true }
    });
};

const listarUsuarios = async () => prisma.usuario.findMany({
    select: { id: true, nome: true, email: true },
    orderBy: { nome: "asc" }
});

const buscarUsuarioPorId = async (id) => prisma.usuario.findUnique({
    where: { id: Number(id) },
    select: { id: true, nome: true, email: true }
});

const atualizarUsuario = async (id, dados) => {
    const dadosAtualizacao = {};
    if (dados.nome !== undefined) {
        const nome = String(dados.nome).trim();
        if (!nome) throw new Error("O nome é obrigatório.");
        dadosAtualizacao.nome = nome;
    }
    if (dados.email !== undefined) {
        const email = String(dados.email).trim().toLowerCase();
        if (!validarEmail(email)) throw new Error("O e-mail digitado não é válido.");
        if (await emailDuplicado(email, Number(id))) throw new Error("Já existe um usuário cadastrado com este e-mail.");
        dadosAtualizacao.email = email;
    }
    return await prisma.usuario.update({
        where: { id: Number(id) },
        data: dadosAtualizacao,
        select: { id: true, nome: true, email: true }
    });
};

const excluirUsuario = async (id) => prisma.usuario.delete({ where: { id: Number(id) } });

module.exports = {
    emailDuplicado,
    validarEmail,
    criarUsuario,
    listarUsuarios,
    buscarUsuarioPorId,
    atualizarUsuario,
    excluirUsuario
};
