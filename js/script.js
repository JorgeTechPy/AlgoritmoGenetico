function convertirBinarioADecimal(binario) {
    let total = 0;
    const procedimiento = [];
    let potencia = 0;

    for (let i = binario.length - 1; i >= 0; i--) {
        const bit = parseInt(binario[i], 10);
        const valorPotencia = Math.pow(2, potencia);
        const resultado = valorPotencia * bit;

        procedimiento.push("2^" + potencia + " x " + bit + " = " + resultado);
        total += resultado;
        potencia++;
    }

    return {
        decimal: total,
        procedimiento: procedimiento,
        fitness: total * total
    };
}

function renderProcedimiento(titulo, calculo) {
    let html = '<article class="process-card">';
    html += "<h3>" + titulo + "</h3>";
    html += '<div class="process-lines">';

    calculo.procedimiento.forEach((linea) => {
        html += "<div>" + linea + "</div>";
    });

    html += '<div class="total">x = ' + calculo.decimal + "</div>";
    html += '<div class="total">Fitness = x^2 = ' + calculo.fitness + "</div>";
    html += "</div></article>";

    return html;
}

const resultadoNode = document.getElementById("lblResultado");
const defaultResultadoHTML = resultadoNode ? resultadoNode.innerHTML : "";
const padreInput = document.getElementById("txtPadre");
const madreInput = document.getElementById("txtMadre");
const puntoInput = document.getElementById("txtPuntoCorte");

function clearResultPanel() {
    if (resultadoNode) {
        resultadoNode.innerHTML = defaultResultadoHTML;
    }
}

function getFeedbackId(input) {
    if (!input) {
        return "";
    }

    if (input.id === "txtPadre") {
        return "feedbackPadre";
    }

    if (input.id === "txtMadre") {
        return "feedbackMadre";
    }

    return "feedbackPunto";
}

function setInvalid(input, message) {
    if (!input) {
        return;
    }

    const feedback = document.getElementById(getFeedbackId(input));
    input.classList.add("is-invalid");

    if (feedback) {
        feedback.textContent = message;
    }
}

function clearInvalid(input) {
    if (!input) {
        return;
    }

    const feedback = document.getElementById(getFeedbackId(input));
    input.classList.remove("is-invalid");

    if (feedback) {
        feedback.textContent = "";
    }
}

function validarCampos(showAll) {
    const padreValor = padreInput ? padreInput.value.trim() : "";
    const madreValor = madreInput ? madreInput.value.trim() : "";
    const puntoValor = puntoInput ? puntoInput.value.trim() : "";
    const binarioRegex = /^[01]+$/;
    let valido = true;

    clearInvalid(padreInput);
    clearInvalid(madreInput);
    clearInvalid(puntoInput);

    if (!padreValor) {
        valido = false;
        if (showAll) {
            setInvalid(padreInput, "Este campo es obligatorio.");
        }
    } else if (!binarioRegex.test(padreValor)) {
        valido = false;
        setInvalid(padreInput, "Solo se permiten valores binarios: 0 y 1.");
    }

    if (!madreValor) {
        valido = false;
        if (showAll) {
            setInvalid(madreInput, "Este campo es obligatorio.");
        }
    } else if (!binarioRegex.test(madreValor)) {
        valido = false;
        setInvalid(madreInput, "Solo se permiten valores binarios: 0 y 1.");
    }

    if (padreValor && madreValor && binarioRegex.test(padreValor) && binarioRegex.test(madreValor)) {
        if (padreValor.length !== madreValor.length) {
            valido = false;
            setInvalid(padreInput, "Los cromosomas deben tener la misma longitud.");
            setInvalid(madreInput, "Los cromosomas deben tener la misma longitud.");
        }
    }

    if (!puntoValor) {
        valido = false;
        if (showAll) {
            setInvalid(puntoInput, "Este campo es obligatorio.");
        }
    } else {
        const puntoNumero = Number(puntoValor);
        const limite = padreValor && binarioRegex.test(padreValor) ? padreValor.length : 0;

        if (!Number.isInteger(puntoNumero)) {
            valido = false;
            setInvalid(puntoInput, "El punto de corte debe ser un numero entero.");
        } else if (limite > 0 && (puntoNumero <= 0 || puntoNumero >= limite)) {
            valido = false;
            setInvalid(puntoInput, "Debe estar entre 1 y " + (limite - 1) + ".");
        }
    }

    return valido;
}

function handleRealtimeValidation() {
    if (!validarCampos(false)) {
        clearResultPanel();
    }
}

function reiniciarCalculo() {
    [padreInput, madreInput, puntoInput].forEach((campo) => {
        if (campo) {
            campo.value = "";
            clearInvalid(campo);
        }
    });

    clearResultPanel();

    if (padreInput) {
        padreInput.focus();
    }
}

function renderGeneCard(clase, titulo, izquierda, derecha, prioridadIzquierda) {
    const izquierdaClase = prioridadIzquierda ? "segment take" : "segment";
    const derechaClase = prioridadIzquierda ? "segment" : "segment take";

    return '<article class="gene-card ' + clase + '">' +
        '<div class="card-title"><span>' + titulo + "</span><span>Corte</span></div>" +
        '<div class="gene-line">' +
        '<span class="' + izquierdaClase + '">' + izquierda + "</span>" +
        '<span class="divider">/</span>' +
        '<span class="' + derechaClase + '">' + derecha + "</span>" +
        "</div></article>";
}

function renderChildCard(clase, titulo, valor) {
    return '<article class="gene-card ' + clase + '">' +
        '<div class="card-title"><span>' + titulo + "</span><span>Nuevo ADN</span></div>" +
        '<div class="gene-line"><span class="segment take">' + valor + "</span></div>" +
        "</article>";
}

function renderFitnessCard(titulo, calculo) {
    return '<article class="fitness-card">' +
        '<div class="card-title"><span>' + titulo + "</span><span>x^2</span></div>" +
        "<strong>" + calculo.fitness + "</strong>" +
        "<span>Decimal: " + calculo.decimal + "</span>" +
        "</article>";
}

function calularCruce() {
    if (!resultadoNode || !validarCampos(true)) {
        clearResultPanel();
        return;
    }

    const punto = Number(puntoInput.value);
    const padreParte1 = padreInput.value.substring(0, punto);
    const padreParte2 = padreInput.value.substring(punto);
    const madreParte1 = madreInput.value.substring(0, punto);
    const madreParte2 = madreInput.value.substring(punto);
    const hijo1 = padreParte1 + madreParte2;
    const hijo2 = madreParte1 + padreParte2;
    const calculoHijo1 = convertirBinarioADecimal(hijo1);
    const calculoHijo2 = convertirBinarioADecimal(hijo2);

    resultadoNode.innerHTML =
        '<div class="result-layout">' +
        '<div class="cut-map">' +
        renderGeneCard("parent-one", "Padre", padreParte1, padreParte2, true) +
        renderGeneCard("parent-two", "Madre", madreParte1, madreParte2, false) +
        "</div>" +
        '<div class="children-grid">' +
        renderChildCard("child-one", "Hijo 1", hijo1) +
        renderChildCard("child-two", "Hijo 2", hijo2) +
        "</div>" +
        '<div class="fitness-grid">' +
        renderFitnessCard("Fitness hijo 1", calculoHijo1) +
        renderFitnessCard("Fitness hijo 2", calculoHijo2) +
        "</div>" +
        renderProcedimiento("Procedimiento hijo 1", calculoHijo1) +
        renderProcedimiento("Procedimiento hijo 2", calculoHijo2) +
        "</div>";
}

if (padreInput) {
    padreInput.addEventListener("input", handleRealtimeValidation);
}

if (madreInput) {
    madreInput.addEventListener("input", handleRealtimeValidation);
}

if (puntoInput) {
    puntoInput.addEventListener("input", handleRealtimeValidation);
}
