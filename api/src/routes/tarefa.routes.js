const express = require("express");
const router = express.Router();

const { 
    adicionar, 
    listar, 
    buscar, 
    atualizar, 
    atualizarStatus, 
    excluir 
} = require("../controller/tarefa.controller");

router.post("/adicionar", adicionar); 
router.get("/listar", listar); 
router.get("/buscar/:id", buscar); 
router.put("/atualizar/:id", atualizar);  
router.patch("/atualizar_status/:id", atualizarStatus); 
router.delete("/excluir/:id", excluir); 

module.exports = router;