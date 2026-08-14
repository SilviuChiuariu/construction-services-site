function verificaUtilizator() {
    const user = document.getElementById("user").value;
    const pass = document.getElementById("pass").value;

    var xhttp = new XMLHttpRequest();     //trimit cereri fara reincarcare
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {     //rasp complet primit, servar rasp cu succ
            const utilizatori = JSON.parse(this.responseText);

            const gasit = utilizatori.find(u => u.utilizator === user && u.parola === pass);   //cautarea

            if (gasit) {
                document.getElementById("rezultat").innerText = "Autentificare reușită!";
            } else {
                document.getElementById("rezultat").innerText = "Utilizator sau parolă incorectă!";
            }
        }
    };

    xhttp.open("GET", "resurse/utilizatori.json", true);
    xhttp.send();
}
