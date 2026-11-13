const tarefaService = require("../service/tarefa.service");

const adicionar = async (req, res) => {
    try {
        const novaTarefa = await tarefaService.criarTarefa(req.body);
        return res.status(201).json({
            mensagem: "cadastro concluído com sucesso",
            tarefa: novaTarefa
        });
    } catch (erro) {
        console.error("Erro ao cadastrar tarefa:", erro);
        return res.status(400).json({
            erro: erro.message
        });
    }
};

const listar = async (req, res) => {
    try {
        const tarefas = await tarefaService.listarTarefas();
        return res.status(200).json(tarefas);
    } catch (erro) {
        console.error("Erro ao listar tarefas:", erro);
        return res.status(500).json({
            erro: "Erro interno no servidor ao listar tarefas."
        });
    }
};

const buscar = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(Number(id))) {
            return res.status(400).json({
                erro: "ID de tarefa inválido."
            });
        }

        const tarefa = await tarefaService.buscarTarefaPorId(id);

        if (!tarefa) {
            return res.status(404).json({
                erro: "Tarefa não encontrada."
            });
        }

        return res.status(200).json(tarefa);
    } catch (erro) {
        console.error("Erro ao buscar tarefa:", erro);
        return res.status(500).json({
            erro: "Erro interno no servidor ao buscar tarefa."
        });
    }
};

const atualizar = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(Number(id))) {
            return res.status(400).json({
                erro: "ID de tarefa inválido."
            });
        }

        const tarefaAtualizada = await tarefaService.atualizarTarefa(id, req.body);

        return res.status(200).json({
            mensagem: "Tarefa atualizada com sucesso",
            tarefa: tarefaAtualizada
        });
    } catch (erro) {
        console.error("Erro ao atualizar tarefa:", erro);
        return res.status(400).json({
            erro: erro.message
        });
    }
};

const atualizarStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (isNaN(Number(id))) {
            return res.status(400).json({
                erro: "ID de tarefa inválido."
            });
        }

        const tarefaAtualizada = await tarefaService.atualizarStatusTarefa(id, status);

        return res.status(200).json({
            mensagem: "Status alterado com sucesso",
            tarefa: tarefaAtualizada
        });
    } catch (erro) {
        console.error("Erro ao atualizar status da tarefa:", erro);
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
                erro: "ID de tarefa inválido."
            });
        }

        await tarefaService.excluirTarefa(id);

        return res.status(200).json({
            mensagem: "Tarefa excluída com sucesso"
        });
    } catch (erro) {
        console.error("Erro ao excluir tarefa:", erro);
        return res.status(500).json({
            erro: "Erro interno no servidor ao excluir tarefa."
        });
    }
};

module.exports = {
    adicionar,
    listar,
    buscar,
    atualizar,
    atualizarStatus,
    excluir
};