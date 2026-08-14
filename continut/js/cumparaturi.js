class Produs {
    constructor(id, nume, cantitate) {
        this.id = id;
        this.nume = nume;
        this.cantitate = cantitate;
    }
}

function adaugaProdus() {
    const numeProdus = document.getElementById("productName").value;
    const cantitateProdus = document.getElementById("cantitateProd").value;
    const numeUnelta = document.getElementById("tool").value;
    const cantitateUnealta = document.getElementById("cantitateUnelte").value;

    if (!numeProdus || !cantitateProdus || !numeUnelta || !cantitateUnealta) {
        alert("Completează toate câmpurile!");
        return;
    }

    // obtinem lista 
    let lista = JSON.parse(localStorage.getItem("cumparaturi")) || [];

    const produsNou = new Produs(lista.length + 1, numeProdus, cantitateProdus);

    lista.push(produsNou);

    // salvare in local storage
    localStorage.setItem("cumparaturi", JSON.stringify(lista));

    alert("Produs adăugat!");
    document.getElementById("productName").value = "";
    document.getElementById("cantitateProd").value = "";
    document.getElementById("tool").value = "";
    document.getElementById("cantitateUnelte").value = "";
}