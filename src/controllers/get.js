const pool = require("../../database/index")
require("dotenv").config();
exports.getuser = async (req, res) => {
  const userId = req.user.id;

  try {
    pool.query('SELECT * FROM usuarios WHERE id = ?', [userId], (err, rows) => {
      if (err) {
        return res.status(500).json({ message: 'Erro ao consultar clientes', error: err.message });
      }

      return res.status(200).json({ authorization: true, getuser: rows });
    });
  } catch (error) {
    console.error('Erro na consulta:', error);
    return res.status(500).json({ message: 'Erro interno no servidor', error: error.message });
  }
};

exports.getCategorys = (req, res) => {
  try {
    const userId = req.user.id;

    pool.query('SELECT * FROM categorias WHERE usuario_id = ?', [userId], (err, rows) => {
      if (err) {
        console.error('Erro na consulta:', err);
        return res.status(500).json({ message: 'Erro interno no servidor', error: err.message });
      }

      if (rows.length === 0) {
        return res.status(404).json({ message: 'Nenhuma categorias encontrada para o usuário logado.' });
      }

      return res.status(200).json({ getCategorys: rows });
    });
  } catch (error) {
    console.error('Erro na consulta:', error);
    return res.status(500).json({ message: 'Erro interno no servidor', error: error.message });
  }
};

exports.getAccounts = (req, res) => {
  try {
    
    const userId = req.user.id;

    pool.query('SELECT id, nome, saldo_inicial FROM contas WHERE usuario_id = ?', [userId], (err, result) => {
      if (err) {
        console.error('Erro na consulta:', err);
        return res.status(500).json({ message: 'Erro interno no servidor', error: err.message });
      } else if (result.length === 0) {
        return res.status(404).json({ message: 'Nenhuma conta encontrada para o usuário logado.' });
      }
      return res.status(200).json({ getAccounts: result });
    })
  } catch (error) {
    console.error('Erro na consulta:', error);
    return res.status(500).json({ message: 'Erro interno no servidor', error: error.message });
  }
}

exports.getTransition = (req, res) => {
  const userId = req.user.id;
  try {
    pool.query('SELECT * FROM transacoes WHERE usuario_id = ?', [userId], (err, result) => {
      if (err) {
        console.error('Erro na consulta:', err);
        return res.status(500).json({ message: 'Erro interno no servidor', error: err.message });
      } else if (result.length === 0) {
        return res.status(404).json({ message: 'Nenhuma transacoes encontrada para o usuário logado.' });
      }
      return res.status(200).json({ getTransition: result });
    })
  } catch (error) {
    console.error('Erro na consulta:', error);
    return res.status(500).json({ message: 'Erro interno no servidor', error: error.message });
  }
};