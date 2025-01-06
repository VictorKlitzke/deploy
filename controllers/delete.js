const pool = require("../database/index");
require("dotenv").config();

exports.deleteAccounts = (req, res) => {
  const { index } = req.body;
  const userId = req.user.id;

  if (!index) {
    return res.status(401).json({ error: "Id da categoria não foi encontrado" });
  }

  if (!req.user || req.user.id !== userId) {
    return res.status(401).json({ error: "Usuário não autenticado." });
  }

  try {
    pool.run(
        "DELETE FROM contas WHERE id = ? AND usuario_id = ?",
        [index, userId],
        (deleteErr) => {
          if (deleteErr) {
            console.error("Erro ao deletar a conta:", deleteErr.message);
            return res.status(500).json({ error: "Erro ao deletar a transação." });
          }

          return res.status(200).json({ message: "Conta deletada com sucesso!" });
        }
    );

  } catch (error) {
    console.error("Erro ao deletar conta:", error.message);
    return res.status(500).json({ error: "Erro interno no servidor." });
  }
}

exports.deletecategory = (req, res) => {
  const { index } = req.body;
  const userId = req.user.id;

  if (!index) {
    return res.status(401).json({ error: "Id da categoria não foi encontrado" });
  }

  if (!req.user || req.user.id !== userId) {
    return res.status(401).json({ error: "Usuário não autenticado." });
  }

  try {
    pool.run(
      "DELETE FROM categorias WHERE id = ? AND usuario_id = ?",
      [index, userId],
      (deleteErr) => {
        if (deleteErr) {
          console.error("Erro ao deletar a categoria:", deleteErr.message);
          return res.status(500).json({ error: "Erro ao deletar a transação." });
        }

        return res.status(200).json({ message: "Categoria deletada com sucesso!" });
      }
    );
  } catch (error) {
    console.error("Erro ao deletar categoria:", error.message);
    return res.status(500).json({ error: "Erro interno no servidor." });
  }
}
exports.deletetransacao = (req, res) => {
  const { index } = req.body;
  const userId = req.user.id;

  if (!index) {
    return res.status(401).json({ error: "Id da transação não foi encontrado" });
  }

  if (!req.user || req.user.id !== userId) {
    return res.status(401).json({ error: "Usuário não autenticado." });
  }

  try {
    pool.run(
      "DELETE FROM transacoes WHERE id = ? AND usuario_id = ?",
      [index, userId],
      (deleteErr) => {
        if (deleteErr) {
          console.error("Erro ao deletar a transação:", deleteErr.message);
          return res.status(500).json({ error: "Erro ao deletar a transação." });
        }

        return res.status(200).json({ message: "Transação deletada com sucesso!" });
      }
    );
  } catch (error) {
    console.error("Erro ao deletar transação:", error.message);
    return res.status(500).json({ error: "Erro interno no servidor." });
  }
}