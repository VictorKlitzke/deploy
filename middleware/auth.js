const jwt = require('jsonwebtoken');
const pool = require('../database/index');

module.exports = async (req, res, next) => {
  let token = req.cookies['token'];

  if (!token && req.headers['authorization']) {
    const authHeader = req.headers['authorization'];
    token = authHeader.split(' ')[1]; 
  }
  
  if (!token) {
    return res.status(401).json({ message: '[AVISO] - TOKEN NÃO INFORMADO' });
  }

  try {
    const decoded = jwt.verify(token, process.env.TOKEN);
    const userId = decoded.id;
    
    pool.get('SELECT * FROM usuarios WHERE id = ?', [userId], (err, user) => {
      if (err) {
        console.error('[AVISO] - ERRO AO CONSULTAR USUÁRIO:', err);
        return res.status(500).json({ message: '[AVISO] - ERRO INTERNO DO SERVIDOR' });
      }

      if (!user) {
        return res
          .status(404)
          .json({ message: '[AVISO] - USUÁRIO NÃO ENCONTRADO' });
      }

      req.user = user; 
      next(); 
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res
        .status(403)
        .json({ message: '[AVISO] - AUTENTICAÇÃO NÃO VALIDADA' });
    } else {
      console.error('[AVISO] - ERRO AO VERIFICAR USUÁRIO:', error);
      return res
        .status(500)
        .json({ message: '[AVISO] - ERRO INTERNO DO SERVIDOR' });
    }
  }
};