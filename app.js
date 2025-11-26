
// Simple client-side logic for HeredaFácil
document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('startBtn');
  const caseForm = document.getElementById('caseForm');
  const results = document.getElementById('results');
  const processType = document.getElementById('processType');
  const steps = document.getElementById('steps');
  const docs = document.getElementById('docs');
  const risk = document.getElementById('risk');
  const downloadPdf = document.getElementById('downloadPdf');
  const findNotarias = document.getElementById('findNotarias');
  const notariasList = document.getElementById('notariasList');
  const lawyersList = document.getElementById('lawyersList');
  const clearBtn = document.getElementById('clearBtn');

  startBtn?.addEventListener('click', () => {
    document.querySelector('#formulario')?.scrollIntoView({behavior:'smooth'});
  });

  clearBtn.addEventListener('click', () => {
    caseForm.reset();
    results.classList.add('hidden');
    notariasList.innerHTML = '';
    lawyersList.innerHTML = '';
  });

  caseForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // read values
    const testamento = document.getElementById('testamento').value;
    const conyuge = document.getElementById('conyuge').value;
    const hijos = Number(document.getElementById('hijos').value || 0);
    const menores = document.getElementById('menores').value;
    const inmuebles = document.getElementById('inmuebles').value;
    const conflicto = document.getElementById('conflicto').value;
    const fullName = document.getElementById('fullName').value;
    const cedula = document.getElementById('cedula').value;
    const department = document.getElementById('department').value;

    // Simple heuristic rules to decide notarial vs judicial
    // Notarial is possible when: testamento = si OR no testamento but no conflict, no menores, pocos bienes inmuebles simples
    let route = 'Notarial';
    if(conflicto === 'si' || menores === 'si' || inmuebles === 'si' && conflicto !== 'no' || testamento === 'ns') {
      route = 'Judicial';
    }
    if(testamento === 'no' && conflicto === 'no' && inmuebles === 'no' && menores === 'no') {
      route = 'Notarial';
    }
    if(testamento === 'si' && conflicto === 'no') route = 'Notarial';
    if(conflicto === 'si') route = 'Judicial';

    // Steps (simple)
    const stepsHtml = `<strong>Tipo de proceso:</strong> ${route}
      <ul>
        <li>Reunir documentación de identificación.</li>
        <li>Realizar inventario de bienes y avalúo si aplica.</li>
        <li>Si es notarial: acudir a notaría con acuerdo entre herederos.</li>
        <li>Si es judicial: contactar abogado y preparar demanda sucesoral.</li>
      </ul>`;

    // Required documents (basic list)
    const docsList = [
      'Cédulas del fallecido y herederos',
      'Registro civil o certificado de defunción',
      'Certificados de tradición (inmuebles) si aplica',
      'Testamento (si existe)',
      'Documentos de matrimonio o unión marital, si aplica'
    ];
    const docsHtml = '<ul>' + docsList.map(d=>`<li>${d}</li>`).join('') + '</ul>';

    // Risk semaforo
    let semaforo = 'Verde';
    if(conflicto === 'si' || testamento === 'ns') semaforo = 'Rojo';
    else if(conflicto === 'parcial' || menores === 'si' || inmuebles === 'si') semaforo = 'Amarillo';

    // Populate UI
    processType.innerHTML = `<h5>Resumen</h5>
      <p><strong>Nombre:</strong> ${fullName} — <strong>Cédula:</strong> ${cedula}</p>
      <p><strong>Departamento:</strong> ${department}</p>
      <p><strong>Tipo de proceso sugerido:</strong> ${route}</p>`;
    steps.innerHTML = `<h5>Pasos siguientes</h5>${stepsHtml}`;
    docs.innerHTML = `<h5>Documentos obligatorios</h5>${docsHtml}`;
    risk.innerHTML = `<h5>Semáforo de riesgo</h5><p><strong>${semaforo}</strong></p>`;

    // Show results
    results.classList.remove('hidden');

    // Populate lawyers (example static list, can be replaced by API)
    const sampleLawyers = [
      {name: 'Abg. Ana Ramírez', dept: department, phone: '312-555-0101'},
      {name: 'Abg. Carlos Gómez', dept: department, phone: '313-555-0102'},
      {name: 'Abg. Laura Torres', dept: department, phone: '310-555-0103'}
    ];
    lawyersList.innerHTML = sampleLawyers.map(l => `<li><strong>${l.name}</strong> — ${l.phone} — <em>${l.dept}</em></li>`).join('');

    // Store last analysis for PDF generation
    window.lastAnalysis = {
      fullName, cedula, department, route, docsList, semaforo, stepsHtml
    };
  });

  downloadPdf.addEventListener('click', () => {
    if(!window.lastAnalysis){
      alert('Ejecuta el análisis primero.');
      return;
    }
    const {{ jsPDF }} = window.jspdf;
    const doc = new jsPDF();
    const a = window.lastAnalysis;
    doc.setFontSize(14);
    doc.text('HeredaFácil - Informe de análisis', 14, 20);
    doc.setFontSize(11);
    doc.text(`Nombre: ${a.fullName}`, 14, 30);
    doc.text(`Cédula: ${a.cedula}`, 14, 36);
    doc.text(`Departamento: ${a.department}`, 14, 42);
    doc.text(`Tipo de proceso sugerido: ${a.route}`, 14, 50);
    doc.text('Semáforo de riesgo: ' + a.semaforo, 14, 58);
    doc.text('Documentos recomendados:', 14, 68);
    a.docsList.forEach((d,i) => doc.text(`- ${d}`, 18, 76 + i*6));
    doc.save('informe_heredafacil.pdf');
  });

  // Find notarias using OpenStreetMap Nominatim (search by department)
  findNotarias.addEventListener('click', async () => {
    notariasList.innerHTML = '<li>Buscando notarías…</li>';
    const dept = document.getElementById('department').value || '';
    try{
      // Using Nominatim to search for "notaría" in the department (works without API key)
      const q = encodeURIComponent(`notaría, ${dept}, Colombia`);
      const url = `https://nominatim.openstreetmap.org/search.php?q=${q}&format=jsonv2&limit=8`;
      const res = await fetch(url, { headers: { 'Accept': 'application/json' }});
      const data = await res.json();
      if(!data || data.length===0){
        notariasList.innerHTML = '<li>No se encontraron notarías. Intenta cambiar el nombre del departamento o permitir geolocalización.</li>';
        return;
      }
      notariasList.innerHTML = data.map(d => `<li><strong>${d.display_name.split(',')[0]}</strong> — ${d.type || ''} <br><small>${d.display_name}</small></li>`).join('');
    }catch(err){
      notariasList.innerHTML = '<li>Error buscando notarías. Revisa tu conexión o intenta más tarde.</li>';
      console.error(err);
    }
  });

});
