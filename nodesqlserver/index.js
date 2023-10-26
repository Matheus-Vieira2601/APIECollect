const express = require('express');
const port = 3000; //porta padrão
const app = express();
const sql = require('mssql');
const bodyParser = require('body-parser');
const cors = require('cors'); 
const connStr = {
    user: 'BD21252',
    password: 'BD21252',
    server: 'regulus.cotuca.unicamp.br',
    database: 'BD21252',
    options: {
      encrypt: true, 
      trustServerCertificate: true 
    }
  };
const corsOptions = {
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
}

//fazendo a conexão global
sql.connect(connStr)
    .then(conn => global.conn = conn)
    .catch(err => console.log(err));

//configurando o body parser para pegar POSTS mais tarde
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configuração do CORS (permite todas as origens, ajuste conforme necessário)
app.use(cors(corsOptions));

//definindo as rotas
const router = express.Router();
router.get('/', (req, res) => res.json({ message: 'Funcionando!' }));
app.use('/', router);

//inicia o servidor
app.listen(port);
console.log('API funcionando!');

function execSQLQuery(sqlQry, res){
    global.conn.request()
               .query(sqlQry)
               .then(result => res.json(result.recordset))
               .catch(err => res.json(err));
}

router.get('/usuarios', async(req, res) =>{
    execSQLQuery('SELECT * FROM EcollectUsuario', res);
})

//puxa um usuario
router.get('/usuario/:id?', (req, res) =>{
    let filter = '';
    if(req.params.id) filter = ' WHERE ID=' + parseInt(req.params.id);
    execSQLQuery('SELECT * FROM EcollectUsuario' + filter, res);
})

//deleta um usuario
router.delete('/usuario/:id', (req, res) =>{
    execSQLQuery('DELETE EcollectUsuario WHERE ID=' + parseInt(req.params.id), res);
    return res.status(201).json({ message: 'Usuário deletado com sucesso.' });
})

// faz o login
router.post('/usuario/login', async (req, res) => {
    const email = req.body.email.substring(0, 100);
    const senha = req.body.senha.substring(0, 30);
  
    // Verifica se o email já existe no banco de dados
    const emailExistsQuery = `SELECT COUNT(*) AS emailCount FROM EcollectUsuario WHERE email = '${email}'`;
  
    try {
      const pool = await sql.connect(connStr);
  
      const emailResult = await pool.request().query(emailExistsQuery);
  
      if (emailResult.recordset[0].emailCount == 0) {
        return res.status(401).json({ error: 'Esse email não existe no banco de dados.', autenticado: false });
      }
  
      const selectQuery = `
       SELECT * FROM EcollectUsuario WHERE email = '${email}'
      `;
  
      const result = await pool.request().query(selectQuery);
  
      if (result.recordset[0].senha == senha)
        return res.status(200).json({message: 'Usuário autenticado', autenticado: true });
  
      return res.status(401).json({ message: 'Senha Incorreta!', autenticado: false });
    } catch (error) {
      console.error('Erro ao verificar Email ou autenticar usuário:', error);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  })

//cadastra um usuario
router.post('/usuario/cadastrar', async(req, res) =>{
    const id = parseInt(req.body.id);
    const nome = req.body.nome.substring(0,150);
    const email = req.body.email.substring(0,100);
    const telefone = req.body.telefone.substring(0,15);
    const senha = req.body.senha.substring(0,50);

    //Verifica se tem letras no telefone
    if(!/^\d{11}$/.test(telefone)){
        return res.status(400).json({ error: 'Número de telefone inválido! Não deve conter letras.' });
    };

    //Verifica se o email já existe no banco de dados
    const emailExistsQuery = `SELECT COUNT(*) AS emailCount FROM EcollectUsuario WHERE email = '${email}'`;    

    try{
        const pool = await sql.connect(connStr);

        const emailResult = await pool.request().query(emailExistsQuery);

        if (emailResult.recordset[0].emailCount > 0) {
            return res.status(400).json({ error: 'Esse email já existe no banco de dados.' });
        }

        const insertQuery = `
        INSERT INTO EcollectUsuario(id, nome, email, telefone, senha)
        VALUES(${id}, '${nome}', '${email}', '${telefone}', '${senha}')
      `;

        await pool.request().query(insertQuery);

        return res.status(201).json({ message: 'Usuário cadastrado com sucesso.' });
    }
    catch(error){
        console.error('Erro ao verificar CPF, RG, Email ou inserir usuário:', error);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
})

//altera um usuario
router.patch('/usuario/alterar/:id', async(req, res) =>{
    const id = parseInt(req.params.id);
    const nome = req.body.nome.substring(0,150);
    const email = req.body.email.substring(0,11);
    const telefone = req.body.telefone.substring(0,11);
    const senha = req.body.senha.substring(0,11);

    //Verifica se tem letras no telefone
    if(!/^\d{11}$/.test(telefone)){
        return res.status(400).json({ error: 'Número de telefone inválido! Não deve conter letras.' });
    };

    const emailExistsQuery = `SELECT COUNT(*) AS emailCount FROM EcollectUsuario WHERE email = '${email}'`;    

    try{
        const pool = await sql.connect(connStr);

        const emailResult = await pool.request().query(emailExistsQuery);

        if (emailResult.recordset[0].emailCount > 0) {
            return res.status(400).json({ error: 'Esse email já existe no banco de dados.' });
        }

        const insertQuery = `
        INSERT INTO EcollectUsuario(id, nome, email, telefone, senha)
        VALUES(${id}, '${nome}', '${email}', '${telefone}', '${senha}')
      `;

        await pool.request().query(insertQuery);

        return res.status(201).json({ message: 'Usuário alterado com sucesso.' });
    }
    catch(error){
        console.error('Erro ao verificar CPF, RG, Email ou inserir usuário:', error);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
})