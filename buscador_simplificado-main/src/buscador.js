"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var cheerio = require("cheerio");
var PASTA = path.join(__dirname, '../paginas_baixadas');
var PONTOS_POR_LINK = 10;
var PONTOS_POR_TERMO = 5; // Alterado para 5 conforme questão 6
var PENALIDADE_AUTOREFERENCIA = 15;
// Extrai os links de uma página HTML
function extrairLinks(pagina) {
    var arquivo = path.join(PASTA, pagina);
    var html = fs.readFileSync(arquivo, 'utf-8');
    var $ = cheerio.load(html);
    var linksExtraidos = [];
    $('a[href]').each(function (_, elem) {
        var href = $(elem).attr('href');
        if (href && href.endsWith('.html')) {
            linksExtraidos.push(href);
        }
    });
    return linksExtraidos;
}
// Conta quantas vezes o termo aparece no código-fonte da página (case insensitive)
function contarOcorrenciasTermo(pagina, termo) {
    var arquivo = path.join(PASTA, pagina);
    var conteudo = fs.readFileSync(arquivo, 'utf-8').toLowerCase();
    var termoMinusculo = termo.toLowerCase();
    var count = 0;
    var pos = conteudo.indexOf(termoMinusculo);
    while (pos !== -1) {
        count++;
        pos = conteudo.indexOf(termoMinusculo, pos + termoMinusculo.length);
    }
    return count;
}
// Constrói mapa de links recebidos por página
function construirMapaLinksRecebidos(paginas, mapaLinks) {
    var linksRecebidos = new Map();
    paginas.forEach(function (p) { return linksRecebidos.set(p, 0); });
    mapaLinks.forEach(function (links, pagina) {
        links.forEach(function (link) {
            var _a;
            if (linksRecebidos.has(link)) {
                linksRecebidos.set(link, ((_a = linksRecebidos.get(link)) !== null && _a !== void 0 ? _a : 0) + 1);
            }
        });
    });
    return linksRecebidos;
}
// Calcula pontos conforme critérios
function calcularPontos(linksRecebidos, freqTermo, autoreferencia) {
    var pontos = linksRecebidos * PONTOS_POR_LINK + freqTermo * PONTOS_POR_TERMO;
    if (autoreferencia)
        pontos -= PENALIDADE_AUTOREFERENCIA;
    return pontos;
}
// Busca termo e calcula resultados
function buscarTermo(termo, paginas, mapaLinks) {
    var _a, _b, _c;
    var linksRecebidos = construirMapaLinksRecebidos(paginas, mapaLinks);
    var resultados = [];
    for (var _i = 0, paginas_1 = paginas; _i < paginas_1.length; _i++) {
        var pagina = paginas_1[_i];
        var freqTermo = contarOcorrenciasTermo(pagina, termo);
        var linksDaPagina = (_a = mapaLinks.get(pagina)) !== null && _a !== void 0 ? _a : [];
        var autoreferencia = linksDaPagina.includes(pagina);
        var pontos = calcularPontos((_b = linksRecebidos.get(pagina)) !== null && _b !== void 0 ? _b : 0, freqTermo, autoreferencia);
        resultados.push({
            pagina: pagina,
            pontos: pontos,
            linksRecebidos: (_c = linksRecebidos.get(pagina)) !== null && _c !== void 0 ? _c : 0,
            freqTermo: freqTermo,
            autoreferencia: autoreferencia,
        });
    }
    return resultados;
}
// Ordena resultados conforme critérios de desempate
function ordenarResultados(resultados) {
    return resultados.sort(function (a, b) {
        if (b.pontos !== a.pontos)
            return b.pontos - a.pontos;
        if (b.linksRecebidos !== a.linksRecebidos)
            return b.linksRecebidos - a.linksRecebidos;
        if (b.freqTermo !== a.freqTermo)
            return b.freqTermo - a.freqTermo;
        if (a.autoreferencia && !b.autoreferencia)
            return 1;
        if (!a.autoreferencia && b.autoreferencia)
            return -1;
        return 0;
    });
}
// Carrega todas as páginas HTML da pasta
function carregarPaginas() {
    return fs.readdirSync(PASTA).filter(function (f) { return f.endsWith('.html'); });
}
// Constrói mapa de links para todas as páginas
function construirMapaLinks(paginas) {
    var mapa = new Map();
    paginas.forEach(function (pagina) {
        mapa.set(pagina, extrairLinks(pagina));
    });
    return mapa;
}
// Termos para teste conforme enunciado
var termosTeste = ['Matrix', 'Ficção Científica', 'Realidade', 'Universo', 'Viagem'];
// Execução principal
function main() {
    var paginas = carregarPaginas();
    var mapaLinks = construirMapaLinks(paginas);
    for (var _i = 0, termosTeste_1 = termosTeste; _i < termosTeste_1.length; _i++) {
        var termo = termosTeste_1[_i];
        console.log("\n\uD83D\uDD0D Resultado da busca por: \"".concat(termo, "\""));
        var resultados = buscarTermo(termo, paginas, mapaLinks);
        var ordenado = ordenarResultados(resultados);
        // Exibe tabela no formato da questão 6
        console.table(ordenado.map(function (r, idx) { return ({
            'Posição': idx + 1,
            'Página': r.pagina,
            'Ocorrências (+5)': "".concat(r.freqTermo, " x 5 = ").concat(r.freqTermo * PONTOS_POR_TERMO),
            'Links Recebidos (+10)': r.linksRecebidos * PONTOS_POR_LINK,
            'Autorreferência (-15)': r.autoreferencia ? -PENALIDADE_AUTOREFERENCIA : 0,
            'Total': r.pontos
        }); }));
    }
}

main();
