const api = "http://localhost:3000";

async function pedir(url, opcoes = {}) {
    const resposta = await fetch(url, opcoes);
    const dados = await resposta.json();

    if (!resposta.ok) {
        throw new Error(dados.erro || dados.mensagem || "Ocorreu um erro.");
    }

    return dados;
}

function mostrar(id, texto, erro = false) {
    const campo = document.querySelector(id);
    if (!campo) return;
    campo.textContent = texto;
    campo.className = erro ? "mensagem erro" : "mensagem sucesso";
}

function textoSeguro(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, letra => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    })[letra]);
}


// cadastrar usuario

const formUsuario = document.querySelector("#formUsuario");

if (formUsuario) {
    formUsuario.addEventListener("submit", async function (evento) {
        evento.preventDefault();

        const nome = document.querySelector("#nomeUsuarioInput").value.trim();
        const email = document.querySelector("#emailUsuarioInput").value.trim();

        try {
            await pedir(api + "/usuarios/adicionar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nome, email })
            });

            mostrar("#mensagemUsuario", "Usuário cadastrado com sucesso!");
            formUsuario.reset();
            await listarUsuarios();
        } catch (erro) {
            mostrar("#mensagemUsuario", erro.message, true);
        }
    });

    listarUsuarios();
}

async function listarUsuarios() {
    const lista = document.querySelector("#listaUsuarios");
    if (!lista) return;

    try {
        const usuarios = await pedir(api + "/usuarios/listar");
        const quantidade = document.querySelector("#quantidadeUsuarios");
        if (quantidade) quantidade.textContent = usuarios.length;

        if (usuarios.length === 0) {
            lista.innerHTML = '<p class="vazio">Nenhum usuário cadastrado ainda.</p>';
            return;
        }

        lista.innerHTML = usuarios.map(usuario => `
            <div class="usuario">
                <div>
                    <strong>${textoSeguro(usuario.nome)}</strong>
                    <small>${textoSeguro(usuario.email)}</small>
                </div>
            </div>
        `).join("");
    } catch (erro) {
        lista.innerHTML = '<p class="vazio">Não foi possível carregar os usuários. Confira se a API e o banco estão ligados.</p>';
    }
}

// tarefas

const formTarefa = document.querySelector("#formTarefa");

if (formTarefa) {
    const id = new URLSearchParams(window.location.search).get("id");

    preencherUsuarios().then(() => {
        if (id) buscarTarefa(id);
    });

    formTarefa.addEventListener("submit", async function (evento) {
        evento.preventDefault();

        const tarefaId = document.querySelector("#tarefaIdInput").value;
        const dados = {
            descricao: document.querySelector("#descricaoTarefa").value.trim(),
            setor: document.querySelector("#setorTarefa").value.trim(),
            usuarioId: Number(document.querySelector("#selectUsuarioTarefa").value),
            prioridade: document.querySelector("#prioridadeTarefa").value
        };

        if (!dados.usuarioId) {
            mostrar("#mensagemTarefa", "Cadastre e selecione um usuário antes de criar a tarefa.", true);
            return;
        }

        const url = tarefaId
            ? api + "/tarefas/atualizar/" + tarefaId
            : api + "/tarefas/adicionar";

        try {
            await pedir(url, {
                method: tarefaId ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dados)
            });

            mostrar("#mensagemTarefa", "Tarefa salva com sucesso!");
            window.location.href = "gerenciar_tarefas.html";
        } catch (erro) {
            mostrar("#mensagemTarefa", erro.message, true);
        }
    });
}

async function preencherUsuarios() {
    const select = document.querySelector("#selectUsuarioTarefa");
    if (!select) return;

    try {
        const usuarios = await pedir(api + "/usuarios/listar");
        select.innerHTML = '<option value="">Selecione um usuário</option>';

        usuarios.forEach(usuario => {
            const opcao = document.createElement("option");
            opcao.value = usuario.id;
            opcao.textContent = usuario.nome;
            select.appendChild(opcao);
        });

        if (usuarios.length === 0) {
            mostrar("#mensagemTarefa", "Cadastre um usuário na página Cadastro de Usuários primeiro.", true);
        }
    } catch (erro) {
        mostrar("#mensagemTarefa", "Não foi possível carregar os usuários. Confira se a API está ligada.", true);
    }
}

async function buscarTarefa(id) {
    try {
        const tarefa = await pedir(api + "/tarefas/buscar/" + id);
        document.querySelector("#tituloFormTarefa").textContent = "Editar tarefa";
        document.querySelector("#tarefaIdInput").value = tarefa.id;
        document.querySelector("#descricaoTarefa").value = tarefa.descricao;
        document.querySelector("#setorTarefa").value = tarefa.setor;
        document.querySelector("#selectUsuarioTarefa").value = tarefa.usuarioId;
        document.querySelector("#prioridadeTarefa").value = tarefa.prioridade;
        document.querySelector("#btnSalvarTarefa").textContent = "Salvar alterações";
    } catch (erro) {
        mostrar("#mensagemTarefa", erro.message, true);
    }
}

if (document.querySelector("#colunaAFazer")) {
    listarTarefas();
}

async function listarTarefas() {
    try {
        const tarefas = await pedir(api + "/tarefas/listar");
        const colunas = {
            "a fazer": document.querySelector("#colunaAFazer"),
            "fazendo": document.querySelector("#colunaFazendo"),
            "pronto": document.querySelector("#colunaPronto")
        };

        Object.values(colunas).forEach(coluna => {
            if (coluna) coluna.innerHTML = "";
        });

        const totais = { "a fazer": 0, "fazendo": 0, "pronto": 0 };

        tarefas.forEach(tarefa => {
            const status = totais[tarefa.status] !== undefined ? tarefa.status : "a fazer";
            totais[status]++;

            const prioridade = String(tarefa.prioridade).toLowerCase();
            const classe = prioridade === "alta" ? "alta" : prioridade === "baixa" ? "baixa" : "";

            const card = document.createElement("div");
            card.className = "card-tarefa";
            card.innerHTML = `
                <span class="prioridade ${classe}">${textoSeguro(tarefa.prioridade)}</span>
                <h3>${textoSeguro(tarefa.descricao)}</h3>
                <p>Setor: ${textoSeguro(tarefa.setor)}</p>
                <p>Responsável: ${textoSeguro(tarefa.usuario ? tarefa.usuario.nome : "Não informado")}</p>
                <select class="statusTarefa">
                    <option value="a fazer" ${status === "a fazer" ? "selected" : ""}>A fazer</option>
                    <option value="fazendo" ${status === "fazendo" ? "selected" : ""}>Fazendo</option>
                    <option value="pronto" ${status === "pronto" ? "selected" : ""}>Pronto</option>
                </select>
                <div class="card-botoes">
                    <a class="botao-claro" href="cadastro_tarefas.html?id=${tarefa.id}">Editar</a>
                    <button class="excluir" type="button">Excluir</button>
                    <button class="salvar-status" type="button">Salvar status</button>
                </div>`;

            card.querySelector(".excluir").addEventListener("click", () => excluirTarefa(tarefa.id));
            card.querySelector(".salvar-status").addEventListener("click", () => {
                mudarStatus(tarefa.id, card.querySelector(".statusTarefa").value);
            });

            if (colunas[status]) colunas[status].appendChild(card);
        });

        Object.keys(colunas).forEach(status => {
            if (colunas[status] && colunas[status].children.length === 0) {
                colunas[status].innerHTML = '<p class="vazio">Nenhuma tarefa aqui.</p>';
            }
        });
    } catch (erro) {
        mostrar("#mensagemQuadro", "Não foi possível carregar as tarefas. Confira se a API e o banco estão ligados.", true);
    }
}

async function mudarStatus(id, status) {
    try {
        await pedir(api + "/tarefas/atualizar_status/" + id, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status })
        });
        listarTarefas();
    } catch (erro) {
        alert(erro.message);
    }
}

async function excluirTarefa(id) {
    if (!confirm("Deseja excluir esta tarefa?")) return;

    try {
        await pedir(api + "/tarefas/excluir/" + id, { method: "DELETE" });
        listarTarefas();
    } catch (erro) {
        alert(erro.message);
    }
}
