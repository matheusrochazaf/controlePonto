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
    const saidaFinal = document.getElementById('horario-saida-final').value;

    if (!entrada || !saidaFinal) {
        limparResultados();
        return;
    }

    const entradaMin = converterParaMinutos(entrada);
    const saidaFinalMin = converterParaMinutos(saidaFinal);

    // Coletar todas as pausas
    const saidasPausas = document.querySelectorAll('.horario-saida-pausa');
    const retornosPausas = document.querySelectorAll('.horario-retorno-pausa');
    
    if (saidasPausas.length === 0 || saidasPausas.length !== retornosPausas.length) {
        limparResultados();
        return;
    }

    let tempoTotalPausaMin = 0;
    let tempoTotalTrabalhado = 0;
    let ultimoRetornoMin = entradaMin;

    // Validar e calcular pausas
    for (let i = 0; i < saidasPausas.length; i++) {
        const saidaPausaMin = converterParaMinutos(saidasPausas[i].value);
        const retornoPausaMin = converterParaMinutos(retornosPausas[i].value);

        if (!saidasPausas[i].value || !retornosPausas[i].value) {
            limparResultados();
            return;
        }

        if (saidaPausaMin <= ultimoRetornoMin) {
            document.getElementById('validacao-diferenca').textContent = `❌ Pausa ${i + 1}: Saída antes do horário anterior!`;
            limparResultados();
            return;
        }

        if (retornoPausaMin <= saidaPausaMin) {
            document.getElementById('validacao-diferenca').textContent = `❌ Pausa ${i + 1}: Retorno antes da saída!`;
            limparResultados();
            return;
        }

        if (retornoPausaMin > saidaFinalMin) {
            document.getElementById('validacao-diferenca').textContent = `❌ Pausa ${i + 1}: Retorno após saída final!`;
            limparResultados();
            return;
        }

        const tempoPausaMin = retornoPausaMin - saidaPausaMin;
        tempoTotalPausaMin += tempoPausaMin;
        
        // Tempo trabalhado até esta pausa
        tempoTotalTrabalhado += saidaPausaMin - ultimoRetornoMin;
        
        ultimoRetornoMin = retornoPausaMin;
    }

    // Tempo após última pausa até saída final
    tempoTotalTrabalhado += saidaFinalMin - ultimoRetornoMin;

    document.getElementById('tempo-pausa').textContent = converterParaTempo(tempoTotalPausaMin);
    document.getElementById('tempo-trabalhado').textContent = converterParaTempo(tempoTotalTrabalhado);

    const diferencaMin = tempoTotalTrabalhado - JORNADA_MINUTOS;
    const diferenca = Math.abs(diferencaMin);
    const sinalDiferenca = diferencaMin >= 0 ? '+' : '-';

    document.getElementById('diferenca-jornada').textContent = `${sinalDiferenca} ${converterParaTempo(diferenca)}`;

    let mensagemDiferenca = '';
    if (diferencaMin > 0) {
        mensagemDiferenca = `✅ Hora extra: ${converterParaTempo(diferencaMin)}`;
    } else if (diferencaMin < 0) {
        mensagemDiferenca = `⚠️ Faltou: ${converterParaTempo(diferenca)}`;
    } else {
        mensagemDiferenca = `✅ Jornada completa`;
    }

    document.getElementById('validacao-diferenca').textContent = mensagemDiferenca;

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

    const tempoAposUltimaPausa = saidaFinalMin - ultimoRetornoMin;
    document.getElementById('tempo-apos-ultima-pausa').textContent = converterParaTempo(tempoAposUltimaPausa);
    const elApos = document.getElementById('validacao-apos-ultima-pausa');
    if (tempoAposUltimaPausa > LIMITE_CONTINUO) {
        elApos.textContent = `⚠️ Ultrapassa 6h contínuas`;
        elApos.className = 'validacao';
    } else {
        elApos.textContent = `✅ Dentro do limite`;
        elApos.className = 'validacao ok';
    }
}

function limparResultados() {
    document.getElementById('tempo-pausa').textContent = '--:--:--';
    document.getElementById('tempo-trabalhado').textContent = '--:--:--';
    document.getElementById('diferenca-jornada').textContent = '--:--:--';
    document.getElementById('validacao-diferenca').textContent = '';
    document.getElementById('tempo-antes-primeira-pausa').textContent = '--:--:--';
    document.getElementById('validacao-antes-primeira-pausa').textContent = '';
    document.getElementById('tempo-apos-ultima-pausa').textContent = '--:--:--';
    document.getElementById('validacao-apos-ultima-pausa').textContent = '';
}

document.addEventListener('DOMContentLoaded', function() {
});
