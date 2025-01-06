const pool = require("../database/index")
const { formmater } = require("../utils/index");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        pool.get("SELECT * FROM usuarios WHERE nome = ?", [username], async (err, user) => {
            if (err) {
                console.error("Erro na consulta ao banco:", err.message);
                return res.status(500).json({ error: "Erro interno no servidor" });
            }

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
        });

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

        const stmt = pool.prepare('INSERT INTO usuarios (nome, email, senha, ativo) VALUES (?, ?, ?, ?)');
        const result = stmt.run(name, email, hashedPassword, ativo);

        return res.status(201).json({ message: 'Usuário criado com sucesso!' });

    } catch (error) {
        console.error("Erro ao registrar usuário:", error.message);
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
};

exports.registerCategory = (req, res) => {
    const { category, type } = req.body;
    const userId = req.user.id;

    if (!category) {
        return res.status(400).json({ error: 'Nome da categoria vazio!' });
    }
    if (!userId) {
        return res.status(400).json({ error: 'ID do usuário não encontrado!' });
    }
    try {

        const existCategories = pool.get('SELECT * FROM categorias WHERE nome = ? AND usuario_id = ?', [category, userId]);
        if (!existCategories) {
            return res.status(400).json({ error: 'Essa categoria já existe para esse usuário' });
        }

        const stmt = pool.prepare('INSERT INTO categorias (nome, tipo, usuario_id) VALUES (?, ?, ?)');
        const result = stmt.run(category, type, userId);

        return res.status(201).json({ message: 'Categoria criado com sucesso!' });

    } catch (error) {
        console.error("Erro ao registrar categoria do usuario:", error.message);
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
};

exports.registerAccounts = (req, res) => {
    const { account, balance } = req.body;
    const userId = req.user.id;

    if (!account) {
        return res.status(400).json({ error: 'Nome da categoria vazio!' });
    }
    if (!userId) {
        return res.status(400).json({ error: 'ID do usuário não encontrado!' });
    }
    try {

        const existCategories = pool.get('SELECT * FROM contas WHERE nome = ? AND usuario_id = ?', [account, userId]);
        if (!existCategories) {
            return res.status(400).json({ error: 'Essa contas já existe para esse usuário' });
        }

        const stmt = pool.prepare('INSERT INTO contas (nome, saldo_inicial, usuario_id) VALUES (?, ?, ?)');
        const result = stmt.run(account, balance, userId);

        return res.status(201).json({ message: 'Conta criada com sucesso!' });

    } catch (error) {
        console.error("Erro ao registrar conta do usuario:", error.message);
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
};

exports.registerExpense = (req, res) => {
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

        const stmt = pool.prepare(`
            INSERT INTO transacoes (categoria_id, conta_id, valor, tipo, descricao, usuario_id, data_transacao) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        const result = stmt.run(categoria_id, conta_id, valor, tipo, descricao, userId, data_transacao);

        if (tipo === 'Saída') {
            const stmt1 = pool.prepare(`
                UPDATE contas 
                SET saldo_inicial = saldo_inicial - ? 
                WHERE id = ?
            `);
            const result1 = stmt1.run(valor.trim(), conta_id);
        } else if (tipo === 'Entrada') {
            const stmt1 = pool.prepare(`
                UPDATE contas 
                SET saldo_inicial = saldo_inicial + ? 
                WHERE id = ?
            `);
            const result1 = stmt1.run(valor.trim(), conta_id);
        } else {
            return res.status(500).json({ message: 'Erro ao atualizar a tabela de transacoes' });
        }

        return res.status(201).json({ message: 'transação criada com sucesso!' });

    } catch (error) {
        console.error("Erro ao registrar conta do usuario:", error.message);
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
};