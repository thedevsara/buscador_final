"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios")); // atenção, código comentado temporariamente para facilitar a compreensão , depois será removido
const cheerio = __importStar(require("cheerio"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// URL base do site hospedado no GitHub Pages
const siteBase = 'https://thedevsara.github.io/projeto_buscador/';
// Página inicial que o crawler começa a visitar
const paginaInicial = 'blade_runner.html';
// Pasta onde as páginas baixadas serão salvas
const pastaDestino = 'paginas_baixadas';
// Conjunto que armazena os links que já foram visitados (para evitar repetições)
const paginasVisitadas = new Set();
// Cria a pasta de destino se ela ainda não existir
if (!fs.existsSync(pastaDestino)) {
    fs.mkdirSync(pastaDestino);
}
/**
 * Função que baixa o conteúdo HTML de uma página a partir da URL
 */
async function pegarHTML(url) {
    const resposta = await axios_1.default.get(url);
    return resposta.data; // retorna o HTML da página
}
/**
 * Função que salva o conteúdo HTML em um arquivo local
 */
function salvarPagina(nomeArquivo, conteudoHTML) {
    const caminhoCompleto = path.join(pastaDestino, nomeArquivo);
    fs.writeFileSync(caminhoCompleto, conteudoHTML, 'utf-8');
}
/**
 * Função que analisa o HTML e encontra todos os links internos da página
 */
function encontrarLinks(html, origem) {
    const $ = cheerio.load(html); // carrega o HTML com cheerio
    const linksEncontrados = [];
    $('a[href]').each((_index, elemento) => {
        const destino = $(elemento).attr('href');
        // Só pega links .html que são internos (não começam com http)
        if (destino && destino.endsWith('.html') && !destino.startsWith('http')) {
            const linkAbsoluto = new URL(destino, origem).href;
            // Evita repetir páginas já visitadas
            if (!paginasVisitadas.has(linkAbsoluto)) {
                linksEncontrados.push(linkAbsoluto);
            }
        }
    });
    return linksEncontrados;
}
/**
 * Função principal que visita a página, salva o conteúdo e segue os links internos
 */
async function rastrear(url) {
    // Se já visitou, não repete
    if (paginasVisitadas.has(url))
        return;
    paginasVisitadas.add(url);
    console.log(`🔎 Rastreando: ${url}`);
    try {
        const html = await pegarHTML(url); // Baixa o HTML da página
        const nomeArquivo = path.basename(url); // Pega o nome do arquivo da URL (ex: matrix.html)
        salvarPagina(nomeArquivo, html); // Salva a página localmente
        const linksNaPagina = encontrarLinks(html, url); // Pega os links dentro da página
        for (const proximoLink of linksNaPagina) {
            await rastrear(proximoLink); // Visita os próximos links encontrados
        }
    }
    catch (erro) {
        console.error(`Erro ao acessar ${url}:`, erro.message);
    }
}
// Início do rastreamento a partir da primeira página
const urlDePartida = new URL(paginaInicial, siteBase).href;
rastrear(urlDePartida);
