const JORNADA_MINUTOS = 8 * 60 + 48;

function converterParaMinutos(tempo) {
    if (!tempo) return 0;
    const [horas, minutos] = tempo.split(':').map(Number);
    return horas * 60 + minutos;
}

function converterParaTempo(minutos) {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00`;
}

function converterParaTempoFormatado(minutos) {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00`;
}

let contadorPausas = 1;

function adicionarPausa() {
    contadorPausas++;
    const container = document.getElementById('pausas-container');
    
    const pausaHtml = `
        <div class="form-group" id="pausa-${contadorPausas}">
            <div class="form-item">
                <label>Saída Pausa ${contadorPausas}</label>
                <input type="time" class="input-field horario-saida-pausa" onchange="calcular()">
            </div>
            <div class="form-item">
                <label>Retorno Pausa ${contadorPausas}</label>
                <input type="time" class="input-field horario-retorno-pausa" onchange="calcular()">
            </div>
            <div class="form-item" style="display: flex; align-items: flex-end; border-right: none;">
                <button onclick="removerPausa(${contadorPausas})" class="btn-remover">✕ Remover</button>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', pausaHtml);
    calcular();
}

function removerPausa(id) {
    const pausa = document.getElementById(`pausa-${id}`);
    if (pausa) {
        pausa.remove();
        calcular();
    }
}

function calcular() {
    const entrada = document.getElementById('horario-entrada').value;

    if (!entrada) {
        limparResultados();
        return;
    }

    const entradaMin = converterParaMinutos(entrada);
    
    // Coletar todas as pausas
    const saidasPausas = document.querySelectorAll('.horario-saida-pausa');
    const retornosPausas = document.querySelectorAll('.horario-retorno-pausa');
    
    if (saidasPausas.length === 0 || saidasPausas.length !== retornosPausas.length) {
        limparResultados();
        return;
    }

    let todasPausasValidas = true;
    let tempoTotalPausaMin = 0;
    let tempoTotalTrabalhado = 0;
    let ultimoRetornoMin = entradaMin;

    // Validar e calcular tempo de pausas
    for (let i = 0; i < saidasPausas.length; i++) {
        const saidaPausaMin = converterParaMinutos(saidasPausas[i].value);
        const retornoPausaMin = converterParaMinutos(retornosPausas[i].value);

        if (!saidasPausas[i].value || !retornosPausas[i].value) {
            limparResultados();
            return;
        }

        if (saidaPausaMin <= ultimoRetornoMin) {
            document.getElementById('validacao-almoco').textContent = `❌ Pausa ${i + 1}: Saída antes do horário anterior!`;
            limparResultados();
            return;
        }

        if (retornoPausaMin <= saidaPausaMin) {
            document.getElementById('validacao-almoco').textContent = `❌ Pausa ${i + 1}: Retorno antes da saída!`;
            limparResultados();
            return;
        }

        const tempoPausaMin = retornoPausaMin - saidaPausaMin;
        tempoTotalPausaMin += tempoPausaMin;
        
        // Tempo trabalhado até esta pausa
        tempoTotalTrabalhado += saidaPausaMin - ultimoRetornoMin;
        
        ultimoRetornoMin = retornoPausaMin;
    }

    document.getElementById('tempo-almoco').textContent = converterParaTempo(tempoTotalPausaMin);

    // Calcular horário de saída mínima (apenas trabalho)
    const tempoRestante = JORNADA_MINUTOS - tempoTotalTrabalhado;
    const saidaMinimaMin = ultimoRetornoMin + tempoRestante;
    document.getElementById('saida-minima').textContent = converterParaTempo(saidaMinimaMin);

    // Calcular horário de saída máxima (com hora extra)
    const HORA_EXTRA_MAXIMA = 1 * 60 + 12;
    const TRABALHO_MAXIMO_PERIODO = 6 * 60;
    
    const tempoMaximoTrabalho = JORNADA_MINUTOS + HORA_EXTRA_MAXIMA;
    const tempoRestanteMax = tempoMaximoTrabalho - tempoTotalTrabalhado;
    const saidaMaximaMin = ultimoRetornoMin + tempoRestanteMax;
    
    const saidaMaximaPor6HorasMin = ultimoRetornoMin + TRABALHO_MAXIMO_PERIODO;
    
    const saidaMaximaFinal = Math.min(saidaMaximaMin, saidaMaximaPor6HorasMin);
    
    const horaExtraTotal = saidaMaximaFinal - saidaMinimaMin;
    document.getElementById('hora-extra-total').textContent = converterParaTempo(Math.max(0, horaExtraTotal));
    
    // Validação final
    let validacaoAlmoco = '✅ Válido';
    
    if (tempoRestanteMax > TRABALHO_MAXIMO_PERIODO) {
        validacaoAlmoco = `⚠️ Máximo 6:00 de trabalho após última pausa. Saída máxima: ${converterParaTempo(saidaMaximaPor6HorasMin)}`;
        document.getElementById('saida-maxima').textContent = converterParaTempo(saidaMaximaPor6HorasMin);
    } else {
        document.getElementById('saida-maxima').textContent = converterParaTempo(saidaMaximaFinal);
    }
    
    document.getElementById('validacao-almoco').textContent = validacaoAlmoco;

    const LIMITE_CONTINUO = 6 * 60;

    const primeiraSaidaPausaMin = converterParaMinutos(saidasPausas[0].value);
    const tempoAntesPrimeiraPausa = primeiraSaidaPausaMin - entradaMin;
    document.getElementById('tempo-antes-primeira-pausa').textContent = converterParaTempo(tempoAntesPrimeiraPausa);
    const elAntes = document.getElementById('validacao-antes-primeira-pausa');
    if (tempoAntesPrimeiraPausa > LIMITE_CONTINUO) {
        elAntes.textContent = `⚠️ Ultrapassa 6h contínuas`;
        elAntes.className = 'validacao';
    } else {
        elAntes.textContent = `✅ Dentro do limite`;
        elAntes.className = 'validacao ok';
    }

    document.getElementById('tempo-apos-ultima-pausa').textContent = converterParaTempo(tempoRestante);
    const elApos = document.getElementById('validacao-apos-ultima-pausa');
    if (tempoRestante > LIMITE_CONTINUO) {
        elApos.textContent = `⚠️ Ultrapassa 6h contínuas`;
        elApos.className = 'validacao';
    } else {
        elApos.textContent = `✅ Dentro do limite`;
        elApos.className = 'validacao ok';
    }
}

function limparResultados() {
    document.getElementById('tempo-almoco').textContent = '--:--:--';
    document.getElementById('saida-minima').textContent = '--:--:--';
    document.getElementById('saida-maxima').textContent = '--:--:--';
    document.getElementById('hora-extra-total').textContent = '--:--:--';
    document.getElementById('validacao-almoco').textContent = '';
    document.getElementById('tempo-antes-primeira-pausa').textContent = '--:--:--';
    document.getElementById('validacao-antes-primeira-pausa').textContent = '';
    document.getElementById('tempo-apos-ultima-pausa').textContent = '--:--:--';
    document.getElementById('validacao-apos-ultima-pausa').textContent = '';
}

document.addEventListener('DOMContentLoaded', function() {
});
