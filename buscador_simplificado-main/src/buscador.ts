import * as fs from 'fs';
import * as path from 'path';
import * as cheerio from 'cheerio';

const PASTA = path.join(__dirname, '../paginas_baixadas');
const PONTOS_POR_LINK = 10;
const PONTOS_POR_TERMO = 10;
const PENALIDADE_AUTOREFERENCIA = 15;

interface Resultado {
    pagina: string;
    pontos: number;
    linksRecebidos: number;
    freqTermo: number;
    autoreferencia: boolean;
}

// Função para extrair links de uma página HTML
function extrairLinks(pagina: string): string[] {
    const arquivo = path.join(PASTA, pagina);
    const html = fs.readFileSync(arquivo, 'utf-8');
    const $ = cheerio.load(html);
    const linksExtraidos: string[] = [];

    $('a[href]').each((_, elem) => {
        const href = $(elem).attr('href');
        if (href && href.endsWith('.html')) {
            linksExtraidos.push(href);
        }
    });

    return linksExtraidos;
}

// Função para contar quantas vezes o termo aparece no código-fonte da página (case insensitive)
function contarOcorrenciasTermo(pagina: string, termo: string): number {
    const arquivo = path.join(PASTA, pagina);
    const conteudo = fs.readFileSync(arquivo, 'utf-8').toLowerCase();
    const termoMinusculo = termo.toLowerCase();

    let count = 0;
    let pos = conteudo.indexOf(termoMinusculo);
    while (pos !== -1) {
        count++;
        pos = conteudo.indexOf(termoMinusculo, pos + termoMinusculo.length);
    }
    return count;
}

// Função para construir um mapa de links recebidos por cada página
function construirMapaLinksRecebidos(paginas: string[], mapaLinks: Map<string, string[]>): Map<string, number> {
    const linksRecebidos = new Map<string, number>();

    // Inicializa contagem com zero para todas as páginas
    paginas.forEach(p => linksRecebidos.set(p, 0));

    // Para cada página, verifica os links que ela aponta e incrementa o contador do destino
    mapaLinks.forEach((links, pagina) => {
        links.forEach(link => {
            if (linksRecebidos.has(link)) {
                linksRecebidos.set(link, (linksRecebidos.get(link) ?? 0) + 1);
            }
        });
    });

    return linksRecebidos;
}

function calcularPontos(linksRecebidos: number, freqTermo: number, autoreferencia: boolean): number {
    let pontos = linksRecebidos * PONTOS_POR_LINK + freqTermo * PONTOS_POR_TERMO;
    if (autoreferencia) pontos -= PENALIDADE_AUTOREFERENCIA;
    return pontos;
}

// Função principal para buscar o termo e calcular resultados
function buscarTermo(termo: string, paginas: string[], mapaLinks: Map<string, string[]>): Resultado[] {
    const linksRecebidos = construirMapaLinksRecebidos(paginas, mapaLinks);

    const resultados: Resultado[] = [];

    for (const pagina of paginas) {
        const freqTermo = contarOcorrenciasTermo(pagina, termo);
        const linksDaPagina = mapaLinks.get(pagina) ?? [];
        const autoreferencia = linksDaPagina.includes(pagina);
        const pontos = calcularPontos(linksRecebidos.get(pagina) ?? 0, freqTermo, autoreferencia);

        resultados.push({
            pagina,
            pontos,
            linksRecebidos: linksRecebidos.get(pagina) ?? 0,
            freqTermo,
            autoreferencia,
        });
    }

    return resultados;
}

// Ordena os resultados conforme critérios da questão 5
function ordenarResultados(resultados: Resultado[]): Resultado[] {
    return resultados.sort((a, b) => {
        if (b.pontos !== a.pontos) return b.pontos - a.pontos;
        if (b.linksRecebidos !== a.linksRecebidos) return b.linksRecebidos - a.linksRecebidos;
        if (b.freqTermo !== a.freqTermo) return b.freqTermo - a.freqTermo;
        if (a.autoreferencia && !b.autoreferencia) return 1;
        if (!a.autoreferencia && b.autoreferencia) return -1;
        return 0;
    });
}

// Função para carregar todas as páginas HTML da pasta
function carregarPaginas(): string[] {
    return fs.readdirSync(PASTA).filter(f => f.endsWith('.html'));
}

// Função para construir o mapa de links para todas as páginas
function construirMapaLinks(paginas: string[]): Map<string, string[]> {
    const mapa = new Map<string, string[]>();
    paginas.forEach(pagina => {
        mapa.set(pagina, extrairLinks(pagina));
    });
    return mapa;
}

// Termos para teste conforme enunciado
const termosTeste = ['Matrix', 'Ficção Científica', 'Realidade', 'Universo', 'Viagem'];

// Execução principal
function main() {
    const paginas = carregarPaginas();
    const mapaLinks = construirMapaLinks(paginas);

    for (const termo of termosTeste) {
        console.log(`\n🔍 Resultado da busca por: "${termo}"`);
        const resultados = buscarTermo(termo, paginas, mapaLinks);
        const ordenado = ordenarResultados(resultados);

        console.table(ordenado.map(r => ({
            Página: r.pagina,
            Pontos: r.pontos,
            'Links Recebidos': r.linksRecebidos,
            Frequência: r.freqTermo,
            Autorreferência: r.autoreferencia ? 'Sim' : 'Não',
        })));
    }
}

main();
