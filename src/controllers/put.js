const pool = require("../../database/index");
const verificationCodes = require('../../store/verification');
const { verificationEmail } = require('../../utils/index');
const bcrypt = require("bcrypt");
const dns = require('dns');
require("dotenv").config();

exports.updatepassword = async (req, res) => {
  const { currentpassword, newpassword, confirmpassword } = req.body;
  const userId = req.user.id;

  if (!req.user || req.user.id !== userId) {
    return res.status(401).json({ error: "Usuário não autenticado." });
  }


  if (!currentpassword || !newpassword || !confirmpassword) {
    return res.status(400).json({ error: "Campos estão vazios!" });
  }

  if (newpassword !== confirmpassword) {
    return res.status(400).json({ error: "Nova senha e confirmação não coincidem!" });
  }

  try {
    pool.get("SELECT * FROM usuarios WHERE id = ?", [userId], async (error, user) => {
      if (error) {
        console.error("Erro na consulta ao banco:", error.message);
        return res.status(500).json({ error: "Erro interno no servidor." });
      }

      if (!user) {
        return res.status(401).json({ error: "Usuário não encontrado." });
      }

      const isMatch = await bcrypt.compare(currentpassword, user.senha);
      if (!isMatch) {
        return res.status(401).json({ error: "Senha atual está incorreta!" });
      }

      if (currentpassword === newpassword) {
        return res.status(400).json({ error: "A nova senha não pode ser igual à senha atual!" });
      }

      const hashedPassword = await bcrypt.hash(newpassword, 10);
      pool.run(
        "UPDATE usuarios SET senha = ? WHERE id = ?",
        [hashedPassword, userId],
        (updateErr) => {
          if (updateErr) {
            console.error("Erro ao atualizar a senha:", updateErr.message);
            return res.status(500).json({ error: "Erro ao atualizar a senha." });
          }

          return res.status(200).json({ message: "Senha atualizada com sucesso!" });
        }
      );
    });
  } catch (error) {
    console.error("Erro ao atualizar senha do usuario:", error.message);
    return res.status(500).json({ error: "Erro interno no servidor." });
  }
};

exports.updateemail = (req, res) => {
  const { currentemail, newemail } = req.body;
  const userId = req.user.id;

  if (currentemail === newemail) {
    return res.status(400).json({ error: "O novo e-mail não pode ser igual ao atual." });
  }

  if (!req.user || req.user.id !== userId) {
    return res.status(401).json({ error: "Usuário não autenticado." });
  }

  const newemailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  if (!newemailRegex.test(newemail)) {
    return res.status(400).json({ error: "E-mail inválido." });
  }

  const domain = newemail.split('@')[1];

  dns.resolveMx(domain, (err, addresses) => {
    if (err || addresses.length === 0) {
      return res.status(400).json({ error: "E-mail não válido ou domínio inexistente." });
    }

    console.log(verificationEmail(newemail)
    );

    verificationEmail(newemail)
      .then(() => res.status(200).json({ message: "Código de verificação enviado!" }))
      .catch((error) => res.status(500).json({ error: "Erro ao enviar o código.", error }));
  });
};

exports.verifyEmailCode = (req, res) => {
  const { newemail, code } = req.body;

  const normalizedEmail = newemail.trim().toLowerCase();
  console.log("Verificando código para o email:", normalizedEmail);
  console.log("Map de códigos de verificação:", verificationCodes);

  const storedCode = verificationCodes.get(normalizedEmail); 
  if (!storedCode) {
    return res.status(400).json({ error: "Código de verificação não encontrado." });
  }

  if (storedCode.code !== parseInt(code)) {
    return res.status(400).json({ error: "Código de verificação inválido." });
  }

  if (Date.now() > storedCode.expiresAt) {
    return res.status(400).json({ error: "Código de verificação expirado." });
  }

  const userId = req.user.id;
  const query = `UPDATE usuarios SET email = ? WHERE id = ?`;

  pool.run(query, [normalizedEmail, userId], function (err) {
    if (err) {
      console.error("Erro ao atualizar o e-mail:", err);
      return res.status(500).json({ error: "Erro ao atualizar o e-mail no banco de dados." });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    verificationCodes.delete(normalizedEmail);

    res.status(200).json({ message: "E-mail atualizado com sucesso!" });
  });
};
