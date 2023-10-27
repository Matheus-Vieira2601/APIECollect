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


function ValidarUser(user)
{
    const errors = [];

    if(!user.nome){
        errors.push({ field: 'nome', message: 'Preencha o nome!' });
    }
    if(!user.email){
        errors.push({ field: 'email', message: 'Preencha o email!' });
    }
    if(!user.telefone){
        errors.push({ field: 'telefone', message: 'Preencha o telefone!' });
    }
    if(!user.senha){
        errors.push({ field: 'senha', message: 'Preencha a senha!' });
    }

    return errors;
}


app.get('/usuarios' , async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('usuario')
            .select('*');

        if (error) {
            console.error('Erro ao consultar o banco de dados:', error);
            return res.status(500).json({ error: 'Erro ao consultar o banco de dados dos usuários. Sintaxe pode estar incorreta.'});
        }
        return res.status(200).json(data);
    } catch (error) {
        console.error('Erro geral no Get:', error);
        return res.status(500).json({ error: 'Problemas internos na API' });
    }
});


app.get('/usuarios/:id', async (req, res) => {
    try{
        const id = req.params.id;

        const { data, error } = await supabase
            .from('usuario')
            .select('*')
            .eq('id', id);

        if (error) {
            console.error('Erro ao consultar o banco de dados:', error);
            return res.status(500).json({ error: 'Erro ao consultar o banco de dados' });
        }

        if (data.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        return res.status(200).json(data[0]);
    } catch(error) {
        console.error('Erro geral:', error);
        return res.status(500).json({ error: 'Erro geral' });
    }
});


app.post('/usuarios/cadastrar', async (req, res) => {
    try{
        const newUser = req.body;

        // Valide os dados do usuário
        const validationErrors = ValidarUser(newUser);

        if (validationErrors.length > 0) {
            return res.status(400).json({ error: 'Erro de validação do usuário', details: validationErrors });
        }

        const { error } = await supabase
            .from('usuario')
            .insert([newUser]);

        if (error) {
            console.error('Erro ao inserir usuário no banco de dados:', error);
            return res.status(500).json({ error: 'Erro ao cadastrar usuário.' });
        }

        return res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
    }catch(error) {
        console.error('Erro geral no post', error);
        return res.status(500).json({ error: 'Erros internos na API' });
    }
});


app.put('/usuarios/:id', async (req, res) => {
    try {       
        const id = req.params.id;
        const updateduser = req.body;

        const { data, error } = await supabase
            .from('usuario')
            .update(updateduser)
            .eq('id', id);

        if (error) {
            console.error('Erro ao atualizar no banco de dados:', error);
            return res.status(500).json({ error: 'Erro ao atualizar no banco de dados' });
        }

        return res.status(200).json('Usuário alterado com sucesso!');
    } catch (error) {
        console.error('Erro geral:', error);
        return res.status(500).json({ error: 'Erro geral' });
    }
});


const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});