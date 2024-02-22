// a function for writing data to a table
function fillTable (tableID, data) {
    const table = document.getElementById(tableID);

    // looping through each data entry
    for (const element of data) {
        const row = table.insertRow(1);

        // looping through each entry's atributes
        for (const sample in element) {
            const cell = row.insertCell(-1);
            cell.innerHTML = element[sample];
        }
    }
}
