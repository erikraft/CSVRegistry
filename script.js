/*
=============================================================================
    ______      _ _                                 
   |  ____|    (_) |                                
   | |__   _ __ _| | __                             
   |  __| | '__| | |/ /                             
   | |____| |  | |   <                              
   |______|_|  |_|_|\_\                             
                                                    
    Feito por Erik Rodrigues Balisa                
=============================================================================
*/

var records = [];
var currentDisplayData = [];

function parseCSV(csvText) {
    var lines = csvText.split('\n');
    var data = [];
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (line.trim() !== '') {
            var cols = line.split(',');
            var trimmedCols = [];
            for (var j = 0; j < cols.length; j++) {
                trimmedCols.push(cols[j].trim());
            }
            data.push(trimmedCols);
        }
    }
    return data;
}

function renderTable(data) {
    var tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    
    for (var index = 0; index < data.length; index++) {
        var row = data[index];
        var tr = document.createElement('tr');
        tr.className = 'gsap-row';
        
        var html = '<td><input type="checkbox" class="action-checkbox" aria-label="Selecionar linha" data-index="' + index + '"></td>';
        
        for (var i = 0; i < 4; i++) {
            var cellData = row[i] !== undefined ? row[i] : '';
            html += '<td>' + cellData + '</td>';
        }
        
        var nomeRegistro = row[1] ? row[1] : 'Desconhecido';
        html += '<td><button class="btn" style="padding: 6px 12px; font-size: 12px;" onclick="alert(\'Registro de ' + nomeRegistro + ' (Feito por Erik Rodrigues Balisa)\')" aria-label="Ver detalhes de ' + nomeRegistro + '"><i class="fa-solid fa-eye"></i> Ver</button></td>';
        
        tr.innerHTML = html;
        tbody.appendChild(tr);
    }

    document.getElementById('totalCount').innerText = 'Total: ' + data.length + ' registros.';

    if (typeof gsap !== "undefined") {
        gsap.fromTo(".gsap-row", 
            { opacity: 0, y: 15 }, 
            { opacity: 1, y: 0, stagger: 0.05, duration: 0.4, ease: "power2.out" }
        );
    }
}

function loadFromTextarea() {
    var text = document.getElementById('manualData').value;
    records = parseCSV(text);
    currentDisplayData = records.slice();
    renderTable(currentDisplayData);
}

function loadFromFile() {
    var fileInput = document.getElementById('fileInput');
    if (fileInput.files.length === 0) {
        alert('Por favor, selecione um arquivo CSV primeiro.');
        return;
    }

    var file = fileInput.files[0];
    
    if (file.name.indexOf('.csv') === -1) {
        alert('Por favor, selecione apenas arquivos CSV.');
        return;
    }

    var reader = new FileReader();
    reader.onload = function(e) {
        var text = e.target.result;
        records = parseCSV(text);
        currentDisplayData = records.slice();
        renderTable(currentDisplayData);
        document.getElementById('manualData').value = text;
    };
    reader.readAsText(file);
}

function listAll() {
    currentDisplayData = records.slice();
    renderTable(currentDisplayData);
}

function searchData() {
    var query = document.getElementById('searchInput').value.toLowerCase();
    if (!query) {
        listAll();
        return;
    }

    currentDisplayData = [];
    for (var i = 0; i < records.length; i++) {
        var row = records[i];
        var match = false;
        for (var j = 0; j < row.length; j++) {
            if (row[j].toLowerCase().indexOf(query) !== -1) {
                match = true;
                break;
            }
        }
        if (match) {
            currentDisplayData.push(row);
        }
    }
    
    renderTable(currentDisplayData);
}

function sortData() {
    var colIndex = parseInt(document.getElementById('sortIndex').value, 10);
    
    if (colIndex >= 0 && colIndex <= 3) {
        currentDisplayData.sort(function(a, b) {
            var valA = a[colIndex] ? a[colIndex] : '';
            var valB = b[colIndex] ? b[colIndex] : '';
            
            if (!isNaN(valA) && !isNaN(valB) && valA !== '' && valB !== '') {
                return Number(valA) - Number(valB);
            }
            return valA.localeCompare(valB);
        });
        renderTable(currentDisplayData);
    } else {
        alert("Índice de coluna inválido.");
    }
}

function clearData() {
    records = [];
    currentDisplayData = [];
    document.getElementById('manualData').value = '';
    document.getElementById('searchInput').value = '';
    renderTable(currentDisplayData);
}

function deleteSelected() {
    var checkboxes = document.querySelectorAll('.action-checkbox:checked');
    if (checkboxes.length === 0) {
        alert("Selecione pelo menos um registro para excluir.");
        return;
    }

    var indices = [];
    for (var i = 0; i < checkboxes.length; i++) {
        indices.push(parseInt(checkboxes[i].getAttribute('data-index'), 10));
    }
    indices.sort(function(a, b) { return b - a; });

    for (var j = 0; j < indices.length; j++) {
        var index = indices[j];
        var recordToDelete = currentDisplayData[index];
        var originalIndex = records.indexOf(recordToDelete);
        
        if (originalIndex > -1) {
            records.splice(originalIndex, 1);
        }
        currentDisplayData.splice(index, 1);
    }

    var csvRows = [];
    for (var k = 0; k < records.length; k++) {
        csvRows.push(records[k].join(','));
    }
    document.getElementById('manualData').value = csvRows.join('\n');
    renderTable(currentDisplayData);
}

function exportData() {
    if (records.length === 0) {
        alert("Não há dados para exportar.");
        return;
    }

    var csvRows = [];
    for (var k = 0; k < records.length; k++) {
        csvRows.push(records[k].join(','));
    }
    var csvContent = csvRows.join('\n');
    
    var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Suporte para o IE11
    if (navigator.msSaveBlob) {
        navigator.msSaveBlob(blob, 'registros.csv');
        return;
    }
    
    var link = document.createElement('a');
    var url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'registros.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

window.onload = function() {
    loadFromTextarea();
};