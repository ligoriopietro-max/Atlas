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
