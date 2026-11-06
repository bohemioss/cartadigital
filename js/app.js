/* BOHEMIOS · Carta digital. Funciona sin servidor y está lista para GitHub Pages. */
(() => {
  'use strict';
  const data = window.BOHEMIOS_MENU;
  if (!data || !Array.isArray(data.categories)) { alert('No se pudo cargar la carta. Revisa datos/menu.js'); return; }
  const restaurant = data.restaurant;
  const cats = data.categories;
  const products = cats.flatMap(c => c.items);
  const productsById = new Map(products.map(p => [p.id, p]));
  const catById = new Map(cats.map(c => [c.id, c]));
  const el = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const norm = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const money = n => `S/ ${Number(n || 0).toFixed(2)}`;
  const safeLocal = {get(key){try {return localStorage.getItem(key);}catch{return null;}},set(key,value){try{localStorage.setItem(key,value);}catch{}}};
  const safeSession = {get(key){try{return sessionStorage.getItem(key);}catch{return null;}},set(key,value){try{sessionStorage.setItem(key,value);}catch{}}};
  let group = 'Cocina', currentCategory = 'piqueos', selected = null, selectedVariant = 0, qty = 1, selections = {}, cart = [], pendingAlcohol = null;
  let toastTimer;
  try {const stored = JSON.parse(safeLocal.get('bohemios_cart_v2') || '[]');cart = Array.isArray(stored) ? stored.filter(x => x && productsById.has(x.id) && x.qty > 0 && x.qty <= 99) : [];}catch{cart=[];}

  function toast(message) {const t=el('toast');t.textContent=message;t.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{t.hidden=true;},3500);}
  function rememberCart() {safeLocal.set('bohemios_cart_v2',JSON.stringify(cart));}
  function itemImage(p,idx=0) {return p.variants?.[idx]?.image || p.image;}
  function assignImage(img,p,idx=0) {if(!img)return;img.alt=`Ilustración de ${p.name}${p.variants?.[idx] ? ', '+p.variants[idx].label : ''}`; img.src=itemImage(p,idx);}
  const panels = ['productModal','confirmModal','cartDrawer','ageModal'];
  function showPanel(id) {panels.forEach(k=>{el(k).hidden=k!==id;el(k).setAttribute('aria-hidden',String(k!==id));});el('overlay').hidden=false;document.body.style.overflow='hidden';const target=el(id).querySelector('button:not([disabled])');target?.focus({preventScroll:true});}
  function closeAll() {panels.forEach(k=>{el(k).hidden=true;el(k).setAttribute('aria-hidden','true');});el('overlay').hidden=true;document.body.style.overflow='';}

  function selectGroup(next) {
    group=next;
    const preferred = next==='Barra'?'cocteles':'piqueos';
    if(catById.get(currentCategory)?.group !== group)currentCategory=preferred;
    document.querySelectorAll('[data-group]').forEach(btn=>btn.classList.toggle('active',btn.dataset.group===group));
    el('searchInput').value='';el('clearSearch').hidden=true;
    renderNav();renderMenu();
  }
  function selectCategory(id) {
    const cat=catById.get(id);if(!cat)return;
    group=cat.group;currentCategory=id;
    document.querySelectorAll('[data-group]').forEach(btn=>btn.classList.toggle('active',btn.dataset.group===group));
    el('searchInput').value='';el('clearSearch').hidden=true;
    renderNav();renderMenu();
  }
  function goCarta(){el('carta').scrollIntoView({behavior:'smooth',block:'start'});}
  function renderNav() {
    const available=cats.filter(c=>c.group===group);
    el('categoryNav').innerHTML=available.map(c=>`<button class="category-btn ${c.id===currentCategory?'active':''}" type="button" data-category="${c.id}" aria-pressed="${c.id===currentCategory}"><span class="nav-emoji">${c.emoji}</span><span>${esc(c.name)}</span><span class="nav-number">${String(c.items.length).padStart(2,'0')}</span></button>`).join('');
    el('mobileCategories').innerHTML=available.map(c=>`<button class="mobile-cat-btn ${c.id===currentCategory?'active':''}" type="button" data-category="${c.id}" aria-pressed="${c.id===currentCategory}">${c.emoji} ${esc(c.name)}</button>`).join('');
  }
  function productCard(p,idx) {
    const c=catById.get(p.category),price=p.variants?.[0]?.price ?? p.price;
    return `<article class="product-card" data-product="${esc(p.id)}" tabindex="0" aria-label="Elegir ${esc(p.name)}" style="animation-delay:${Math.min(idx,9)*.035}s">
      <div class="product-photo"><img loading="lazy" src="${esc(itemImage(p))}" alt="Ilustración de ${esc(p.name)}"><span class="product-badge">${p.variants?.length > 1 ? `${p.variants.length} PRESENTACIONES` : (p.alcohol ? 'BARRA BOHEMIOS' : c.name.toUpperCase())}</span></div>
      <div class="product-card-content"><h4>${esc(p.name)}</h4><p>${esc(p.description || 'Disfruta esta especialidad de Bohemios.')}</p><div class="product-card-bottom"><div class="product-price"><span>${p.variants?.length > 1?'DESDE':'PRECIO'}</span><strong>${money(price)}</strong></div><button class="product-select" data-select="${esc(p.id)}" type="button">ELEGIR +</button></div></div>
    </article>`;
  }
  function renderMenu() {
    const query=el('searchInput').value.trim();const cat=catById.get(currentCategory);
    let list;
    if (query) {
      list=products.filter(p=>norm(`${p.name} ${p.description} ${catById.get(p.category)?.name}`).includes(norm(query)));
      el('categoryEyebrow').textContent='RESULTADOS EN TODA LA CARTA';el('categoryHeading').textContent='Tu búsqueda';el('categorySubtitle').textContent=`${list.length} opciones para “${query}”`;
      el('categoryIcon').textContent='🔎';
    } else {
      list=cat.items;el('categoryEyebrow').textContent=cat.group==='Cocina'?'DE NUESTRA COCINA':'DE NUESTRA BARRA';el('categoryHeading').textContent=cat.name;el('categorySubtitle').textContent=cat.subtitle;el('categoryIcon').textContent=cat.emoji;
    }
    el('resultCount').textContent=`${list.length} producto${list.length===1?'':'s'}`;
    el('productsGrid').innerHTML=list.length?list.map(productCard).join(''):`<div class="no-results"><span style="font-size:39px">🔍</span><strong>NO ENCONTRAMOS ESO</strong><p>Prueba buscando con otra palabra o cambia de sección.</p><button type="button" class="btn btn-outline" id="resetSearch">VER CARTA COMPLETA</button></div>`;
  }
  function requireAge(p) {
    if(p.alcohol && safeSession.get('bohemios_adult')!=='true'){pendingAlcohol=p;showPanel('ageModal');return;}
    openProduct(p);
  }
  function openProduct(p){
    selected=p;selectedVariant=0;qty=1;selections={};
    el('productModalTitle').textContent=p.name;el('productModalDesc').textContent=p.description || 'Una especialidad de nuestra carta.';el('productNote').value='';
    drawProductControls();showPanel('productModal');
  }
  function drawProductControls(){
    if(!selected)return;
    const p=selected;
    el('productModalImage').innerHTML=`<img id="selectedPhoto" src="${esc(itemImage(p,selectedVariant))}" alt="${esc(p.name)}"><span class="image-caption" id="selectedImageLabel">${p.variants?.[selectedVariant]?.label?.toUpperCase() || 'BOHEMIOS'}</span>`;
    const v=p.variants || [];
    el('variantControl').innerHTML=v.length > 1 ? `<div class="option-title">ELIGE LA PRESENTACIÓN *</div><div class="option-pills variant-pills">${v.map((item,i)=>`<label class="option-pill"><input type="radio" name="product-variant" value="${i}" ${i===selectedVariant?'checked':''}><span>${esc(item.label)} <b>${money(item.price)}</b></span></label>`).join('')}</div>` : v.length===1? `<div class="option-title">PRESENTACIÓN</div><div class="option-pills"><label class="option-pill"><input type="radio" name="product-variant" value="0" checked><span>${esc(v[0].label)} <b>${money(v[0].price)}</b></span></label></div>`:'';
    el('optionsControl').innerHTML=(p.options || []).map((option,index)=>{
      const isMulti=option.type==='multi';
      return `<div class="extra-option" data-option-index="${index}"><div class="option-title">${esc(option.label)} ${option.required?'*':''}</div><div class="option-pills">${option.values.map(value=>`<label class="option-pill"><input type="${isMulti?'checkbox':'radio'}" name="option-${index}" value="${esc(value)}"><span>${esc(value)}</span></label>`).join('')}</div>${isMulti?`<p class="option-hint">Selecciona exactamente ${option.max} opciones.</p>`:''}</div>`;
    }).join('');
    updateProductTotal();
  }
  function updateProductTotal(){const price=selected?.variants?.[selectedVariant]?.price??selected?.price??0;el('modalTotal').textContent=money(price*qty);el('modalQuantity').textContent=qty;}
  function currentOptionData(){
    const result=[];
    for(let i=0;i<(selected.options||[]).length;i++){
      const option=selected.options[i];const checked=[...el('optionsControl').querySelectorAll(`input[name="option-${i}"]:checked`)].map(input=>input.value);
      if (option.required && (!checked.length || (option.type==='multi' && checked.length !== option.max))){
        toast(option.type==='multi'?`Debes elegir exactamente ${option.max} opciones en “${option.label}”.`:`Selecciona una opción en “${option.label}”.`);
        el('optionsControl').querySelector(`[name="option-${i}"]`)?.focus();return null;
      }
      if(checked.length) result.push({label:option.label,values:checked});
    }
    return result;
  }
  function addSelection(){
    if(!selected)return;
    const opts=currentOptionData();if(!opts)return;
    const name=selected.name, variant=selected.variants?.[selectedVariant]?.label || '', price=selected.variants?.[selectedVariant]?.price??selected.price;
    const note=el('productNote').value.trim().slice(0,450);
    const signature=JSON.stringify([selected.id,variant,opts,note]);
    const existing=cart.find(x=>x.signature===signature);
    if(existing)existing.qty=Math.min(99,existing.qty+qty);
    else cart.push({uid:`item-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,id:selected.id,name,category:selected.category,variant,variantIndex:selectedVariant,price,qty,options:opts,note,signature});
    rememberCart();renderCart();
    el('confirmedProduct').textContent=`${qty} × ${name}${variant?' · '+variant:''} añadido${qty===1?'':'s'} a tu pedido.`;
    showPanel('confirmModal');
  }
  const subtotal=()=>cart.reduce((sum,x)=>sum+x.price*x.qty,0);
  function renderCart(){
    const totalQty=cart.reduce((sum,x)=>sum+x.qty,0);
    document.querySelectorAll('[data-cart-count]').forEach(node=>node.textContent=totalQty);
    el('cartEmpty').hidden=cart.length>0;el('cartFilled').hidden=!cart.length;el('finishOrder').disabled=!cart.length;
    el('cartSubtotal').textContent=money(subtotal());
    el('cartList').innerHTML=cart.map(x=>{
      const p=productsById.get(x.id);
      const detail=[x.variant,...(x.options||[]).map(o=>`${o.label}: ${o.values.join(', ')}`),x.note?`Nota: ${x.note}`:''].filter(Boolean).join(' · ');
      return `<div class="cart-item" data-uid="${esc(x.uid)}"><img src="${esc(itemImage(p,x.variantIndex))}" alt="${esc(x.name)}"><div class="cart-item-info"><div class="cart-item-title-row"><b>${esc(x.name)}</b><strong>${money(x.price*x.qty)}</strong></div><div class="cart-item-options">${esc(detail || 'Presentación clásica')}</div><div class="cart-item-bottom"><div class="mini-qty"><button type="button" data-cart-act="minus" aria-label="Restar uno">−</button><span>${x.qty}</span><button type="button" data-cart-act="plus" aria-label="Sumar uno">+</button></div><button class="remove-item" type="button" data-cart-act="remove">Eliminar</button></div></div></div>`;
    }).join('');
  }
  function updateMode(){
    const value=el('deliveryMode').value;
    el('deliveryFields').hidden=value!=='delivery';el('tableFields').hidden=value!=='mesa';
    el('shippingInfo').textContent=value==='delivery'?'Costo de delivery: por confirmar según zona.':value==='recojo'?'Recojo en Jr. Cusco 430, San Ignacio.':'Consumo en el local · Jr. Cusco 430.';
  }
  function finish(){
    if(!cart.length)return;
    const name=el('clientName').value.trim(),phone=el('clientPhone').value.replace(/\D/g,''),mode=el('deliveryMode').value,pay=el('paymentMethod').value;
    if(name.length < 2){toast('Ingresa tu nombre completo.');el('clientName').focus();return;}
    if(!/^9\d{8}$/.test(phone)){toast('Ingresa un celular peruano de 9 dígitos.');el('clientPhone').focus();return;}
    const district=el('district').value.trim(),address=el('deliveryAddress').value.trim(),ref=el('addressReference').value.trim(),table=el('tableNumber').value.trim(),notes=el('orderNotes').value.trim();
    if(mode==='delivery' && !district){toast('Indica tu distrito o zona.');el('district').focus();return;}
    if(mode==='delivery' && address.length<5){toast('Indica tu dirección completa para delivery.');el('deliveryAddress').focus();return;}
    if(mode==='mesa' && !table){toast('Indica el número o referencia de mesa.');el('tableNumber').focus();return;}
    const modeText={delivery:'Delivery',recojo:'Recojo en el local',mesa:'Consumo en el local'}[mode];
    const lines=[`🍕 *NUEVO PEDIDO — BOHEMIOS*`,``,`👤 *Cliente:* ${name}`,`📱 *Celular:* ${phone}`,``,`🧾 *DETALLE DEL PEDIDO*`];
    cart.forEach((it,index)=>{
      lines.push(`${index+1}. *${it.qty} × ${it.name}${it.variant?' — '+it.variant:''}* — ${money(it.price*it.qty)}`);
      lines.push(`   Precio unitario: ${money(it.price)}`);
      (it.options||[]).forEach(o=>lines.push(`   • ${o.label}: ${o.values.join(', ')}`));
      if(it.note)lines.push(`   • Indicación: ${it.note}`);
      lines.push('');
    });
    lines.push(`💰 *Subtotal:* ${money(subtotal())}`,`📍 *Modalidad:* ${modeText}`);
    if(mode==='delivery'){lines.push(`🗺️ *Zona:* ${district}`,`🏠 *Dirección:* ${address}`,`🚚 *Costo de envío:* Por confirmar`);if(ref)lines.push(`📌 *Referencia:* ${ref}`);}
    if(mode==='mesa')lines.push(`🍽️ *Mesa:* ${table}`);
    if(mode==='recojo')lines.push(`🏪 *Recojo:* ${restaurant.address}`);
    lines.push(`💳 *Método de pago:* ${pay}`);
    if(notes)lines.push(`📝 *Notas adicionales:* ${notes}`);
    if(cart.some(x=>productsById.get(x.id)?.alcohol))lines.push(`🔞 El cliente declara ser mayor de 18 años.`);
    lines.push('','Por favor, confirmen la disponibilidad, el total final y los datos de pago. ¡Gracias!');
    const url=`https://wa.me/${restaurant.phone}?text=${encodeURIComponent(lines.join('\n'))}`;
    const link=document.createElement('a');link.href=url;link.target='_blank';link.rel='noopener noreferrer';document.body.appendChild(link);link.click();link.remove();
    toast('Se abrió WhatsApp con el pedido listo para enviar.');
  }
  // Events — category navigation
  document.querySelectorAll('[data-group]').forEach(btn=>btn.addEventListener('click',()=>selectGroup(btn.dataset.group)));
  function delegatedCategory(e){const btn=e.target.closest('[data-category]');if(btn){selectCategory(btn.dataset.category);}}
  el('categoryNav').addEventListener('click',delegatedCategory);el('mobileCategories').addEventListener('click',delegatedCategory);
  el('searchInput').addEventListener('input',()=>{el('clearSearch').hidden=!el('searchInput').value;renderMenu();});
  el('clearSearch').addEventListener('click',()=>{el('searchInput').value='';el('clearSearch').hidden=true;renderMenu();el('searchInput').focus();});
  el('productsGrid').addEventListener('click',e=>{const productID=e.target.closest('[data-product]')?.dataset.product;if(productID)requireAge(productsById.get(productID));else if(e.target.closest('#resetSearch')){el('searchInput').value='';el('clearSearch').hidden=true;renderMenu();}});
  el('productsGrid').addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('.product-card')){e.preventDefault();requireAge(productsById.get(e.target.dataset.product));}});
  el('exploreBtn').addEventListener('click',goCarta);
  el('barBtn').addEventListener('click',()=>{selectGroup('Barra');goCarta();});
  el('experienceBtn').addEventListener('click',goCarta);el('locationOrder').addEventListener('click',goCarta);
  document.querySelectorAll('[data-footer-group]').forEach(a=>a.addEventListener('click',()=>selectGroup(a.dataset.footerGroup)));
  document.querySelectorAll('[data-bottom]').forEach(btn=>btn.addEventListener('click',()=>{selectGroup(btn.dataset.bottom);goCarta();}));
  // Events — product modal
  el('variantControl').addEventListener('change',e=>{if(e.target.name==='product-variant'){selectedVariant=Number(e.target.value);assignImage(el('selectedPhoto'),selected,selectedVariant);el('selectedImageLabel').textContent=selected.variants[selectedVariant].label.toUpperCase();updateProductTotal();}});
  el('optionsControl').addEventListener('change',e=>{
    const input=e.target;if(input.type!=='checkbox'||!input.checked)return;
    const index=Number(input.name.replace('option-','')),option=selected?.options?.[index];if(!option||option.type!=='multi')return;
    const checked=[...el('optionsControl').querySelectorAll(`input[name="option-${index}"]:checked`)];
    if(checked.length>option.max){input.checked=false;toast(`Solo puedes elegir ${option.max} opciones.`);}
  });
  el('qtyMinus').addEventListener('click',()=>{qty=Math.max(1,qty-1);updateProductTotal();});
  el('qtyPlus').addEventListener('click',()=>{qty=Math.min(99,qty+1);updateProductTotal();});
  el('addToCart').addEventListener('click',addSelection);
  el('closeProduct').addEventListener('click',closeAll);el('closeConfirm').addEventListener('click',closeAll);
  el('continueShopping').addEventListener('click',closeAll);
  el('confirmCheckout').addEventListener('click',()=>{renderCart();updateMode();showPanel('cartDrawer');});
  // Events — cart
  function openCart(){renderCart();updateMode();showPanel('cartDrawer');}
  ['headerCart','sidebarCart','bottomCart'].forEach(id=>el(id).addEventListener('click',openCart));
  el('closeCart').addEventListener('click',closeAll);
  el('emptyBrowse').addEventListener('click',()=>{closeAll();goCarta();});
  el('cartList').addEventListener('click',e=>{
    const btn=e.target.closest('[data-cart-act]'),itemNode=e.target.closest('[data-uid]');if(!btn||!itemNode)return;
    const i=cart.findIndex(c=>c.uid===itemNode.dataset.uid);if(i<0)return;
    const action=btn.dataset.cartAct;
    if(action==='plus')cart[i].qty=Math.min(99,cart[i].qty+1);
    else if(action==='minus'){cart[i].qty--;if(cart[i].qty<1)cart.splice(i,1);}
    else if(action==='remove')cart.splice(i,1);
    rememberCart();renderCart();
  });
  el('deliveryMode').addEventListener('change',updateMode);
  el('finishOrder').addEventListener('click',finish);
  el('checkoutForm').addEventListener('submit',e=>{e.preventDefault();finish();});
  // Age acknowledgement for alcoholic drinks (self-declaration, not identity verification)
  el('ageYes').addEventListener('click',()=>{safeSession.set('bohemios_adult','true');const p=pendingAlcohol;pendingAlcohol=null;if(p)openProduct(p);else closeAll();});
  el('ageNo').addEventListener('click',()=>{pendingAlcohol=null;closeAll();});
  el('overlay').addEventListener('click',closeAll);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!el('overlay').hidden)closeAll();});
  el('year').textContent=new Date().getFullYear();
  selectGroup('Cocina');renderCart();updateMode();
})();
