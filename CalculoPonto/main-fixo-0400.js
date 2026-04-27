const JORNADA_MIN = 4 * 60;

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
    if (!entrada) { limparResultados(); return; }

    const entradaMin = converterParaMinutos(entrada);
    document.getElementById('saida').textContent = converterParaTempo(entradaMin + JORNADA_MIN);
}

function limparResultados() {
    document.getElementById('saida').textContent = '--:--:--';
}

document.addEventListener('DOMContentLoaded', function() {});
