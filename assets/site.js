(function(){
  const toggle=document.querySelector('.menu-toggle');
  const nav=document.querySelector('.navlinks');
  if(toggle&&nav){toggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));});}
  document.querySelectorAll('[data-demo-form]').forEach(form=>form.addEventListener('submit',event=>{
    event.preventDefault();
    const status=form.querySelector('.status');
    if(status){status.textContent='Questa è una versione dimostrativa: il modulo non invia né salva dati. La funzione sarà collegata quando attiveremo il servizio.';status.classList.add('show');}
  }));
  const year=document.querySelector('[data-year]'); if(year) year.textContent=new Date().getFullYear();
})();
  // Registrazione PWA e installazione dalla homepage
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    window.addEventListener('load', () => navigator.serviceWorker.register('/Atlas/sw.js').catch(() => {}));
  }
  let atlasInstallPrompt = null;
  const installButton = document.getElementById('install-atlas');
  if (installButton) {
    window.addEventListener('beforeinstallprompt', event => {
      event.preventDefault(); atlasInstallPrompt = event; installButton.hidden = false;
    });
    installButton.addEventListener('click', async () => {
      if (atlasInstallPrompt) {
        atlasInstallPrompt.prompt();
        await atlasInstallPrompt.userChoice;
        atlasInstallPrompt = null;
      } else {
        const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
        const message = isIOS
          ? 'Per aggiungere Atlas alla schermata Home: tocca Condividi nel browser, poi “Aggiungi alla schermata Home”.'
          : 'Se il browser mostra “Installa app” o “Aggiungi alla schermata Home”, usa quel comando dal menu del browser. La disponibilità dipende dal dispositivo e dal browser.';
        alert(message);
      }
    });
  }
