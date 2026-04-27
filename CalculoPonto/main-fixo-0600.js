const JORNADA_MINIMA_MIN = 4 * 60 + 1;
const JORNADA_MAXIMA_MIN = 6 * 60;
const PAUSA_MINIMA_MIN = 15;
const PAUSA_MAXIMA_MIN = 2 * 60;

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
    if (pausa) { pausa.remove(); calcular(); }
}

function calcular() {
    const entrada = document.getElementById('horario-entrada').value;
    if (!entrada) { limparResultados(); return; }

    const entradaMin = converterParaMinutos(entrada);
    const saidasPausas = document.querySelectorAll('.horario-saida-pausa');
    const retornosPausas = document.querySelectorAll('.horario-retorno-pausa');

    if (saidasPausas.length === 0 || saidasPausas.length !== retornosPausas.length) {
        limparResultados();
        return;
    }

    let tempoTotalPausaMin = 0;
    let tempoTotalTrabalhado = 0;
    let ultimoRetornoMin = entradaMin;

    for (let i = 0; i < saidasPausas.length; i++) {
        const saidaPausaMin = converterParaMinutos(saidasPausas[i].value);
        const retornoPausaMin = converterParaMinutos(retornosPausas[i].value);

        if (!saidasPausas[i].value || !retornosPausas[i].value) { limparResultados(); return; }

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

        tempoTotalPausaMin += retornoPausaMin - saidaPausaMin;
        tempoTotalTrabalhado += saidaPausaMin - ultimoRetornoMin;
        ultimoRetornoMin = retornoPausaMin;
    }

    document.getElementById('tempo-almoco').textContent = converterParaTempo(tempoTotalPausaMin);

    const tempoRestanteMinimo = Math.max(0, JORNADA_MINIMA_MIN - tempoTotalTrabalhado);
    const tempoRestanteMaximo = Math.max(0, JORNADA_MAXIMA_MIN - tempoTotalTrabalhado);

    document.getElementById('saida-minima').textContent = converterParaTempo(ultimoRetornoMin + tempoRestanteMinimo);
    document.getElementById('saida-maxima').textContent = converterParaTempo(ultimoRetornoMin + tempoRestanteMaximo);

    // Validação pausa
    let validacaoAlmoco;
    if (tempoTotalPausaMin > PAUSA_MAXIMA_MIN) {
        validacaoAlmoco = `❌ Tempo de pausa excede o máximo de 02:00:00`;
    } else if (tempoTotalPausaMin < PAUSA_MINIMA_MIN) {
        validacaoAlmoco = `❌ Tempo de pausa abaixo do mínimo de 00:15:00`;
    } else {
        validacaoAlmoco = `✅ Válido`;
    }
    const elAlmoco = document.getElementById('validacao-almoco');
    elAlmoco.textContent = validacaoAlmoco;
    elAlmoco.className = validacaoAlmoco.startsWith('✅') ? 'validacao ok' : 'validacao';

    // Antes da 1ª pausa
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

    // Após última pausa (mínimo restante para atingir 4:01)
    document.getElementById('tempo-apos-ultima-pausa').textContent = converterParaTempo(tempoRestanteMinimo);
    const elApos = document.getElementById('validacao-apos-ultima-pausa');
    if (tempoRestanteMinimo > LIMITE_CONTINUO) {
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
    document.getElementById('validacao-almoco').textContent = '';
    document.getElementById('tempo-antes-primeira-pausa').textContent = '--:--:--';
    document.getElementById('validacao-antes-primeira-pausa').textContent = '';
    document.getElementById('tempo-apos-ultima-pausa').textContent = '--:--:--';
    document.getElementById('validacao-apos-ultima-pausa').textContent = '';
}

document.addEventListener('DOMContentLoaded', function() {});
