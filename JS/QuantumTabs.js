function openTab(evt, tabName) {
  var i, tabcontent, tablinks;
  // Obtener todos los elementos con class="tabcontent" y ocultarlos
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  // Obtener todos los elementos con class="tablinks" y eliminar la clase "active"
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  // Mostrar el contenido actual de la pestaña y añadir una clase "active" al botón que abrió la pestaña
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
}

function moveTab(direction) {
  var tabs = document.getElementsByClassName("tablinks");
  var currentTab = document.getElementsByClassName("active")[0];
  var tabIndex = Array.prototype.indexOf.call(tabs, currentTab);
  var nextTab = tabIndex + direction;

  // Ciclo para permitir navegación continua
  if (nextTab >= tabs.length) {
      nextTab = 0; // Volver al inicio
  } else if (nextTab < 0) {
      nextTab = tabs.length - 1; // Ir al final
  }

  // Simular clic en la nueva pestaña
  tabs[nextTab].click();
}

