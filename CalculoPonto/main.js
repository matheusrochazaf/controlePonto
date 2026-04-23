const JORNADA_MINUTOS = 8 * 60 + 48;
const ALMOCO_MINIMO = 1 * 60 + 12;
const ALMOCO_MAXIMO = 2 * 60;
const HORA_EXTRA_MAXIMA = 1 * 60 + 12;
const TRABALHO_MAXIMO_PERIODO = 6 * 60;

function converterParaMinutos(tempo) {
    if (!tempo) return 0;
    const [horas, minutos] = tempo.split(':').map(Number);
    return horas * 60 + minutos;
}

function converterParaTempo(minutos) {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

function converterParaTempoFormatado(minutos) {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00`;
}

function calcular() {
    const entrada = document.getElementById('horario-entrada').value;
    const saidaAlmoco = document.getElementById('horario-saida-almoco').value;
    const retornoAlmoco = document.getElementById('horario-retorno-almoco').value;

    if (!entrada || !saidaAlmoco || !retornoAlmoco) {
        limparResultados();
        return;
    }

    const entradaMin = converterParaMinutos(entrada);
    const saidaAlmocoMin = converterParaMinutos(saidaAlmoco);
    const retornoAlmocoMin = converterParaMinutos(retornoAlmoco);

    if (saidaAlmocoMin <= entradaMin) {
        document.getElementById('validacao-almoco').textContent = '❌ Saída antes da entrada!';
        limparResultados();
        return;
    }

    if (retornoAlmocoMin <= saidaAlmocoMin) {
        document.getElementById('validacao-almoco').textContent = '❌ Retorno antes da saída!';
        limparResultados();
        return;
    }

    const tempoAlmocoMin = retornoAlmocoMin - saidaAlmocoMin;
    document.getElementById('tempo-almoco').textContent = converterParaTempo(tempoAlmocoMin);

    let validacaoAlmoco = '';
    if (tempoAlmocoMin < ALMOCO_MINIMO) {
        validacaoAlmoco = `❌ Você fez menos tempo de almoço, o mínimo é 1:12`;
    } else if (tempoAlmocoMin > ALMOCO_MAXIMO) {
        validacaoAlmoco = `❌ Almoço Máximo 2:00, ultrapassou`;
    } else {
        validacaoAlmoco = '✅ Válido';
    }

    const tempoTrabalhado = (saidaAlmocoMin - entradaMin);
    
    if (tempoTrabalhado > TRABALHO_MAXIMO_PERIODO) {
        validacaoAlmoco = `❌ Máximo 6:00 antes do almoço, você trabalhou ${converterParaTempo(tempoTrabalhado)})`;
        document.getElementById('validacao-almoco').textContent = validacaoAlmoco;
        document.getElementById('saida-minima').textContent = '--:--:--';
        document.getElementById('saida-maxima').textContent = '--:--:--';
        document.getElementById('hora-extra-total').textContent = '--:--:--';
        return;
    }

    const tempoRestante = JORNADA_MINUTOS - tempoTrabalhado;
    const saidaMinimaMin = retornoAlmocoMin + tempoRestante;
    document.getElementById('saida-minima').textContent = converterParaTempo(saidaMinimaMin);

    const tempoMaximoTrabalho = JORNADA_MINUTOS + HORA_EXTRA_MAXIMA;
    const tempoRestanteMax = tempoMaximoTrabalho - tempoTrabalhado;
    const saidaMaximaMin = retornoAlmocoMin + tempoRestanteMax;
    
    const saidaMaximaPor6HorasMin = retornoAlmocoMin + TRABALHO_MAXIMO_PERIODO;
    
    const saidaMaximaFinal = Math.min(saidaMaximaMin, saidaMaximaPor6HorasMin);
    
    const horaExtraTotal = saidaMaximaFinal - saidaMinimaMin;
    document.getElementById('hora-extra-total').textContent = converterParaTempo(Math.max(0, horaExtraTotal));
    
    if (tempoRestanteMax > TRABALHO_MAXIMO_PERIODO) {
        validacaoAlmoco = `❌ Máximo 6:00 após almoço. Saída máxima: ${converterParaTempo(saidaMaximaPor6HorasMin)}`;
        document.getElementById('validacao-almoco').textContent = validacaoAlmoco;
        document.getElementById('saida-maxima').textContent = converterParaTempo(saidaMaximaPor6HorasMin);
        return;
    }
    
    document.getElementById('saida-maxima').textContent = converterParaTempo(saidaMaximaFinal);
    document.getElementById('validacao-almoco').textContent = validacaoAlmoco;
}

function limparResultados() {
    document.getElementById('tempo-almoco').textContent = '--:--:--';
    document.getElementById('saida-minima').textContent = '--:--:--';
    document.getElementById('saida-maxima').textContent = '--:--:--';
    document.getElementById('hora-extra-total').textContent = '--:--:--';
    document.getElementById('validacao-almoco').textContent = '';
}

document.addEventListener('DOMContentLoaded', function() {
});
