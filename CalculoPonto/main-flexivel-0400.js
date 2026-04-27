const TRABALHO_MINIMO_MIN = 5;
const TRABALHO_MAXIMO_MIN = 4 * 60;

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

function calcular() {
    const entrada = document.getElementById('horario-entrada').value;
    const saida = document.getElementById('horario-saida').value;

    if (!entrada || !saida) { limparResultados(); return; }

    const entradaMin = converterParaMinutos(entrada);
    const saidaMin = converterParaMinutos(saida);

    if (saidaMin <= entradaMin) {
        const el = document.getElementById('validacao-trabalhado');
        el.textContent = '❌ Saída deve ser após a entrada';
        el.className = 'validacao';
        document.getElementById('tempo-trabalhado').textContent = '--:--:--';
        return;
    }

    const tempoTrabalhado = saidaMin - entradaMin;
    document.getElementById('tempo-trabalhado').textContent = converterParaTempo(tempoTrabalhado);

    const el = document.getElementById('validacao-trabalhado');
    if (tempoTrabalhado < TRABALHO_MINIMO_MIN) {
        el.textContent = `❌ Tempo trabalhado abaixo do mínimo de 00:05:00`;
        el.className = 'validacao';
    } else if (tempoTrabalhado > TRABALHO_MAXIMO_MIN) {
        el.textContent = `❌ Tempo trabalhado excede o máximo de 04:00:00`;
        el.className = 'validacao';
    } else {
        el.textContent = `✅ Dentro da jornada permitida`;
        el.className = 'validacao ok';
    }
}

function limparResultados() {
    document.getElementById('tempo-trabalhado').textContent = '--:--:--';
    document.getElementById('validacao-trabalhado').textContent = '';
}

document.addEventListener('DOMContentLoaded', function() {});
