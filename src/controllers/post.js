const pool = require("../../database/index")
const { formmater } = require("../../utils/index");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        pool.query(
            "SELECT * FROM usuarios WHERE nome = $1",
            [username],
            async (err, result) => {
                if (err) {
                    console.error("Erro na consulta ao banco:", err.message);
                    return res.status(500).json({ error: "Erro interno no servidor" });
                }

                const user = result.rows[0];
                if (!user) {
                    return res.status(401).json({ error: "Usuário ou senha inválidos" });
                }

                user.senha = user.senha.replace("$2y$", "$2a$");
                const isPasswordValid = await bcrypt.compare(password, user.senha);
                if (!isPasswordValid) {
                    return res.status(401).json({ error: "Senha incorreta" });
                }

                const token = jwt.sign({ id: user.id }, process.env.TOKEN, { expiresIn: "3h" });

                res.cookie('token', token, {
                    httpOnly: true,
                    secure: false,
                    sameSite: 'lax',
                    maxAge: 18000000
                });

                return res.json({
                    authorization: true,
                    token: token,
                    message: "Login realizado com sucesso",
                    UserId: user.id
                });
            }
        );
    } catch (error) {
        console.error("Erro ao realizar login:", error.message);
        return res.status(500).json({ error: "Erro interno no servidor" });
    }

};

exports.logout = async (req, res) => {
    const token = req.cookies['token'] || req.headers['authorization'];

    if (token) {
        res.cookie('token', '', {
            expires: new Date(0),
            path: '/',
            httpOnly: true,
        });
    }
    res.status(200).json({ authorization: false, message: 'Logout realizado com sucesso' });
}

exports.register = async (req, res) => {
    const { name, email, password } = req.body;
    const ativo = 1;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        pool.query(
            'INSERT INTO usuarios (nome, email, senha, ativo) VALUES ($1, $2, $3, $4) RETURNING id',
            [name, email, hashedPassword, ativo],
            (err, result) => {
                if (err) {
                    console.error('Erro ao inserir o usuário:', err.message);
                    return res.status(500).json({ error: 'Erro ao criar o usuário.' });
                }

                return res.status(201).json({ message: 'Usuário criado com sucesso!', userId: result.rows[0].id });
            }
        );

    } catch (error) {
        console.error("Erro ao registrar usuário:", error.message);
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
};

exports.registerCategory = async (req, res) => {
    const { category, type } = req.body;
    const userId = req.user.id;

    if (!category) {
        return res.status(400).json({ error: 'Nome da categoria vazio!' });
    }
    if (!userId) {
        return res.status(400).json({ error: 'ID do usuário não encontrado!' });
    }
    try {
        const { rows: existingCategories } = await pool.query(
            'SELECT * FROM categorias WHERE nome = $1 AND usuario_id = $2',
            [category.trim(), userId]
        );

        if (existingCategories.length > 0) {
            return res.status(400).json({ error: 'Essa categoria já existe para esse usuário' });
        }

        const { rows } = await pool.query(
            'INSERT INTO categorias (nome, tipo, usuario_id) VALUES ($1, $2, $3) RETURNING id',
            [category.trim(), type, userId]
        );

        return res.status(201).json({
            message: 'Categoria criada com sucesso!',
            categoryId: rows[0].id
        });

    } catch (error) {
        console.error('Erro ao registrar categoria do usuário:', error.message);
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }

};

exports.registerAccounts = async (req, res) => {
    const { account, balance } = req.body;
    const userId = req.user.id;

    if (!account) {
        return res.status(400).json({ error: 'Nome da categoria vazio!' });
    }
    if (!userId) {
        return res.status(400).json({ error: 'ID do usuário não encontrado!' });
    }
    try {
        const { rows: existingAccounts } = await pool.query(
            'SELECT * FROM contas WHERE nome = $1 AND usuario_id = $2',
            [account.trim(), userId]
        );

        if (existingAccounts.length > 0) {
            return res.status(400).json({ error: 'Essa conta já existe para esse usuário' });
        }

        const { rows } = await pool.query(
            'INSERT INTO contas (nome, saldo_inicial, usuario_id) VALUES ($1, $2, $3) RETURNING id',
            [account.trim(), balance, userId]
        );

        return res.status(201).json({
            message: 'Conta criada com sucesso!',
            accountId: rows[0].id
        });

    } catch (error) {
        console.error("Erro ao registrar conta do usuário:", error.message);
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
};

exports.registerExpense = async (req, res) => {
    const { expense } = req.body;

    const { categoria_id, conta_id, valor, tipo, descricao, data_transacao } = expense;
    const userId = req.user.id;

    if (!valor || !descricao || !data_transacao || !tipo) {
        return res.status(400).json({ error: 'Campos estão vazios!' });
    }
    if (!userId) {
        return res.status(400).json({ error: 'ID do usuário não encontrado!' });
    }
    try {
        (async () => {
            const insertQuery = `
                    INSERT INTO transacoes (categoria_id, conta_id, valor, tipo, descricao, usuario_id, data_transacao) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id
                `;
            const insertResult = await pool.query(insertQuery, [categoria_id, conta_id, valor, tipo, descricao, userId, data_transacao]);

            let updateQuery;
            if (tipo === 'Saída') {
                updateQuery = `
                        UPDATE contas 
                        SET saldo_inicial = saldo_inicial - $1 
                        WHERE id = $2
                    `;
            } else if (tipo === 'Entrada') {
                updateQuery = `
                        UPDATE contas 
                        SET saldo_inicial = saldo_inicial + $1 
                        WHERE id = $2
                    `;
            } else {
                return res.status(500).json({ message: 'Erro ao atualizar a tabela de transações' });
            }

            await pool.query(updateQuery, [valor, conta_id]);

            return res.status(201).json({ message: 'Transação criada com sucesso!', transacaoId: insertResult.rows[0].id });
        })();

    } catch (error) {
        console.error("Erro ao registrar conta do usuario:", error.message);
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
};