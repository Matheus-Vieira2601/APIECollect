const connStr = {
    user: 'BD21252',
    password: 'BD21252',
    server: 'regulus.cotuca.unicamp.br',
    database: 'BD21252',
    options: {
      encrypt: true, // Isso é equivalente a TrustServerCertificate=True; no .NET
      trustServerCertificate: true // Isso também é equivalente a TrustServerCertificate=True; no .NET
    }
  };

const sql = require("mssql");


sql.connect(connStr)
   .then(conn => createTable(conn))
   .catch(err => console.log("erro! " + err));


function createTable(conn){
    const table = new sql.Table('ECollectUsuario');
    table.create = true;
    table.columns.add('id', sql.Int, {nullable: false, primary: true});
    table.columns.add('nome', sql.VarChar(150), {nullable: false});
    table.columns.add('email', sql.VarChar(100), {nullable: false});
    table.columns.add('telefone', sql.VarChar(15), {nullable: false}); 
    table.columns.add('senha', sql.VarChar(50), {nullable: false});
    table.rows.add(1, 'Matheus Vieira', 'matheus@gmail.com', '19955820419', 'senha123');
    table.rows.add(2, 'João Maia', 'maiajj@gmail.com', '19988620548', 'senha1234');
    table.rows.add(3, 'Matheus Parro', 'parro@gmail.com', '19856201504', 'senha');

  const request = new sql.Request()
  request.bulk(table)
          .then(result => console.log('funcionou'))
          .catch(err => console.log('erro no bulk. ' + err));
}