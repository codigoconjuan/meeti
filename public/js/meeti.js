document.addEventListener('DOMContentLoaded', () => {
    if(document.querySelector('#ubicacion-meeti')) {
        mostrarMapa();
    }
})


function mostrarMapa() {

    // obtener los valores
    const lat = document.querySelector('#lat').value,
          lng = document.querySelector('#lng').value,
          direccion = document.querySelector('#direccion').value;

    var map = L.map('ubicacion-meeti').setView([lat, lng], 16);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    L.marker([lat, lng]).addTo(map)
        .bindPopup(direccion)
        .openPopup();
}


