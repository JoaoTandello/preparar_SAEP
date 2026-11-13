const usuarioService = require("../service/usuario.service");

const adicionar = async (req, res) => {
    try {
        const usuario = await usuarioService.criarUsuario(req.body);
        return res.status(201).json({
            mensagem: "cadastro concluído com sucesso",
            usuario
        });
    } catch (erro) {
        console.error("Erro no cadastro de usuário:", erro);
        return res.status(400).json({
            erro: erro.message
        });
    }
};

const listar = async (req, res) => {
    try {
        const usuarios = await usuarioService.listarUsuarios();
        return res.status(200).json(usuarios);
    } catch (erro) {
        console.error("Erro ao listar usuários:", erro);
        return res.status(500).json({
            erro: "Erro interno no servidor ao listar usuários."
        });
    }
};

const buscar = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(Number(id))) {
            return res.status(400).json({
                erro: "ID de usuário inválido."
            });
        }

        const usuario = await usuarioService.buscarUsuarioPorId(id);

        if (!usuario) {
            return res.status(404).json({
                erro: "Usuário não encontrado."
            });
        }

        return res.status(200).json(usuario);
    } catch (erro) {
        console.error("Erro ao buscar usuário:", erro);
        return res.status(500).json({
            erro: "Erro interno no servidor ao buscar usuário."
        });
    }
};

const atualizar = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(Number(id))) {
            return res.status(400).json({
                erro: "ID de usuário inválido."
            });
        }

        const usuarioAtualizado = await usuarioService.atualizarUsuario(id, req.body);

        return res.status(200).json({
            mensagem: "Usuário atualizado com sucesso!",
            usuario: usuarioAtualizado
        });
    } catch (erro) {
        console.error("Erro ao atualizar usuário:", erro);
        return res.status(400).json({
            erro: erro.message
        });
    }
};

const excluir = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(Number(id))) {
            return res.status(400).json({
                erro: "ID de usuário inválido."
            });
        }

        await usuarioService.excluirUsuario(id);

        return res.status(200).json({
            mensagem: "Usuário removido com sucesso!"
        });
    } catch (erro) {
        console.error("Erro ao excluir usuário:", erro);
        return res.status(500).json({
            erro: "Erro interno no servidor ao excluir usuário."
        });
    }
};

module.exports = {
    adicionar,
    listar,
    buscar,
    atualizar,
    excluir
};