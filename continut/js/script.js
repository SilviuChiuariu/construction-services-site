//1. Functii pentru afisarea datelor in invata-------------------------------------------- 
function showInfo() {
    const infoElement1 = document.getElementById("info1");
    const infoElement2 = document.getElementById("info2");
    const infoElement3 = document.getElementById("info3");
    const infoElement4 = document.getElementById("info4");
    const infoElement5 = document.getElementById("info5");


    function updateTime() {
        const timeElement = document.getElementById("currentTime");
        if (timeElement) {
            const now = new Date();
            timeElement.innerHTML = `${now.toLocaleString()}`;
        }
    }

    const userInfo1 = `<p id="currentTime"></p>`;
    infoElement1.innerHTML = userInfo1;

    const userInfo2 = `<p>${window.location.href}</p>`;
    infoElement2.innerHTML = userInfo2;

    const userInfo3 = `<p>${navigator.appName} - ${navigator.appVersion}</p>`;
    infoElement3.innerHTML = userInfo3;

    const userInfo4 = `<p>${navigator.platform}</p>`;
    infoElement4.innerHTML = userInfo4;

    const userInfo5 = `<p id="location">Se încarcă...</p>`;
    infoElement5.innerHTML = userInfo5;
    
    updateTime();
    setInterval(updateTime, 1000);

    // Geolocation API pentru locație
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                document.getElementById("location").innerHTML = `Lat: ${latitude}, Long: ${longitude}`;
            },
            (error) => {
                document.getElementById("location").innerHTML = "Nepermisă de utilizator.";
            }
        );
    } else {
        document.getElementById("location").innerHTML = "Nu este suportată de browser.";
    }
}
//---------------------------------------------------------------------------------------



//2. functii pentru desenarea pe canvas din sectiunea invata-----------------------------
let canvas, ctx, firstClick = null;

function handleCanvasClick(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (!firstClick) {
        firstClick = { x, y };
    } else {
        const strokeColor = document.getElementById("strokeColor").value;
        const fillColor = document.getElementById("fillColor").value;

        drawRectangle(firstClick.x, firstClick.y, x - firstClick.x, y - firstClick.y, strokeColor, fillColor);
        firstClick = null;
    }
}

function drawRectangle(x, y, width, height, strokeColor, fillColor) {
    ctx.fillStyle = fillColor;
    ctx.strokeStyle = strokeColor;
    ctx.fillRect(x, y, width, height);
    ctx.strokeRect(x, y, width, height);
}

function initCanvas() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    canvas.addEventListener("click", handleCanvasClick);

    //figurile initiale
    drawRectangle(50, 50, 100, 80, "#000", "#ff0000");
    drawRectangle(200, 150, 120, 90, "#00f", "#0f0");
}
//------------------------------------------------------------------------



//3. Fuctii pentru tabelul din invata-------------------------------------
function adaugaLinie() {
    let tabel = document.getElementById("tabel");
    let pozitie = document.getElementById("pozitie").value;
    let bgColor = document.getElementById("bgColor").value;
    
    let rowCount = tabel.rows.length;
    let index = Math.min(Math.max(pozitie, 0), rowCount); 

    let newRow = tabel.insertRow(index);

    for (let i = 0; i < tabel.rows[0].cells.length; i++) {
        let newCell = newRow.insertCell(i);
        newCell.textContent = "Nou";
        newCell.style.backgroundColor = bgColor;
    }
}

function adaugaColoana() {
    let tabel = document.getElementById("tabel");
    let pozitie = document.getElementById("pozitie").value;
    let bgColor = document.getElementById("bgColor").value;

    let colCount = tabel.rows[0].cells.length;
    let index = Math.min(Math.max(pozitie, 0), colCount); 

    for (let i = 0; i < tabel.rows.length; i++) {
        let row = tabel.rows[i];
        let newCell = row.insertCell(index);
        newCell.textContent = "Nou";
        newCell.style.backgroundColor = bgColor;
    }
}
//-------------------------------------------------------------------------------------



//4.functia de schimbare--------------------------------------------------------------
function schimbaContinut(resursa, jsFisier, jsFunctie) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", "/" + resursa + ".html", true);
    xhttp.onreadystatechange = function() {                                 
        if (this.readyState == 4 && this.status == 200) {   
            document.getElementById("continut").innerHTML = this.responseText;

            if (resursa === "invata") {
                showInfo();
                initCanvas();
            }

            if (jsFisier) {
                var elementScript = document.createElement('script');
                console.log("Se încearcă încărcarea scriptului:", jsFisier);
                elementScript.onload = function () {
                    console.log("hello");
                    if (jsFunctie) {
                        window[jsFunctie]();
                        console.log("Se încearcă încărcarea scriptului:", jsFisier);
                    }
                };
                elementScript.src = jsFisier;
                document.head.appendChild(elementScript);
            } else {
                if (jsFunctie) {
                    window[jsFunctie]();
                    console.log("Se încearcă încărcarea scriptului:", jsFisier);
                }
            }
        }
    };
    xhttp.send();
}
//--------------------------------------------------------------------------------------



//5.Meniu------------------------------------------------------------------------------
function toggleMenu(){
    const menu = document.getElementById("menu");
    menu.classList.toggle("show");
    menu.classList.toggle("hidden");
}
//-------------------------------------------------------------------------------------



//6.Inregistrare-------------------------------------------------------------------------
function inregistreaza() {
    const utilizator = document.getElementById("username").value;
    const parola = document.getElementById("parola").value;

    const obj = { utilizator: utilizator, parola: parola };

    const xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/api/utilizatori", true);
    xhttp.setRequestHeader("Content-Type", "application/json");

    xhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                document.getElementById("mesaj").innerText = "Utilizator înregistrat cu succes!";
            } else {
                document.getElementById("mesaj").innerText = "Eroare la înregistrare!";
            }
        }
    };

    xhttp.send(JSON.stringify(obj));
}
//--------------------------------------------------------------------------------------------