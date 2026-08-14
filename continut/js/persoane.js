function incarcaPersoane() {
    console.log("Se încearcă încărcarea fișierului persoane.xml...");
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log("XML încărcat cu succes");
            var xmlDoc = this.responseXML;
            var persoane = xmlDoc.getElementsByTagName("persoana");

            let tabel = "<table border='1'><tr><th>Nume</th><th>Prenume</th><th>Varsta</th></tr>";

            for (let i = 0; i < persoane.length; i++) {
                let nume = persoane[i].getElementsByTagName("nume")[0].textContent;
                let prenume = persoane[i].getElementsByTagName("prenume")[0].textContent;
                let varsta = persoane[i].getElementsByTagName("varsta")[0].textContent;

                tabel += `<tr><td>${nume}</td><td>${prenume}</td><td>${varsta}</td></tr>`;
            }

            tabel += "</table>";
            document.getElementById("continut").innerHTML = tabel;
        } else if (this.readyState == 4) {
            console.error("Eroare la încărcarea XML-ului:", this.status);
        }
    };
    xhttp.open("GET", "resurse/persoane.xml", true);
    xhttp.send();
}
