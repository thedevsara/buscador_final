"use strict";
const resultados = [
    {
        pagina: "matrix.html",
        termosEncontrados: 3,
        linksRecebidos: 2,
        autorreferencia: false,
        pontuacao: 50,
    },
    {
        pagina: "blade_runner.html",
        termosEncontrados: 2,
        linksRecebidos: 4,
        autorreferencia: true,
        pontuacao: 45,
    },
    {
        pagina: "neuromancer.html",
        termosEncontrados: 2,
        linksRecebidos: 2,
        autorreferencia: false,
        pontuacao: 40,
    },
    // Adicione outros resultados conforme necessário
];
function gerarTabelaHTML(resultados) {
    let html = `
  <!DOCTYPE html>
  <html lang="pt-BR">
  <head>
    <meta charset="UTF-8">
    <title>Resultados da Busca</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 20px; }
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
      th { background-color: #f2f2f2; }
      h1 { color: #333; }
    </style>
  </head>
  <body>
    <h1>Resultados da Busca</h1>
    <table>
      <thead>
        <tr>
          <th>Página</th>
          <th>Termos Encontrados</th>
          <th>Links Recebidos</th>
          <th>Autorreferência</th>
          <th>Pontuação</th>
        </tr>
      </thead>
      <tbody>`;
    resultados.forEach(r => {
        html += `
      <tr>
        <td><a href="${r.pagina}">${r.pagina.replace('.html', '').replace('_', ' ').toUpperCase()}</a></td>
        <td>${r.termosEncontrados}</td>
        <td>${r.linksRecebidos}</td>
        <td>${r.autorreferencia ? 'Sim' : 'Não'}</td>
        <td>${r.pontuacao >= 0 ? '+' : ''}${r.pontuacao}</td>
      </tr>`;
    });
    html += `
      </tbody>
    </table>
  </body>
  </html>
  `;
    return html;
}
// Exemplo de uso: salvar em arquivo ou exibir no navegador
const fs = require('fs');
fs.writeFileSync('resultados.html', gerarTabelaHTML(resultados), 'utf-8');
console.log("Arquivo 'resultados.html' gerado com sucesso!");
