const express = require('express');
require('dotenv').config()
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors')

const app = express();

app.use(cors({
    origin: '*'
}))

app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

const supabase = createClient(supabaseUrl, supabaseKey);

app.get('/usuarios' , async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('usuario')
            .select('*');

        if (error) {
            console.error('Erro ao consultar o banco de dados:', error);
            return res.status(500).json({ error: 'Erro ao consultar o banco de dados dos pacientes. Sintaxe pode estar incorreta.'});
        }
        return res.status(200).json(data);
    } catch (error) {
        console.error('Erro geral aqui no GetPciente:', error);
        return res.status(500).json({ error: 'Problemas internos na API' });
    }
});


app.post('/usuarios/cadastrar', async (req, res) => {
    try{
        const newUser = req.body;

        if (nome == null || email == null || telefone == null || senha == null) {
            return res.status(400).json({ error: 'Por favor, forneça todos os campos necessários.' });
        }

        const { data, error } = await supabase
            .from('usuario')
            .insert([
                newUser
            ]);

        if (error) {
            console.error('Erro ao inserir usuário no banco de dados:', error);
            return res.status(500).json({ error: 'Erro ao cadastrar o usuário.' });
        }

        return res.status(201).json(data[0]);
    }catch(error) {
        console.error('Erro geral no post', error);
        return res.status(500).json({ error: 'Erros internos na API' });
    }
});


const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});