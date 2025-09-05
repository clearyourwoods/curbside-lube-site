(function(){
  const state = { location:'', year:'', make:'', model:'', vin:'', notes:'', specs:{engine:'', body:''} };
  const $ = (id) => document.getElementById(id);
  document.getElementById('yearNow').textContent = new Date().getFullYear();

  const OIL_DB = [
    { make: 'Honda', items: [
      { model: 'Civic', years: [2012,2013,2014,2015,2016], oil: '0W-20', filter: 'Fram PH7317' },
      { model: 'Civic', years: [2017,2018,2019,2020,2021,2022,2023,2024], oil: '0W-20', filter: 'Fram PH7317' },
      { model: 'Accord', years: [2013,2014,2015,2016,2017], oil: '0W-20', filter: 'Fram PH7317' },
      { model: 'Accord', years: [2018,2019,2020,2021,2022,2023,2024], oil: '0W-20', filter: 'Fram PH7317' },
    ]},
    { make: 'Toyota', items: [
      { model: 'Camry', years: [2012,2013,2014,2015,2016,2017], oil: '0W-20', filter: 'Toyota 04152-YZZA1' },
      { model: 'Camry', years: [2018,2019,2020,2021,2022,2023,2024], oil: '0W-16', filter: 'Toyota 04152-YZZA1' },
      { model: 'Corolla', years: [2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024], oil: '0W-20', filter: 'Toyota 04152-YZZA1' },
      { model: 'Tundra', years: [2014,2015,2016,2017,2018,2019,2020], oil: '0W-20', filter: 'Fram PH4967' },
    ]},
    { make: 'Ford', items: [
      { model: 'F-150', years: [2011,2012,2013,2014], oil: '5W-20', filter: 'Motorcraft FL-500S' },
      { model: 'F-150', years: [2015,2016,2017,2018,2019,2020,2021,2022,2023,2024], oil: '5W-30', filter: 'Motorcraft FL-500S' },
      { model: 'Escape', years: [2013,2014,2015,2016,2017,2018,2019], oil: '5W-20', filter: 'Motorcraft FL-910S' },
    ]},
    { make: 'Chevrolet', items: [
      { model: 'Silverado 1500', years: [2014,2015,2016,2017,2018,2019,2020], oil: '0W-20', filter: 'ACDelco PF63E' },
      { model: 'Equinox', years: [2018,2019,2020,2021,2022,2023], oil: '0W-20', filter: 'ACDelco PF64' },
    ]},
    { make: 'Nissan', items: [
      { model: 'Altima', years: [2013,2014,2015,2016,2017,2018], oil: '0W-20', filter: 'Fram PH6607' },
    ]},
    { make: 'Subaru', items: [
      { model: 'Outback', years: [2015,2016,2017,2018,2019], oil: '0W-20', filter: 'Fram XG7317' },
    ]},
  ];

  function normalize(s){ return String(s||'').trim().toLowerCase(); }
  function findOilFilter(year, make, model){
    const y = parseInt(year,10);
    const m = normalize(make), md = normalize(model);
    for(const e of OIL_DB){
      if(normalize(e.make) === m){
        for(const it of e.items){
          if(normalize(it.model) === md && it.years.includes(y)){
            return {oil: it.oil, filter: it.filter, source: 'db'};
          }
        }
      }
    }
    if(!Number.isNaN(y)){
      if(y >= 2018) return {oil: '0W-20', filter: 'See supplier', source: 'rule'};
      if(y >= 2010) return {oil: '5W-20', filter: 'See supplier', source: 'rule'};
    }
    return {oil: '5W-30', filter: 'See supplier', source: 'unknown'};
  }

  async function decodeVIN(vin){
    try{
      const url = `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValuesExtended/${encodeURIComponent(vin)}?format=json`;
      const r = await fetch(url);
      const j = await r.json();
      const row = (j && j.Results && j.Results[0]) || {};
      return { year: row.ModelYear||'', make: row.Make||'', model: row.Model||row.Series||'', engine: row.EngineModel||row.EngineCylinders||row.DisplacementL||'', body: row.BodyClass||'' };
    }catch(e){ console.error(e); return null; }
  }

  function updateSuggestions(){
    const {oil, filter, source} = findOilFilter(state.year, state.make, state.model);
    document.getElementById('oil').textContent = oil;
    document.getElementById('filter').textContent = filter;
    document.getElementById('source').textContent = source;
    updateMailto();
  }

  function encodeBody(s){ return encodeURIComponent(s).replace(/%0A/g, '\n'); }

  function updateMailto(){
    const lines = [
      `LOCATION: ${state.location||'(not provided)'}`,
      `VEHICLE: ${state.year||'?'} ${state.make||'?'} ${state.model||'?'}`,
      state.vin ? `VIN: ${state.vin}` : null,
      state.specs.engine ? `ENGINE: ${state.specs.engine}` : null,
      state.specs.body ? `BODY: ${state.specs.body}` : null,
      '',
      'RECOMMENDED (verify before service):',
      `Oil: ${document.getElementById('oil').textContent||'-'}`,
      `Filter: ${document.getElementById('filter').textContent||'-'}`,
      `Source: ${document.getElementById('source').textContent||'-'}`,
      state.notes ? `\nNOTES: ${state.notes}` : null,
      '\n— Submitted from Mobile Oil Caddie site'
    ].filter(Boolean).join('\n');

    const subject = `Service Request — ${state.make||''} ${state.model||''} ${state.year||''}`.trim() || 'Service Request';
    const href = `mailto:clearyourwoods@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeBody(lines)}`;
    document.getElementById('mailtoLink').setAttribute('href', href);
    document.getElementById('copyBtn').onclick = () => navigator.clipboard && navigator.clipboard.writeText(lines);
  }

  function bind(id, key){
    document.getElementById(id).addEventListener('input', e => {
      state[key] = e.target.value;
      if(['year','make','model'].includes(key)) updateSuggestions(); else updateMailto();
    });
  }
  bind('location','location'); bind('year','year'); bind('make','make'); bind('model','model'); bind('vin','vin'); bind('notes','notes');
  document.getElementById('decodeBtn').addEventListener('click', async () => {
    if(!state.vin || state.vin.trim().length < 8) return;
    const btn = document.getElementById('decodeBtn');
    btn.disabled = true; btn.textContent = 'Decoding…';
    const res = await decodeVIN(state.vin.trim());
    btn.disabled = false; btn.textContent = 'Decode';
    if(res){
      if(res.year){ state.year = String(res.year); document.getElementById('year').value = state.year; }
      if(res.make){ state.make = res.make; document.getElementById('make').value = state.make; }
      if(res.model){ state.model = res.model; document.getElementById('model').value = state.model; }
      state.specs.engine = res.engine||''; state.specs.body = res.body||'';
      document.getElementById('specs').textContent = (state.specs.engine||state.specs.body) ? `Engine: ${state.specs.engine||'-'}  —  Body: ${state.specs.body||'-'}` : '';
      updateSuggestions();
    }
  });

  // Initial
  updateSuggestions(); updateMailto();

  // Self-tests
  const tests = [];
  function t(name, fn){ try{ tests.push({name, pass: !!fn()}); }catch(e){ tests.push({name, pass:false}); } }
  const eq = (a,b) => JSON.stringify(a)===JSON.stringify(b);
  t('Camry 2019 → 0W-16 / YZZA1', () => eq(findOilFilter(2019,'Toyota','Camry'), {oil:'0W-16', filter:'Toyota 04152-YZZA1', source:'db'}));
  t('Civic 2015 → 0W-20 / PH7317', () => eq(findOilFilter(2015,'Honda','Civic'), {oil:'0W-20', filter:'Fram PH7317', source:'db'}));
  t('Unknown 2011 → rule 5W-20', () => eq(findOilFilter(2011,'X','Y'), {oil:'5W-20', filter:'See supplier', source:'rule'}));
  t('Unknown 2005 → unknown 5W-30', () => eq(findOilFilter(2005,'X','Y'), {oil:'5W-30', filter:'See supplier', source:'unknown'}));
  const ul = document.getElementById('test-list');
  tests.forEach(ts => { const li = document.createElement('li'); li.textContent = (ts.pass?'✅ ':'❌ ')+ts.name; ul.appendChild(li); });
})();