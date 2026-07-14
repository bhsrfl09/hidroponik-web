// PENGATURAN FIREBASE (Isi sesuai detail Firebase kamu)
const firebaseConfig = {
    databaseURL: "https://URL_DATABASE_KAMU.firebaseio.com/"
};

// Inisialisasi Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// 1. Membaca Sensor & Status Realtime secara LIVE
database.ref('/sensors').on('value', (snapshot) => {
    const data = snapshot.val();
    if(data) {
        document.getElementById('valPH').innerText = data.ph.toFixed(1);
        document.getElementById('valTDS').innerHTML = data.tds + ' <small>ppm</small>';
        document.getElementById('valWaterTemp').innerHTML = data.waterTemp.toFixed(1) + ' <small>&deg;C</small>';
        document.getElementById('valAirTemp').innerHTML = data.airTemp.toFixed(1) + ' <small>&deg;C</small>';
        document.getElementById('valHum').innerHTML = data.humidity.toFixed(1) + ' <small>%</small>';
    }
});

// Membaca status aktuator untuk mengupdate warna tombol
database.ref('/status').on('value', (snapshot) => {
    const data = snapshot.val();
    if(data) {
        updateRelayButton('AirBersih', data.airBersih, 'Air Bersih');
        updateRelayButton('PhUp', data.phUp, 'pH Up');
        updateRelayButton('PhDown', data.phDown, 'pH Down');
        updateRelayButton('NutAB', data.nutAB, 'Nutrisi AB');
        updateRelayButton('Exhaust', data.exhaust, 'Exhaust');
    }
});

// Membaca pengaturan awal saat web dibuka
database.ref('/settings').once('value').then((snapshot) => {
    const data = snapshot.val();
    if(data) {
        document.getElementById('systemMode').value = data.mode || "auto";
        document.getElementById('phMin').value = data.phMin || 5.5;
        document.getElementById('phMax').value = data.phMax || 6.5;
        document.getElementById('tdsMin').value = data.tdsMin || 800;
        document.getElementById('tdsMax').value = data.tdsMax || 1400;
        document.getElementById('humMin').value = data.humMin || 70;
        document.getElementById('humMax').value = data.humMax || 80;
        document.getElementById('tempMax').value = data.tempMax || 30.0;
        changeMode(false); // Update UI
    }
});

// 2. Fungsi Bantuan Tombol
function updateRelayButton(idSuffix, state, displayName) {
    let btn = document.getElementById('btn' + idSuffix);
    if(state === 'ON') {
        btn.classList.add('active');
        btn.innerText = `Pompa ${displayName} : ON`;
    } else {
        btn.classList.remove('active');
        btn.innerText = `Pompa ${displayName} : OFF`;
    }
}

// 3. Mengubah Mode (Kirim ke Firebase)
function changeMode(sendToServer = true) {
    let mode = document.getElementById("systemMode").value;
    let isManual = (mode === 'manual');
    
    let buttons = document.querySelectorAll('.controls .btn');
    buttons.forEach(btn => btn.disabled = !isManual);
    document.getElementById("modeWarning").style.display = isManual ? "none" : "block";

    if(sendToServer) {
        database.ref('/settings').update({ mode: mode });
    }
}

// 4. Tombol Relay Manual (Kirim ke Firebase)
function toggleRelay(relayName) {
    let btnId = 'btn' + relayName.charAt(0).toUpperCase() + relayName.slice(1);
    let btn = document.getElementById(btnId);
    let isTurnedOn = !btn.classList.contains('active');
    let state = isTurnedOn ? 'ON' : 'OFF';

    // Kirim state baru ke database
    database.ref('/relays/' + relayName).set(state);
}

// 5. Menyimpan Threshold (Kirim ke Firebase)
function saveThresholds() {
    let settings = {
        phMin: parseFloat(document.getElementById("phMin").value),
        phMax: parseFloat(document.getElementById("phMax").value),
        tdsMin: parseInt(document.getElementById("tdsMin").value),
        tdsMax: parseInt(document.getElementById("tdsMax").value),
        humMin: parseFloat(document.getElementById("humMin").value),
        humMax: parseFloat(document.getElementById("humMax").value),
        tempMax: parseFloat(document.getElementById("tempMax").value)
    };

    database.ref('/settings').update(settings)
        .then(() => alert("Pengaturan batas berhasil disimpan ke Internet!"))
        .catch(() => alert("Gagal menyimpan ke internet!"));
}