function createTable(title) {
    // Create table container
    const tableDiv = document.createElement('div');
    tableDiv.className = 'table-container';
    
    // Create table element
    const tbl = document.createElement('table');
    tbl.id = title.toLowerCase().replace(' ', '-');
    
    // Create header
    const tblheader = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const thtitle = document.createElement('th');
    thtitle.innerHTML = title;
    thtitle.setAttribute('colspan', '3');
    thtitle.id = `${tbl.id}-title`;
    headerRow.appendChild(thtitle);
    tblheader.appendChild(headerRow);
    tbl.appendChild(tblheader);
    
    // Create column headers
    const columnRow = document.createElement('tr');
    const columns = ['Action', 'Title', 'Artist'];
    columns.forEach(col => {
        const th = document.createElement('th');
        th.innerHTML = col;
        columnRow.appendChild(th);
    });
    tblheader.appendChild(columnRow);
    
    // Create body
    const tblBody = document.createElement('tbody');
    tblBody.id = `${title.toLowerCase().replace(' ', '-')}-body`;
    tbl.appendChild(tblBody);
    
    // Add table to container
    tableDiv.appendChild(tbl);
    document.getElementById('tables-container').appendChild(tableDiv);
}

function updateTableTitle(tableId, newTitle) {
    const titleCell = document.getElementById(`${tableId}-title`);
    if (titleCell) {
        titleCell.innerHTML = newTitle;
    }
} 