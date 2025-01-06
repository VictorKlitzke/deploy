-- CreateTable
CREATE TABLE "usuarios" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ativo" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "categorias" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario_id" INTEGER NOT NULL,
    CONSTRAINT "categorias_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "contas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "saldo_inicial" REAL NOT NULL DEFAULT 0,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario_id" INTEGER NOT NULL,
    CONSTRAINT "contas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "transacoes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuario_id" INTEGER NOT NULL,
    "categoria_id" INTEGER NOT NULL,
    "conta_id" INTEGER NOT NULL,
    "valor" REAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "descricao" TEXT,
    "data_transacao" DATETIME NOT NULL,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "transacoes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "transacoes_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "transacoes_conta_id_fkey" FOREIGN KEY ("conta_id") REFERENCES "contas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "parcelas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "transacao_id" INTEGER NOT NULL,
    "numero_parcela" INTEGER NOT NULL,
    "valor" REAL NOT NULL,
    "data_vencimento" DATETIME NOT NULL,
    CONSTRAINT "parcelas_transacao_id_fkey" FOREIGN KEY ("transacao_id") REFERENCES "transacoes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "orcamentos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuario_id" INTEGER NOT NULL,
    "categoria_id" INTEGER NOT NULL,
    "valor_limite" REAL NOT NULL,
    "periodo" TEXT NOT NULL,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "orcamentos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "orcamentos_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "metas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuario_id" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "valor_meta" REAL NOT NULL,
    "data_limite" DATETIME NOT NULL,
    "valor_atual" REAL NOT NULL DEFAULT 0,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "metas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");
